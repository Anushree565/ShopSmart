// login.html + register.html: form validation and API calls

function getRedirectTarget() {
  return new URLSearchParams(window.location.search).get('redirect') || 'index.html';
}

function toggleFieldError(inputId, valid) {
  $(`#${inputId}`).css('border-color', valid ? '' : 'var(--red)');
  $(`#err-${inputId}`).toggle(!valid);
}

$(function () {
  if (isLoggedIn()) {
    // already logged in — no need to show auth forms
    if (window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html')) {
      window.location.href = getRedirectTarget();
      return;
    }
  }

  // ---------- LOGIN ----------
  $('#loginBtn').on('click', function () {
    const email = $('#loginEmail').val().trim();
    const password = $('#loginPassword').val();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const emailValid = emailRegex.test(email);
    const passwordValid = password.length > 0;
    toggleFieldError('loginEmail', emailValid);
    toggleFieldError('loginPassword', passwordValid);
    if (!emailValid || !passwordValid) return;

    const btn = $(this).prop('disabled', true).text('Logging in…');

    API.post('/auth/login', { email, password }).done((res) => {
      localStorage.setItem('ss_token', res.token);
      localStorage.setItem('ss_user', JSON.stringify(res.user));
      showToast('Login successful');
      setTimeout(() => (window.location.href = getRedirectTarget()), 500);
    }).fail((xhr) => {
      const msg = xhr.responseJSON?.message || 'Login failed. Please try again.';
      showToast(msg, 'error');
      btn.prop('disabled', false).text('Login');
    });
  });

  // ---------- REGISTER ----------
  $('#registerBtn').on('click', function () {
    const name = $('#regName').val().trim();
    const email = $('#regEmail').val().trim();
    const password = $('#regPassword').val();
    const confirmPassword = $('#regConfirmPassword').val();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const nameValid = name.length >= 2;
    const emailValid = emailRegex.test(email);
    const passwordValid = password.length >= 6;
    const confirmValid = password === confirmPassword && confirmPassword.length > 0;

    toggleFieldError('regName', nameValid);
    toggleFieldError('regEmail', emailValid);
    toggleFieldError('regPassword', passwordValid);
    toggleFieldError('regConfirmPassword', confirmValid);
    if (!nameValid || !emailValid || !passwordValid || !confirmValid) return;

    const btn = $(this).prop('disabled', true).text('Creating account…');

    API.post('/auth/register', { name, email, password, confirmPassword }).done((res) => {
      localStorage.setItem('ss_token', res.token);
      localStorage.setItem('ss_user', JSON.stringify(res.user));
      showToast('Account created successfully');
      setTimeout(() => (window.location.href = getRedirectTarget()), 500);
    }).fail((xhr) => {
      const msg = xhr.responseJSON?.message || 'Registration failed. Please try again.';
      showToast(msg, 'error');
      btn.prop('disabled', false).text('Create Account');
    });
  });
});
