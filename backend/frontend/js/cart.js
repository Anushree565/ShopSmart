// cart.html: renders localStorage cart, quantity controls, totals

function calcTotals(cart) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const delivery = subtotal === 0 || subtotal >= CONFIG.DELIVERY_THRESHOLD ? 0 : CONFIG.DELIVERY_FEE;
  const total = subtotal + delivery;
  return { subtotal, delivery, total };
}

function renderCart() {
  const cart = getCart();

  if (!cart.length) {
    $('#cartItemsList').html(`
      <div class="empty-state">
        <i class="fa-solid fa-cart-shopping"></i>
        <p>Your cart is empty.</p>
        <a href="products.html">Start shopping</a>
      </div>
    `);
    $('#cartActionsRow').hide();
  } else {
    $('#cartActionsRow').show();
    const html = cart.map((item) => `
      <div class="cart-item" data-id="${item.productId}">
        <img src="${item.image}" alt="${escapeHtml(item.name)}">
        <div>
          <h4>${escapeHtml(item.name)}</h4>
          <div class="item-price">${formatPrice(item.price)} each</div>
          <a href="#" class="remove-item" data-id="${item.productId}">Remove</a>
        </div>
        <div class="qty-btns">
          <button class="qty-dec" data-id="${item.productId}">−</button>
          <span>${item.quantity}</span>
          <button class="qty-inc" data-id="${item.productId}">+</button>
        </div>
        <div style="font-weight:800; min-width:90px; text-align:right;">${formatPrice(item.price * item.quantity)}</div>
      </div>
    `).join('');
    $('#cartItemsList').html(html);
  }

  const { subtotal, delivery, total } = calcTotals(cart);
  $('#sumSubtotal').text(formatPrice(subtotal));
  $('#sumDelivery').html(delivery === 0 ? '<span class="free">FREE</span>' : formatPrice(delivery));
  $('#sumTotal').text(formatPrice(total));

  bindCartEvents();
}

function bindCartEvents() {
  $('.qty-inc').off('click').on('click', function () {
    const id = Number($(this).data('id'));
    const cart = getCart();
    const item = cart.find((i) => i.productId === id);
    if (item) { item.quantity++; saveCart(cart); renderCart(); }
  });

  $('.qty-dec').off('click').on('click', function () {
    const id = Number($(this).data('id'));
    let cart = getCart();
    const item = cart.find((i) => i.productId === id);
    if (item) {
      item.quantity--;
      if (item.quantity <= 0) cart = cart.filter((i) => i.productId !== id);
      saveCart(cart);
      renderCart();
    }
  });

  $('.remove-item').off('click').on('click', function (e) {
    e.preventDefault();
    const id = Number($(this).data('id'));
    const cart = getCart().filter((i) => i.productId !== id);
    saveCart(cart);
    renderCart();
    showToast('Item removed from cart');
  });
}

$(function () {
  renderCart();

  $('#clearCartBtn').on('click', (e) => {
    e.preventDefault();
    saveCart([]);
    renderCart();
    showToast('Cart cleared');
  });

  $('#checkoutBtn').on('click', () => {
    if (!getCart().length) {
      showToast('Your cart is empty', 'error');
      return;
    }
    if (requireLogin('checkout.html')) {
      window.location.href = 'checkout.html';
    }
  });
});
