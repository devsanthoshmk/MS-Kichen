import express from 'express';
import { getAllRows, getRow, runQuery } from '../config/database.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all orders (protected route)
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 50, sortBy = 'created_at', sortOrder = 'DESC' } = req.query;
    
    let sql = 'SELECT * FROM orders';
    const params = [];
    
    if (status && status !== 'all') {
      sql += ' WHERE status = ?';
      params.push(status);
    }
    
    // Add sorting
    const allowedSortFields = ['id', 'customer_name', 'status', 'created_at', 'total_amount'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const sortDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    sql += ` ORDER BY ${sortField} ${sortDirection}`;
    
    // Add pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    sql += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    
    const orders = await getAllRows(sql, params);
    
    // Parse order_items JSON for each order
    const ordersWithParsedItems = orders.map(order => ({
      ...order,
      order_items: JSON.parse(order.order_items)
    }));
    
    // Get total count
    let countSql = 'SELECT COUNT(*) as total FROM orders';
    const countParams = [];
    if (status && status !== 'all') {
      countSql += ' WHERE status = ?';
      countParams.push(status);
    }
    
    const totalResult = await getRow(countSql, countParams);
    
    res.json({
      orders: ordersWithParsedItems,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalResult.total,
        totalPages: Math.ceil(totalResult.total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get single order (protected route)
router.get('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const order = await getRow('SELECT * FROM orders WHERE id = ?', [id]);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Parse order_items JSON
    order.order_items = JSON.parse(order.order_items);
    
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Create new order (for WhatsApp bot - no authentication required)
router.post('/', async (req, res) => {
  try {
    const { customer_name, phone_number, order_items, address, notes } = req.body;
    
    // Validation
    if (!customer_name || !phone_number || !order_items || !address) {
      return res.status(400).json({ 
        error: 'Missing required fields: customer_name, phone_number, order_items, address' 
      });
    }
    
    if (!Array.isArray(order_items) || order_items.length === 0) {
      return res.status(400).json({ error: 'order_items must be a non-empty array' });
    }
    
    // Calculate total amount
    const total_amount = order_items.reduce((sum, item) => {
      return sum + ((item.price || 0) * (item.quantity || 1));
    }, 0);
    
    const orderItemsJson = JSON.stringify(order_items);
    
    const result = await runQuery(
      `INSERT INTO orders (customer_name, phone_number, order_items, address, notes, total_amount, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [customer_name, phone_number, orderItemsJson, address, notes || '', total_amount]
    );
    
    // Get the created order
    const newOrder = await getRow('SELECT * FROM orders WHERE id = ?', [result.lastID]);
    newOrder.order_items = JSON.parse(newOrder.order_items);
    
    // Emit to all connected admin clients
    const io = req.app.get('io');
    io.emit('newOrder', newOrder);
    
    res.status(201).json({
      success: true,
      order: newOrder,
      message: 'Order created successfully'
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Update order (protected route)
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { customer_name, phone_number, order_items, address, notes, status } = req.body;
    
    // Check if order exists
    const existingOrder = await getRow('SELECT * FROM orders WHERE id = ?', [id]);
    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Calculate total amount if order_items provided
    let total_amount = existingOrder.total_amount;
    let orderItemsJson = existingOrder.order_items;
    
    if (order_items && Array.isArray(order_items)) {
      total_amount = order_items.reduce((sum, item) => {
        return sum + ((item.price || 0) * (item.quantity || 1));
      }, 0);
      orderItemsJson = JSON.stringify(order_items);
    }
    
    await runQuery(
      `UPDATE orders 
       SET customer_name = COALESCE(?, customer_name),
           phone_number = COALESCE(?, phone_number),
           order_items = COALESCE(?, order_items),
           address = COALESCE(?, address),
           notes = COALESCE(?, notes),
           status = COALESCE(?, status),
           total_amount = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [customer_name, phone_number, orderItemsJson, address, notes, status, total_amount, id]
    );
    
    // Get updated order
    const updatedOrder = await getRow('SELECT * FROM orders WHERE id = ?', [id]);
    updatedOrder.order_items = JSON.parse(updatedOrder.order_items);
    
    // Emit to all connected admin clients
    const io = req.app.get('io');
    io.emit('orderUpdated', updatedOrder);
    
    res.json({
      success: true,
      order: updatedOrder,
      message: 'Order updated successfully'
    });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// Update order status (protected route)
router.put('/:id/status', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status. Valid statuses: ' + validStatuses.join(', ')
      });
    }
    
    // Check if order exists
    const existingOrder = await getRow('SELECT * FROM orders WHERE id = ?', [id]);
    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    await runQuery(
      'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );
    
    // Get updated order
    const updatedOrder = await getRow('SELECT * FROM orders WHERE id = ?', [id]);
    updatedOrder.order_items = JSON.parse(updatedOrder.order_items);
    
    // Emit to all connected admin clients
    const io = req.app.get('io');
    io.emit('orderStatusUpdated', { orderId: id, status, order: updatedOrder });
    
    res.json({
      success: true,
      order: updatedOrder,
      message: `Order status updated to ${status}`
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Delete order (protected route)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if order exists
    const existingOrder = await getRow('SELECT * FROM orders WHERE id = ?', [id]);
    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    await runQuery('DELETE FROM orders WHERE id = ?', [id]);
    
    // Emit to all connected admin clients
    const io = req.app.get('io');
    io.emit('orderDeleted', { orderId: id });
    
    res.json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

// Get order statistics (protected route)
router.get('/stats/summary', authenticateAdmin, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Total orders
    const totalOrders = await getRow('SELECT COUNT(*) as count FROM orders');
    
    // Today's orders
    const todayOrders = await getRow(
      'SELECT COUNT(*) as count FROM orders WHERE DATE(created_at) = ?',
      [today]
    );
    
    // Orders by status
    const ordersByStatus = await getAllRows(
      'SELECT status, COUNT(*) as count FROM orders GROUP BY status'
    );
    
    // Today's revenue
    const todayRevenue = await getRow(
      'SELECT SUM(total_amount) as revenue FROM orders WHERE DATE(created_at) = ? AND status != "cancelled"',
      [today]
    );
    
    // Total revenue
    const totalRevenue = await getRow(
      'SELECT SUM(total_amount) as revenue FROM orders WHERE status != "cancelled"'
    );
    
    res.json({
      totalOrders: totalOrders.count,
      todayOrders: todayOrders.count,
      ordersByStatus: ordersByStatus.reduce((acc, item) => {
        acc[item.status] = item.count;
        return acc;
      }, {}),
      todayRevenue: todayRevenue.revenue || 0,
      totalRevenue: totalRevenue.revenue || 0
    });
  } catch (error) {
    console.error('Error fetching order statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;