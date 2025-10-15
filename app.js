import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// =====================================
// 1. CONFIGURACIÓN DE FIREBASE
// =====================================
const firebaseConfig = {
  apiKey: "AIzaSyAcGrB1AUJhchXjNGjBD7s7FnmKchQEZzg",
  authDomain: "adonaytapp.firebaseapp.com",
  projectId: "adonaytapp",
  storageBucket: "adonaytapp.firebasestorage.app",
  messagingSenderId: "141677270435",
  appId: "1:141677270435:web:b7c31e84e7b2d86c297616",
  measurementId: "G-6XDXLLLMN7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// =====================================
// 2. ELEMENTOS DEL DOM
// =====================================
const loginEmailInput = document.getElementById('login-email');
const loginPasswordInput = document.getElementById('login-password');
const loginBtn = document.getElementById('login-btn');
const signupEmailInput = document.getElementById('signup-email');
const signupPasswordInput = document.getElementById('signup-password');
const signupBtn = document.getElementById('signup-btn');
const resetEmailInput = document.getElementById('reset-email');
const resetPasswordBtn = document.getElementById('reset-password-btn');
const logoutBtn = document.getElementById('logout-btn');

const loginFormView = document.getElementById('login-form-view');
const signupFormView = document.getElementById('signup-form-view');
const resetPasswordView = document.getElementById('reset-password-view');
const userView = document.getElementById('user-view');
const userEmailDisplay = document.getElementById('user-email-display');
const verificationStatus = document.getElementById('verification-status');
const messageContainer = document.getElementById('message-container');
const messageText = document.getElementById('message-text');
const messageStrong = document.getElementById('message-strong');
const headerTitle = document.getElementById('header-title');
const loader = document.getElementById('loader');

// =====================================
// 3. NAVEGACIÓN ENTRE VISTAS
// =====================================
document.getElementById('go-to-signup-link').addEventListener('click', (e) => {
  e.preventDefault();
  clearMessage();
  renderView('signup');
});
document.getElementById('go-to-login-link-1').addEventListener('click', (e) => {
  e.preventDefault();
  clearMessage();
  renderView('login');
});
document.getElementById('go-to-login-link-2').addEventListener('click', (e) => {
  e.preventDefault();
  clearMessage();
  renderView('login');
});
document.getElementById('forgot-password-link').addEventListener('click', (e) => {
  e.preventDefault();
  clearMessage();
  renderView('reset_password');
});

function renderView(viewName) {
  [loginFormView, signupFormView, resetPasswordView, userView].forEach(view => view.classList.add('hidden'));
  switch (viewName) {
    case 'login':
      loginFormView.classList.remove('hidden');
      headerTitle.textContent = "Inicia Sesión en la Plataforma";
      break;
    case 'signup':
      signupFormView.classList.remove('hidden');
      headerTitle.textContent = "Crea tu Cuenta";
      break;
    case 'reset_password':
      resetPasswordView.classList.remove('hidden');
      headerTitle.textContent = "Restablece Contraseña";
      break;
    case 'authenticated':
      userView.classList.remove('hidden');
      headerTitle.textContent = "¡Sesión Iniciada!";
      break;
  }
}

function showLoader(isVisible) {
  loader.classList.toggle('hidden', !isVisible);
  if (isVisible) {
    [loginFormView, signupFormView, resetPasswordView, userView].forEach(view => view.classList.add('hidden'));
  }
}

// =====================================
// 4. MENSAJES DE ALERTA
// =====================================
function displayMessage(text, type) {
  messageContainer.classList.remove('hidden', 'bg-red-100', 'border-red-400', 'text-red-700', 'bg-green-100', 'border-green-400', 'text-green-700');
  messageText.textContent = text;
  if (type === 'error') {
    messageStrong.textContent = 'Error: ';
    messageContainer.classList.add('bg-red-100', 'border', 'border-red-400', 'text-red-700');
  } else if (type === 'success') {
    messageStrong.textContent = 'Éxito: ';
    messageContainer.classList.add('bg-green-100', 'border', 'border-green-400', 'text-green-700');
  }
}

function clearMessage() {
  messageContainer.classList.add('hidden');
  messageText.textContent = '';
  messageStrong.textContent = '';
}

// =====================================
// 5. AUTENTICACIÓN
// =====================================

// Login
loginBtn.addEventListener('click', async () => {
  const email = loginEmailInput.value.trim();
  const password = loginPasswordInput.value.trim();
  if (!email || !password) return displayMessage('Por favor, completa todos los campos.', 'error');
  showLoader(true);
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    displayMessage(mapFirebaseError(error.code), 'error');
  } finally {
    showLoader(false);
  }
});

// Signup
signupBtn.addEventListener('click', async () => {
  const email = signupEmailInput.value.trim();
  const password = signupPasswordInput.value.trim();
  if (!email || !password) return displayMessage('Por favor, completa todos los campos.', 'error');
  showLoader(true);
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(userCredential.user);
    displayMessage('Cuenta creada. Verifica tu correo electrónico.', 'success');
    renderView('login');
  } catch (error) {
    displayMessage(mapFirebaseError(error.code), 'error');
  } finally {
    showLoader(false);
  }
});

// Reset password
resetPasswordBtn.addEventListener('click', async () => {
  const email = resetEmailInput.value.trim();
  if (!email) return displayMessage('Por favor, ingresa tu correo electrónico.', 'error');
  showLoader(true);
  try {
    await sendPasswordResetEmail(auth, email);
    displayMessage('Se ha enviado un enlace de restablecimiento a tu correo.', 'success');
    renderView('login');
  } catch (error) {
    displayMessage(mapFirebaseError(error.code), 'error');
  } finally {
    showLoader(false);
  }
});

// Logout
logoutBtn.addEventListener('click', async () => {
  showLoader(true);
  try {
    await signOut(auth);
  } catch (error) {
    displayMessage('Error al cerrar sesión.', 'error');
  } finally {
    showLoader(false);
  }
});

// =====================================
// 6. CAMBIOS EN EL ESTADO DE AUTENTICACIÓN
// =====================================
onAuthStateChanged(auth, (user) => {
  if (user) {
    userEmailDisplay.textContent = user.email || '(Usuario anónimo)';
    renderView('authenticated');
    if (user.emailVerified) {
      verificationStatus.textContent = "Correo verificado ✅";
      verificationStatus.className = "text-green-600";
    } else {
      verificationStatus.textContent = "Correo no verificado ❌";
      verificationStatus.className = "text-red-600";
    }
  } else {
    renderView('login');
  }
});

// =====================================
// 7. ERRORES DE FIREBASE
// =====================================
function mapFirebaseError(code) {
  switch (code) {
    case 'auth/invalid-email':
      return 'El formato del correo electrónico es incorrecto.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Credenciales incorrectas. Verifica tu correo electrónico y contraseña.';
    case 'auth/weak-password':
      return 'La contraseña debe tener al menos 6 caracteres.';
    case 'auth/email-already-in-use':
      return 'Este correo ya está registrado.';
    default:
      return 'Ocurrió un error desconocido. Código: ' + code;
  }
}

