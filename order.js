import { FLAVORS, computeTotals } from './js/flavors.js';
import { createOrder, updateOrder, getOrder } from './js/orders.js';

const state = {
  fulfillment: 'pickup', payment: 'gcash', qty: {}, assortedQty: 0,
};

let editMode = null; // { id, token, orderCode }

function pillClass(btn, selected) {
  btn.classList.toggle('selected', selected);
}

function buildOrderPayload() {
  const { totalUnits, itemsTotal, deliveryFee, total } = computeTotals(state.qty, state.assortedQty, state.fulfillment);
  const items = FLAVORS.filter(f => (state.qty[f.key] || 0) > 0).map(f => ({ key: f.key, name: f.name, qty: state.qty[f.key] }));
  return {
    customer: {
      name: document.getElementById('in-name').value.trim(),
      contact: document.getElementById('in-contact').value.trim(),
    },
    fulfillment: state.fulfillment,
    address: state.fulfillment === 'delivery' ? document.getElementById('in-address').value.trim() : '',
    date: document.getElementById('in-date').value,
    time: document.getElementById('in-time').value,
    payment: state.payment,
    items,
    assortedQty: state.assortedQty,
    notes: document.getElementById('in-notes').value.trim(),
    pricing: { totalUnits, itemsTotal, deliveryFee, total },
  };
}

function buildSummaryText() {
  const lines = [];
  FLAVORS.forEach(f => { if (state.qty[f.key]) lines.push(`${f.name} x${state.qty[f.key]}`); });
  if (state.assortedQty) lines.push(`Assorted Pack x${state.assortedQty} (pricing TBD)`);
  const { total } = computeTotals(state.qty, state.assortedQty, state.fulfillment);
  const name = document.getElementById('in-name').value;
  const contact = document.getElementById('in-contact').value;
  const address = document.getElementById('in-address').value;
  const date = document.getElementById('in-date').value;
  const time = document.getElementById('in-time').value;
  const notes = document.getElementById('in-notes').value;
  const parts = [
    'New Order - The Marsh Bites',
    `Name: ${name || '-'}`,
    `Contact: ${contact || '-'}`,
    `Fulfillment: ${state.fulfillment === 'delivery' ? 'Delivery' : 'Pickup'}`,
  ];
  if (state.fulfillment === 'delivery') parts.push(`Address: ${address || '-'}`);
  parts.push(`Preferred Date/Time: ${date || '-'} ${time || ''}`);
  parts.push(`Payment: ${state.payment === 'gcash' ? 'GCash' : 'Cash'}`);
  parts.push('--- Order ---');
  parts.push(...(lines.length ? lines : ['(no items selected)']));
  parts.push(`Total: ₱${total}`);
  if (notes) parts.push(`Notes: ${notes}`);
  return parts.join('\n');
}

function render() {
  const { totalUnits, total } = computeTotals(state.qty, state.assortedQty, state.fulfillment);
  const linesEl = document.getElementById('summary-lines');
  linesEl.innerHTML = '';
  FLAVORS.forEach(f => {
    const q = state.qty[f.key] || 0;
    if (q > 0) {
      linesEl.innerHTML += `<div class="summary-line"><span>${f.name} x${q}</span><span style="font-weight:700;"></span></div>`;
    }
  });
  if (state.assortedQty) linesEl.innerHTML += `<div class="summary-line"><span>Assorted Pack x${state.assortedQty}</span><span style="font-weight:700;">TBD</span></div>`;
  if (state.fulfillment === 'delivery' && (totalUnits + state.assortedQty) > 0) linesEl.innerHTML += `<div class="summary-line"><span>Delivery fee</span><span style="font-weight:700;">₱50</span></div>`;

  const hasItems = (totalUnits + state.assortedQty) > 0;
  document.getElementById('summary-empty').style.display = hasItems ? 'none' : 'block';
  document.getElementById('summary-total').style.display = hasItems ? 'flex' : 'none';
  document.getElementById('summary-total-val').textContent = '₱' + total;

  const summaryText = buildSummaryText();
  const mailto = 'mailto:hello@themarshbites.com?subject=' + encodeURIComponent('New Order - ' + (document.getElementById('in-name').value || 'Marsh Bites Customer')) + '&body=' + encodeURIComponent(summaryText);
  document.getElementById('btn-email').href = mailto;
}

document.querySelectorAll('.qty-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const key = btn.dataset.key;
    const delta = btn.dataset.action === 'inc' ? 1 : -1;
    if (key === 'assorted') {
      state.assortedQty = Math.max(0, state.assortedQty + delta);
      document.getElementById('qty-assorted').textContent = state.assortedQty;
    } else {
      state.qty[key] = Math.max(0, (state.qty[key] || 0) + delta);
      document.getElementById('qty-' + key).textContent = state.qty[key];
    }
    render();
  });
});

document.getElementById('btn-pickup').addEventListener('click', () => {
  state.fulfillment = 'pickup';
  pillClass(document.getElementById('btn-pickup'), true);
  pillClass(document.getElementById('btn-delivery'), false);
  document.getElementById('address-block').style.display = 'none';
  render();
});
document.getElementById('btn-delivery').addEventListener('click', () => {
  state.fulfillment = 'delivery';
  pillClass(document.getElementById('btn-pickup'), false);
  pillClass(document.getElementById('btn-delivery'), true);
  document.getElementById('address-block').style.display = 'block';
  render();
});
document.getElementById('btn-gcash').addEventListener('click', () => {
  state.payment = 'gcash';
  pillClass(document.getElementById('btn-gcash'), true);
  pillClass(document.getElementById('btn-cash'), false);
});
document.getElementById('btn-cash').addEventListener('click', () => {
  state.payment = 'cash';
  pillClass(document.getElementById('btn-gcash'), false);
  pillClass(document.getElementById('btn-cash'), true);
});

['in-name','in-contact','in-address','in-date','in-time'].forEach(id => {
  document.getElementById(id).addEventListener('input', render);
});

const NOTES_WORD_LIMIT = 200;
const notesEl = document.getElementById('in-notes');
const notesCountEl = document.getElementById('notes-count');

function updateNotesCount() {
  const words = notesEl.value.trim().split(/\s+/).filter(Boolean);
  notesCountEl.textContent = `${words.length} / ${NOTES_WORD_LIMIT} words`;
  notesCountEl.classList.toggle('limit', words.length >= NOTES_WORD_LIMIT);
}

notesEl.addEventListener('input', () => {
  const words = notesEl.value.split(/\s+/).filter(Boolean);
  if (words.length > NOTES_WORD_LIMIT) {
    notesEl.value = words.slice(0, NOTES_WORD_LIMIT).join(' ');
  }
  updateNotesCount();
  render();
});

document.getElementById('btn-copy').addEventListener('click', () => {
  const text = buildSummaryText();
  navigator.clipboard.writeText(text).catch(() => {});
  const msg = document.getElementById('copied-msg');
  msg.classList.add('show');
  setTimeout(() => msg.classList.remove('show'), 4000);
});

// --- Place / update order against Firebase ---
const placeBtn = document.getElementById('btn-place-order');
const placeMsg = document.getElementById('place-order-msg');

function validate(payload) {
  if (!payload.customer.name) return 'Please enter your name.';
  if (!payload.customer.contact) return 'Please enter a contact number.';
  if (payload.fulfillment === 'delivery' && !payload.address) return 'Please enter a delivery address.';
  if (!payload.date || !payload.time) return 'Please pick a preferred date and time.';
  if (payload.items.length === 0 && payload.assortedQty === 0) return 'Please choose at least one flavor.';
  return null;
}

placeBtn.addEventListener('click', async () => {
  const payload = buildOrderPayload();
  const err = validate(payload);
  if (err) {
    placeMsg.textContent = err;
    placeMsg.classList.add('show');
    return;
  }
  placeMsg.classList.remove('show');
  placeBtn.disabled = true;
  placeBtn.textContent = editMode ? 'Updating…' : 'Placing Order…';
  try {
    if (editMode) {
      await updateOrder(editMode.id, editMode.token, payload);
      window.location.href = `receipt.html?id=${editMode.id}&t=${editMode.token}`;
    } else {
      const { id, accessToken } = await createOrder(payload);
      localStorage.setItem('mb_last_order', JSON.stringify({ id, token: accessToken }));
      window.location.href = `receipt.html?id=${id}&t=${accessToken}`;
    }
  } catch (e) {
    placeMsg.textContent = "Couldn't send your order — please check your connection and try again, or message us on Facebook.";
    placeMsg.classList.add('show');
    placeBtn.disabled = false;
    placeBtn.textContent = editMode ? '✏️ Update Order' : '✅ Place Order';
  }
});

async function initEditMode() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('edit');
  const token = params.get('t');
  const banner = document.getElementById('edit-banner');

  if (id && token) {
    try {
      const order = await getOrder(id);
      if (order && order.accessToken === token) {
        editMode = { id, token, orderCode: order.orderCode };
        document.getElementById('in-name').value = order.customer?.name || '';
        document.getElementById('in-contact').value = order.customer?.contact || '';
        document.getElementById('in-address').value = order.address || '';
        document.getElementById('in-date').value = order.date || '';
        document.getElementById('in-time').value = order.time || '';
        document.getElementById('in-notes').value = order.notes || '';
        updateNotesCount();
        state.fulfillment = order.fulfillment || 'pickup';
        state.payment = order.payment || 'gcash';
        state.assortedQty = order.assortedQty || 0;
        (order.items || []).forEach(it => { state.qty[it.key] = it.qty; });

        pillClass(document.getElementById('btn-pickup'), state.fulfillment === 'pickup');
        pillClass(document.getElementById('btn-delivery'), state.fulfillment === 'delivery');
        document.getElementById('address-block').style.display = state.fulfillment === 'delivery' ? 'block' : 'none';
        pillClass(document.getElementById('btn-gcash'), state.payment === 'gcash');
        pillClass(document.getElementById('btn-cash'), state.payment === 'cash');
        FLAVORS.forEach(f => { document.getElementById('qty-' + f.key).textContent = state.qty[f.key] || 0; });
        document.getElementById('qty-assorted').textContent = state.assortedQty;

        placeBtn.textContent = '✏️ Update Order';
        banner.textContent = `Editing order ${order.orderCode} — saving will update your existing order.`;
        banner.classList.add('show');
      } else {
        banner.textContent = "We couldn't find that order to edit, so here's a blank form instead.";
        banner.classList.add('show');
      }
    } catch (e) {
      banner.textContent = "Couldn't load that order right now — here's a blank form instead.";
      banner.classList.add('show');
    }
  }
  render();
}

initEditMode();
