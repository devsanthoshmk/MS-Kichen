# WhatsApp Food Ordering Admin Dashboard

A complete admin dashboard for managing WhatsApp-based food orders with real-time updates.

## 🚀 Features

- **Authentication**: Simple username/PIN login system
- **Real-time Updates**: Live order notifications using WebSockets
- **Order Management**: View, update, and delete orders
- **Menu Management**: Full CRUD operations for menu items
- **Responsive Design**: Mobile-friendly interface
- **Modern UI**: Built with Vue 3, PrimeVue, and TailwindCSS

## 📋 Tech Stack

**Frontend:**

- Vue 3 with Vite
- Vue Router
- PrimeVue UI Components
- TailwindCSS
- Lucide Vue Icons
- Socket.IO Client

**Backend:**

- Node.js with Express
- SQLite Database
- Socket.IO for real-time updates
- ES Modules

## 📁 Project Structure

```
food-ordering-admin/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── orders.js
│   │   │   └── menu.js
│   │   └── app.js
│   ├── database/
│   │   └── orders.db
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── views/
│   │   ├── router/
│   │   ├── services/
│   │   └── main.js
│   ├── public/
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 🛠 Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Start the backend server:

```bash
npm start
```

Backend will run on http://localhost:5000

### Frontend Setup

1. Navigate to frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

Frontend will run on http://localhost:5173

## 📊 Database Schema

### Orders Table

```sql
CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  order_items TEXT NOT NULL, -- JSON string
  address TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  total_amount REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Menu Items Table

```sql
CREATE TABLE menu_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  description TEXT,
  available BOOLEAN DEFAULT 1,
  image_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Categories Table

```sql
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🔐 Authentication

**Default Admin Credentials:**

- Username: `admin`
- PIN: `12345`

## 📡 API Endpoints

### Authentication

- `POST /api/auth/login` - Admin login

### Orders

- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order (for WhatsApp bot)
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Delete order
- `PUT /api/orders/:id/status` - Update order status

### Menu

- `GET /api/menu` - Get all menu items
- `POST /api/menu` - Create menu item
- `PUT /api/menu/:id` - Update menu item
- `DELETE /api/menu/:id` - Delete menu item

### Categories

- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category

## 🔄 Real-time Features

The dashboard uses Socket.IO for real-time updates:

- New orders appear instantly
- Order status updates broadcast to all clients
- Menu changes reflected immediately

## 💾 Order Items JSON Format

Orders store items as structured JSON:

```json
[
  {
    "category": "tiffen",
    "item": "idly",
    "quantity": 2,
    "price": 30
  },
  {
    "category": "side-dish",
    "item": "gravy",
    "quantity": 1,
    "price": 25
  }
]
```

## 🎨 UI Components

The dashboard uses PrimeVue components:

- **DataTable** for orders and menu management
- **Dialog** for add/edit forms
- **Toast** for notifications
- **Card** for order display
- **Sidebar** for navigation

## 📱 Mobile Responsive

The interface is fully responsive and optimized for:

- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🔧 Development

### Backend Development

```bash
cd backend
npm run dev  # Uses nodemon for auto-reload
```

### Frontend Development

```bash
cd frontend
npm run dev  # Vite dev server with HMR
```

### Build for Production

```bash
cd frontend
npm run build
```

## 🚦 Order Status Flow

1. **Pending** - New order received
2. **Confirmed** - Order accepted
3. **Preparing** - Food being prepared
4. **Ready** - Ready for pickup/delivery
5. **Delivered** - Order completed
6. **Cancelled** - Order cancelled

## 📞 WhatsApp Bot Integration

The backend provides an endpoint for WhatsApp bot integration:

```javascript
// POST /api/orders
{
  "customer_name": "John Doe",
  "phone_number": "+1234567890",
  "order_items": [
    {"category": "tiffen", "item": "idly", "quantity": 2, "price": 30}
  ],
  "address": "123 Main St, City"
}
```

## 🎯 Key Features Implemented

✅ Real-time order updates with WebSockets
✅ Admin authentication with username/PIN
✅ Complete CRUD for orders and menu
✅ Responsive design with mobile support
✅ Modern UI with PrimeVue components
✅ SQLite database with proper schema
✅ Order status management
✅ Menu categorization
✅ Toast notifications
✅ Image upload support for menu items

## 📝 Usage

1. **Login**: Use admin/12345 to access the dashboard
2. **View Orders**: See all orders with real-time updates
3. **Manage Menu**: Add, edit, delete menu items and categories
4. **Update Status**: Change order status with dropdown
5. **Mobile Access**: Use on any device with responsive design

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for your food ordering business!

---

**Happy Ordering! 🍕📱**
