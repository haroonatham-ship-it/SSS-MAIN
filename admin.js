const loginPanel = document.getElementById('loginPanel');
const recordsPanel = document.getElementById('recordsPanel');
const loginForm = document.getElementById('loginForm');
const loginStatus = document.getElementById('loginStatus');
const logoutBtn = document.getElementById('logoutBtn');
const studentRows = document.getElementById('studentRows');
const recordsStatus = document.getElementById('recordsStatus');
const searchInput = document.getElementById('searchInput');
const recordCount = document.getElementById('recordCount');
let students = [];

function addCell(row, value) {
  const cell = document.createElement('td');
  cell.textContent = value == null || value === '' ? '—' : String(value);
  row.appendChild(cell);
  return cell;
}
function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
}
function renderStudents() {
  const term = searchInput.value.trim().toLowerCase();
  const filtered = students.filter(s => [s.fullName, s.email, s.phone, s.course, s.education].some(v => String(v || '').toLowerCase().includes(term)));
  studentRows.replaceChildren();
  recordCount.textContent = `${filtered.length} record${filtered.length === 1 ? '' : 's'}`;
  if (!filtered.length) {
    const row = document.createElement('tr'); const cell = document.createElement('td');
    cell.colSpan = 7; cell.className = 'muted'; cell.textContent = students.length ? 'No matching records.' : 'No registrations yet.'; row.appendChild(cell); studentRows.appendChild(row); return;
  }
  for (const student of filtered) {
    const row = document.createElement('tr');
    addCell(row, student.id);
    const nameCell = addCell(row, student.fullName);
    if (student.message) { const note = document.createElement('div'); note.className = 'muted'; note.style.marginTop = '5px'; note.textContent = student.message; nameCell.appendChild(note); }
    const contact = document.createElement('td');
    const email = document.createElement('div'); email.textContent = student.email || '—';
    const phone = document.createElement('div'); phone.className = 'muted'; phone.textContent = student.phone || '—';
    contact.append(email, phone); row.appendChild(contact);
    addCell(row, student.course); addCell(row, student.education); addCell(row, formatDate(student.createdAt));
    const actionCell = document.createElement('td'); const del = document.createElement('button'); del.className = 'delete-btn'; del.textContent = 'Delete';
    del.addEventListener('click', () => deleteStudent(student.id)); actionCell.appendChild(del); row.appendChild(actionCell);
    studentRows.appendChild(row);
  }
}
async function loadStudents() {
  recordsStatus.textContent = 'Loading student records…';
  try {
    const response = await fetch('/api/admin/students'); const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Unable to load records.');
    students = data; renderStudents(); recordsStatus.textContent = '';
  } catch (error) {
    recordsStatus.textContent = error.message;
  }
}
async function checkSession() {
  try { const response = await fetch('/api/admin/me'); const data = await response.json(); if (data.isAdmin) showRecords(); }
  catch (_error) { /* Login form remains available if the server cannot be reached. */ }
}
function showRecords() {
  loginPanel.classList.add('hidden'); recordsPanel.classList.remove('hidden'); logoutBtn.classList.remove('hidden'); loadStudents();
}
loginForm.addEventListener('submit', async event => {
  event.preventDefault(); loginStatus.textContent = 'Signing in…';
  const password = new FormData(loginForm).get('password');
  try {
    const response = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
    const data = await response.json(); if (!response.ok) throw new Error(data.message || 'Login failed.');
    loginStatus.className = 'admin-status ok'; loginStatus.textContent = 'Signed in.'; loginForm.reset(); showRecords();
  } catch (error) { loginStatus.className = 'admin-status'; loginStatus.textContent = error.message; }
});
async function deleteStudent(id) {
  if (!confirm(`Delete student record #${id}? This cannot be undone.`)) return;
  try {
    const response = await fetch(`/api/admin/students/${encodeURIComponent(id)}`, { method: 'DELETE' });
    const data = await response.json(); if (!response.ok) throw new Error(data.message || 'Delete failed.');
    students = students.filter(s => s.id !== id); renderStudents(); recordsStatus.className = 'admin-status ok'; recordsStatus.textContent = data.message;
  } catch (error) { recordsStatus.className = 'admin-status'; recordsStatus.textContent = error.message; }
}
logoutBtn.addEventListener('click', async () => {
  await fetch('/api/admin/logout', { method: 'POST' });
  recordsPanel.classList.add('hidden'); logoutBtn.classList.add('hidden'); loginPanel.classList.remove('hidden'); loginStatus.textContent = 'You have logged out.'; loginStatus.className = 'admin-status ok';
});
searchInput.addEventListener('input', renderStudents);
document.getElementById('refreshBtn').addEventListener('click', loadStudents);
checkSession();
