// ============================================
// HOUSE OF SULVARAN - Configuración de Firebase (v5 local)
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

function initFirebase() {
    if (!isFirebaseConfigured()) return false;
    if (firebaseApp && firebaseAuth && firebaseDb) return true;

    try {
        if (!firebaseApp) {
            firebaseApp = firebase.initializeApp(firebaseConfig);
        }
        if (!firebaseAuth) {
            firebaseAuth = firebase.auth();
        }
        if (!firebaseDb) {
            firebaseDb = firebase.app().firestore();
            firebaseDb.settings({ experimentalForceLongPolling: true });
        }
        console.log('✅ Firebase inicializado correctamente (modo local)');
        return true;
    } catch (e) {
        console.error('❌ Error inicializando Firebase:', e.message);
        return false;
    }
}