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

// Cargar Productos (Desde colección de documentos individuales)
async function fbLoadProducts() {
    if (!isFirestoreReady()) return [];
    try {
        const querySnapshot = await firebaseDb.collection('products').get();
        const products = [];
        querySnapshot.forEach((doc) => {
            products.push(doc.data());
        });
        return products;
    } catch (e) {
        console.error("Error al cargar productos:", e);
    }
    return [];
}

// Guardar Productos (Cada producto es un documento independiente + borrado de eliminados)
async function fbSaveProducts(products) {
    if (!isFirestoreReady()) return false;
    try {
        const batch = firebaseDb.batch();
        const productsRef = firebaseDb.collection('products');

        // 1. Obtener los IDs que ya están en la nube para limpiar los que se hayan borrado
        const snapshot = await productsRef.get();
        const existingIds = new Set();
        snapshot.forEach(doc => existingIds.add(doc.id));

        const newIds = new Set(products.map(p => String(p.id)));

        // 2. Marcar para borrar en Firestore los productos que ya no están
        existingIds.forEach(id => {
            if (!newIds.has(id)) {
                batch.delete(productsRef.doc(id));
            }
        });

        // 3. Guardar/Actualizar cada producto en su propio documento
        for (const p of products) {
            const productId = p.id ? String(p.id) : String(Date.now());
            p.id = productId;
            const docRef = productsRef.doc(productId);
            batch.set(docRef, p, { merge: true });
        }

        await batch.commit();
        return true;
    } catch (e) {
        console.error("Error al guardar productos:", e);
        return false;
    }
}

async function hybridSaveProducts(products) {
    return await fbSaveProducts(products);
}

// Suscripción de productos en tiempo real (Escucha toda la colección)
function fbSubscribeProducts(callback) {
    if (!isFirestoreReady()) return null;
    return firebaseDb.collection('products')
        .onSnapshot((querySnapshot) => {
            const products = [];
            querySnapshot.forEach((doc) => {
                products.push(doc.data());
            });
            callback(products);
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

// Cargar Contenido General
async function fbLoadContent() {
    if (!isFirestoreReady()) return { titulo: "", subtitulo: "", descripcion: "", bannerText: "", aboutText: "" };
    try {
        const docRef = await firebaseDb.collection(FB_COLLECTION).doc(FB_DOC_CONTENT).get();
        if (docRef.exists && docRef.data()) {
            const data = docRef.data();
            return {
                titulo: data.titulo || "Relojes, Perfumes, Ropa y Calzado de Alta Gama",
                subtitulo: data.subtitulo || "Relojes, Perfumes, Ropa y Calzado de Alta Gama",
                descripcion: data.descripcion || "Productos Relojes Perfumes Ropas y calzados.",
                bannerText: data.bannerText || "",
                aboutText: data.aboutText || "",
                ...data
            };
        }
    } catch (e) {
        console.error("Error al cargar contenido:", e);
    }
    return { 
        titulo: "Relojes, Perfumes, Ropa y Calzado de Alta Gama", 
        subtitulo: "Relojes, Perfumes, Ropa y Calzado de Alta Gama",
        descripcion: "Productos Relojes Perfumes Ropas y calzados.",
        bannerText: "",
        aboutText: ""
    };
}

// Suscripción de contenido
function fbSubscribeContent(callback) {
    if (!isFirestoreReady()) return null;
    return firebaseDb.collection(FB_COLLECTION).doc(FB_DOC_CONTENT)
        .onSnapshot((doc) => {
            if (doc.exists && doc.data()) {
                const data = doc.data();
                callback({
                    titulo: data.titulo || "Relojes, Perfumes, Ropa y Calzado de Alta Gama",
                    subtitulo: data.subtitulo || "Relojes, Perfumes, Ropa y Calzado de Alta Gama",
                    descripcion: data.descripcion || "Productos Relojes Perfumes Ropas y calzados.",
                    bannerText: data.bannerText || "",
                    aboutText: data.aboutText || "",
                    ...data
                });
            } else {
                callback({ 
                    titulo: "Relojes, Perfumes, Ropa y Calzado de Alta Gama", 
                    subtitulo: "Relojes, Perfumes, Ropa y Calzado de Alta Gama",
                    descripcion: "Productos Relojes Perfumes Ropas y calzados.",
                    bannerText: "",
                    aboutText: ""
                });
            }
        }, (error) => {
            console.error("Error en tiempo real de contenido:", error);
        });
}

async function fbInitDataIfEmpty() {
    if (!isFirestoreReady()) return;
    try {
        console.log("Firestore inicializado correctamente.");
    } catch (e) {
        console.error('Error inicializando Firestore:', e);
    }
}// Guardar Noticias
async function fbSaveNews(news) {
    if (!isFirestoreReady()) return false;
    try {
        await firebaseDb.collection(FB_COLLECTION).doc(FB_DOC_NEWS).set({
            items: news,
            news: news,
            updatedAt: new Date().toISOString()
        }, { merge: true });
        return true;
    } catch (e) {
        console.error("Error al guardar noticias:", e);
        return false;
    }
}

async function hybridSaveNews(news) {
    return await fbSaveNews(news);
}

// Guardar Contenido General
async function fbSaveContent(content) {
    if (!isFirestoreReady()) return false;
    try {
        await firebaseDb.collection(FB_COLLECTION).doc(FB_DOC_CONTENT).set({
            ...content,
            updatedAt: new Date().toISOString()
        }, { merge: true });
        return true;
    } catch (e) {
        console.error("Error al guardar contenido:", e);
        return false;
    }
}

async function hybridSaveContent(content) {
    return await fbSaveContent(content);
}