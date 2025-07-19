// src/utils/highlight.js
// Generic utility to highlight an element based on URL pattern

export function highlightOnUrl() {
  const match = window.location.pathname.match(/\/products\/(\d+)/);
  if (!match) return;

  const productId = match[1];
  const card = document.querySelector(`.product-card[data-product-id=\"${productId}\"]`);
  if (!card) return;

  card.classList.add('highlighted');
  card.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', highlightOnUrl);
}