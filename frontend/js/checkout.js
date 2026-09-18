// checkout.html: renders order summary, validates fields, places order

function renderCheckoutSummary() {
  const cart = getCart();

  if (!cart.length) {
    showToast('Your cart is empty', 'error');
    setTimeout(() => (window.location.href = 'cart.html'), 800);
    return;
  }

  const itemsHtml = cart.map((item) => `
    <div class="checkout-item-row">
      <span>${escapeHtml(item.name)} × ${item.quantity}</span>
      <span>${formatPrice(item.price * item.quantity)}</span>
    </div>
  `).join('');
  $('#checkoutItemsList').html(itemsHtml);

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const delivery = subtotal >= CONFIG.DELIVERY_THRESHOLD ? 0 : CONFIG.DELIVERY_FEE;
  const total = subtotal + delivery;

  $('#coSubtotal').text(formatPrice(subtotal));
  $('#coDelivery').html(delivery === 0 ? '<span class="free">FREE</span>' : formatPrice(delivery));
  $('#coTotal').text(formatPrice(total));
}

function validateField(id, condition) {
  const valid = condition;
  $(`#${id}`).css('border-color', valid ? '' : 'var(--red)');
  $(`#err-${id}`).toggle(!valid);
  return valid;
}

function validateCheckoutForm() {
  const fullName = $('#fullName').val().trim();
  const email = $('#email').val().trim();
  const phone = $('#phone').val().trim();
  const address = $('#address').val().trim();
  const city = $('#city').val().trim();
  const state = $('#state').val().trim();
  const pincode = $('#pincode').val().trim();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9]{10}$/;
  const pinRegex = /^[0-9]{6}$/;

  const checks = [
    validateField('fullName', fullName.length >= 2),
    validateField('email', emailRegex.test(email)),
    validateField('phone', phoneRegex.test(phone)),
    validateField('address', address.length >= 5),
    validateField('city', city.length >= 2),
    validateField('state', state.length >= 2),
    validateField('pincode', pinRegex.test(pincode))
  ];

  return checks.every(Boolean);
}

$(function () {
  if (!requireLogin('checkout.html')) return;

  renderCheckoutSummary();

  $('.payment-option').on('click', function () {
    $('.payment-option').removeClass('selected');
    $(this).addClass('selected');
    $(this).find('input').prop('checked', true);
  });
  $('.payment-option[data-value="COD"]').addClass('selected');

  $('#placeOrderBtn').on('click', function () {
    if (!validateCheckoutForm()) {
      showToast('Please fix the highlighted fields', 'error');
      return;
    }

    const cart = getCart();
    if (!cart.length) {
      showToast('Your cart is empty', 'error');
      return;
    }

    const payload = {
      fullName: $('#fullName').val().trim(),
      email: $('#email').val().trim(),
      phone: $('#phone').val().trim(),
      address: $('#address').val().trim(),
      city: $('#city').val().trim(),
      state: $('#state').val().trim(),
      pincode: $('#pincode').val().trim(),
      paymentMethod: $('input[name="payment"]:checked').val(),
      items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity }))
    };

    const btn = $(this);
    btn.prop('disabled', true).text('Placing order…');

    API.post('/orders', payload).done((res) => {
      saveCart([]);
      showToast('Order placed successfully!');
      setTimeout(() => (window.location.href = 'orders.html'), 900);
    }).fail((xhr) => {
      const msg = xhr.responseJSON?.message || 'Failed to place order. Please try again.';
      showToast(msg, 'error');
      btn.prop('disabled', false).text('Place Order');
    });
  });
});
