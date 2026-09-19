// Global configuration for the ShopSmart frontend
const CONFIG = {
  // Relative path works both locally (http://localhost:5000) and once deployed,
  // since Express serves the frontend and the API from the same origin.
  API_BASE_URL: '/api',
  DELIVERY_THRESHOLD: 500, // free delivery above this subtotal
  DELIVERY_FEE: 49,
  CURRENCY_SYMBOL: '₹'
};
