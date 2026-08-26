// ============================================
// HOUSE OF SULVARAN - Configuración de Firebase (v4 robusta)
// ============================================

const firebaseConfig = {
    apiKey: "AIzaSyB0NXKgm97aWde7nICoy7obUhN2W3iBa6c",
    authDomain: "house-of-sulvaran.firebaseapp.com",
    projectId: "house-of-sulvaran",
    storageBucket: "house-of-sulvaran.firebasestorage.app",
    messagingSenderId: "606593449474",
    appId: "1:606593449474:web:cddfabfbcc476c524ef11b",
    measurementId: "G-0GFJMZ0TF0"
};

function isFirebaseConfigured() {
    return firebaseConfig.apiKey && firebaseConfig.apiKey.startsWith('AIza');
}

let firebaseApp = null;
let firebaseAuth = null;
let firebaseDb = null;
let initAttempts = 0;
const MAX_ATTEMPTS = 10;

function initFirebase() {
    if (!isFirebaseConfigured()) {
        console.warn('⚠️ Firebase no configurado: apiKey vacía o inválida');
        return false;
    }

    // Si ya está todo inicializado, retornar true inmediatamente
    if (firebaseApp && firebaseAuth && firebaseDb) {
        return true;
    }

    // Verificar que el objeto global 'firebase' exista (cargado desde CDN)
    if (typeof firebase === 'undefined') {
        initAttempts++;
        if (initAttempts <= MAX_ATTEMPTS) {
            console.warn(`⏳ Esperando que Firebase CDN cargue... intento ${initAttempts}/${MAX_ATTEMPTS}`);
            setTimeout(initFirebase, 300);
            return false;
        } else {
            console.error('❌ Firebase CDN no cargó después de ' + MAX_ATTEMPTS + ' intentos. Verifica tu conexión o si un bloqueador de scripts está activo.');
            return false;
        }
    }

    try {
        if (!firebaseApp) {
            firebaseApp = firebase.initializeApp(firebaseConfig);
        }
        if (!firebaseAuth) {
            firebaseAuth = firebase.auth();
        }
        if (!firebaseDb) {
            firebaseDb = firebase.firestore();
        }
        console.log('✅ Firebase inicializado correctamente (Firestore activo)');
        return true;
    } catch (e) {
        console.error('❌ Error inicializando Firebase:', e.message);
        return false;
    }
}
