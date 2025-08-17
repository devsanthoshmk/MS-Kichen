import express from 'express';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { getAllRows, getRow, runQuery } from '../config/database.js';
import { authenticateAdmin } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await getAllRows(
      'SELECT * FROM categories WHERE active = 1 ORDER BY name'
    );
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Create new category (protected)
router.post('/categories', authenticateAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    
    // Check if category already exists
    const existing = await getRow('SELECT id FROM categories WHERE name = ?', [name.toLowerCase()]);
    if (existing) {
      return res.status(400).json({ error: 'Category already exists' });
    }
    
    const result = await runQuery(
      'INSERT INTO categories (name, description) VALUES (?, ?)',
      [name.toLowerCase(), description || '']
    );
    
    const newCategory = await getRow('SELECT * FROM categories WHERE id = ?', [result.lastID]);
    
    res.status(201).json({
      success: true,
      category: newCategory,
      message: 'Category created successfully'
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Get all menu items
router.get('/', async (req, res) => {
  try {
    const { category, available, page = 1, limit = 100 } = req.query;
    
    let sql = 'SELECT * FROM menu_items';
    const params = [];
    const conditions = [];
    
    if (category && category !== 'all') {
      conditions.push('category = ?');
      params.push(category);
    }
    
    if (available !== undefined) {
      conditions.push('available = ?');
      params.push(available === 'true' ? 1 : 0);
    }
    
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    
    sql += ' ORDER BY category, name';
    
    // Add pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    sql += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    
    const menuItems = await getAllRows(sql, params);
    
    // Get total count
    let countSql = 'SELECT COUNT(*) as total FROM menu_items';
    const countParams = [];
    if (conditions.length > 0) {
      countSql += ' WHERE ' + conditions.join(' AND ');
      countParams.push(...params.slice(0, -2)); // Remove limit and offset
    }
    
    const totalResult = await getRow(countSql, countParams);
    
    res.json({
      menuItems,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalResult.total,
        totalPages: Math.ceil(totalResult.total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

// Get menu items grouped by category (for public display)
router.get('/grouped', async (req, res) => {
  try {
    const menuItems = await getAllRows(
      'SELECT * FROM menu_items WHERE available = 1 ORDER BY category, name'
    );
    
    // Group by category
    const groupedMenu = menuItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});
    
    res.json(groupedMenu);
  } catch (error) {
    console.error('Error fetching grouped menu:', error);
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});

// Get single menu item
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const menuItem = await getRow('SELECT * FROM menu_items WHERE id = ?', [id]);
    
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    res.json(menuItem);
  } catch (error) {
    console.error('Error fetching menu item:', error);
    res.status(500).json({ error: 'Failed to fetch menu item' });
  }
});

// Create new menu item (protected)
router.post('/', authenticateAdmin, upload.single('image'), async (req, res) => {
  try {
    const { category, name, price, description, available = true } = req.body;
    
    // Validation
    if (!category || !name || !price) {
      return res.status(400).json({ 
        error: 'Required fields: category, name, price' 
      });
    }
    
    if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      return res.status(400).json({ error: 'Price must be a positive number' });
    }
    
    // Check if menu item already exists
    const existing = await getRow(
      'SELECT id FROM menu_items WHERE category = ? AND name = ?',
      [category.toLowerCase(), name]
    );
    
    if (existing) {
      return res.status(400).json({ 
        error: 'Menu item with this name already exists in this category' 
      });
    }
    
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;
    
    const result = await runQuery(
      `INSERT INTO menu_items (category, name, price, description, available, image_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [category.toLowerCase(), name, parseFloat(price), description || '', available === 'true' ? 1 : 0, image_url]
    );
    
    const newMenuItem = await getRow('SELECT * FROM menu_items WHERE id = ?', [result.lastID]);
    
    // Emit to all connected admin clients
    const io = req.app.get('io');
    io.emit('menuItemCreated', newMenuItem);
    
    res.status(201).json({
      success: true,
      menuItem: newMenuItem,
      message: 'Menu item created successfully'
    });
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({ error: 'Failed to create menu item' });
  }
});

// Update menu item (protected)
router.put('/:id', authenticateAdmin, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { category, name, price, description, available } = req.body;
    
    // Check if menu item exists
    const existingItem = await getRow('SELECT * FROM menu_items WHERE id = ?', [id]);
    if (!existingItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    // Validate price if provided
    if (price !== undefined && (isNaN(parseFloat(price)) || parseFloat(price) <= 0)) {
      return res.status(400).json({ error: 'Price must be a positive number' });
    }
    
    // Check for duplicate name in category
    if ((category || name) && (category !== existingItem.category || name !== existingItem.name)) {
      const duplicate = await getRow(
        'SELECT id FROM menu_items WHERE category = ? AND name = ? AND id != ?',
        [category || existingItem.category, name || existingItem.name, id]
      );
      
      if (duplicate) {
        return res.status(400).json({ 
          error: 'Menu item with this name already exists in this category' 
        });
      }
    }
    
    const image_url = req.file ? `/uploads/${req.file.filename}` : existingItem.image_url;
    
    await runQuery(
      `UPDATE menu_items 
       SET category = COALESCE(?, category),
           name = COALESCE(?, name),
           price = COALESCE(?, price),
           description = COALESCE(?, description),
           available = COALESCE(?, available),
           image_url = COALESCE(?, image_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        category ? category.toLowerCase() : null,
        name,
        price ? parseFloat(price) : null,
        description,
        available !== undefined ? (available === 'true' ? 1 : 0) : null,
        image_url,
        id
      ]
    );
    
    const updatedMenuItem = await getRow('SELECT * FROM menu_items WHERE id = ?', [id]);
    
    // Emit to all connected admin clients
    const io = req.app.get('io');
    io.emit('menuItemUpdated', updatedMenuItem);
    
    res.json({
      success: true,
      menuItem: updatedMenuItem,
      message: 'Menu item updated successfully'
    });
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

// Toggle menu item availability (protected)
router.put('/:id/toggle-availability', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingItem = await getRow('SELECT * FROM menu_items WHERE id = ?', [id]);
    if (!existingItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    const newAvailability = existingItem.available ? 0 : 1;
    
    await runQuery(
      'UPDATE menu_items SET available = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newAvailability, id]
    );
    
    const updatedMenuItem = await getRow('SELECT * FROM menu_items WHERE id = ?', [id]);
    
    // Emit to all connected admin clients
    const io = req.app.get('io');
    io.emit('menuItemUpdated', updatedMenuItem);
    
    res.json({
      success: true,
      menuItem: updatedMenuItem,
      message: `Menu item ${newAvailability ? 'enabled' : 'disabled'} successfully`
    });
  } catch (error) {
    console.error('Error toggling menu item availability:', error);
    res.status(500).json({ error: 'Failed to update menu item availability' });
  }
});

// Delete menu item (protected)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingItem = await getRow('SELECT * FROM menu_items WHERE id = ?', [id]);
    if (!existingItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    await runQuery('DELETE FROM menu_items WHERE id = ?', [id]);
    
    // Emit to all connected admin clients
    const io = req.app.get('io');
    io.emit('menuItemDeleted', { menuItemId: id });
    
    res.json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
});

// Get menu statistics (protected)
router.get('/stats/summary', authenticateAdmin, async (req, res) => {
  try {
    // Total menu items
    const totalItems = await getRow('SELECT COUNT(*) as count FROM menu_items');
    
    // Available items
    const availableItems = await getRow('SELECT COUNT(*) as count FROM menu_items WHERE available = 1');
    
    // Items by category
    const itemsByCategory = await getAllRows(
      'SELECT category, COUNT(*) as count FROM menu_items GROUP BY category ORDER BY count DESC'
    );
    
    // Average price
    const avgPrice = await getRow('SELECT AVG(price) as average FROM menu_items WHERE available = 1');
    
    res.json({
      totalItems: totalItems.count,
      availableItems: availableItems.count,
      unavailableItems: totalItems.count - availableItems.count,
      itemsByCategory: itemsByCategory.reduce((acc, item) => {
        acc[item.category] = item.count;
        return acc;
      }, {}),
      averagePrice: Math.round(avgPrice.average * 100) / 100 || 0
    });
  } catch (error) {
    console.error('Error fetching menu statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;