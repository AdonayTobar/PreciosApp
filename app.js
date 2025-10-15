// ===================== IMPORTS =====================
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    onAuthStateChanged,
    signInWithCustomToken,
    signInAnonymously,
    sendPasswordResetEmail,
    sendEmailVerification
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { setLogLevel } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// ===================== CONFIGURACIÓN FIREBASE =====================
const firebaseConfig = {
    apiKey: "AIzaSyAcGrB1AUJhchXjNGjBD7s7FnmKchQEZzg",
    authDomain: "adonaytapp.firebaseapp.com",
    projectId: "adonaytapp",
    storageBucket: "adonaytapp.firebasestorage.app",
    messagingSenderId: "141677270435",
    appId: "1:141677270435:web:b7c31e84e7b2d86c297616",
    measurementId: "G-6XDXLLLMN7"
};

const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
let app, auth;

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    setLogLevel('debug');
    if (initialAuthToken) await signInWithCustomToken(auth, initialAuthToken);
    else await signInAnonymously(auth);
} catch (e) {
    console.error("Error al inicializar Firebase:", e);
    displayMessage("Error de configuración de Firebase.", 'error');
}

// ===================== ELEMENTOS DEL DOM =====================
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

// ===================== NAVEGACIÓN =====================
document.getElementById('go-to-signup-link').addEventListener('click', e => { e.preventDefault(); clearMessage(); renderView('signup'); });
document.getElementById('go-to-login-link-1').addEventListener('click', e => { e.preventDefault(); clearMessage(); renderView('login'); });
document.getElementById('go-to-login-link-2').addEventListener('click', e => { e.preventDefault(); clearMessage(); renderView('login'); });
document.getElementById('forgot-password-link').addEventListener('click', e => { e.preventDefault(); clearMessage(); renderView('reset_password'); });

// ===================== FUNCIONES DE INTERFAZ =====================
function renderView(viewName) {
    [loginFormView, signupFormView, resetPasswordView, userView].forEach(v => v.classList.add('hidden'));
    switch (viewName) {
        case 'login': loginFormView.classList.remove('hidden'); headerTitle.textContent = "Inicia Sesión en la Plataforma"; break;
        case 'signup': signupFormView.classList.remove('hidden'); headerTitle.textContent = "Crea tu Cuenta"; break;
        case 'reset_password': resetPasswordView.classList.remove('hidden'); headerTitle.textContent = "Restablece Contraseña"; break;
        case 'authenticated': userView.classList.remove('hidden'); headerTitle.textContent = "¡Sesión Iniciada!"; break;
    }
}

function showLoader(isVisible) {
    loader.classList.toggle('hidden', !isVisible);
    if (isVisible) [loginFormView, signupFormView, resetPasswordView, userView].forEach(v => v.classList.add('hidden'));
}

function displayMessage(text, type) {
    messageContainer.classList.remove('hidden', 'bg-red-100', 'border-red-400', 'text-red-700', 'bg-green-100', 'border-green-400', 'text-green-700');
    messageText.textContent = text;
    if (type === 'error') {
        messageStrong.textContent = 'Error: ';
        messageContainer.classList.add('bg-red-100', 'border', 'border-red-400', 'text-red-700');
    } else {
        messageStrong.textContent = 'Éxito: ';
        messageContainer.classList.add('bg-green-100', 'border', 'border-green-400', 'text-green-700');
    }
}

function clearMessage() {
    messageContainer.classList.add('hidden');
    messageText.textContent = '';
    messageStrong.textContent = '';
}

function mapFirebaseError(code) {
    switch (code) {
        case 'auth/invalid-email': return 'El formato del correo es incorrecto.';
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential': return 'Credenciales incorrectas.';
        case 'auth/weak-password': return 'Contraseña demasiado débil.';
        case 'auth/email-already-in-use': return 'Este correo ya está registrado.';
        default: return 'Error desconocido. (' + code + ')';
    }
}

// ===================== AUTENTICACIÓN =====================
signupBtn.addEventListener('click', async () => {
    clearMessage();
    const email = signupEmailInput.value;
    const password = signupPasswordInput.value;
    if (!email || !password) return displayMessage("Por favor ingresa correo y contraseña.", 'error');
    showLoader(true);
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (userCredential.user) await sendEmailVerification(userCredential.user);
        displayMessage("Cuenta creada. Verifica tu correo antes de iniciar sesión.", 'success');
        renderView('login');
    } catch (error) {
        displayMessage(mapFirebaseError(error.code), 'error');
    } finally {
        showLoader(false);
    }
});

loginBtn.addEventListener('click', async () => {
    clearMessage();
    const email = loginEmailInput.value;
    const password = loginPasswordInput.value;
    if (!email || !password) return displayMessage("Por favor ingresa correo y contraseña.", 'error');
    showLoader(true);
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        if (user && !user.emailVerified) {
            await signOut(auth);
            throw new Error('auth/email-not-verified');
        }
        displayMessage("Inicio de sesión exitoso. Redirigiendo...", 'success');
        localStorage.setItem('loggedIn', 'true');
        showLoader(false);
        setTimeout(() => window.location.href = "precios.html", 1000);
        return;
    } catch (error) {
        if (error.message === 'auth/email-not-verified')
            displayMessage("Tu cuenta no está verificada. Revisa tu correo electrónico.", 'error');
        else displayMessage(mapFirebaseError(error.code), 'error');
    } finally {
        showLoader(false);
    }
});

resetPasswordBtn.addEventListener('click', async () => {
    clearMessage();
    const email = resetEmailInput.value;
    if (!email) return displayMessage("Ingresa un correo válido.", 'error');
    showLoader(true);
    try {
        await sendPasswordResetEmail(auth, email);
        displayMessage(`Se envió un enlace a "${email}".`, 'success');
        resetEmailInput.value = '';
        renderView('login');
    } catch {
        displayMessage("Ocurrió un error al enviar el enlace.", 'error');
    } finally {
        showLoader(false);
    }
});

logoutBtn.addEventListener('click', async () => {
    clearMessage();
    try {
        localStorage.removeItem('loggedIn');
        await signOut(auth);
        displayMessage("Sesión cerrada correctamente.", 'success');
    } catch {
        displayMessage("No se pudo cerrar sesión.", 'error');
    }
});

// ===================== MONITOREO =====================
onAuthStateChanged(auth, (user) => {
    loginEmailInput.value = loginPasswordInput.value = signupEmailInput.value = signupPasswordInput.value = resetEmailInput.value = '';
    if (user && user.email) {
        userEmailDisplay.textContent = user.email;
        renderView('authenticated');
        if (user.emailVerified) {
            verificationStatus.textContent = '✅ Correo verificado.';
            verificationStatus.className = 'mb-4 p-3 rounded-lg text-sm font-medium bg-green-100 text-green-700';
        } else {
            verificationStatus.textContent = '⚠️ Correo NO verificado.';
            verificationStatus.className = 'mb-4 p-3 rounded-lg text-sm font-medium bg-yellow-100 text-yellow-700';
        }
    } else renderView('login');
    loader.classList.add('hidden');
});
