// wishlist.html: shows the logged-in user's wishlist, backed by MySQL

function loadWishlist() {
  API.get('/wishlist').done((res) => {
    if (!res.data.length) {
      $('#wishlistGrid').html(`
        <div class="empty-state" style="grid-column:1/-1;">
          <i class="fa-solid fa-heart-crack"></i>
          <p>Your wishlist is empty.</p>
          <a href="products.html">Browse products</a>
        </div>
      `);
      return;
    }

    $('#wishlistGrid').html(res.data.map(productCardHTML).join(''));
    $('#wishlistGrid .wishlist-btn').addClass('active');
    bindProductGridEvents('#wishlistGrid');

    // Remove card from view immediately when un-hearted
    $('#wishlistGrid .wishlist-btn').on('click', function () {
      const card = $(this).closest('.product-card');
      setTimeout(() => {
        if (!$(this).hasClass('active')) card.fadeOut(200, () => card.remove());
      }, 50);
    });
  }).fail(() => showError('#wishlistGrid', 'Could not load your wishlist. Is the backend server running?'));
}

$(function () {
  if (!requireLogin('wishlist.html')) return;
  loadWishlist();
});
