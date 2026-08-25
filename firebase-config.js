// ============================================
// HOUSE OF SULVARAN - Configuración de Firebase
// ============================================
// Credenciales reales de House of Sulvaran
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

// Verifica si Firebase está configurado correctamente
function isFirebaseConfigured() {
    return firebaseConfig.apiKey && firebaseConfig.apiKey.startsWith('AIza');
}

// Inicializa Firebase solo si está configurado
let firebaseApp = null;
let firebaseAuth = null;
let firebaseDb = null;

function initFirebase() {
    if (!isFirebaseConfigured()) return false;
    if (firebaseApp) return true;
    try {
        firebaseApp = firebase.initializeApp(firebaseConfig);
        firebaseAuth = firebase.auth();
        firebaseDb = firebase.firestore();
        console.log('🔥 Firebase inicializado correctamente');
        return true;
    } catch (e) {
        console.error('Error inicializando Firebase:', e);
        return false;
    }
}
