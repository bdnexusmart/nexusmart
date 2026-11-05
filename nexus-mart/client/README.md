# Nexus Mart — Multivendor E-commerce (MERN)

- **Frontend:** React 18 + Vite + Tailwind CSS v4 (`/client`)
- **Backend:** Node + Express + **TypeScript** (`/server`)
- **Database:** MongoDB via Mongoose
- **Roles (single app, role-based):** Customer · Vendor · Admin

## Quick start

Prerequisites: Node 18+ and a running MongoDB (local or Atlas).

```bash
# 1. Backend
cd server
cp .env.example .env        # then edit JWT_SECRET and MONGO_URI
npm install
npm run seed                # creates admin@nexusmart.com / Admin@123 + base categories
npm run dev                 # API on http://localhost:5000

# 2. Frontend (new terminal)
cd client
cp .env.example .env
npm install
npm run dev                 # App on http://localhost:5173
```

**Change the seeded admin password immediately.**

## How the marketplace flow works

1. A visitor signs up as **Shop** (customer) or **Sell** (vendor + store name).
2. New vendors start as `pending`. An **admin** approves them (Admin → Vendors).
3. Approved vendors create products. New/edited products are `pending` until an **admin** approves them (Admin → Products).
4. Customers browse approved products, add to cart, and check out (one order can contain items from many vendors).
5. Each **vendor** manages the status of only their own line items; the order is marked delivered when all active items are delivered.
6. Reviews are limited to customers who purchased the product.

## Project structure

```
server/src
  config/       db connection
  models/       User, Vendor, Product, Category, Cart, Order, Review
  controllers/  business logic per resource
  routes/       Express routers (role guards applied here)
  middleware/   protect (JWT), authorize(role), validate, error handling
  utils/        ApiError, generateToken, seed
client/src
  services/     axios instance + API functions
  context/      AuthContext, CartContext
  routes/       ProtectedRoute (role-based)
  components/   layout + product card
  pages/        customer/, auth/, vendor/, admin/
```

## API overview (all under `/api`)

| Area | Endpoints |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` |
| Products | `GET /products`, `GET /products/:slug`, vendor CRUD (`POST/PUT/DELETE`), `GET /products/vendor/mine`, admin `GET /products/admin/all`, `PUT /products/admin/:id/approve` |
| Vendors | `GET /vendors`, `GET /vendors/:slug`, `GET/PUT /vendors/me`, `GET /vendors/me/dashboard`, admin `GET /vendors/admin/all`, `PUT /vendors/admin/:id/status` |
| Categories | `GET /categories`, admin CRUD |
| Cart (customer) | `GET /cart`, `POST /cart/items`, `PUT/DELETE /cart/items/:itemId`, `DELETE /cart` |
| Orders | `POST /orders`, `GET /orders/mine`, `GET /orders/:id`, vendor `GET /orders/vendor/mine`, `PUT /orders/:id/items/:itemId/status`, admin `GET /orders/admin/all`, `PUT /orders/admin/:id/payment-status` |
| Reviews | `GET/POST /reviews/product/:productId`, `DELETE /reviews/:id` |
| Users | `PUT /users/profile`, `POST /users/addresses`, admin `GET /users`, `PUT /users/:id/status` |

## Status & known gaps

Verified: backend type-checks (`tsc --noEmit`), boots, and returns correct responses for routing, validation and auth guards; the client builds for production.

**Not yet verified:** full end-to-end flows against a live MongoDB (register → approve → list → order). Run through them once locally before building further.

Not implemented yet (deliberately out of the scaffold's scope):
- **Online payments** — checkout is cash-on-delivery only; add Stripe/SSLCommerz etc. next.
- **Image upload** — products take image URLs; add Multer + Cloudinary/S3.
- Vendor payouts/commission settlement (commission is *calculated* per order but not paid out).
- Email notifications, password reset, refresh tokens, rate limiting.
- Automated tests.
- Category management UI for admins (API exists: `/api/categories`).
- Multi-currency / shipping rules (flat $5 shipping, 5% tax placeholder in `orderController.ts`).
