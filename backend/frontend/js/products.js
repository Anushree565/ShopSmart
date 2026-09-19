// products.html: listing with filters, sorting, search, and pagination

let currentCategories = [];
let currentSubcategories = [];

function getParams() {
  return new URLSearchParams(window.location.search);
}

function buildQueryFromState(state) {
  const params = new URLSearchParams();
  if (state.category) params.set('category', state.category);
  if (state.subcategory) params.set('subcategory', state.subcategory);
  if (state.search) params.set('search', state.search);
  if (state.sort) params.set('sort', state.sort);
  if (state.priceRange) params.set('price', state.priceRange);
  if (state.rating) params.set('rating', state.rating);
  if (state.inStock) params.set('inStock', '1');
  if (state.page && state.page > 1) params.set('page', state.page);
  return params;
}

function readStateFromUrl() {
  const p = getParams();
  return {
    category: p.get('category') || '',
    subcategory: p.get('subcategory') || '',
    search: p.get('search') || '',
    sort: p.get('sort') || '',
    priceRange: p.get('price') || '',
    rating: p.get('rating') || '',
    inStock: p.get('inStock') === '1',
    page: parseInt(p.get('page'), 10) || 1
  };
}

function updateUrl(state) {
  const query = buildQueryFromState(state);
  const newUrl = `products.html${query.toString() ? '?' + query.toString() : ''}`;
  window.history.replaceState({}, '', newUrl);
}

function updateBreadcrumbAndTitle(state) {
  let title = 'All Products';
  let crumbs = '<a href="index.html">Home</a> / <a href="products.html">Products</a>';

  if (state.search) {
    title = `Results for "${escapeHtml(state.search)}"`;
    crumbs += ` / <span>Search</span>`;
  } else if (state.category) {
    const cat = currentCategories.find((c) => String(c.id) === String(state.category));
    if (cat) {
      title = cat.name;
      crumbs += ` / <a href="categories.html?id=${cat.id}">${cat.name}</a>`;
      if (state.subcategory) {
        const sub = currentSubcategories.find((s) => String(s.id) === String(state.subcategory));
        if (sub) {
          title = sub.name;
          crumbs += ` / <span>${sub.name}</span>`;
        }
      } else {
        crumbs += ` / <span>All</span>`;
      }
    }
  }

  $('#pageTitle').text(title);
  $('#breadcrumbs').html(crumbs);
}

function loadProducts(state) {
  $('#productGrid').html('<div class="skeleton" style="height:320px;"></div><div class="skeleton" style="height:320px;"></div><div class="skeleton" style="height:320px;"></div><div class="skeleton" style="height:320px;"></div>');

  const query = { page: state.page, limit: 12 };
  if (state.category) query.category = state.category;
  if (state.subcategory) query.subcategory = state.subcategory;
  if (state.search) query.search = state.search;
  if (state.sort) query.sort = state.sort;
  if (state.rating) query.rating = state.rating;
  if (state.inStock) query.inStock = 'true';
  if (state.priceRange) {
    const [min, max] = state.priceRange.split('-');
    if (min) query.minPrice = min;
    if (max) query.maxPrice = max;
  }

  API.get('/products', query).done((res) => {
    $('#productCount').text(`${res.pagination.total} product${res.pagination.total !== 1 ? 's' : ''} found`);
    $('#resultsLabel').text(`Showing ${res.data.length} of ${res.pagination.total} results`);

    if (!res.data.length) {
      $('#productGrid').html(`
        <div class="empty-state" style="grid-column:1/-1;">
          <i class="fa-solid fa-box-open"></i>
          <p>No products match your filters.</p>
          <a href="products.html">Clear filters</a>
        </div>
      `);
      $('#pagination').empty();
      return;
    }

    $('#productGrid').html(res.data.map(productCardHTML).join(''));
    bindProductGridEvents('#productGrid');
    markWishlistedCards('#productGrid');
    renderPagination(res.pagination, state);
  }).fail(() => showError('#productGrid', 'Could not load products. Is the backend server running?'));
}

function renderPagination(pagination, state) {
  const { page, totalPages } = pagination;
  if (totalPages <= 1) { $('#pagination').empty(); return; }

  let html = `<button ${page === 1 ? 'disabled' : ''} data-page="${page - 1}"><i class="fa-solid fa-chevron-left"></i></button>`;
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) {
    html += `<button class="${i === page ? 'active' : ''}" data-page="${i}">${i}</button>`;
  }
  html += `<button ${page === totalPages ? 'disabled' : ''} data-page="${page + 1}"><i class="fa-solid fa-chevron-right"></i></button>`;
  $('#pagination').html(html);

  $('#pagination button').on('click', function () {
    const newPage = Number($(this).data('page'));
    state.page = newPage;
    updateUrl(state);
    loadProducts(state);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function bindFilterControls(state) {
  $(`input[name="price"][value="${state.priceRange}"]`).prop('checked', true);
  $(`input[name="rating"][value="${state.rating}"]`).prop('checked', true);
  $('#inStockFilter').prop('checked', state.inStock);
  $('#sortSelect').val(state.sort);

  $('input[name="price"]').on('change', function () {
    state.priceRange = $(this).val();
    state.page = 1;
    updateUrl(state);
    loadProducts(state);
  });
  $('input[name="rating"]').on('change', function () {
    state.rating = $(this).val();
    state.page = 1;
    updateUrl(state);
    loadProducts(state);
  });
  $('#inStockFilter').on('change', function () {
    state.inStock = $(this).is(':checked');
    state.page = 1;
    updateUrl(state);
    loadProducts(state);
  });
  $('#sortSelect').on('change', function () {
    state.sort = $(this).val();
    updateUrl(state);
    loadProducts(state);
  });
}

$(function () {
  const state = readStateFromUrl();
  if (state.search) $('#navSearchInput').val(state.search);

  bindFilterControls(state);

  API.get('/categories').done((res) => {
    currentCategories = res.data;
    if (state.category) {
      API.get(`/categories/${state.category}/subcategories`).done((subRes) => {
        currentSubcategories = subRes.data;
        updateBreadcrumbAndTitle(state);
      });
    } else {
      updateBreadcrumbAndTitle(state);
    }
  });

  loadProducts(state);
});
