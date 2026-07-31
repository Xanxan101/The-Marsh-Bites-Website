import { listenOrder } from './orders.js';
import { STATUS_LABELS } from './flavors.js';
import { escapeHtml, timeAgo, toDate } from './utils.js';

const params = new URLSearchParams(window.location.search);
const orderId = params.get('id');
const token = params.get('t');

const loadingEl = document.getElementById('receipt-loading');
const notFoundEl = document.getElementById('receipt-not-found');
const cardEl = document.getElementById('receipt-card');

if (!orderId) {
  loadingEl.style.display = 'none';
  notFoundEl.style.display = 'block';
} else {
  listenOrder(orderId, order => {
    loadingEl.style.display = 'none';
    if (!order) {
      notFoundEl.style.display = 'block';
      cardEl.style.display = 'none';
      return;
    }
    render(order);
  });
}

function render(order) {
  cardEl.style.display = 'block';
  document.getElementById('r-code').textContent = order.orderCode;

  const status = order.status || 'pending';
  const statusEl = document.getElementById('r-status');
  statusEl.textContent = STATUS_LABELS[status] || status;
  statusEl.className = 'status-badge status-' + status;

  document.getElementById('r-name').textContent = order.customer?.name || '-';
  document.getElementById('r-contact').textContent = order.customer?.contact || '-';
  document.getElementById('r-fulfillment').textContent = order.fulfillment === 'delivery' ? 'Delivery' : 'Pickup';

  const addrRow = document.getElementById('r-address-row');
  if (order.fulfillment === 'delivery') {
    addrRow.style.display = 'flex';
    document.getElementById('r-address').textContent = order.address || '-';
  } else {
    addrRow.style.display = 'none';
  }

  document.getElementById('r-datetime').textContent = `${order.date || '-'} ${order.time || ''}`.trim();
  document.getElementById('r-payment').textContent = order.payment === 'cash' ? 'Cash' : 'GCash';

  const itemsEl = document.getElementById('r-items');
  itemsEl.innerHTML = '';
  (order.items || []).forEach(it => {
    itemsEl.innerHTML += `<div class="summary-line"><span>${escapeHtml(it.name)} x${it.qty}</span></div>`;
  });
  if (order.assortedQty) itemsEl.innerHTML += `<div class="summary-line"><span>Assorted Pack x${order.assortedQty} (pricing TBD)</span></div>`;

  const pricing = order.pricing || {};
  document.getElementById('r-items-total').textContent = '₱' + (pricing.itemsTotal || 0);
  const feeRow = document.getElementById('r-fee-row');
  if (pricing.deliveryFee) {
    feeRow.style.display = 'flex';
    document.getElementById('r-fee').textContent = '₱' + pricing.deliveryFee;
  } else {
    feeRow.style.display = 'none';
  }
  document.getElementById('r-total').textContent = '₱' + (pricing.total || 0);

  const notesRow = document.getElementById('r-notes-row');
  if (order.notes) {
    notesRow.style.display = 'block';
    document.getElementById('r-notes').textContent = order.notes;
  } else {
    notesRow.style.display = 'none';
  }

  const created = toDate(order.createdAt);
  const updated = toDate(order.updatedAt);
  document.getElementById('r-created').textContent = created ? `Placed ${timeAgo(created)}` : '';

  const editedRow = document.getElementById('r-edited-row');
  if ((order.editCount || 0) > 0 && updated) {
    editedRow.style.display = 'block';
    document.getElementById('r-edited').textContent = `Last updated ${timeAgo(updated)}`;
  } else {
    editedRow.style.display = 'none';
  }

  const editBtn = document.getElementById('r-edit-btn');
  if (token && token === order.accessToken) {
    editBtn.href = `order.html?edit=${orderId}&t=${token}`;
    editBtn.style.display = 'inline-block';
  } else {
    editBtn.style.display = 'none';
  }
  document.getElementById('r-more-btn').href = 'order.html';
}
