// Error page — displays error info from query parameters

const params = new URLSearchParams(window.location.search);
const messageElement = document.getElementById('error-message');
const detailElement = document.getElementById('error-detail');
const retryButton = document.getElementById('retry-button');

const message = params.get('message') || 'An unexpected error occurred.';
const detail = params.get('detail') || '';

if (messageElement) {
  messageElement.textContent = message;
}

if (detailElement && detail) {
  detailElement.textContent = detail;
}

if (retryButton) {
  retryButton.addEventListener('click', () => {
    // Navigate back to WhatsApp Web
    window.location.href = 'https://web.whatsapp.com';
  });
}