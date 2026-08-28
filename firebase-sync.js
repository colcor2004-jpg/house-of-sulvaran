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

// Cargar Productos (soporta múltiples estructuras de campos)
async function fbLoadProducts() {
    if (!isFirestoreReady()) return null;
    try {
        const docRef = await firebaseDb.collection(FB_COLLECTION).doc(FB_DOC_PRODUCTS).get();
        if (docRef.exists) {
            const data = docRef.data();
            // Revisa si están en 'items', 'products' o si el documento mismo es un arreglo
            if (Array.isArray(data)) return data;
            return data.items || data.products || data.list || [];
        }
    } catch (e) {
        console.error("Error al cargar productos:", e);
    }
    return [];
}

// Guardar Productos de forma robusta
async function fbSaveProducts(products) {
    if (!isFirestoreReady()) return false;
    try {
        // Aseguramos guardar tanto en 'items' como en 'products' para compatibilidad total
        await firebaseDb.collection(FB_COLLECTION).doc(FB_DOC_PRODUCTS).set({
            items: products,
            products: products,
            updatedAt: new Date().toISOString()
        }, { merge: true });
        console.log("Productos guardados exitosamente en Firestore.");
        return true;
    } catch (e) {
        console.error("Error al guardar productos en Firebase:", e);
        return false;
    }
}

// Función híbrida para el panel de administración
async function hybridSaveProducts(products) {
    const savedInCloud = await fbSaveProducts(products);
    // También guardamos una copia de respaldo en el navegador por seguridad
    try {
        localStorage.setItem('housesulvaran_products', JSON.stringify(products));
    } catch (err) {
        console.warn("No se pudo guardar en localStorage", err);
    }
    return savedInCloud;
}

// Suscripción o carga en tiempo real para productos
function fbSubscribeProducts(callback) {
    if (!isFirestoreReady()) return null;
    return firebaseDb.collection(FB_COLLECTION).doc(FB_DOC_PRODUCTS)
        .onSnapshot((doc) => {
            if (doc.exists) {
                const data = doc.data();
                if (Array.isArray(data)) {
                    callback(data);
                } else {
                    callback(data.items || data.products || data.list || []);
                }
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
            const data = docRef.data();
            return data.items || data.news || data;
        }
    } catch (e) {
        console.error("Error al cargar noticias:", e);
    }
    return null;
}

// Suscripción en tiempo real para noticias
function fbSubscribeNews(callback) {
    if (!isFirestoreReady()) return null;
    return firebaseDb.collection(FB_COLLECTION).doc(FB_DOC_NEWS)
        .onSnapshot((doc) => {
            if (doc.exists) {
                const data = doc.data();
                callback(data.items || data.news || []);
            } else {
                callback([]);
            }
        }, (error) => {
            console.error("Error en tiempo real de noticias:", error);
        });
}

// Cargar Contenido General de la Página
async function fbLoadContent() {
    if (!isFirestoreReady()) return null;
    try {
        const docRef = await firebaseDb.collection(FB_COLLECTION).doc(FB_DOC_CONTENT).get();
        if (docRef.exists) {
            return docRef.data();
        }
    } catch (e) {
        console.error("Error al cargar contenido:", e);
    }
    return {};
}

// Suscripción en tiempo real para contenido
function fbSubscribeContent(callback) {
    if (!isFirestoreReady()) return null;
    return firebaseDb.collection(FB_COLLECTION).doc(FB_DOC_CONTENT)
        .onSnapshot((doc) => {
            if (doc.exists) {
                callback(doc.data() || {});
            } else {
                callback({});
            }
        }, (error) => {
            console.error("Error en tiempo real de contenido:", error);
        });
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