// Thin wrapper around $.ajax for talking to the ShopSmart API
const API = {
  _headers() {
    const token = localStorage.getItem('ss_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  },

  get(endpoint, data = {}) {
    return $.ajax({
      url: CONFIG.API_BASE_URL + endpoint,
      method: 'GET',
      data,
      headers: API._headers(),
      dataType: 'json'
    });
  },

  post(endpoint, data = {}) {
    return $.ajax({
      url: CONFIG.API_BASE_URL + endpoint,
      method: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json',
      headers: API._headers(),
      dataType: 'json'
    });
  },

  del(endpoint) {
    return $.ajax({
      url: CONFIG.API_BASE_URL + endpoint,
      method: 'DELETE',
      headers: API._headers(),
      dataType: 'json'
    });
  }
};
