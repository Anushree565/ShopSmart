# ShopSmart

A full-stack e-commerce site — Electronics, Fashion, and Home & Living — built with Node.js/Express, MySQL, and a vanilla HTML/CSS/jQuery frontend. ~150 seeded products across 15 subcategories, JWT auth, cart, wishlist, checkout, and order history.

**🚀 Live demo:** [shopsmart-production-c5aa.up.railway.app](https://shopsmart-production-c5aa.up.railway.app)

## Stack
Node.js + Express · MySQL · vanilla HTML/CSS/jQuery · JWT + bcrypt

## Run it locally

**1. Database**
```bash
cd database
mysql -u root -p < schema.sql
mysql -u root -p shopsmart < seed.sql
```

**2. Backend**
```bash
cd backend
npm install
cp .env.example .env   # then fill in your MySQL credentials + a JWT secret
npm run dev
```

**3. Open** [http://localhost:5000](http://localhost:5000) — frontend and API are served together from one port.

## Features
- Browse by category → subcategory → filtered/sorted/paginated product listing
- Product search, cart (localStorage), wishlist & order history (MySQL, login required)
- JWT-based register/login with bcrypt-hashed passwords
- Checkout with field validation and order placement

## API
`/api/products`, `/api/products/:id`, `/api/categories`, `/api/categories/:id/subcategories`, `/api/auth/register`, `/api/auth/login`, `/api/orders` (auth), `/api/wishlist` (auth)

## Deployed on Railway
Backend + MySQL both hosted on [Railway](https://railway.app), auto-deployed from this GitHub repo.

**Notes from getting this running, in case future-me hits the same walls:**
- `frontend/` must live *inside* `backend/` (not as a sibling folder) — Railway's build only includes files under the configured Root Directory, so a sibling folder silently gets excluded.
- Set **Build Command to empty** and only set a **Start Command** (`npm start`) — having both set to the same command causes a config error.
- In Railway's Variables Raw Editor, **no spaces around `=`** and **no quotes around values** — `NAME =value` or `NAME="value"` both get parsed incorrectly and trigger an "invalid variable name" build failure.
- Railway's Data tab only browses its *default* database — if your app uses a differently-named database (this project uses `shopsmart`), check via the Console tab (`mysql -u root -p$MYSQL_ROOT_PASSWORD` → `SHOW DATABASES;`) instead of trusting an empty-looking Data tab.
- The Console's paste limit is ~32KB — a large seed file needs splitting into chunks before pasting.
