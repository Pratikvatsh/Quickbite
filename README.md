# 🍔 QuickBite — College Canteen Food Ordering System

> A full-stack food ordering app for college campuses. Dark-themed, mobile-first, Swiggy-inspired UI.

---

## 🗂 Project Structure

```
quickbite/
├── backend/                  # Node.js + Express API
│   ├── middleware/
│   │   └── auth.js           # JWT auth + role guards
│   ├── models/
│   │   ├── User.js           # Users (customer / owner)
│   │   ├── FoodItem.js       # Menu items
│   │   ├── Category.js       # Food categories
│   │   ├── Cart.js           # Per-user cart
│   │   └── Order.js          # Orders with status history
│   ├── routes/
│   │   ├── auth.js           # /api/auth — login, register, me
│   │   ├── menu.js           # /api/menu — CRUD + availability
│   │   ├── cart.js           # /api/cart — add, update, remove, clear
│   │   ├── orders.js         # /api/orders — place, track, update status
│   │   ├── categories.js     # /api/categories
│   │   └── users.js          # /api/users — profile, password, notifications
│   ├── server.js             # Express entry point
│   ├── seed.js               # Seed demo data
│   ├── .env                  # Environment variables
│   └── package.json
│
└── frontend/                 # React app (CRA)
    └── src/
        ├── context/
        │   ├── AuthContext.jsx   # Global auth state + JWT
        │   └── CartContext.jsx   # Global cart state
        ├── utils/
        │   └── api.js            # Axios instance with auth header
        ├── components/common/
        │   ├── TopNav.jsx        # Top nav with cart + notifications
        │   ├── BottomNav.jsx     # Mobile bottom tab bar
        │   └── FoodCard.jsx      # Reusable food item card
        ├── pages/
        │   ├── SplashScreen.jsx
        │   ├── LoginPage.jsx     # Login + Signup with role selector
        │   ├── customer/
        │   │   ├── HomePage.jsx          # Search, categories, featured
        │   │   ├── MenuPage.jsx          # Browse + filter + search
        │   │   ├── FoodDetailPage.jsx    # Item detail + add to cart
        │   │   ├── CartPage.jsx          # Cart management
        │   │   ├── CheckoutPage.jsx      # Review + special instructions
        │   │   ├── OrderConfirmPage.jsx  # Order placed confirmation
        │   │   ├── OrderTrackingPage.jsx # Live order status tracker
        │   │   ├── OrderHistoryPage.jsx  # Past orders
        │   │   └── ProfilePage.jsx       # Edit profile + password
        │   └── owner/
        │       ├── OwnerDashboard.jsx    # Stats + quick actions
        │       ├── OwnerOrders.jsx       # Manage all orders + update status
        │       ├── OwnerMenu.jsx         # Menu item list + availability toggle
        │       └── OwnerAddItem.jsx      # Add / Edit food items
        ├── App.js             # Routes + role-based guards
        ├── index.js
        └── index.css          # Dark theme design system
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js ≥ 18
- MongoDB running locally (or a MongoDB Atlas URI)

---

### 1. Clone & Setup Backend

```bash
cd quickbite/backend
npm install
```

Edit `.env` if needed:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/quickbite
JWT_SECRET=quickbite_super_secret_jwt_key_2024
```

Seed the database with demo data:
```bash
npm run seed
```

Start the backend:
```bash
npm run dev        # development (nodemon)
# or
npm start          # production
```

Backend runs at: `http://localhost:5000`

---

### 2. Setup Frontend

```bash
cd quickbite/frontend
npm install
npm start
```

Frontend runs at: `http://localhost:3000`

The `proxy` in `package.json` forwards `/api` calls to `localhost:5000`.

---

## 🔐 Demo Login Credentials

| Role       | Email                    | Password     |
|------------|--------------------------|--------------|
| 👨‍🍳 Owner   | owner@quickbite.com      | password123  |
| 🎓 Student | student@quickbite.com    | password123  |

---

## ✅ Feature Checklist

### Customer (Student)
- [x] Register & login with role selection
- [x] Splash screen
- [x] Home page with search, categories, featured items
- [x] Browse full menu with category filter
- [x] Veg-only filter
- [x] Search food items
- [x] Food detail page with ratings, prep time, calories
- [x] Add to cart / modify quantities
- [x] Cart page with bill summary
- [x] Checkout with special instructions
- [x] Cash on Pickup payment (no online payment)
- [x] Order confirmation with order number
- [x] Live order tracking (polls every 10 seconds)
- [x] Order history
- [x] Push notification when order is ready
- [x] Edit profile (name, phone, college ID)
- [x] Change password

### Shop Owner
- [x] Owner login dashboard
- [x] Stats: total orders, today's orders, active orders, revenue
- [x] View all incoming orders (auto-refreshes every 12 seconds)
- [x] Filter orders by status
- [x] Update order status: Placed → Preparing → Ready → Completed
- [x] Cancel orders
- [x] Manage menu (view all items)
- [x] Toggle item availability (Live / Off)
- [x] Add new food items
- [x] Edit existing food items
- [x] Delete food items
- [x] Special instructions shown on order cards

---

## 🛠 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login + get JWT |
| GET | `/api/auth/me` | Get current user |

### Menu
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/menu` | Get all items (with filters) |
| GET | `/api/menu/:id` | Get single item |
| POST | `/api/menu` | Add item (owner) |
| PUT | `/api/menu/:id` | Edit item (owner) |
| PATCH | `/api/menu/:id/availability` | Toggle availability (owner) |
| DELETE | `/api/menu/:id` | Delete item (owner) |

### Cart
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart` | Get cart |
| POST | `/api/cart/add` | Add item |
| PUT | `/api/cart/update` | Update quantity |
| DELETE | `/api/cart/remove/:id` | Remove item |
| DELETE | `/api/cart/clear` | Clear cart |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Place order |
| GET | `/api/orders/my` | Customer's orders |
| GET | `/api/orders/all` | All orders (owner) |
| GET | `/api/orders/:id` | Single order |
| PATCH | `/api/orders/:id/status` | Update status (owner) |
| GET | `/api/orders/stats/dashboard` | Stats (owner) |

---

## 🎨 Design System

The UI is built using pure CSS variables (no Tailwind dependency needed):

- **Fonts**: Syne (display) + DM Sans (body) — loaded from Google Fonts
- **Colors**: `--accent: #ff6b35` (orange), dark backgrounds `#0a0a0f / #111118 / #16161f`
- **Radius**: 8px / 14px / 20px / 999px (pill)
- **Animations**: fadeIn, slideUp, bounce, glow, shimmer (skeleton)

---

## 🔄 Order Status Flow

```
Placed ──▶ Preparing ──▶ Ready ──▶ Completed
   └──────────────────────────────▶ Cancelled
```

When status changes to **Ready**, a notification is pushed to the customer's notification bell.

---

## 📝 Notes

- No online payment is implemented — all orders use **Cash on Pickup**
- Order tracking **auto-polls every 10 seconds** for live status
- Owner dashboard **auto-refreshes every 12–15 seconds**
- JWT tokens stored in `localStorage` (standard for college projects)
- Images use Unsplash URLs — internet connection required for images
