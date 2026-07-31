import { auth } from './firebase.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { listenAllOrders, setOrderStatus } from './orders.js';
import { STATUS_LABELS, STATUS_ORDER } from './flavors.js';
import { escapeHtml, timeAgo, toDate } from './utils.js';

let allOrders = [];
let currentFilter = 'all';
let unsubscribeOrders = null;

onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = 'staff-login.html';
    return;
  }
  document.getElementById('staff-email').textContent = user.email;
  if (!unsubscribeOrders) {
    unsubscribeOrders = listenAllOrders(orders => {
      allOrders = orders;
      render();
    });
  }
});

document.getElementById('sign-out-btn').addEventListener('click', () => {
  signOut(auth);
});

document.querySelectorAll('.filter-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    currentFilter = tab.dataset.status;
    document.querySelectorAll('.filter-tab').forEach(t => t.classList.toggle('selected', t === tab));
    render();
  });
});

function nextActions(status) {
  const map = {
    pending: [['preparing', 'Start Preparing'], ['cancelled', 'Cancel']],
    preparing: [['ready', 'Mark Ready'], ['cancelled', 'Cancel']],
    ready: [['completed', 'Mark Completed']],
    completed: [],
    cancelled: [],
  };
  return map[status] || [];
}

function render() {
  const listEl = document.getElementById('orders-list');
  const emptyEl = document.getElementById('orders-empty');

  const counts = { all: allOrders.length };
  STATUS_ORDER.concat('cancelled').forEach(s => { counts[s] = 0; });
  allOrders.forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1; });
  document.querySelectorAll('.filter-tab').forEach(tab => {
    const countEl = tab.querySelector('.count');
    if (countEl) countEl.textContent = counts[tab.dataset.status] ?? 0;
  });

  const filtered = currentFilter === 'all' ? allOrders : allOrders.filter(o => o.status === currentFilter);
  listEl.innerHTML = '';
  emptyEl.style.display = filtered.length ? 'none' : 'block';
  filtered.forEach(order => listEl.appendChild(renderCard(order)));
}

function renderCard(order) {
  const card = document.createElement('div');
  card.className = 'staff-order-card status-' + order.status;

  const itemsHtml = (order.items || [])
    .map(it => `<div class="summary-line"><span>${escapeHtml(it.name)} x${it.qty}</span></div>`)
    .join('') + (order.assortedQty ? `<div class="summary-line"><span>Assorted Pack x${order.assortedQty}</span></div>` : '');

  const created = toDate(order.createdAt);
  const updated = toDate(order.updatedAt);
  const editedBadge = (order.editCount || 0) > 0
    ? `<span class="edited-badge">✏️ Edited${updated ? ' · ' + timeAgo(updated) : ''}</span>`
    : '';

  const actionsHtml = nextActions(order.status)
    .map(([status, label]) => `<button class="status-btn status-btn-${status}" data-id="${order.id}" data-status="${status}">${label}</button>`)
    .join('');

  card.innerHTML = `
    <div class="staff-card-top">
      <div>
        <div class="staff-order-code">${escapeHtml(order.orderCode)}</div>
        <div class="staff-order-time">${created ? timeAgo(created) : ''}</div>
      </div>
      <span class="status-badge status-${order.status}">${STATUS_LABELS[order.status] || order.status}</span>
    </div>
    ${editedBadge}
    <div class="staff-card-body">
      <div class="staff-row"><strong>${escapeHtml(order.customer?.name || '-')}</strong> · ${escapeHtml(order.customer?.contact || '-')}</div>
      <div class="staff-row">${order.fulfillment === 'delivery' ? '🛵 Delivery' : '🏠 Pickup'}${order.fulfillment === 'delivery' && order.address ? ' — ' + escapeHtml(order.address) : ''}</div>
      <div class="staff-row">📅 ${escapeHtml(order.date || '-')} ${escapeHtml(order.time || '')}</div>
      <div class="staff-row">💰 ${order.payment === 'cash' ? 'Cash' : 'GCash'}</div>
      <div class="staff-items">${itemsHtml}</div>
      <div class="staff-row staff-total">Total: ₱${order.pricing?.total ?? 0}</div>
      ${order.notes ? `<div class="staff-notes">📝 ${escapeHtml(order.notes)}</div>` : ''}
    </div>
    <div class="staff-card-actions">${actionsHtml}</div>
  `;

  card.querySelectorAll('.status-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      try {
        await setOrderStatus(btn.dataset.id, btn.dataset.status);
      } catch (e) {
        btn.disabled = false;
      }
    });
  });

  return card;
}
