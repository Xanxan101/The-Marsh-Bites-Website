const FLAVORS = [
  {
    "key": "f0",
    "name": "Cookies & Cream"
  },
  {
    "key": "f1",
    "name": "Blueberry Sour Strips"
  },
  {
    "key": "f2",
    "name": "Strawberry Cheesecake"
  },
  {
    "key": "f3",
    "name": "Mint Choco"
  },
  {
    "key": "f4",
    "name": "Caramel Macchiato Biscoff"
  },
  {
    "key": "f5",
    "name": "Bubblegum Pop"
  },
  {
    "key": "f6",
    "name": "Peach Mango Yogurt"
  },
  {
    "key": "f7",
    "name": "Double Choco"
  },
  {
    "key": "f8",
    "name": "Matcha"
  },
  {
    "key": "f9",
    "name": "Mango Graham"
  }
];

const state = {
  fulfillment: 'pickup', payment: 'gcash', qty: {}, assortedQty: 0,
};

function pillClass(btn, selected) {
  btn.classList.toggle('selected', selected);
}

function computeTotals() {
  let totalUnits = 0;
  FLAVORS.forEach(f => { totalUnits += state.qty[f.key] || 0; });
  const fours = Math.floor(totalUnits / 4);
  let rem = totalUnits % 4;
  const twos = Math.floor(rem / 2);
  const ones = rem % 2;
  let total = fours * 570 + twos * 290 + ones * 149;
  if (state.fulfillment === 'delivery' && (totalUnits + state.assortedQty) > 0) total += 50;
  return { totalUnits, total };
}

function buildSummaryText() {
  const lines = [];
  FLAVORS.forEach(f => { if (state.qty[f.key]) lines.push(`${f.name} x${state.qty[f.key]}`); });
  if (state.assortedQty) lines.push(`Assorted Pack x${state.assortedQty} (pricing TBD)`);
  const { total } = computeTotals();
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
  const { totalUnits, total } = computeTotals();
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

['in-name','in-contact','in-address','in-date','in-time','in-notes'].forEach(id => {
  document.getElementById(id).addEventListener('input', render);
});

document.getElementById('btn-copy').addEventListener('click', () => {
  const text = buildSummaryText();
  navigator.clipboard.writeText(text).catch(() => {});
  const msg = document.getElementById('copied-msg');
  msg.classList.add('show');
  setTimeout(() => msg.classList.remove('show'), 4000);
});

render();
