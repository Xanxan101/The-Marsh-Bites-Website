import { auth } from './firebase.js';
import {
  signInWithEmailAndPassword, onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

onAuthStateChanged(auth, user => {
  if (user) window.location.href = 'staff.html';
});

const form = document.getElementById('login-form');
const errEl = document.getElementById('login-error');
const btn = document.getElementById('login-btn');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errEl.classList.remove('show');
  btn.disabled = true;
  btn.textContent = 'Signing in…';
  try {
    await signInWithEmailAndPassword(
      auth,
      document.getElementById('login-email').value.trim(),
      document.getElementById('login-password').value,
    );
    window.location.href = 'staff.html';
  } catch (err) {
    errEl.textContent = 'Incorrect email or password.';
    errEl.classList.add('show');
    btn.disabled = false;
    btn.textContent = 'Sign In';
  }
});
