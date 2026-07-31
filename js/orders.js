import { db } from './firebase.js';
import {
  collection, doc, addDoc, getDoc, updateDoc, onSnapshot,
  serverTimestamp, query, orderBy, increment,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const ordersCol = collection(db, 'orders');

function randomString(len, chars) {
  let out = '';
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function randomAccessToken() {
  return randomString(24, 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789');
}

function randomOrderCode() {
  return 'MB-' + randomString(6, 'ABCDEFGHJKMNPQRSTUVWXYZ23456789');
}

// orderData: { customer, fulfillment, address, date, time, payment, items, assortedQty, notes, pricing }
export async function createOrder(orderData) {
  const accessToken = randomAccessToken();
  const orderCode = randomOrderCode();
  const docRef = await addDoc(ordersCol, {
    ...orderData,
    orderCode,
    accessToken,
    status: 'pending',
    editCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return { id: docRef.id, accessToken, orderCode };
}

export async function updateOrder(orderId, accessToken, orderData) {
  const ref = doc(db, 'orders', orderId);
  await updateDoc(ref, {
    ...orderData,
    accessToken,
    updatedAt: serverTimestamp(),
    editCount: increment(1),
  });
}

export async function getOrder(orderId) {
  const ref = doc(db, 'orders', orderId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export function listenOrder(orderId, cb) {
  const ref = doc(db, 'orders', orderId);
  return onSnapshot(ref, snap => {
    if (!snap.exists()) { cb(null); return; }
    cb({ id: snap.id, ...snap.data() });
  });
}

export function listenAllOrders(cb) {
  const q = query(ordersCol, orderBy('createdAt', 'desc'));
  return onSnapshot(q, snap => {
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

export async function setOrderStatus(orderId, status) {
  const ref = doc(db, 'orders', orderId);
  await updateDoc(ref, { status, updatedAt: serverTimestamp() });
}
