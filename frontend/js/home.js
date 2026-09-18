// Homepage: categories + featured/deals/trending product rails

const CATEGORY_HERO_IMAGES = {
  1: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=700&q=80',
  2: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=700&q=80',
  3: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=700&q=80'
};

function renderCategoryGrid(categories) {
  const html = categories.map((c) => `
    <a class="category-card" href="categories.html?id=${c.id}">
      <img src="${CATEGORY_HERO_IMAGES[c.id] || c.image_url}" alt="${escapeHtml(c.name)}">
      <div class="cat-label">
        <h3>${escapeHtml(c.name)}</h3>
        <span>Explore now</span>
      </div>
    </a>
  `).join('');
  $('#categoryGrid').html(html);
}

$(function () {
  API.get('/categories').done((res) => renderCategoryGrid(res.data))
    .fail(() => showError('#categoryGrid', 'Could not load categories. Is the backend server running?'));

  API.get('/products', { limit: 8 }).done((res) => {
    $('#featuredGrid').html(res.data.map(productCardHTML).join(''));
    bindProductGridEvents('#featuredGrid');
    markWishlistedCards('#featuredGrid');
  }).fail(() => showError('#featuredGrid', 'Could not load featured products.'));

  API.get('/products', { limit: 8, page: 2 }).done((res) => {
    $('#dealsGrid').html(res.data.map(productCardHTML).join(''));
    bindProductGridEvents('#dealsGrid');
    markWishlistedCards('#dealsGrid');
  }).fail(() => showError('#dealsGrid', 'Could not load deals.'));

  API.get('/products', { limit: 8, sort: 'rating' }).done((res) => {
    $('#trendingGrid').html(res.data.map(productCardHTML).join(''));
    bindProductGridEvents('#trendingGrid');
    markWishlistedCards('#trendingGrid');
  }).fail(() => showError('#trendingGrid', 'Could not load trending products.'));
});
