function showTab(tabId) {
  document.querySelectorAll('.tab').forEach(t => t.classList.add('hidden'));
  document.getElementById(tabId).classList.remove('hidden');

  document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
  document.querySelector(`.tabs button[onclick*="${tabId}"]`).classList.add('active');
}
