// ============================================
// HOUSE OF SULVARAN - Main Application (v2 con Firebase Sync en Tiempo Real)
// ============================================

const defaultProducts = [];

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

let cachedProducts = [];
let cachedNews = defaultNews;
let cachedContent = defaultContent;

// Formateadores y Utilidades Visuales
function formatPrice(price) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(price);
}

function formatDate(dateStr) {
    if (!dateStr) return '';
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

// ==========================================
// RENDERIZADO REACTIVO DEL CONTENIDO Y UI
// ==========================================
function updateUIContent(c) {
    if (!c) return;
    cachedContent = { ...defaultContent, ...c };

    const setText = (id, val) => { 
        const el = document.getElementById(id); 
        if (el && val !== undefined && val !== null) el.textContent = val; 
    };
    const setHtml = (id, val) => { 
        const el = document.getElementById(id); 
        if (el && val !== undefined && val !== null) el.innerHTML = val; 
    };
    const setHref = (id, val) => { 
        const el = document.getElementById(id); 
        if (el && val !== undefined && val !== null) el.href = val; 
    };

    // Textos principales y banner
    if (c.heroSubtitle) setText('heroSubtitle', c.heroSubtitle);
    if (c.heroTitle) setHtml('heroTitle', c.heroTitle.replace(/(Alta Gama|alta gama)/g, '<span class="highlight">$1</span>'));
    if (c.heroDesc) setText('heroDesc', c.heroDesc);
    if (c.productsTitle) setText('productsTitle', c.productsTitle);
    if (c.newsTitle) setText('newsTitle', c.newsTitle);

    // Sección Sobre Nosotros (Aquí se mapean las casillas que no aparecían)
    if (c.aboutTitle) setHtml('aboutTitle', c.aboutTitle.replace(/(HOUSE OF SULVARAN|JS Prendas|JS Perfumeria)/g, '<span class="gold-text">$1</span>'));
    if (c.aboutText1) setText('aboutText1', c.aboutText1);
    if (c.aboutText2) setText('aboutText2', c.aboutText2);

    // Contacto y Redes
    if (c.contactLocation) setText('contactLocation', c.contactLocation);
    if (c.contactHours) setText('contactHours', c.contactHours);
    if (c.tiktokUrl) {
        setHref('tiktokLink', c.tiktokUrl);
        setHref('footerTiktok', c.tiktokUrl);
    }
    if (c.instagramUrl) {
        setHref('instagramLink', c.instagramUrl);
        setHref('footerInstagram', c.instagramUrl);
    }

    // Estadísticas / Contadores
    if (c.stat1Value) setText('stat1Value', c.stat1Value);
    if (c.stat1Label) setText('stat1Label', c.stat1Label);
    if (c.stat2Value) setText('stat2Value', c.stat2Value);
    if (c.stat2Label) setText('stat2Label', c.stat2Label);
    if (c.stat3Value) setText('stat3Value', c.stat3Value);
    if (c.stat3Label) setText('stat3Label', c.stat3Label);
}

function renderProducts(limit = null) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    let products = cachedProducts;

    // DETECCIÓN INTELIGENTE: Si no se pasa un límite explícito y estamos en el Inicio, limitar a 6
    if (!limit) {
        const path = window.location.pathname;
        if (path.endsWith('index.html') || path === '/' || path.endsWith('/house-of-sulvaran/') || path.endsWith('/house-of-sulvaran')) {
            limit = 6;
        }
    }

    if (limit) products = products.slice(0, limit);

    if (!products || products.length === 0) {
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
    `;
    }).join('');
}
function renderNews() {
    const grid = document.getElementById('newsGrid');
    if (!grid) return;
    const news = cachedNews;
    if (!news || news.length === 0) {
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

// Lightbox para galería de productos
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

// Gestión de Sesión de Usuario
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
        if (logoutBtn) logoutBtn.classList.remove('hidden');
        if (user.role === 'admin' && adminBtn) adminBtn.classList.remove('hidden');
    } else {
        loginBtn.textContent = 'Ingresar';
        loginBtn.href = 'login.html';
        loginBtn.onclick = null;
        if (adminBtn) adminBtn.classList.add('hidden');
        if (logoutBtn) logoutBtn.classList.add('hidden');
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
            const href = this.getAttribute('href');
            if (href && href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });
}

// Control de IP y Contador de Clicks en WhatsApp
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
        }
    } catch (e) {
        console.error('Error tracking WhatsApp click:', e);
    }
}

// ==========================================
// INICIALIZACIÓN Y SUSCRIPCIÓN EN TIEMPO REAL
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    checkLoginState();
    initNavbar();
    initSmoothScroll();

    // 1. Suscripción en tiempo real al Contenido General y "Sobre Nosotros"
    if (typeof fbSubscribeContent === 'function') {
        fbSubscribeContent((c) => {
            if (c) {
                updateUIContent(c);
            }
        });
    }

    // 2. Suscripción en tiempo real al Catálogo de Productos
    if (typeof fbSubscribeProducts === 'function') {
        fbSubscribeProducts((productsList) => {
            cachedProducts = productsList || [];
            // Renderiza los primeros 6 destacados en la página de inicio
            renderProducts(6); 
        });
    } else {
        // Respaldo inmediato por si Firebase tarda en responder
        renderProducts(6);
    }

    // 3. Suscripción en tiempo real a Noticias
    if (typeof fbSubscribeNews === 'function') {
        fbSubscribeNews((newsList) => {
            cachedNews = newsList || defaultNews;
            renderNews();
        });
    } else {
        renderNews();
    }
});