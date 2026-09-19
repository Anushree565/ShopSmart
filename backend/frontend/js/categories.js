// Categories page: shows 3 main categories, or subcategories of a selected one

const CATEGORY_IMAGES = {
  1: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=700&q=80',
  2: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=700&q=80',
  3: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=700&q=80'
};

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function renderMainCategories(categories) {
  const html = categories.map((c) => `
    <a class="category-card" href="categories.html?id=${c.id}">
      <img src="${CATEGORY_IMAGES[c.id] || c.image_url}" alt="${c.name}">
      <div class="cat-label">
        <h3>${c.name}</h3>
        <span>View subcategories</span>
      </div>
    </a>
  `).join('');
  $('#mainCategoryGrid').html(html);
}

function renderSubcategories(category, subcats) {
  $('#mainCategoriesSection').hide();
  $('#subcategorySection').show();
  $('#pageTitle').text(category.name);
  $('#pageSubtitle').text(`${subcats.length} subcategories in ${category.name}`);
  $('#breadcrumbs').html(`<a href="index.html">Home</a> / <a href="categories.html">Categories</a> / <span>${category.name}</span>`);

  const html = subcats.map((s) => `
    <a class="subcat-card" href="products.html?category=${category.id}&subcategory=${s.id}">
      <img src="${s.image_url}" alt="${s.name}">
      <h4>${s.name}</h4>
      <span>${s.product_count} products</span>
    </a>
  `).join('');
  $('#subcategoryGrid').html(html);
}

$(function () {
  const categoryId = getQueryParam('id');

  API.get('/categories').done((res) => {
    const categories = res.data;

    if (!categoryId) {
      renderMainCategories(categories);
      return;
    }

    const category = categories.find((c) => String(c.id) === String(categoryId));
    if (!category) {
      showError('#mainCategoryGrid', 'Category not found.');
      return;
    }

    API.get(`/categories/${categoryId}/subcategories`).done((subRes) => {
      renderSubcategories(category, subRes.data);
    }).fail(() => showError('#mainCategoryGrid', 'Could not load subcategories.'));
  }).fail(() => showError('#mainCategoryGrid', 'Could not load categories. Is the backend server running?'));
});
