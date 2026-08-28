// ============================================
// HOUSE OF SULVARAN - Main Application (v2 con Firebase Sync)
// ============================================

const defaultProducts = [
    { id: 1, name: "Patek Philippe Nautilus", category: "Reloj", price: 85000, status: "disponible", description: "Icono de la relojería suiza. Caja de acero inoxidable, esfera azul cobalto y movimiento automático de manufactura.", image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&q=80", images: ["https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&q=80"] },
    { id: 2, name: "Creed Aventus", category: "Perfume", price: 445, status: "disponible", description: "Fragancia legendaria que encapsula fuerza, poder y éxito. Notas de piña, abedul y almizcle.", image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&q=80", images: ["https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&q=80"] },
    { id: 3, name: "Rolex Daytona", category: "Reloj", price: 42000, status: "disponible", description: "Cronógrafo legendario con bisel de cerámica negra. El compañero indispensable del gentleman driver.", image: "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=600&q=80", images: ["https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=600&q=80"] },
    { id: 4, name: "Tom Ford Tobacco Vanille", category: "Perfume", price: 395, status: "disponible", description: "Una interpretación opulenta del tabaco y la vainilla. Cálido, especiado y profundamente seductor.", image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=80", images: ["https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=80"] },
    { id: 5, name: "Audemars Piguet Royal Oak", category: "Reloj", price: 78000, status: "disponible", description: "Diseño octogonal revolucionario con bisel hexagonal. Acero inoxidable y esfera 'Grande Tapisserie'.", image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=80", images: ["https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=80"] },
    { id: 6, name: "Clive Christian No. 1", category: "Perfume", price: 865, status: "disponible", description: "Considerado el perfume más caro del mundo. Bergamota, cardamomo y sándalo en su máxima expresión.", image: "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=600&q=80", images: ["https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=600&q=80"] },
    { id: 7, name: "Camisa Gucci Slim Fit", category: "Ropa", price: 320, status: "disponible", description: "Camisa de vestir de algodón egipcio con corte slim fit. Elegancia italiana para cualquier ocasión.", image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80", images: ["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80"] },
    { id: 8, name: "Zapatos Oxford Berluti", category: "Zapato", price: 1850, status: "disponible", description: "Zapatos Oxford de piel patinada a mano. El arte del calzado de lujo en su máxima expresión.", image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80", images: ["https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80"] }
];

const defaultNews = [
    { id: 1, title: "¡Nueva colección de relojes suizos disponible!", category: "Novedad", content: "Acabamos de recibir la nueva temporada de relojes suizos. Modelos exclusivos con precios especiales por tiempo limitado. Contáctanos por WhatsApp para más información.", date: "2026-08-15" },
    { id: 2, title: "Promoción: 15% de descuento en perfumes", category: "Promoción", content: "Por esta semana, todos nuestros perfumes de alta gama tienen un 15% de descuento. Aprovecha y lleva tu fragancia favorita a un precio increíble. Válido hasta agotar existencias.", date: "2026-08-10" },
    { id: 3, title: "Envíos disponibles a todo Venezuela", category: "Información", content: "Ahora realizamos envíos seguros a todas las ciudades de Venezuela. Pagos mediante transferencia, Pago Móvil y Zelle. Tu pedido llega en 3-5 días hábiles.", date: "2026-08-05" }
];

const defaultContent = {
    heroSubtitle: "Elegancia y Distinción",
    heroTitle: "Relojes, Perfumes, Ropa y Calzado de Alta Gama",
    heroDesc: "Productos de lujo seleccionados con criterio exigente: relojes, perfumes, ropa y calzado. Pagos mediante transferencias, pago móvil, divisas y USDT. Envíos a toda Venezuela.",
    productsTitle: "Productos Destacados",
    newsTitle: "Noticias y Promociones",
    aboutTitle: "HOUSE OF SULVARAN",
    aboutText1: "Somos tu destino de confianza para relojes, perfumes, ropa y calzado de alta gama en Venezuela. Cada pieza es seleccionada con criterio exigente para ofrecerte solo lo mejor del mercado internacional.",
    aboutText2: "Envíos a toda Venezuela. Atención personalizada por WhatsApp. Pagos mediante transferencias, pago móvil, divisas y USDT. Productos 100% originales con garantía de satisfacción.",
    aboutImage: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&q=80",
    contactLocation: "Venezuela - Envíos a todo el país",
    contactHours: "Lunes a Domingo - 24 horas",
    tiktokUrl: "https://www.tiktok.com/@house.sulvaran",
    instagramUrl: "https://www.instagram.com/houseofsulvaran/",
    stat1Value: "100%",
    stat1Label: "Originales",
    stat2Value: "+500",
    stat2Label: "Clientes",
    stat3Value: "24/7",
    stat3Label: "Atención"
};

let cachedProducts = null;
let cachedNews = null;
let cachedContent = null;

// ═══════════════════════════════════════════════════════════
// GETTERS: Firestore primero, luego SITE_DATA, luego localStorage
// ═══════════════════════════════════════════════════════════
async function getProductsAsync() {
    if (cachedProducts) return cachedProducts;
    const fb = await fbLoadProducts();
    cachedProducts = (fb && Array.isArray(fb)) ? fb : [];
    return cachedProducts;
}

async function getNewsAsync() {
    if (cachedNews) return cachedNews;
    const fb = await fbLoadNews();
    if (fb) { cachedNews = fb; return fb; }
    if (typeof window.SITE_DATA !== 'undefined' && window.SITE_DATA.news) {
        return window.SITE_DATA.news;
    }
    const local = localStorage.getItem('housesulvaranNews');
    if (local) { try { return JSON.parse(local); } catch(e) {} }
    return defaultNews;
}

async function getContentAsync() {
    if (cachedContent) return cachedContent;
    const fb = await fbLoadContent();
    if (fb) { cachedContent = fb; return fb; }
    if (typeof window.SITE_DATA !== 'undefined' && window.SITE_DATA.content) {
        return window.SITE_DATA.content;
    }
    const local = localStorage.getItem('housesulvaranContent');
    if (local) { try { return JSON.parse(local); } catch(e) {} }
    return defaultContent;
}

// Sync helpers para compatibilidad con código existente
function getProducts() { return cachedProducts || defaultProducts; }
function getNews() { return cachedNews || defaultNews; }
function getContent() { return cachedContent || defaultContent; }

function formatPrice(price) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(price);
}

function formatDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('es-VE', { day: 'numeric', month: 'long', year: 'numeric' });
}

function getStatusBadge(status) {
    const map = {
        'disponible': { class: 'status-disponible', text: 'Disponible' },
        'agotado': { class: 'status-agotado', text: 'Agotado' },
        'bajo pedido': { class: 'status-bajo-pedido', text: 'Bajo Pedido' }
    };
    const s = map[status] || map['disponible'];
    return `<span class="status-badge ${s.class}">${s.text}</span>`;
}

function getStatusButton(status, productName) {
    if (status === 'agotado') {
        return `<button class="product-btn product-btn-disabled" disabled>Agotado</button>`;
    }
    const text = status === 'bajo pedido' ? 'Pedir Ahora' : 'Consultar';
    return `<a href="https://wa.me/584241403937?text=Hola,%20estoy%20interesado%20en%20${encodeURIComponent(productName)}" target="_blank" class="product-btn" onclick="trackWhatsAppClick(event)">${text}</a>`;
}

function renderProducts(limit = null) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    let products = getProducts();
    if (limit) products = products.slice(0, limit);
    if (products.length === 0) {
        grid.innerHTML = '<p style="text-align:center;color:var(--gray);grid-column:1/-1;padding:2rem;">No hay productos disponibles en este momento.</p>';
        return;
    }
    grid.innerHTML = products.map(p => {
        const images = p.images || (p.image ? [p.image] : []);
        const mainImg = images[0] || 'https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=600&q=80';
        const thumbs = images.slice(1, 4);
        const statusBadge = getStatusBadge(p.status);
        const btn = getStatusButton(p.status, p.name);
        const opacityClass = p.status === 'agotado' ? 'product-agotado' : '';
        return `
        <div class="product-card fade-in ${opacityClass}">
            <div class="product-gallery-main">
                <img src="${mainImg}" alt="${p.name}" class="product-image" onerror="this.src='https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=600&q=80'" onclick="openProductLightbox('${encodeURIComponent(JSON.stringify(images))}')">
                ${images.length > 1 ? `<div class="product-gallery-count">${images.length} fotos</div>` : ''}
                <div class="product-status-overlay">${statusBadge}</div>
            </div>
            ${thumbs.length > 0 ? `
            <div class="product-gallery-thumbs">
                ${thumbs.map((img, i) => `<img src="${img}" alt="${p.name} ${i+2}" onclick="swapProductImage(this)">`).join('')}
            </div>` : ''}
            <div class="product-info">
                <p class="product-category">${p.category}</p>
                <h3 class="product-name">${p.name}</h3>
                <p class="product-desc">${p.description}</p>
                <div class="product-footer">
                    <span class="product-price">${formatPrice(p.price)}</span>
                    ${btn}
                </div>
            </div>
        </div>
    `}).join('');
}

function swapProductImage(thumb) {
    const card = thumb.closest('.product-card');
    const mainImg = card.querySelector('.product-image');
    const temp = mainImg.src;
    mainImg.src = thumb.src;
    thumb.src = temp;
}

function openProductLightbox(encodedImages) {
    try {
        const images = JSON.parse(decodeURIComponent(encodedImages));
        if (!images || images.length === 0) return;
        let html = '<div class="lightbox-overlay" onclick="closeLightbox()"><div class="lightbox-content">';
        images.forEach((img, i) => {
            html += `<img src="${img}" class="lightbox-img" style="${i === 0 ? '' : 'display:none'}">`;
        });
        if (images.length > 1) {
            html += '<div class="lightbox-nav"><button onclick="prevLightbox(event)">‹</button><span id="lightboxCounter">1 / ' + images.length + '</span><button onclick="nextLightbox(event)">›</button></div>';
        }
        html += '<button class="lightbox-close" onclick="closeLightbox(event)">×</button></div></div>';
        const div = document.createElement('div');
        div.innerHTML = html;
        document.body.appendChild(div.firstElementChild);
        window.lightboxImages = images;
        window.lightboxIndex = 0;
    } catch (e) { console.error(e); }
}

function closeLightbox(e) {
    if (e) e.stopPropagation();
    const overlay = document.querySelector('.lightbox-overlay');
    if (overlay) overlay.remove();
    window.lightboxImages = null;
}

function nextLightbox(e) {
    e.stopPropagation();
    if (!window.lightboxImages) return;
    window.lightboxIndex = (window.lightboxIndex + 1) % window.lightboxImages.length;
    updateLightbox();
}

function prevLightbox(e) {
    e.stopPropagation();
    if (!window.lightboxImages) return;
    window.lightboxIndex = (window.lightboxIndex - 1 + window.lightboxImages.length) % window.lightboxImages.length;
    updateLightbox();
}

function updateLightbox() {
    const imgs = document.querySelectorAll('.lightbox-img');
    imgs.forEach((img, i) => img.style.display = i === window.lightboxIndex ? 'block' : 'none');
    const counter = document.getElementById('lightboxCounter');
    if (counter) counter.textContent = (window.lightboxIndex + 1) + ' / ' + window.lightboxImages.length;
}

function renderNews() {
    const grid = document.getElementById('newsGrid');
    if (!grid) return;
    const news = getNews();
    if (news.length === 0) {
        grid.innerHTML = '<p class="no-news">No hay noticias o promociones en este momento.</p>';
        return;
    }
    const sorted = [...news].sort((a, b) => new Date(b.date) - new Date(a.date));
    grid.innerHTML = sorted.map(n => `
        <div class="news-card fade-in">
            <span class="news-badge">${n.category}</span>
            <p class="news-date">${formatDate(n.date)}</p>
            <h3 class="news-title">${n.title}</h3>
            <p class="news-excerpt">${n.content}</p>
        </div>
    `).join('');
}

function loadContent() {
    const c = getContent();
    const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    const setHtml = (id, val) => { const el = document.getElementById(id); if (el) el.innerHTML = val; };
    const setSrc = (id, val) => { const el = document.getElementById(id); if (el) el.src = val; };
    const setHref = (id, val) => { const el = document.getElementById(id); if (el) el.href = val; };

    setText('heroSubtitle', c.heroSubtitle);
   setHtml('heroTitle', (c.heroTitle || "").replace(/(Alta Gama|alta gama)/g, '<span class="highlight">$1</span>'));
    setHtml('heroTitle', c.heroTitle.replace(/(Alta Gama|alta gama)/g, '<span class="gold-text">$1</span>'));
    setText('heroDesc', c.heroDesc);
    setText('productsTitle', c.productsTitle);
    setText('newsTitle', c.newsTitle);
   setHtml('aboutTitle', (c.aboutTitle || "").replace(/(HOUSE OF SULVARAN|JS Perfumeria)/g, '<span class="highlight">$1</span>'));
    setHtml('aboutTitle', c.aboutTitle.replace(/(HOUSE OF SULVARAN|JS Prendas)/g, '<span class="gold-text">$1</span>'));
    setText('aboutText1', c.aboutText1);
    setText('aboutText2', c.aboutText2);
    setSrc('aboutImage', c.aboutImage);
    setText('contactLocation', c.contactLocation);
    setText('contactHours', c.contactHours);
    setHref('tiktokLink', c.tiktokUrl);
    setHref('instagramLink', c.instagramUrl);
    setHref('footerTiktok', c.tiktokUrl);
    setHref('footerInstagram', c.instagramUrl);
}

function checkLoginState() {
    const user = JSON.parse(localStorage.getItem('housesulvaranUser'));
    const loginBtn = document.getElementById('loginBtn');
    const adminBtn = document.getElementById('adminBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    if (!loginBtn) return;

    if (user) {
        loginBtn.textContent = user.name || 'Mi Cuenta';
        loginBtn.href = '#';
        loginBtn.onclick = () => { };
        logoutBtn.classList.remove('hidden');
        if (user.role === 'admin') adminBtn.classList.remove('hidden');
    } else {
        loginBtn.textContent = 'Ingresar';
        loginBtn.href = 'login.html';
        loginBtn.onclick = null;
        adminBtn.classList.add('hidden');
        logoutBtn.classList.add('hidden');
    }
}

function logout() {
    if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().signOut().catch(() => {});
    }
    localStorage.removeItem('housesulvaranUser');
    window.location.reload();
}

function initNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) navbar.style.boxShadow = '0 2px 15px rgba(0,0,0,0.3)';
        else navbar.style.boxShadow = 'none';
    });
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

function loadStats() {
    const c = getContent();
    const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setText('stat1Value', c.stat1Value);
    setText('stat1Label', c.stat1Label);
    setText('stat2Value', c.stat2Value);
    setText('stat2Label', c.stat2Label);
    setText('stat3Value', c.stat3Value);
    setText('stat3Label', c.stat3Label);
}

async function getVisitorIP() {
    try {
        const res = await fetch('https://api.ipify.org?format=json');
        const data = await res.json();
        return data.ip;
    } catch (e) {
        const fallback = navigator.userAgent + screen.width + screen.height;
        let hash = 0;
        for (let i = 0; i < fallback.length; i++) {
            hash = ((hash << 5) - hash) + fallback.charCodeAt(i);
            hash |= 0;
        }
        return 'local-' + Math.abs(hash);
    }
}

async function trackWhatsAppClick(event) {
    try {
        const ip = await getVisitorIP();
        const key = 'housesulvaranWhatsAppIPs';
        const counterKey = 'housesulvaranWhatsAppCount';
        let ips = JSON.parse(localStorage.getItem(key)) || [];
        let count = parseInt(localStorage.getItem(counterKey)) || 0;

        if (!ips.includes(ip)) {
            ips.push(ip);
            count++;
            localStorage.setItem(key, JSON.stringify(ips));
            localStorage.setItem(counterKey, count);

            const c = getContent();
            if (c.stat2Label === 'Clientes' || c.stat2Label === 'Consultas') {
                c.stat2Value = '+' + count;
                const currentContent = JSON.parse(localStorage.getItem('housesulvaranContent')) || defaultContent;
                currentContent.stat2Value = '+' + count;
                localStorage.setItem('housesulvaranContent', JSON.stringify(currentContent));
                loadStats();
            }
        }
    } catch (e) {
        console.error('Error tracking WhatsApp click:', e);
    }
}

async function init() {
    // Inicializar Firebase si está configurado
    if (typeof initFirebase === 'function') initFirebase();

    // Cargar datos (Firestore primero, luego SITE_DATA, luego localStorage)
    cachedProducts = await getProductsAsync();
    cachedNews = await getNewsAsync();
    cachedContent = await getContentAsync();

    // Suscribirse a cambios en tiempo real si Firestore está disponible
    if (isFirestoreReady()) {
        fbSubscribeProducts(products => {
            cachedProducts = products;
            renderProducts(6);
        });
        fbSubscribeNews(news => {
            cachedNews = news;
            renderNews();
        });
        fbSubscribeContent(content => {
            cachedContent = content;
            loadContent();
            loadStats();
        });
        console.log('🔥 Firestore activo: sincronización en tiempo real');
    } else {
        console.log('🔒 Modo local: usa "Exportar data.js" para compartir cambios');
    }

    renderProducts(6);
    renderNews();
    loadContent();
    loadStats();
    checkLoginState();
    initNavbar();
    initSmoothScroll();
}

document.addEventListener('DOMContentLoaded', init);
