// product.html: single product detail + related products

let currentProduct = null;
let selectedQty = 1;

function getProductIdFromUrl() {
  return new URLSearchParams(window.location.search).get('id');
}

function renderProductDetail(product) {
  currentProduct = product;

  $('#breadcrumbs').html(`
    <a href="index.html">Home</a> /
    <a href="products.html?category=${product.category_id}">${escapeHtml(product.category_name)}</a> /
    <a href="products.html?category=${product.category_id}&subcategory=${product.subcategory_id}">${escapeHtml(product.subcategory_name)}</a> /
    <span>${escapeHtml(product.name)}</span>
  `);
  document.title = `${product.name} — ShopSmart`;

  const inStock = product.stock > 0;
  const discount = product.discount_percent > 0
    ? `<span class="price-discount">${product.discount_percent}% off</span>` : '';

  const html = `
    <div class="pd-gallery">
      <img src="${product.image_url}" alt="${escapeHtml(product.name)}">
    </div>
    <div>
      <h1 class="pd-title">${escapeHtml(product.name)}</h1>
      <div class="pd-rating-row">
        <span class="pd-rating-badge">${product.rating} <i class="fa-solid fa-star"></i></span>
        <span style="font-size:13.5px; color:var(--ink-soft);">${product.review_count} ratings</span>
      </div>
      <div class="pd-price-row">
        <span class="price-now">${formatPrice(product.price)}</span>
        ${product.original_price > product.price ? `<span class="price-original">${formatPrice(product.original_price)}</span>` : ''}
        ${discount}
      </div>
      <div class="pd-stock ${inStock ? 'in' : 'out'}">
        <i class="fa-solid ${inStock ? 'fa-circle-check' : 'fa-circle-xmark'}"></i>
        ${inStock ? `In Stock (${product.stock} available)` : 'Out of Stock'}
      </div>
      <p class="pd-desc">${escapeHtml(product.description)}</p>

      <div class="qty-selector">
        <span style="font-weight:700; font-size:14px;">Quantity</span>
        <div class="qty-btns">
          <button id="qtyMinus">−</button>
          <span id="qtyValue">1</span>
          <button id="qtyPlus">+</button>
        </div>
      </div>

      <div class="pd-actions">
        <button class="btn-primary-lg" id="pdAddToCart" ${inStock ? '' : 'disabled'}>
          <i class="fa-solid fa-cart-plus"></i> ${inStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
        <button class="btn-outline-lg" id="pdWishlist">
          <i class="fa-solid fa-heart"></i> Wishlist
        </button>
      </div>
    </div>
  `;

  $('#productDetailContainer .product-detail').replaceWith(`<div class="product-detail">${html}</div>`);

  $('#qtyMinus').on('click', () => {
    if (selectedQty > 1) { selectedQty--; $('#qtyValue').text(selectedQty); }
  });
  $('#qtyPlus').on('click', () => {
    if (selectedQty < product.stock) { selectedQty++; $('#qtyValue').text(selectedQty); }
  });
  $('#pdAddToCart').on('click', () => {
    addToCartById(product.id, selectedQty);
  });
  $('#pdWishlist').on('click', function () {
    const btn = $(this);
    if (!isLoggedIn()) {
      showToast('Please login to use wishlist', 'error');
      setTimeout(() => (window.location.href = 'login.html'), 700);
      return;
    }
    if (btn.hasClass('active')) {
      API.del(`/wishlist/${product.id}`).done(() => {
        btn.removeClass('active');
        showToast('Removed from wishlist');
      });
    } else {
      API.post('/wishlist', { productId: product.id }).done(() => {
        btn.addClass('active');
        showToast('Added to wishlist');
      });
    }
  });

  if (isLoggedIn()) {
    API.get('/wishlist').done((res) => {
      if (res.data.some((p) => p.id === product.id)) $('#pdWishlist').addClass('active');
    });
  }
}

$(function () {
  const id = getProductIdFromUrl();
  if (!id) {
    showError('#productDetailContainer', 'No product specified.');
    return;
  }

  API.get(`/products/${id}`).done((res) => {
    renderProductDetail(res.data);
    if (res.related && res.related.length) {
      $('#relatedGrid').html(res.related.map(productCardHTML).join(''));
      bindProductGridEvents('#relatedGrid');
      markWishlistedCards('#relatedGrid');
    } else {
      $('#relatedGrid').closest('.section').hide();
    }
  }).fail((xhr) => {
    const msg = xhr.status === 404 ? 'Product not found.' : 'Could not load this product. Is the backend server running?';
    showError('#productDetailContainer', msg);
  });
});
