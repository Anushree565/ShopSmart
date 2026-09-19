// Shared UI helpers used across every page

function formatPrice(value) {
  const num = Number(value) || 0;
  return CONFIG.CURRENCY_SYMBOL + num.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

function renderStars(rating) {
  const r = Number(rating) || 0;
  const full = Math.floor(r);
  const half = r - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  let html = '';
  for (let i = 0; i < full; i++) html += '<i class="fa-solid fa-star"></i>';
  if (half) html += '<i class="fa-solid fa-star-half-stroke"></i>';
  for (let i = 0; i < empty; i++) html += '<i class="fa-regular fa-star"></i>';
  return html;
}

function showToast(message, type = 'success') {
  let container = $('#toastContainer');
  if (!container.length) {
    $('body').append('<div id="toastContainer" class="toast-container"></div>');
    container = $('#toastContainer');
  }
  const toast = $(`<div class="toast toast-${type}">${message}</div>`);
  container.append(toast);
  setTimeout(() => toast.addClass('show'), 10);
  setTimeout(() => {
    toast.removeClass('show');
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}

function getCart() {
  try {
    return JSON.parse(localStorage.getItem('ss_cart')) || [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem('ss_cart', JSON.stringify(cart));
  updateCartBadge();
}

function updateCartBadge() {
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  $('.cart-badge').text(count).toggle(count > 0);
}

function isLoggedIn() {
  return !!localStorage.getItem('ss_token');
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('ss_user'));
  } catch (e) {
    return null;
  }
}

function logout() {
  localStorage.removeItem('ss_token');
  localStorage.removeItem('ss_user');
  showToast('Logged out successfully');
  setTimeout(() => (window.location.href = 'index.html'), 600);
}

function renderNavbarAuthState() {
  const container = $('#navAuthSlot');
  if (!container.length) return;

  if (isLoggedIn()) {
    const user = getCurrentUser();
    container.html(`
      <div class="nav-user-dropdown">
        <button class="nav-user-btn"><i class="fa-solid fa-circle-user"></i> ${user ? user.name.split(' ')[0] : 'Account'}</button>
        <div class="nav-user-menu">
          <a href="orders.html"><i class="fa-solid fa-box"></i> My Orders</a>
          <a href="wishlist.html"><i class="fa-solid fa-heart"></i> Wishlist</a>
          <a href="#" id="logoutBtn"><i class="fa-solid fa-right-from-bracket"></i> Logout</a>
        </div>
      </div>
    `);

    $('#logoutBtn').on('click', (e) => {
      e.preventDefault();
      logout();
    });

    // Click-to-toggle instead of hover (a hover gap between the button and
    // menu was losing the cursor before it reached the menu items).
    $('.nav-user-btn').off('click').on('click', function (e) {
      e.stopPropagation();
      $('.nav-user-menu').toggleClass('show');
    });
    $('.nav-user-menu').off('click').on('click', function (e) {
      e.stopPropagation(); // clicking inside the menu shouldn't close it via the document handler
    });
    $(document).off('click.userMenu').on('click.userMenu', () => {
      $('.nav-user-menu').removeClass('show');
    });
  } else {
    container.html(`<a href="login.html" class="nav-login-link"><i class="fa-solid fa-user"></i> Login</a>`);
  }
}

function requireLogin(redirectTarget) {
  if (!isLoggedIn()) {
    showToast('Please login to continue', 'error');
    setTimeout(() => {
      window.location.href = `login.html?redirect=${encodeURIComponent(redirectTarget || window.location.pathname)}`;
    }, 700);
    return false;
  }
  return true;
}

function showError(container, message) {
  $(container).html(`
    <div class="empty-state">
      <i class="fa-solid fa-triangle-exclamation"></i>
      <p>${message}</p>
    </div>
  `);
}

function initNavbarSearch() {
  $('#navSearchForm').on('submit', function (e) {
    e.preventDefault();
    const q = $('#navSearchInput').val().trim();
    window.location.href = `products.html?search=${encodeURIComponent(q)}`;
  });
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

// Renders a single product card. Shared by home, products, and category pages.
function productCardHTML(p) {
  const discountBadge = p.discount_percent > 0
    ? `<span class="discount-badge">${p.discount_percent}% OFF</span>` : '';
  const outOfStock = p.stock <= 0;
  return `
    <div class="product-card" data-id="${p.id}">
      <a href="product.html?id=${p.id}">
        <div class="product-thumb">
          <img src="${p.image_url}" alt="${escapeHtml(p.name)}" loading="lazy">
          ${discountBadge}
        </div>
      </a>
      <button class="wishlist-btn" data-id="${p.id}" title="Add to wishlist">
        <i class="fa-solid fa-heart"></i>
      </button>
      <div class="product-info">
        <div class="product-subcat">${escapeHtml(p.subcategory_name || '')}</div>
        <a href="product.html?id=${p.id}"><div class="product-name">${escapeHtml(p.name)}</div></a>
        <div class="product-rating">${renderStars(p.rating)} <span>(${p.review_count})</span></div>
        <div class="product-price-row">
          <span class="price-now">${formatPrice(p.price)}</span>
          ${p.original_price > p.price ? `<span class="price-original">${formatPrice(p.original_price)}</span>` : ''}
        </div>
        ${outOfStock ? '<div class="out-of-stock-tag">Out of stock</div>' : ''}
        <button class="btn-add-cart" data-id="${p.id}" ${outOfStock ? 'disabled' : ''}>
          <i class="fa-solid fa-cart-plus"></i> ${outOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  `;
}

function bindProductGridEvents(container) {
  $(container).find('.btn-add-cart').on('click', function (e) {
    e.preventDefault();
    addToCartById($(this).data('id'), 1);
  });
  $(container).find('.wishlist-btn').on('click', function (e) {
    e.preventDefault();
    toggleWishlistFromCard($(this), $(this).data('id'));
  });
}

function addToCartById(productId, quantity) {
  API.get(`/products/${productId}`).done((res) => {
    const product = res.data;
    if (product.stock <= 0) {
      showToast('This product is out of stock', 'error');
      return;
    }
    const cart = getCart();
    const existing = cart.find((i) => i.productId === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image_url,
        quantity
      });
    }
    saveCart(cart);
    showToast('Added to cart');
  }).fail(() => showToast('Could not add product to cart', 'error'));
}

function toggleWishlistFromCard(btn, productId) {
  if (!isLoggedIn()) {
    showToast('Please login to use wishlist', 'error');
    setTimeout(() => (window.location.href = 'login.html'), 700);
    return;
  }
  if (btn.hasClass('active')) {
    API.del(`/wishlist/${productId}`).done(() => {
      btn.removeClass('active');
      showToast('Removed from wishlist');
    });
  } else {
    API.post('/wishlist', { productId }).done(() => {
      btn.addClass('active');
      showToast('Added to wishlist');
    }).fail(() => showToast('Could not update wishlist', 'error'));
  }
}

// Marks wishlist-btn icons active for products already in the logged-in user's wishlist
function markWishlistedCards(container) {
  if (!isLoggedIn()) return;
  API.get('/wishlist').done((res) => {
    const ids = new Set(res.data.map((p) => p.id));
    $(container).find('.wishlist-btn').each(function () {
      const id = Number($(this).data('id'));
      if (ids.has(id)) $(this).addClass('active');
    });
  });
}

$(function () {
  updateCartBadge();
  renderNavbarAuthState();
  initNavbarSearch();
});