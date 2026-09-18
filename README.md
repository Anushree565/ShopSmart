# ShopSmart

A complete, portfolio-quality full-stack e-commerce website — Electronics, Fashion, and Home & Living — built with Node.js/Express, MySQL, and a vanilla HTML/CSS/jQuery frontend.

This is a brand-new, independent project. It does not modify or depend on any other project on your machine.

---

## 1. Project Structure

```
ShopSmart-Final/
├── backend/              Node.js + Express API (JWT auth, bcrypt, MySQL)
│   ├── config/db.js
│   ├── controllers/
│   ├── middleware/authMiddleware.js
│   ├── routes/
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── frontend/             Static HTML/CSS/jQuery site (served by the backend)
│   ├── *.html
│   ├── css/style.css
│   └── js/
├── database/
│   ├── schema.sql        Tables: users, categories, subcategories, products, orders, order_items, wishlist
│   └── seed.sql          ~150 realistic products with relevant images across 15 subcategories
├── .gitignore
└── README.md
```

The Express server also serves the `frontend/` folder as static files, so the **entire app runs from one server on one port** — no separate frontend server or build step needed.

---

## 2. Prerequisites

- **Node.js** v18+ and npm
- **MySQL** 8.x (or MariaDB 10.5+) running locally

---

## 3. MySQL Setup

1. Make sure MySQL is running.
2. Create the database and tables, then load the sample data:

```bash
cd ShopSmart-Final/database
mysql -u root -p < schema.sql
mysql -u root -p shopsmart < seed.sql
```

`schema.sql` drops and recreates a fresh `shopsmart` database, so it's safe to re-run any time you want to reset the data. It also seeds the 3 categories and 15 subcategories. `seed.sql` adds the ~150 products.

---

## 4. Backend Setup

```bash
cd ShopSmart-Final/backend
npm install
cp .env.example .env
```

Open `.env` and set your real MySQL password:

```
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=shopsmart
DB_PORT=3306

JWT_SECRET=change_this_to_a_long_random_secret_string
JWT_EXPIRES_IN=7d
```

Then start the server:

```bash
npm run dev
```

You should see:

```
✅ MySQL connected successfully to database: shopsmart
🚀 ShopSmart server running at http://localhost:5000
```

---

## 5. Open the App

Visit **http://localhost:5000** in your browser. That's it — frontend and backend are served together.

If you prefer, you can also open the `frontend/*.html` files directly with a tool like VS Code Live Server; the frontend calls the API at `http://localhost:5000/api` regardless (see `frontend/js/config.js`), as long as the backend is running.

---

## 6. Exact URLs to Test

| Page | URL |
|---|---|
| Home | http://localhost:5000/index.html |
| Categories | http://localhost:5000/categories.html |
| Subcategories of Electronics | http://localhost:5000/categories.html?id=1 |
| Products in a subcategory | http://localhost:5000/products.html?category=1&subcategory=1 |
| All products | http://localhost:5000/products.html |
| Search | http://localhost:5000/products.html?search=laptop |
| Product detail | http://localhost:5000/product.html?id=1 |
| Cart | http://localhost:5000/cart.html |
| Login | http://localhost:5000/login.html |
| Register | http://localhost:5000/register.html |
| Checkout | http://localhost:5000/checkout.html |
| Wishlist | http://localhost:5000/wishlist.html |
| My Orders | http://localhost:5000/orders.html |
| API health check | http://localhost:5000/api/health |

---

## 7. API Reference

**Products**
- `GET /api/products` — query params: `category, subcategory, search, minPrice, maxPrice, rating, inStock, sort, page, limit`
- `GET /api/products/:id`

**Categories**
- `GET /api/categories`
- `GET /api/categories/:id/subcategories`

**Auth**
- `POST /api/auth/register` — `{ name, email, password, confirmPassword }`
- `POST /api/auth/login` — `{ email, password }`

**Orders** (require `Authorization: Bearer <token>`)
- `POST /api/orders` — `{ fullName, email, phone, address, city, state, pincode, paymentMethod, items: [{productId, quantity}] }`
- `GET /api/orders`

**Wishlist** (require `Authorization: Bearer <token>`)
- `GET /api/wishlist`
- `POST /api/wishlist` — `{ productId }`
- `DELETE /api/wishlist/:productId`

---

## 8. Testing Checklist

- [ ] Homepage loads with hero, categories, featured/deals/trending rails
- [ ] Categories page → clicking a main category shows its subcategories
- [ ] Clicking a subcategory opens the filtered product listing
- [ ] Products load with correct, relevant images
- [ ] Search returns matching products
- [ ] Price / rating / in-stock filters work and combine correctly
- [ ] Sorting (price, rating, newest) works
- [ ] Pagination works
- [ ] Product detail page shows full info + related products
- [ ] Add to Cart works from grid, detail page, and updates the navbar badge instantly
- [ ] Cart page: quantity +/-, remove, clear cart, subtotal/delivery/total all correct
- [ ] Register creates an account (bcrypt-hashed password) and logs you in
- [ ] Login authenticates and issues a JWT
- [ ] Wishlist requires login; add/remove persists in MySQL
- [ ] Checkout requires login; validates every field; blocks on empty cart
- [ ] Placing an order saves `orders` + `order_items` in MySQL, clears the cart, and redirects to My Orders
- [ ] My Orders lists past orders with items, dates, and status
- [ ] Responsive layout works on mobile, tablet, and desktop widths

---

## 9. Notes

- Product images are served from Unsplash's stable CDN, chosen per-subcategory to be relevant to each product type (different smartphones show different smartphone photos, sofas show sofa photos, etc.) — every URL is stored directly in `seed.sql`, and the frontend simply renders `product.image_url`.
- Cart is stored in `localStorage` (fast, no login required to browse/add-to-cart); wishlist and orders are stored server-side in MySQL and require a logged-in user, per the spec.
- Prices are in INR (₹). Free delivery applies above ₹500; otherwise a flat ₹49 delivery fee is added, both in the cart and at checkout.
