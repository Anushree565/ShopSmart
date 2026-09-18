# ShopSmart

A complete, portfolio-quality full-stack e-commerce website — Electronics, Fashion, and Home & Living — built with Node.js/Express, MySQL, and a vanilla HTML/CSS/jQuery frontend.

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

## 3. MySQL Setup (local)

Create the database and tables, then load the sample data. Easiest via phpMyAdmin: **Import** → choose `schema.sql` → Go, then select the `shopsmart` database → **Import** → choose `seed.sql` → Go.

Or from the command line:
```bash
cd ShopSmart-Final/database
mysql -u root -p < schema.sql
mysql -u root -p shopsmart < seed.sql
```

`schema.sql` drops and recreates a fresh `shopsmart` database, so it's safe to re-run any time you want to reset the data. It also seeds the 3 categories and 15 subcategories. `seed.sql` adds the ~150 products.

---

## 4. Backend Setup (local)

```bash
cd ShopSmart-Final/backend
npm install
cp .env.example .env
```

Edit `.env` with your real MySQL credentials:
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

Visit **http://localhost:5000** in your browser.

---

## 5. API Reference

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

## 6. Testing Checklist

- [ ] Homepage loads with hero, categories, featured/deals/trending rails
- [ ] Categories → subcategories → filtered product listing navigation works
- [ ] Search, price/rating/in-stock filters, sorting, and pagination all work
- [ ] Product detail page shows full info + related products
- [ ] Add to Cart works and updates the navbar badge instantly
- [ ] Cart: quantity +/-, remove, clear cart, totals all correct
- [ ] Register/Login work (bcrypt-hashed password, JWT issued)
- [ ] Wishlist requires login; add/remove persists in MySQL
- [ ] Checkout requires login, validates fields, blocks on empty cart
- [ ] Placing an order saves to MySQL, clears the cart, redirects to My Orders
- [ ] My Orders lists past orders with items, dates, and status
- [ ] Responsive on mobile, tablet, and desktop

---

## 7. Deploying (GitHub + Railway)

### 7a. One-time code change before deploying

`frontend/js/config.js` should use a relative API path so the same frontend code works both locally and once deployed:
```js
const CONFIG = {
  API_BASE_URL: '/api',
  DELIVERY_THRESHOLD: 500,
  DELIVERY_FEE: 49,
  CURRENCY_SYMBOL: '₹'
};
```
This works because Express serves the frontend and the API from the same origin, whether that's `localhost:5000` or your deployed domain.

### 7b. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: ShopSmart full-stack e-commerce app"
```
Confirm `.env` is not staged (`git status` should only show `.env.example`), then:
```bash
git remote add origin https://github.com/YOUR_USERNAME/shopsmart-final.git
git branch -M main
git push -u origin main
```

### 7c. Deploy on Railway

Railway hosts the Node backend and a MySQL database together in one project, auto-deploys from GitHub, and gives a free public HTTPS domain.

1. **New Project → Deploy from GitHub repo** → select your repo.
2. Service **Settings**: Root Directory = `backend`, Start Command = `npm start`.
3. **New → Database → Add MySQL** in the same project.
4. On the backend service's **Variables** tab, add:
   ```
   DB_HOST=${{MySQL.MYSQLHOST}}
   DB_USER=${{MySQL.MYSQLUSER}}
   DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
   DB_PORT=${{MySQL.MYSQLPORT}}
   DB_NAME=shopsmart
   JWT_SECRET=<a long random string>
   JWT_EXPIRES_IN=7d
   ```
5. Open the MySQL service's **Connect** tab, run the provided `mysql` command from your terminal, then:
   ```sql
   CREATE DATABASE IF NOT EXISTS shopsmart;
   USE shopsmart;
   source /path/to/ShopSmart-Final/database/schema.sql;
   source /path/to/ShopSmart-Final/database/seed.sql;
   ```
6. **Settings → Generate Domain** to get your public URL.
7. Visit the URL — everything should work exactly as it did locally.

Railway auto-redeploys on every `git push` to `main`.

### 7d. Common deployment issues

| Symptom | Likely cause |
|---|---|
| `MySQL connection failed` in deploy logs | Env var names don't match the MySQL service's actual variable names — check its Connect/Variables tab |
| Blank page / 404 on routes like `/product.html` | Root Directory isn't set to `backend` |
| Products list empty | `seed.sql` wasn't imported into the Railway MySQL instance |

---

## 8. Notes

- Product images are served from Unsplash's stable CDN, chosen per-subcategory to be relevant to each product type — every URL is stored directly in `seed.sql`.
- Cart is stored in `localStorage`; wishlist and orders are stored server-side in MySQL and require a logged-in user.
- Prices are in INR (₹). Free delivery above ₹500; otherwise a flat ₹49 delivery fee.