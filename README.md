# MS Kitchen restaurant kitchen website and food ordering frontend

MS Kitchen is a restaurant kitchen website and food ordering frontend with a real-time admin dashboard for WhatsApp food orders.

The restaurant kitchen website provides an online food ordering frontend where customers browse South Indian dishes, search items, apply discount codes, and manage their cart. The companion web admin dashboard lets kitchen operators track incoming WhatsApp orders, update order status in real time through WebSockets, and manage menu items.

## Architecture

The repository contains four components:

1. `website`: A customer-facing restaurant kitchen website and food ordering frontend built with Vue 3, Vite 7, Tailwind CSS 4, and PrimeVue 4. It includes client-side cart management, geolocation lookup via OpenStreetMap Nominatim, menu filtering across categories, and image resolution through the Pexels API.
2. `web-admin/backend`: An Express REST API and Socket.IO server running on Node.js with SQLite persistence (`orders.db`). It stores categories, menu items, and incoming customer orders. It broadcasts order status updates to connected admin clients.
3. `web-admin/frontend`: A single-page admin portal built with Vue 3, Vite 5, Vue Router 4, Tailwind CSS 3, and PrimeVue 3. It connects to the backend API and Socket.IO server to display real-time order notifications, revenue statistics, order status controls, and menu catalog editing.
4. `WA automation`: A workspace package containing the `whatsapp-web.js` dependency for WhatsApp order automation.

## Setup

### Prerequisites

- Node.js version 18 or higher
- npm or pnpm package manager

### Website setup

Install dependencies and start the customer food ordering frontend:

```bash
cd website
npm install
npm run dev
```

The website starts at `http://localhost:5173`.

### Admin backend setup

Install backend dependencies and run the SQLite database migration:

```bash
cd web-admin/backend
npm install
npm run dev
```

The backend server starts at `http://localhost:5000` and creates `database/orders.db` if it does not exist.

### Admin frontend setup

Install dashboard dependencies and run the admin user interface:

```bash
cd web-admin/frontend
npm install
npm run dev
```

The admin frontend starts at `http://localhost:5173`. If running alongside the website on the same machine, configure Vite to use a separate port such as 5174.

### WhatsApp automation setup

Install the WhatsApp automation dependencies:

```bash
cd "WA automation"
pnpm install
```

## Usage

### Ordering food on the website

1. Open `http://localhost:5173` in a web browser.
2. Filter dishes by category, search by dish name or keyword, and sort by price, rating, or preparation time.
3. Click items to add them to the cart.
4. Detect delivery location with the browser geolocation button or select manually.
5. Apply offer codes such as `SAVE60` or `WELCOME100` in the cart drawer.

### Managing orders in the admin dashboard

1. Navigate to the admin dashboard in your browser.
2. Log in with the default admin credentials.
3. View incoming orders on the dashboard page with live status updates.
4. Update an order status between pending, confirmed, preparing, ready, delivered, or cancelled.
5. Navigate to `/menu` to add new dishes, modify prices, or toggle item availability.

### Submitting orders via API

External services or WhatsApp bots submit orders directly to the backend endpoint:

```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Santhosh",
    "phone_number": "7904127446",
    "order_items": [
      {"category": "tiffen", "item": "idly", "quantity": 2, "price": 30},
      {"category": "side-dish", "item": "gravy", "quantity": 1, "price": 25}
    ],
    "address": "767 Shivaraj Nagar",
    "notes": "Extra spicy"
  }'
```

## Configuration

### Environment and network ports

- `PORT`: Admin backend listening port. The default is `5000`.
- Backend Socket.IO CORS origin: Set to `http://localhost:5173` in `web-admin/backend/server.js`.
- Frontend API base URL: Configured in `web-admin/frontend/src/services/api.js` to target `http://localhost:5000/api`.

### Admin credentials

- Default username: `admin`
- Default PIN: `12345`

Set custom credentials in `web-admin/backend/src/routes/auth.js`.

### Database storage

The SQLite database file sits at `web-admin/backend/database/orders.db`. The table schema initializes automatically on backend startup with tables for `categories`, `menu_items`, and `orders`.
