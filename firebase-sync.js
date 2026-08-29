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
    if (!isFirestoreReady()) return [];
    try {
        const docRef = await firebaseDb.collection(FB_COLLECTION).doc(FB_DOC_PRODUCTS).get();
        if (docRef.exists) {
            const data = docRef.data();
            if (Array.isArray(data)) return data;
            return data.items || data.products || data.list || [];
        }
    } catch (e) {
        console.error("Error al cargar productos:", e);
    }
    return [];
}

// Guardar Productos
async function fbSaveProducts(products) {
    if (!isFirestoreReady()) return false;
    try {
        await firebaseDb.collection(FB_COLLECTION).doc(FB_DOC_PRODUCTS).set({
            items: products,
            products: products,
            updatedAt: new Date().toISOString()
        }, { merge: true });
        return true;
    } catch (e) {
        console.error("Error al guardar productos:", e);
        return false;
    }
}

async function hybridSaveProducts(products) {
    return await fbSaveProducts(products);
}

// Suscripción de productos
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