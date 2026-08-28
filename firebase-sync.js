// ============================================
// HOUSE OF SULVARAN - Capa de sincronización Firestore (v3)
// ============================================
// CAMBIO IMPORTANTE (v3):
//   Antes: TODOS los productos vivían dentro de UN solo documento
//          (siteData/products => { items: [ ...cientos de productos... ] })
//          => al superar 1 MB Firestore rechaza la escritura.
//   Ahora: cada producto es su propio documento dentro de la COLECCIÓN
//          "products" (products/{id}). Ya no hay límite práctico de catálogo
//          y solo se escribe el producto editado, no todo el catálogo.
//
// Estructura en Firestore:
//   products/{id}        -> { id, name, category, price, status, description, image, images[], updatedAt }
//   siteData/news        -> { items: [...] }      (contenido pequeño)
//   siteData/content     -> { ...campos... }      (contenido pequeño)
// ============================================

const PRODUCTS_COLLECTION = 'products';
const SITE_COLLECTION = 'siteData';
const LEGACY_PRODUCTS_DOC = 'products'; // siteData/products (formato viejo)

// Límite real de Firestore por documento: 1 MiB. Dejamos margen.
const MAX_DOC_BYTES = 900 * 1024;

function isFirestoreReady() {
    return typeof firebaseDb !== 'undefined' && firebaseDb !== null;
}

function ensureFirestore() {
    if (isFirestoreReady()) return true;
    if (typeof initFirebase === 'function') return initFirebase() && isFirestoreReady();
    return false;
}

function approxBytes(obj) {
    try { return new Blob([JSON.stringify(obj)]).size; } catch (e) { return JSON.stringify(obj).length; }
}

// ───────────────────────────────────────────
// Normalización de productos
// ───────────────────────────────────────────
// Se descartan las imágenes de demostración por URL (Unsplash y similares).
// Solo se conservan imágenes subidas desde la galería (data:image/... en JPG)
// o URLs propias que el administrador haya escrito a mano.
function isDemoImage(url) {
    if (!url || typeof url !== 'string') return true;
    return /images\.unsplash\.com|source\.unsplash\.com|placeholder\.com|via\.placeholder/i.test(url);
}

function normalizeProduct(raw) {
    if (!raw) return null;
    const images = (raw.images || (raw.image ? [raw.image] : []))
        .filter(img => typeof img === 'string' && img.trim() && !isDemoImage(img))
        .slice(0, 3);
    return {
        id: Number(raw.id) || Date.now(),
        name: raw.name || '',
        category: raw.category || 'Reloj',
        price: Number(raw.price) || 0,
        status: raw.status || 'disponible',
        description: raw.description || '',
        image: images[0] || '',
        images: images
    };
}

function sortProducts(list) {
    return list.slice().sort((a, b) => (b.id || 0) - (a.id || 0));
}

// ───────────────────────────────────────────
// PRODUCTOS (subcolección: 1 documento por producto)
// ───────────────────────────────────────────
async function fbLoadProducts() {
    if (!ensureFirestore()) return null;
    try {
        await fbMigrateLegacyProducts();
        const snap = await firebaseDb.collection(PRODUCTS_COLLECTION).get();
        const items = [];
        snap.forEach(doc => {
            const p = normalizeProduct(doc.data());
            if (p) items.push(p);
        });
        return sortProducts(items);
    } catch (e) {
        console.error('Firestore: error cargando productos', e);
        return null;
    }
}

function fbSubscribeProducts(callback) {
    if (!ensureFirestore()) return () => {};
    return firebaseDb.collection(PRODUCTS_COLLECTION).onSnapshot(snap => {
        const items = [];
        snap.forEach(doc => {
            const p = normalizeProduct(doc.data());
            if (p) items.push(p);
        });
        callback(sortProducts(items));
    }, err => console.error('Firestore: error en la suscripción de productos', err));
}

// Guarda UN producto (documento individual). Devuelve true si se guardó.
async function fbSaveProduct(product) {
    if (!ensureFirestore()) return false;
    const clean = normalizeProduct(product);
    if (!clean) return false;

    const size = approxBytes(clean);
    if (size > MAX_DOC_BYTES) {
        alert(
            '⚠️ Este producto pesa ' + (size / 1024 / 1024).toFixed(2) + ' MB y supera el límite de 1 MB por producto.\n\n' +
            'Usa menos fotos o fotos más livianas (la galería las comprime automáticamente).'
        );
        return false;
    }

    try {
        await firebaseDb
            .collection(PRODUCTS_COLLECTION)
            .doc(String(clean.id))
            .set({ ...clean, updatedAt: new Date().toISOString() });
        return true;
    } catch (e) {
        console.error('Firestore: error guardando producto', e);
        alert('❌ No se pudo guardar en la nube: ' + (e.message || e));
        return false;
    }
}

async function fbDeleteProduct(id) {
    if (!ensureFirestore()) return false;
    try {
        await firebaseDb.collection(PRODUCTS_COLLECTION).doc(String(id)).delete();
        return true;
    } catch (e) {
        console.error('Firestore: error eliminando producto', e);
        return false;
    }
}

// Guarda una lista completa (se usa solo en migraciones/importaciones).
async function fbSaveProducts(list) {
    if (!ensureFirestore()) return false;
    try {
        const items = (list || []).map(normalizeProduct).filter(Boolean);
        // Firestore permite 500 operaciones por batch.
        for (let i = 0; i < items.length; i += 400) {
            const batch = firebaseDb.batch();
            items.slice(i, i + 400).forEach(p => {
                const ref = firebaseDb.collection(PRODUCTS_COLLECTION).doc(String(p.id));
                batch.set(ref, { ...p, updatedAt: new Date().toISOString() });
            });
            await batch.commit();
        }
        return true;
    } catch (e) {
        console.error('Firestore: error guardando lista de productos', e);
        return false;
    }
}

// Compatibilidad con el código anterior del panel.
async function hybridSaveProducts(list) { return fbSaveProducts(list); }

// Migra el documento viejo siteData/products (array gigante) a la colección.
let legacyMigrationDone = false;
async function fbMigrateLegacyProducts() {
    if (legacyMigrationDone || !isFirestoreReady()) return;
    legacyMigrationDone = true;
    try {
        const ref = firebaseDb.collection(SITE_COLLECTION).doc(LEGACY_PRODUCTS_DOC);
        const doc = await ref.get();
        if (!doc.exists) return;
        const data = doc.data() || {};
        const legacy = data.items || data.products || [];
        if (Array.isArray(legacy) && legacy.length) {
            console.log('Migrando ' + legacy.length + ' productos del formato antiguo a la colección "products"...');
            await fbSaveProducts(legacy);
        }
        await ref.delete();
        console.log('✅ Migración completada: siteData/products eliminado.');
    } catch (e) {
        console.warn('No se pudo migrar el documento antiguo de productos:', e.message || e);
    }
}

// ───────────────────────────────────────────
// NOTICIAS (documento único, contenido liviano)
// ───────────────────────────────────────────
async function fbLoadNews() {
    if (!ensureFirestore()) return null;
    try {
        const doc = await firebaseDb.collection(SITE_COLLECTION).doc('news').get();
        if (!doc.exists) return null;
        const items = (doc.data() || {}).items;
        return Array.isArray(items) ? items : null;
    } catch (e) {
        console.error('Firestore: error cargando noticias', e);
        return null;
    }
}

function fbSubscribeNews(callback) {
    if (!ensureFirestore()) return () => {};
    return firebaseDb.collection(SITE_COLLECTION).doc('news').onSnapshot(doc => {
        if (!doc.exists) return;
        const items = (doc.data() || {}).items;
        if (Array.isArray(items)) callback(items);
    }, err => console.error('Firestore: error en la suscripción de noticias', err));
}

async function fbSaveNews(items) {
    if (!ensureFirestore()) return false;
    try {
        await firebaseDb.collection(SITE_COLLECTION).doc('news')
            .set({ items: items || [], updatedAt: new Date().toISOString() });
        return true;
    } catch (e) {
        console.error('Firestore: error guardando noticias', e);
        return false;
    }
}
async function hybridSaveNews(items) { return fbSaveNews(items); }

// ───────────────────────────────────────────
// CONTENIDO DEL SITIO (documento único)
// ───────────────────────────────────────────
async function fbLoadContent() {
    if (!ensureFirestore()) return null;
    try {
        const doc = await firebaseDb.collection(SITE_COLLECTION).doc('content').get();
        if (!doc.exists) return null;
        const data = doc.data() || {};
        delete data.updatedAt;
        return Object.keys(data).length ? data : null;
    } catch (e) {
        console.error('Firestore: error cargando contenido', e);
        return null;
    }
}

function fbSubscribeContent(callback) {
    if (!ensureFirestore()) return () => {};
    return firebaseDb.collection(SITE_COLLECTION).doc('content').onSnapshot(doc => {
        if (!doc.exists) return;
        const data = doc.data() || {};
        delete data.updatedAt;
        if (Object.keys(data).length) callback(data);
    }, err => console.error('Firestore: error en la suscripción de contenido', err));
}

async function fbSaveContent(content) {
    if (!ensureFirestore()) return false;
    try {
        await firebaseDb.collection(SITE_COLLECTION).doc('content')
            .set({ ...content, updatedAt: new Date().toISOString() });
        return true;
    } catch (e) {
        console.error('Firestore: error guardando contenido', e);
        return false;
    }
}
async function hybridSaveContent(content) { return fbSaveContent(content); }

// Ya NO se siembran productos de demostración en Firestore.
// (Eso era lo que "reiniciaba" el catálogo al abrir el admin en otro dispositivo.)
async function fbInitDataIfEmpty() { return true; }
