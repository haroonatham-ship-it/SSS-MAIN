const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
menuToggle?.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.textContent = isOpen ? '✕' : '☰';
});
navLinks?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  navLinks.classList.remove('open');
  menuToggle?.setAttribute('aria-expanded', 'false');
  if (menuToggle) menuToggle.textContent = '☰';
}));

document.querySelectorAll('[data-course]').forEach(link => link.addEventListener('click', () => {
  const select = document.getElementById('courseSelect');
  if (select) select.value = link.dataset.course;
}));

const form = document.getElementById('registrationForm');
const status = document.getElementById('formStatus');
form?.addEventListener('submit', async event => {
  event.preventDefault();
  status.textContent = 'Submitting your details…';
  status.className = 'form-status';
  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  try {
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    const response = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Registration failed.');
    status.textContent = result.message;
    status.className = 'form-status success';
    form.reset();
  } catch (error) {
    status.textContent = error.message || 'Could not submit. Please check that the server is running.';
    status.className = 'form-status error';
  } finally {
    submitButton.disabled = false;
  }
});

document.getElementById('year').textContent = new Date().getFullYear();
