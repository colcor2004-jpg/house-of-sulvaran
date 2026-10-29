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
            products.push({ id: doc.id, ...doc.data() });
        });
        return products;
    } catch (e) {
        console.error("Error al cargar productos:", e);
    }
    return [];
}

// Guardar Productos
async function fbSaveProducts(products) {
    if (!isFirestoreReady()) return false;
    try {
        const batch = firebaseDb.batch();
        const productsRef = firebaseDb.collection('products');

        const snapshot = await productsRef.get();
        const existingIds = new Set();
        snapshot.forEach(doc => existingIds.add(doc.id));

        const newIds = new Set(products.map(p => String(p.id)));

        existingIds.forEach(id => {
            if (!newIds.has(id)) {
                batch.delete(productsRef.doc(id));
            }
        });

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

// Suscripción de productos en tiempo real con reintento automático
function fbSubscribeProducts(callback) {
    if (typeof firebaseDb === 'undefined' || !firebaseDb || !isFirestoreReady()) {
        setTimeout(() => fbSubscribeProducts(callback), 1000);
        return null;
    }

    try {
        return firebaseDb.collection('products')
            .onSnapshot((querySnapshot) => {
                const products = [];
                querySnapshot.forEach((doc) => {
                    products.push({ id: doc.id, ...doc.data() });
                });
                callback(products);
            }, (error) => {
                console.error("Error en tiempo real de productos:", error);
            });
    } catch (e) {
        console.error("No se pudo establecer la suscripción de productos:", e);
    }
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
    if (!isFirestoreReady()) return {};
    try {
        const docRef = await firebaseDb.collection(FB_COLLECTION).doc(FB_DOC_CONTENT).get();
        if (docRef.exists && docRef.data()) {
            return docRef.data();
        }
    } catch (e) {
        console.error("Error al cargar contenido:", e);
    }
    return {};
}

// Suscripción de contenido con reintento automático y prioridad a los datos de la nube
function fbSubscribeContent(callback) {
    if (typeof firebaseDb === 'undefined' || !firebaseDb || !isFirestoreReady()) {
        setTimeout(() => fbSubscribeContent(callback), 1000);
        return null;
    }

    return firebaseDb.collection(FB_COLLECTION).doc(FB_DOC_CONTENT)
        .onSnapshot((doc) => {
            if (doc.exists && doc.data()) {
                // Sepriorizan los datos de la nube sin sobreescribirlos con textos fijos
                callback(doc.data());
            } else {
                fbInitDataIfEmpty();
                callback({});
            }
        }, (error) => {
            console.error("Error en tiempo real de contenido:", error);
        });
}

// Guardar Contenido General
async function fbSaveContent(content) {
    localStorage.setItem('housesulvaranContent', JSON.stringify(content));
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

// Inicializar datos en Firestore si está vacío
function fbInitDataIfEmpty() {
    if (typeof firebaseDb === 'undefined' || !firebaseDb) return;
    
    const docRef = firebaseDb.collection(FB_COLLECTION).doc(FB_DOC_CONTENT);
    docRef.get().then((doc) => {
        if (!doc.exists) {
            docRef.set({
                heroSubtitle: "Elegancia y Distinción",
                heroTitle: "Relojes, Perfumes, Ropas y Calzados ",
                heroDesc: "Piezas Exclusivas con altos estandares de calidad. Bienvenidos!",
                aboutTitle: "HOUSE OF SULVARAN",
                aboutText1: "Somos tu destino de confianza para que adquieras tus relojes, perfumes, ropas y calzados de alta calidad en Venezuela.",
                aboutText2: "Envíos a toda Venezuela. Atención personalizada por WhatsApp.",
                stat1Value: "", stat1Label: "",
                stat2Value: "", stat2Label: "",
                stat3Value: "", stat3Label: ""
            }).then(() => {
                console.log("Documento inicial creado en Firestore con éxito.");
            }).catch((error) => {
                console.error("Error al crear el documento inicial:", error);
            });
        }
    }).catch((error) => {
        console.error("Error al verificar el documento en Firestore:", error);
    });
}