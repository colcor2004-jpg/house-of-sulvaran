// ============================================
// HOUSE OF SULVARAN - Admin Panel (v2 con Firebase Sync)
// ============================================

const defaultProducts = [];

const defaultNews = [
    { id: 1, title: "¡Nueva colección de relojes suizos disponible!", category: "Novedad", content: "Acabamos de recibir la nueva temporada de relojes suizos. Modelos exclusivos con precios especiales por tiempo limitado. Contáctanos por WhatsApp para más información.", date: "2026-08-15" },
    { id: 2, title: "Promoción: 15% de descuento en perfumes", category: "Promoción", content: "Por esta semana, todos nuestros perfumes de alta gama tienen un 15% de descuento. Aprovecha y lleva tu fragancia favorita a un precio increíble. Válido hasta agotar existencias.", date: "2026-08-10" },
    { id: 3, title: "Envíos disponibles a todo Venezuela", category: "Información", content: "Ahora realizamos envíos seguros a todas las ciudades de Venezuela. Pagos mediante transferencia, Pago Móvil y Zelle. Tu pedido llega en 3-5 días hábiles.", date: "2026-08-05" }
];

const defaultContent = {
    heroSubtitle: "Elegancia y Distinción",
    heroTitle: "Relojes y Perfumes de Alta Gama",
    heroDesc: "Descubre nuestra exclusiva selección de relojes de lujo y fragancias importadas. Calidad garantizada y precios competitivos en toda Venezuela.",
    productsTitle: "Productos Destacados",
    newsTitle: "Noticias y Promociones",
    aboutTitle: "HOUSE OF SULVARAN",
    aboutText1: "Somos tu destino de confianza para relojes y perfumes de alta gama en Venezuela. Seleccionamos cada pieza con criterio exigente para ofrecerte solo lo mejor del mercado.",
    aboutText2: "Envíos a toda Venezuela. Atención personalizada por WhatsApp. Productos 100% originales con garantía de satisfacción.",
    aboutImage: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&q=80",
    contactLocation: "Venezuela - Envíos a todo el país",
    contactHours: "Lunes a Domingo - 24 horas",
    tiktokUrl: "https://tiktok.com",
    instagramUrl: "https://instagram.com"
};

let firebaseEnabled = false;
let aboutImageBase64 = null;
let galleryImages = [];

function checkAdmin() {
    const user = JSON.parse(localStorage.getItem('housesulvaranUser'));
    if (!user || user.role !== 'admin') {
        window.location.href = 'login.html';
        return false;
    }
    document.getElementById('adminName').textContent = user.name;
    return true;
}

// ═══════════════════════════════════════════════════════════
// GETTERS: Firestore primero, luego SITE_DATA, luego localStorage
// ═══════════════════════════════════════════════════════════
let cachedAdminProducts = null;

async function getProductsAsync() {
    if (cachedAdminProducts) return cachedAdminProducts;
    if (typeof fbLoadProducts === 'function') {
        const fb = await fbLoadProducts();
        if (fb && Array.isArray(fb) && fb.length > 0) {
            cachedAdminProducts = fb;
            return cachedAdminProducts;
        }
    }
    const local = localStorage.getItem('housesulvaranProducts');
    if (local) {
        try { 
            const parsed = JSON.parse(local);
            if (Array.isArray(parsed) && parsed.length > 0) {
                cachedAdminProducts = parsed;
                return cachedAdminProducts;
            }
        } catch(e) {}
    }
    cachedAdminProducts = [];
    return cachedAdminProducts;
}
function getNews() {
    const local = localStorage.getItem('housesulvaranNews');
    if (local) {
        try { return JSON.parse(local); } catch(e) {}
    }
    if (typeof window.SITE_DATA !== 'undefined' && window.SITE_DATA.news) {
        return window.SITE_DATA.news;
    }
    return defaultNews;
}
function getContent() {
    const local = localStorage.getItem('housesulvaranContent');
    if (local) {
        try { return JSON.parse(local); } catch(e) {}
    }
    if (typeof window.SITE_DATA !== 'undefined' && window.SITE_DATA.content) {
        return window.SITE_DATA.content;
    }
    return defaultContent;
}

// ===== GUARDADO ROBUSTO =====
function safeSaveToStorage(key, data) {
    try {
        const json = JSON.stringify(data);
        localStorage.setItem(key, json);
        return true;
    } catch (e) {
        const isQuota = e.name === 'QuotaExceededError' || 
                        e.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
                        e.message && e.message.toLowerCase().includes('quota');

        if (isQuota) {
            const sizeMB = (JSON.stringify(data).length / 1024 / 1024).toFixed(2);
            alert(
                '⚠️ Almacenamiento lleno (' + sizeMB + ' MB usados)\n\n' +
                'En smartphones el navegador permite muy poco espacio.\n\n' +
                'SOLUCIONES:\n' +
                '1. Usa URLs de imágenes (pega un link de imgur/unsplash) en vez de subir archivos.\n' +
                '2. Borra productos con muchas imágenes grandes.\n' +
                '3. Administra los productos desde una PC/Mac donde el límite es mayor.\n\n' +
                'El producto NO se guardó. Intenta de nuevo con menos imágenes.'
            );
        } else if (e.name === 'SecurityError') {
            alert('⚠️ Navegación privada detectada.\nEn modo incógnito no se puede guardar. Usa una ventana normal.');
        } else {
            alert('❌ Error al guardar: ' + e.message);
        }
        console.error('Error guardando en localStorage [' + key + ']:', e);
        return false;
    }
}

function saveProducts(p) { return safeSaveToStorage('housesulvaranProducts', p); }
function saveNews(n) { return safeSaveToStorage('housesulvaranNews', n); }
function saveContentObj(c) { return safeSaveToStorage('housesulvaranContent', c); }

function formatPrice(price) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(price);
}

function formatDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('es-VE', { day: 'numeric', month: 'short', year: 'numeric' });
}

function generateId() { return Date.now(); }

function getStatusDot(status) {
    const map = {
        'disponible': { color: '#22c55e', text: 'Disponible' },
        'agotado': { color: '#ef4444', text: 'Agotado' },
        'bajo pedido': { color: '#f59e0b', text: 'Bajo Pedido' }
    };
    const s = map[status] || map['disponible'];
    return `<span style="display:inline-flex;align-items:center;gap:0.3rem;font-size:0.7rem;"><span style="width:8px;height:8px;border-radius:50%;background:${s.color};display:inline-block;"></span>${s.text}</span>`;
}

// ===== FIREBASE INIT =====
function initFirebaseAdmin() {
    if (typeof initFirebase === 'function' && initFirebase()) {
        firebaseEnabled = true;
        const clientsNav = document.getElementById('clientsNavItem');
        if (clientsNav) clientsNav.style.display = 'block';

        // Mostrar badge de estado de Firestore
        const statusDiv = document.getElementById('firebaseStatus');
        if (statusDiv) {
            statusDiv.innerHTML = '<span class="firebase-badge">🔥 Firestore activo — Cambios en tiempo real</span>';
        }

        // Inicializar datos en Firestore si está vacío
        fbInitDataIfEmpty();
    } else {
        const statusDiv = document.getElementById('firebaseStatus');
        if (statusDiv) {
            statusDiv.innerHTML = '<span class="firebase-badge off">🔒 Modo Local — Exporta data.js para compartir cambios</span>';
        }
    }
}

// ===== COMPRESIÓN DE IMÁGENES =====
function compressImage(file, maxWidth, quality) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                let w = img.width;
                let h = img.height;
                if (w > maxWidth) {
                    h = Math.round(h * (maxWidth / w));
                    w = maxWidth;
                }
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, w, h);
                ctx.drawImage(img, 0, 0, w, h);
                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(dataUrl);
            };
            img.onerror = function() {
                reject(new Error('No se pudo cargar la imagen para comprimir'));
            };
            img.src = e.target.result;
        };
        reader.onerror = function() {
            reject(new Error('Error al leer el archivo'));
        };
        reader.readAsDataURL(file);
    });
}

// ===== PRODUCTS =====
function updateProductStats() {
    const products = getProducts();
    const watches = products.filter(p => p.category === 'Reloj').length;
    const perfumes = products.filter(p => p.category === 'Perfume').length;
    const clothes = products.filter(p => p.category === 'Ropa').length;
    const shoes = products.filter(p => p.category === 'Zapato').length;
    const available = products.filter(p => p.status === 'disponible').length;
    const soldout = products.filter(p => p.status === 'agotado').length;
    const preorder = products.filter(p => p.status === 'bajo pedido').length;
    const totalValue = products.reduce((sum, p) => sum + p.price, 0);
    document.getElementById('statTotal').textContent = products.length;
    document.getElementById('statWatches').textContent = watches;
    document.getElementById('statPerfumes').textContent = perfumes;
    document.getElementById('statClothes').textContent = clothes;
    document.getElementById('statShoes').textContent = shoes;
    document.getElementById('statValue').textContent = formatPrice(totalValue);
    const extra = document.getElementById('statExtraRow');
    if (extra) {
        extra.innerHTML = `
            <div class="stat-card"><div class="stat-card-value" style="color:#22c55e">${available}</div><div class="stat-card-label">Disponibles</div></div>
            <div class="stat-card"><div class="stat-card-value" style="color:#ef4444">${soldout}</div><div class="stat-card-label">Agotados</div></div>
            <div class="stat-card"><div class="stat-card-value" style="color:#f59e0b">${preorder}</div><div class="stat-card-label">Bajo Pedido</div></div>
        `;
    }
}

async function renderProductsTable() {
    const tbody = document.getElementById('productsTableBody');
    const products = await getProductsAsync();
    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--gray);padding:2.5rem;">No hay productos. Haz clic en "Nuevo Producto" para agregar uno.</td></tr>';
        updateProductStats();
        return;
    }
    tbody.innerHTML = products.map(p => {
        const imgCount = p.images ? p.images.length : (p.image ? 1 : 0);
        const mainImg = p.images && p.images[0] ? p.images[0] : (p.image || 'https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=100&q=80');
        const statusDot = getStatusDot(p.status);
        return `
        <tr>
            <td>
                <div class="table-gallery-preview">
                    <img src="${mainImg}" class="table-product-img" alt="${p.name}" onerror="this.src='https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=100&q=80'">
                    ${imgCount > 1 ? `<span class="table-gallery-badge">${imgCount}</span>` : ''}
                </div>
            </td>
            <td><strong>${p.name}</strong></td>
            <td><span style="color:var(--gold);font-size:0.75rem;">${p.category}</span></td>
            <td>${formatPrice(p.price)}</td>
            <td>${statusDot}</td>
            <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${p.description}</td>
            <td>
                <div class="table-actions">
                    <button class="table-btn table-btn-edit" onclick="editProduct(${p.id})">Editar</button>
                    <button class="table-btn table-btn-delete" onclick="deleteProduct(${p.id})">Eliminar</button>
                </div>
            </td>
        </tr>
    `}).join('');
    updateProductStats();
}

function openProductModal(productId = null) {
    const modal = document.getElementById('productModal');
    const title = document.getElementById('productModalTitle');
    const form = document.getElementById('productForm');
    form.reset();
    resetGallery();
    if (productId) {
        const product = getProducts().find(p => p.id === productId);
        if (product) {
            title.textContent = 'Editar Producto';
            document.getElementById('productId').value = product.id;
            document.getElementById('productName').value = product.name;
            document.getElementById('productCategory').value = product.category;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productStatus').value = product.status || 'disponible';
            document.getElementById('productDesc').value = product.description;
            const images = product.images || (product.image ? [product.image] : []);
            document.getElementById('productImageUrl').value = images[0] || '';
            loadGalleryImages(images.slice(0, 3));
        }
    } else {
        title.textContent = 'Nuevo Producto';
        document.getElementById('productId').value = '';
        document.getElementById('productStatus').value = 'disponible';
    }
    modal.classList.add('active');
}

function closeProductModal() {
    document.getElementById('productModal').classList.remove('active');
    resetGallery();
}

async function saveProduct(e) {
    e.preventDefault();
    const id = document.getElementById('productId').value;
    const name = document.getElementById('productName').value.trim();
    const category = document.getElementById('productCategory').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const status = document.getElementById('productStatus').value;
    const description = document.getElementById('productDesc').value.trim();

    let images = (galleryImages || []).filter(img => img).slice(0, 3);
    const urlInput = document.getElementById('productImageUrl').value.trim();
    if (urlInput && !images.includes(urlInput)) {
        images.unshift(urlInput);
    }
    images = images.slice(0, 3);
    let image = images[0] || '';

    let products = getProducts();
    if (id) {
        const idx = products.findIndex(p => p.id == id);
        if (idx !== -1) products[idx] = { ...products[idx], name, category, price, status, description, image, images };
    } else {
        products.push({ id: generateId(), name, category, price, status, description, image, images });
    }

    // GUARDADO HÍBRIDO: Firestore + localStorage
    const savedToCloud = await hybridSaveProducts(products);

    if (savedToCloud) {
        alert('✅ Producto guardado en la NUBE. Todos los usuarios lo verán automáticamente.');
    } else {
        // Fallback a localStorage
        if (saveProducts(products)) {
            alert('✅ Producto guardado localmente.\n\n⚠️ Para que otros dispositivos lo vean, exporta data.js y súbelo al hosting.');
        } else {
            return; // Error guardando
        }
    }

    renderProductsTable();
    closeProductModal();
}

function editProduct(id) { openProductModal(id); }

async function deleteProduct(id) {
    if (!confirm('¿Eliminar este producto?')) return;
    const filtered = getProducts().filter(p => p.id !== id);

    const savedToCloud = await hybridSaveProducts(filtered);
    if (!savedToCloud) {
        saveProducts(filtered);
    }
    renderProductsTable();
}

async function resetProducts() {
    if (!confirm('¿Deseas vaciar todos los productos del inventario?')) return;
    await hybridSaveProducts([]);
    safeSaveToStorage('housesulvaranProducts', []);
    renderProductsTable();
}


// ===== NEWS =====
function renderNewsTable() {
    const tbody = document.getElementById('newsTableBody');
    const news = getNews();
    if (news.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--gray);padding:2.5rem;">No hay publicaciones. Haz clic en "Nueva Publicación" para crear una.</td></tr>';
        return;
    }
    const sorted = [...news].sort((a, b) => new Date(b.date) - new Date(a.date));
    tbody.innerHTML = sorted.map(n => `
        <tr>
            <td>${formatDate(n.date)}</td>
            <td><strong>${n.title}</strong></td>
            <td><span style="color:var(--gold);font-size:0.75rem;">${n.category}</span></td>
            <td style="max-width:250px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${n.content}</td>
            <td>
                <div class="table-actions">
                    <button class="table-btn table-btn-edit" onclick="editNews(${n.id})">Editar</button>
                    <button class="table-btn table-btn-delete" onclick="deleteNews(${n.id})">Eliminar</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openNewsModal(newsId = null) {
    const modal = document.getElementById('newsModal');
    const title = document.getElementById('newsModalTitle');
    const form = document.getElementById('newsForm');
    form.reset();
    if (newsId) {
        const item = getNews().find(n => n.id === newsId);
        if (item) {
            title.textContent = 'Editar Publicación';
            document.getElementById('newsId').value = item.id;
            document.getElementById('newsTitleField').value = item.title;
            document.getElementById('newsCategoryField').value = item.category;
            document.getElementById('newsContentField').value = item.content;
            document.getElementById('newsDateField').value = item.date;
        }
    } else {
        title.textContent = 'Nueva Publicación';
        document.getElementById('newsId').value = '';
        document.getElementById('newsDateField').value = new Date().toISOString().split('T')[0];
    }
    modal.classList.add('active');
}

function closeNewsModal() { document.getElementById('newsModal').classList.remove('active'); }

async function saveNewsItem(e) {
    e.preventDefault();
    const id = document.getElementById('newsId').value;
    const title = document.getElementById('newsTitleField').value.trim();
    const category = document.getElementById('newsCategoryField').value;
    const content = document.getElementById('newsContentField').value.trim();
    const dateVal = document.getElementById('newsDateField').value;
    const date = dateVal || new Date().toISOString().split('T')[0];
    let news = getNews();
    if (id) {
        const idx = news.findIndex(n => n.id == id);
        if (idx !== -1) news[idx] = { ...news[idx], title, category, content, date };
    } else {
        news.push({ id: generateId(), title, category, content, date });
    }

    const savedToCloud = await hybridSaveNews(news);
    if (!savedToCloud) saveNews(news);

    renderNewsTable();
    closeNewsModal();
}

function editNews(id) { openNewsModal(id); }

async function deleteNews(id) {
    if (!confirm('¿Eliminar esta publicación?')) return;
    const filtered = getNews().filter(n => n.id !== id);
    const savedToCloud = await hybridSaveNews(filtered);
    if (!savedToCloud) saveNews(filtered);
    renderNewsTable();
}

// ===== CLIENTS (Firebase) =====
async function loadClients() {
    if (!firebaseEnabled || !firebaseDb) {
        alert('Firebase no está configurado. Configúralo en firebase-config.js para ver clientes.');
        return;
    }
    const tbody = document.getElementById('clientsTableBody');
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--gray);padding:2rem;">Cargando clientes...</td></tr>';

    try {
        const snapshot = await firebaseDb.collection('users').orderBy('createdAt', 'desc').get();
        const clients = [];
        let googleCount = 0;
        let otherCount = 0;

        snapshot.forEach(doc => {
            const data = doc.data();
            clients.push(data);
            if (data.provider && data.provider.includes('google')) googleCount++;
            else otherCount++;
        });

        document.getElementById('clientTotal').textContent = clients.length;
        document.getElementById('clientGoogle').textContent = googleCount;
        document.getElementById('clientEmail').textContent = otherCount;

        if (clients.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--gray);padding:2.5rem;">No hay clientes registrados aún.</td></tr>';
            return;
        }

        tbody.innerHTML = clients.map(c => {
            const date = c.createdAt ? (c.createdAt.toDate ? c.createdAt.toDate().toLocaleDateString('es-VE') : new Date(c.createdAt).toLocaleDateString('es-VE')) : 'N/A';
            const providerIcon = c.provider && c.provider.includes('google') ? '🔵 Google' : 
                                c.provider && c.provider.includes('phone') ? '📱 Teléfono' : '📧 Email';
            return `
                <tr>
                    <td><strong>${c.name || 'Sin nombre'}</strong></td>
                    <td>${c.email || '—'}</td>
                    <td>${c.phone || '—'}</td>
                    <td><span style="color:var(--gold);font-size:0.8rem;">${providerIcon}</span></td>
                    <td>${date}</td>
                </tr>
            `;
        }).join('');
    } catch (e) {
        console.error('Error cargando clientes:', e);
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#ff6b6b;padding:2rem;">Error al cargar clientes. Verifica que Firestore esté habilitado en Firebase Console.</td></tr>';
    }
}

// ===== CONTENT EDITOR =====
function loadContentEditor() {
    const c = getContent();
    const safeSet = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
    safeSet('heroSubtitleInput', c.heroSubtitle);
    safeSet('heroTitleInput', c.heroTitle);
    safeSet('heroDescInput', c.heroDesc);
    safeSet('productsTitleInput', c.productsTitle);
    safeSet('newsTitleInput', c.newsTitle);
    safeSet('aboutTitleInput', c.aboutTitle);
    safeSet('aboutText1Input', c.aboutText1);
    safeSet('aboutText2Input', c.aboutText2);
    safeSet('aboutImageInput', c.aboutImage);
    safeSet('contactLocationInput', c.contactLocation);
    safeSet('contactHoursInput', c.contactHours);
    safeSet('tiktokUrlInput', c.tiktokUrl);
    safeSet('instagramUrlInput', c.instagramUrl);
    safeSet('stat1ValueInput', c.stat1Value);
    safeSet('stat1LabelInput', c.stat1Label);
    safeSet('stat2ValueInput', c.stat2Value);
    safeSet('stat2LabelInput', c.stat2Label);
    safeSet('stat3ValueInput', c.stat3Value);
    safeSet('stat3LabelInput', c.stat3Label);
    const preview = document.getElementById('aboutImagePreview');
    if (preview && c.aboutImage) { preview.src = c.aboutImage; preview.classList.add('show'); }
}

async function saveContent() {
    const c = {
        heroSubtitle: document.getElementById('heroSubtitleInput').value,
        heroTitle: document.getElementById('heroTitleInput').value,
        heroDesc: document.getElementById('heroDescInput').value,
        productsTitle: document.getElementById('productsTitleInput').value,
        newsTitle: document.getElementById('newsTitleInput').value,
        aboutTitle: document.getElementById('aboutTitleInput').value,
        aboutText1: document.getElementById('aboutText1Input').value,
        aboutText2: document.getElementById('aboutText2Input').value,
        aboutImage: document.getElementById('aboutImageInput').value,
        contactLocation: document.getElementById('contactLocationInput').value,
        contactHours: document.getElementById('contactHoursInput').value,
        tiktokUrl: document.getElementById('tiktokUrlInput').value,
        instagramUrl: document.getElementById('instagramUrlInput').value,
        stat1Value: document.getElementById('stat1ValueInput').value,
        stat1Label: document.getElementById('stat1LabelInput').value,
        stat2Value: document.getElementById('stat2ValueInput').value,
        stat2Label: document.getElementById('stat2LabelInput').value,
        stat3Value: document.getElementById('stat3ValueInput').value,
        stat3Label: document.getElementById('stat3LabelInput').value
    };

    const savedToCloud = await hybridSaveContent(c);
    if (savedToCloud) {
        alert('✅ Contenido guardado en la NUBE. Todos los usuarios lo verán automáticamente.');
    } else {
        if (saveContentObj(c)) {
            alert('✅ Contenido guardado localmente.\n\n⚠️ Exporta data.js para compartir cambios con otros dispositivos.');
        }
    }
}

// ===== NAVIGATION =====
function showSection(section, el) {
    document.querySelectorAll('.admin-nav a').forEach(a => a.classList.remove('active'));
    if (el) el.classList.add('active');
    document.getElementById('productsSection').classList.add('hidden');
    document.getElementById('contentSection').classList.add('hidden');
    document.getElementById('newsSection').classList.add('hidden');
    document.getElementById('clientsSection').classList.add('hidden');
    document.getElementById(section + 'Section').classList.remove('hidden');
    if (section === 'content') loadContentEditor();
    if (section === 'news') renderNewsTable();
    if (section === 'clients') loadClients();
}

function logout() {
    if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().signOut().catch(() => {});
    }
    localStorage.removeItem('housesulvaranUser');
    window.location.href = 'index.html';
}

// ===== INIT =====
function initImagePreviews() {
    const aboutInput = document.getElementById('aboutImageInput');
    const aboutPreview = document.getElementById('aboutImagePreview');
    if (aboutInput && aboutPreview) {
        aboutInput.addEventListener('input', function() {
            if (this.value) { aboutPreview.src = this.value; aboutPreview.classList.add('show'); }
            else { aboutPreview.classList.remove('show'); }
        });
    }
}

function initModals() {
    const productModal = document.getElementById('productModal');
    const newsModal = document.getElementById('newsModal');
    if (productModal) {
        productModal.addEventListener('click', function(e) { if (e.target === this) closeProductModal(); });
    }
    if (newsModal) {
        newsModal.addEventListener('click', function(e) { if (e.target === this) closeNewsModal(); });
    }
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') { closeProductModal(); closeNewsModal(); }
    });
}

// ===== FILE UPLOAD & DRAG DROP =====
function initFileUpload(dropZoneId, fileInputId, previewId, urlInputId, base64Var) {
    const dropZone = document.getElementById(dropZoneId);
    const fileInput = document.getElementById(fileInputId);
    const preview = document.getElementById(previewId);
    const urlInput = document.getElementById(urlInputId);

    if (!dropZone || !fileInput) return;

    dropZone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) handleFile(file, preview, urlInput, base64Var);
    });

    dropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', function(e) {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file, preview, urlInput, base64Var);
    });
}

// ===== GALLERY FUNCTIONS =====
function openGallerySlot(index) {
    const input = document.getElementById('galleryFileInput');
    if (input) {
        input.dataset.targetIndex = index;
        input.click();
    }
}

function handleGalleryFile(input) {
    const file = input.files[0];
    if (!file) return;
    const index = parseInt(input.dataset.targetIndex || '0');
    processGalleryFile(file, index);
    input.value = '';
}

async function processGalleryFile(file, index) {
    if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen (JPG, PNG, WEBP).');
        return;
    }
    if (file.size > 50 * 1024 * 1024) {
        alert('La imagen es muy grande. Máximo 50MB. Se comprimirá automáticamente.');
        return;
    }

    try {
        const compressed = await compressImage(file, 600, 0.7);
        galleryImages[index] = compressed;
        updateGalleryUI();
    } catch (err) {
        alert('Error al procesar la imagen: ' + err.message);
    }
}

function updateGalleryUI() {
    const slots = document.querySelectorAll('.gallery-slot');
    slots.forEach((slot, i) => {
        const placeholder = slot.querySelector('.gallery-placeholder');
        const img = slot.querySelector('.gallery-img');
        const removeBtn = slot.querySelector('.gallery-remove');
        if (galleryImages[i]) {
            if (placeholder) placeholder.style.display = 'none';
            if (img) { img.src = galleryImages[i]; img.style.display = 'block'; }
            if (removeBtn) removeBtn.style.display = 'flex';
        } else {
            if (placeholder) placeholder.style.display = 'flex';
            if (img) { img.src = ''; img.style.display = 'none'; }
            if (removeBtn) removeBtn.style.display = 'none';
        }
    });
}

function removeGalleryImage(index, event) {
    if (event) event.stopPropagation();
    const removedImage = galleryImages[index];
    const urlInput = document.getElementById('productImageUrl');
    if (removedImage && urlInput && urlInput.value.trim() === removedImage) {
        urlInput.value = '';
    }
    galleryImages[index] = null;
    galleryImages = galleryImages.filter(img => img);
    updateGalleryUI();
}

function resetGallery() {
    galleryImages = [];
    updateGalleryUI();
}

function loadGalleryImages(images) {
    galleryImages = images || [];
    updateGalleryUI();
}

// ===== DRAG & DROP EN SLOTS DE GALERÍA =====
function initGalleryDragDrop() {
    const slots = document.querySelectorAll('.gallery-slot');
    slots.forEach(slot => {
        slot.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.stopPropagation();
            slot.style.borderColor = '#0A0A0A';
            slot.style.background = 'rgba(0,0,0,0.03)';
        });
        slot.addEventListener('dragleave', function(e) {
            e.preventDefault();
            e.stopPropagation();
            slot.style.borderColor = 'rgba(0,0,0,0.15)';
            slot.style.background = '';
        });
        slot.addEventListener('drop', function(e) {
            e.preventDefault();
            e.stopPropagation();
            slot.style.borderColor = 'rgba(0,0,0,0.15)';
            slot.style.background = '';
            const file = e.dataTransfer.files[0];
            if (file) {
                const index = parseInt(slot.dataset.index || '0');
                processGalleryFile(file, index);
            }
        });
    });
}

async function handleFile(file, previewEl, urlInputEl, base64Var) {
    if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen (JPG, PNG, WEBP).');
        return;
    }
    if (file.size > 50 * 1024 * 1024) {
        alert('La imagen es muy grande. Máximo 50MB. Se comprimirá automáticamente.');
        return;
    }

    try {
        const compressed = await compressImage(file, 800, 0.75);
        if (base64Var === 'about') aboutImageBase64 = compressed;

        if (previewEl) {
            previewEl.src = compressed;
            previewEl.style.display = 'block';
            previewEl.classList.add('show');
        }
        if (urlInputEl) {
            urlInputEl.value = compressed;
        }
    } catch (err) {
        alert('Error al procesar la imagen: ' + err.message);
    }
}

function exportDataJS() {
    const products = getProducts();
    const news = getNews();
    const content = getContent();

    const data = `// ============================================
// HOUSE OF SULVARAN - Datos del sitio (EXPORTADOS)
// ============================================
// Fecha de exportación: ${new Date().toLocaleString('es-VE')}
// Reemplaza este archivo en tu hosting para que TODOS los usuarios vean los cambios.
// ============================================

window.SITE_DATA = {
    products: ${JSON.stringify(products, null, 4)},
    news: ${JSON.stringify(news, null, 4)},
    content: ${JSON.stringify(content, null, 4)}
};`;

    const blob = new Blob([data], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert('✅ data.js descargado.\n\nSube este archivo a tu hosting (Netlify/Vercel/GitHub Pages) reemplazando el data.js anterior.\n\nAsí TODOS los usuarios verán los cambios que hiciste.');
}

function init() {
    if (!checkAdmin()) return;
    initFirebaseAdmin();
    renderProductsTable();
    initImagePreviews();
    initModals();
    initFileUpload('aboutDropZone', 'aboutImageFile', 'aboutImagePreview', 'aboutImageInput', 'about');
    initGalleryDragDrop();

    const productForm = document.getElementById('productForm');
    const newsForm = document.getElementById('newsForm');
    if (productForm) productForm.addEventListener('submit', saveProduct);
    if (newsForm) newsForm.addEventListener('submit', saveNewsItem);
}

document.addEventListener('DOMContentLoaded', init);
