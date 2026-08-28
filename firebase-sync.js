// ============================================
// HOUSE OF SULVARAN - Firebase Firestore Sync
// ============================================
// Sincroniza productos, noticias y contenido con Firestore.
// Si Firebase está configurado, los datos van a la NUBE
// y TODOS los dispositivos ven los cambios INSTANTÁNEAMENTE.
// Si NO está configurado, funciona en modo local (localStorage).
// ============================================

const FB_COLLECTION = 'siteData';
const FB_DOC_PRODUCTS = 'products';
const FB_DOC_NEWS = 'news';
const FB_DOC_CONTENT = 'content';

let fbProductsUnsub = null;
let fbNewsUnsub = null;
let fbContentUnsub = null;

// ═══════════════════════════════════════════════════════════
// DETECTAR si Firebase Firestore está disponible
// ═══════════════════════════════════════════════════════════
function isFirestoreReady() {
    return typeof firebaseDb !== 'undefined' && firebaseDb !== null;
}

// ═══════════════════════════════════════════════════════════
// GUARDAR en Firestore (usado por admin.js)
// ═══════════════════════════════════════════════════════════
async function fbSaveProducts(products) {
    if (!isFirestoreReady()) return false;
    try {
        const batch = firebaseDb.batch();
        const parentRef = firebaseDb.collection(FB_COLLECTION).doc(FB_DOC_PRODUCTS);

        products.forEach(product => {
            const prodId = product.id ? String(product.id) : parentRef.collection('products').doc().id;
            const docRef = parentRef.collection('products').doc(prodId);
            
            batch.set(docRef, {
                id: prodId,
                name: product.name || '',
                price: product.price || 0,
                category: product.category || '',
                image: product.image || '',
                description: product.description || '',
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        });

        await batch.commit();
        console.log('Productos guardados en subcolección de Firestore');
        return true;
    } catch (e) {
        console.error('Error guardando productos en Firestore:', e);
        return false;
    }
}

async function fbSaveNews(news) {
    if (!isFirestoreReady()) return false;
    try {
        await firebaseDb.collection(FB_COLLECTION).doc(FB_DOC_NEWS).set({
            data: news,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        return true;
    } catch (e) {
        console.error('Error guardando noticias en Firestore:', e);
        return false;
    }
}

async function fbSaveContent(content) {
    if (!isFirestoreReady()) return false;
    try {
        await firebaseDb.collection(FB_COLLECTION).doc(FB_DOC_CONTENT).set({
            data: content,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        return true;
    } catch (e) {
        console.error('Error guardando contenido en Firestore:', e);
        return false;
    }
}

// ═══════════════════════════════════════════════════════════
// CARGAR desde Firestore (una sola vez)
// ═══════════════════════════════════════════════════════════
async function fbLoadProducts() {
    if (!isFirestoreReady()) return null;
    try {
        const doc = await firebaseDb.collection(FB_COLLECTION).doc(FB_DOC_PRODUCTS).get();
        if (doc.exists) {
            return doc.data().data;
        }
        return null;
    } catch (e) {
        console.error('Error cargando productos de Firestore:', e);
        return null;
    }
}

async function fbLoadNews() {
    if (!isFirestoreReady()) return null;
    try {
        const doc = await firebaseDb.collection(FB_COLLECTION).doc(FB_DOC_NEWS).get();
        if (doc.exists) return doc.data().data;
        return null;
    } catch (e) {
        return null;
    }
}

async function fbLoadContent() {
    if (!isFirestoreReady()) return null;
    try {
        const doc = await firebaseDb.collection(FB_COLLECTION).doc(FB_DOC_CONTENT).get();
        if (doc.exists) return doc.data().data;
        return null;
    } catch (e) {
        return null;
    }
}

// ═══════════════════════════════════════════════════════════
// ESCUCHAR cambios en TIEMPO REAL
// ═══════════════════════════════════════════════════════════
function fbSubscribeProducts(callback) {
    if (!isFirestoreReady()) return null;
    fbProductsUnsub = firebaseDb.collection(FB_COLLECTION).doc(FB_DOC_PRODUCTS)
        .onSnapshot(doc => {
            if (doc.exists && doc.data().data) {
                console.log('🔄 Productos actualizados desde Firestore');
                callback(doc.data().data);
            }
        }, err => {
            console.error('Error en subscription de productos:', err);
        });
    return fbProductsUnsub;
}

function fbSubscribeNews(callback) {
    if (!isFirestoreReady()) return null;
    fbNewsUnsub = firebaseDb.collection(FB_COLLECTION).doc(FB_DOC_NEWS)
        .onSnapshot(doc => {
            if (doc.exists && doc.data().data) {
                callback(doc.data().data);
            }
        });
    return fbNewsUnsub;
}

function fbSubscribeContent(callback) {
    if (!isFirestoreReady()) return null;
    fbContentUnsub = firebaseDb.collection(FB_COLLECTION).doc(FB_DOC_CONTENT)
        .onSnapshot(doc => {
            if (doc.exists && doc.data().data) {
                callback(doc.data().data);
            }
        });
    return fbContentUnsub;
}

// ═══════════════════════════════════════════════════════════
// GUARDADO HÍBRIDO (Firestore + localStorage backup)
// ═══════════════════════════════════════════════════════════
async function hybridSaveProducts(products) {
    const savedToCloud = await fbSaveProducts(products);
    safeSaveToStorage('housesulvaranProducts', products);
    return savedToCloud;
}

async function hybridSaveNews(news) {
    const savedToCloud = await fbSaveNews(news);
    safeSaveToStorage('housesulvaranNews', news);
    return savedToCloud;
}

async function hybridSaveContent(content) {
    const savedToCloud = await fbSaveContent(content);
    safeSaveToStorage('housesulvaranContent', content);
    return savedToCloud;
}

// Helper
function safeSaveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (e) {
        console.error('Error guardando en localStorage:', e);
        return false;
    }
}

// ═══════════════════════════════════════════════════════════
// INICIALIZAR datos en Firestore (migración)
// ═══════════════════════════════════════════════════════════
async function fbInitDataIfEmpty() {
    if (!isFirestoreReady()) return;
    try {
        const prodDoc = await firebaseDb.collection(FB_COLLECTION).doc(FB_DOC_PRODUCTS).get();
        if (!prodDoc.exists) {
            let products = null;
            if (typeof window.SITE_DATA !== 'undefined' && window.SITE_DATA.products) {
                products = window.SITE_DATA.products;
            } else {
                const local = localStorage.getItem('housesulvaranProducts');
                if (local) products = JSON.parse(local);
            }
            if (products) {
                await fbSaveProducts(products);
                console.log('📤 Productos migrados a Firestore');
            }
        }
        const newsDoc = await firebaseDb.collection(FB_COLLECTION).doc(FB_DOC_NEWS).get();
        if (!newsDoc.exists) {
            let news = null;
            if (typeof window.SITE_DATA !== 'undefined' && window.SITE_DATA.news) {
                news = window.SITE_DATA.news;
            } else {
                const local = localStorage.getItem('housesulvaranNews');
                if (local) news = JSON.parse(local);
            }
            if (news) await fbSaveNews(news);
        }
        const contentDoc = await firebaseDb.collection(FB_COLLECTION).doc(FB_DOC_CONTENT).get();
        if (!contentDoc.exists) {
            let content = null;
            if (typeof window.SITE_DATA !== 'undefined' && window.SITE_DATA.content) {
                content = window.SITE_DATA.content;
            } else {
                const local = localStorage.getItem('housesulvaranContent');
                if (local) content = JSON.parse(local);
            }
            if (content) await fbSaveContent(content);
        }
    } catch (e) {
        console.error('Error inicializando Firestore:', e);
    }
}
