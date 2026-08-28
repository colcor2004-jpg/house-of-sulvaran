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

// Cargar Productos
async function fbLoadProducts() {
    if (!isFirestoreReady()) return null;
    try {
        const docRef = await firebaseDb.collection(FB_COLLECTION).doc(FB_DOC_PRODUCTS).get();
        if (docRef.exists) {
            const data = docRef.data();
            return data.items || data.products || null;
        }
    } catch (e) {
        console.error("Error al cargar productos:", e);
    }
    return null;
}

// Guardar Productos
async function fbSaveProducts(products) {
    if (!isFirestoreReady()) return false;
    try {
        await firebaseDb.collection(FB_COLLECTION).doc(FB_DOC_PRODUCTS).set({
            items: products,
            updatedAt: new Date().toISOString()
        });
        return true;
    } catch (e) {
        console.error("Error al guardar productos:", e);
        return false;
    }
}

// Función híbrida para el panel de administración
async function hybridSaveProducts(products) {
    return await fbSaveProducts(products);
}

// Suscripción o carga en tiempo real para el catálogo
function fbSubscribeProducts(callback) {
    if (!isFirestoreReady()) return null;
    return firebaseDb.collection(FB_COLLECTION).doc(FB_DOC_PRODUCTS)
        .onSnapshot((doc) => {
            if (doc.exists) {
                const data = doc.data();
                callback(data.items || data.products || []);
            } else {
                callback([]);
            }
        }, (error) => {
            console.error("Error en tiempo real de productos:", error);
        });
}

// Cargar Noticias
async function fbLoadNews() {
    if (!isFirestoreReady()) return null;
    try {
        const docRef = await firebaseDb.collection(FB_COLLECTION).doc(FB_DOC_NEWS).get();
        if (docRef.exists) {
            return docRef.data().items || null;
        }
    } catch (e) {
        console.error("Error al cargar noticias:", e);
    }
    return null;
}

// Inicialización general
async function fbInitDataIfEmpty() {
    if (!isFirestoreReady()) return;
    try {
        console.log("Firestore inicializado correctamente.");
    } catch (e) {
        console.error('Error inicializando Firestore:', e);
    }
}