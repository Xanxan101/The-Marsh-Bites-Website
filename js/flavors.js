export const FLAVORS = [
  { key: 'f0', name: 'Cookies & Cream', emoji: '🍪', color: '#C9C2BA' },
  { key: 'f1', name: 'Blueberry Sour Strips', emoji: '🫐', color: '#6FC7E8' },
  { key: 'f2', name: 'Strawberry Cheesecake', emoji: '🍓', color: '#F7A8BE' },
  { key: 'f3', name: 'Mint Choco', emoji: '🍫', color: '#8FCB9B' },
  { key: 'f4', name: 'Caramel Macchiato Biscoff', emoji: '☕', color: '#D9A25E' },
  { key: 'f5', name: 'Bubblegum Pop', emoji: '🫧', color: '#F8CFE0' },
  { key: 'f6', name: 'Peach Mango Yogurt', emoji: '🍑', color: '#FFD98A' },
  { key: 'f7', name: 'Double Choco', emoji: '🍫', color: '#9C8B90' },
  { key: 'f8', name: 'Matcha', emoji: '🍵', color: '#A8C97F' },
  { key: 'f9', name: 'Mango Graham', emoji: '🥭', color: '#D8C08A' },
];

export const UNIT_PRICE = 149;
export const BUNDLE_2_PRICE = 290;
export const BUNDLE_4_PRICE = 570;
export const DELIVERY_FEE = 50;

export function computeItemsTotal(totalUnits) {
  const fours = Math.floor(totalUnits / 4);
  const rem = totalUnits % 4;
  const twos = Math.floor(rem / 2);
  const ones = rem % 2;
  return fours * BUNDLE_4_PRICE + twos * BUNDLE_2_PRICE + ones * UNIT_PRICE;
}

export function computeTotals(qty, assortedQty, fulfillment) {
  let totalUnits = 0;
  FLAVORS.forEach(f => { totalUnits += qty[f.key] || 0; });
  const itemsTotal = computeItemsTotal(totalUnits);
  const hasItems = (totalUnits + (assortedQty || 0)) > 0;
  const deliveryFee = (fulfillment === 'delivery' && hasItems) ? DELIVERY_FEE : 0;
  return { totalUnits, itemsTotal, deliveryFee, total: itemsTotal + deliveryFee };
}

export const STATUS_LABELS = {
  pending: '🕐 Order Received',
  preparing: '🔥 Preparing',
  ready: '✅ Ready',
  completed: '🎉 Completed',
  cancelled: '❌ Cancelled',
};

export const STATUS_ORDER = ['pending', 'preparing', 'ready', 'completed'];
