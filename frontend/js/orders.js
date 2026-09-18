// orders.html: lists the logged-in user's past orders from MySQL

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function renderOrders(orders) {
  if (!orders.length) {
    $('#ordersList').html(`
      <div class="empty-state">
        <i class="fa-solid fa-box-open"></i>
        <p>You haven't placed any orders yet.</p>
        <a href="products.html">Start shopping</a>
      </div>
    `);
    return;
  }

  const html = orders.map((order) => `
    <div class="order-card">
      <div class="order-card-head">
        <div>
          <strong>Order #${order.id}</strong>
          <div style="font-size:12.5px; color:var(--ink-soft);">Placed on ${formatDate(order.created_at)}</div>
        </div>
        <span class="order-status status-${order.status}">${order.status}</span>
      </div>
      <div>
        ${order.items.map((item) => `
          <div class="order-item-row">
            <div>
              <div style="font-weight:600; font-size:14px;">${escapeHtml(item.product_name)}</div>
              <div style="font-size:12.5px; color:var(--ink-soft);">Qty: ${item.quantity} × ${formatPrice(item.price)}</div>
            </div>
          </div>
        `).join('')}
      </div>
      <div style="display:flex; justify-content:space-between; margin-top:14px; padding-top:14px; border-top:1px solid var(--line); font-weight:800;">
        <span>Total</span><span>${formatPrice(order.total)}</span>
      </div>
    </div>
  `).join('');

  $('#ordersList').html(html);
}

$(function () {
  if (!requireLogin('orders.html')) return;

  API.get('/orders').done((res) => renderOrders(res.data))
    .fail(() => showError('#ordersList', 'Could not load your orders. Is the backend server running?'));
});
