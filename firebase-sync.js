// ==========================================
// CONFIGURACIÓN DE SINCRONIZACIÓN FIREBASE
// ==========================================

const FB_COLLECTION = "housesulvaran_data";
const FB_DOC_PRODUCTS = "products";
const FB_DOC_NEWS = "news";
const FB_DOC_CONTENT = "content";

function isFirestoreReady() {
    return typeof firebase !== 'undefined' && firebase.firestore;
}

// Cargar Productos desde Firestore
async function fbLoadProducts() {
    if (!isFirestoreReady()) return null;
    try {
        const docRef = await firebaseDb.collection(FB_COLLECTION).doc(FB_DOC_PRODUCTS).get();
        if (docRef.exists) {
            const data = docRef.data();
            return data.items || data.products || null;
        }
    } catch (e) {
        console.error("Error al cargar productos de Firestore:", e);
    }
    return null;
}

// Guardar Productos en Firestore
async function fbSaveProducts(products) {
    if (!isFirestoreReady()) return false;
    try {
        await firebaseDb.collection(FB_COLLECTION).doc(FB_DOC_PRODUCTS).set({
            items: products,
            updatedAt: new Date().toISOString()
        });
        return true;
    } catch (e) {
        console.error("Error al guardar productos en Firestore:", e);
        return false;
    }
}

// Inicialización general vacía para evitar errores de referencia
async function fbInitDataIfEmpty() {
    if (!isFirestoreReady()) return;
    try {
        // Validación limpia sin sobrescribir con datos demo
        console.log("Firestore sincronizado correctamente.");
    } catch (e) {
        console.error('Error inicializando Firestore:', e);
    }
}