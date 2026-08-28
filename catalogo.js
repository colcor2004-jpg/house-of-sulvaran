// ============================================
// HOUSE OF SULVARAN - Catálogo Completo (v2 con Firebase Sync)
// ============================================

const defaultProducts = [
    { id: 1, name: "Patek Philippe Nautilus", category: "Reloj", price: 85000, status: "disponible", description: "Icono de la relojería suiza. Caja de acero inoxidable, esfera azul cobalto y movimiento automático de manufactura.", image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&q=80", images: ["https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&q=80"] },
    { id: 2, name: "Creed Aventus", category: "Perfume", price: 445, status: "disponible", description: "Fragancia legendaria que encapsula fuerza, poder y éxito. Notas de piña, abedul y almizcle.", image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&q=80", images: ["https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&q=80"] },
    { id: 3, name: "Rolex Daytona", category: "Reloj", price: 42000, status: "disponible", description: "Cronógrafo legendario con bisel de cerámica negra. El compañero indispensable del gentleman driver.", image: "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=600&q=80", images: ["https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=600&q=80"] },
    { id: 4, name: "Tom Ford Tobacco Vanille", category: "Perfume", price: 395, status: "disponible", description: "Una interpretación opulenta del tabaco y la vainilla. Cálido, especiado y profundamente seductor.", image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=80", images: ["https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=80"] },
    { id: 5, name: "Audemars Piguet Royal Oak", category: "Reloj", price: 78000, status: "disponible", description: "Diseño octogonal revolucionario con bisel hexagonal. Acero inoxidable y esfera 'Grande Tapisserie'.", image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=80", images: ["https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=80"] },
    { id: 6, name: "Clive Christian No. 1", category: "Perfume", price: 865, status: "disponible", description: "Considerado el perfume más caro del mundo. Bergamota, cardamomo y sándalo en su máxima expresión.", image: "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=600&q=80", images: ["https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=600&q=80"] },
    { id: 7, name: "Camisa Gºucci Slim Fit", category: "Ropa", price: 320, status: "disponible", description: "Camisa de vestir de algodón egipcio con corte slim fit. Elegancia italiana para cualquier ocasión.", image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80", images: ["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80"] },
    { id: 8, namºe: "Zapatos Oxford Berluti", category: "Zapato", price: 1850, status: "disponible", description: "Zapatos Oxford de piel patinada a mano. El arte del calzado de lujo en su máxima expresión.", image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80", images: ["https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80"] }
];

let allProducts = [];
let currentFilter = { search: '', category: '', status: '', sort: 'newest' };

function formatPrice(price) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(price);
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

async function initCatalogo() {
    // Inicializar Firebase
    if (typeof initFirebase === 'function') initFirebase();

    const fbProducts = await fbLoadProducts();
    allProducts = (fbProducts && Array.isArray(fbProducts)) ? fbProducts : [];
    // Suscribirse a cambios en tiempo real
    if (isFirestoreReady()) {
        fbSubscribeProducts(products => {
            allProducts = products;
            renderCatalogo();
            updateCount();
        });
    }

    // Leer parámetros URL
    const params = new URLSearchParams(window.location.search);
    const catParam = params.get('cat');
    if (catParam) {
        document.getElementById('categoryFilter').value = catParam;
        currentFilter.category = catParam;
    }

    renderCatalogo();
    updateCount();
    setupEventListeners();
    checkLoginState();
    initNavbar();
}

function setupEventListeners() {
    document.getElementById('searchInput').addEventListener('input', debounce(function() {
        currentFilter.search = this.value.toLowerCase().trim();
        renderCatalogo();
        updateCount();
    }, 300));

    document.getElementById('categoryFilter').addEventListener('change', function() {
        currentFilter.category = this.value;
        renderCatalogo();
        updateCount();
    });

    document.getElementById('statusFilter').addEventListener('change', function() {
        currentFilter.status = this.value;
        renderCatalogo();
        updateCount();
    });

    document.getElementById('sortFilter').addEventListener('change', function() {
        currentFilter.sort = this.value;
        renderCatalogo();
    });
}

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function getFilteredProducts() {
    let filtered = [...allProducts];

    if (currentFilter.search) {
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(currentFilter.search) ||
            p.description.toLowerCase().includes(currentFilter.search) ||
            p.category.toLowerCase().includes(currentFilter.search)
        );
    }

    if (currentFilter.category) {
        filtered = filtered.filter(p => p.category === currentFilter.category);
    }

    if (currentFilter.status) {
        filtered = filtered.filter(p => p.status === currentFilter.status);
    }

    switch (currentFilter.sort) {
        case 'price-asc':
            filtered.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            filtered.sort((a, b) => b.price - a.price);
            break;
        case 'name':
            filtered.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'newest':
        default:
            filtered.sort((a, b) => (b.id || 0) - (a.id || 0));
            break;
    }

    return filtered;
}

function renderCatalogo() {
    const grid = document.getElementById('catalogoGrid');
    const products = getFilteredProducts();

    if (products.length === 0) {
        grid.innerHTML = `
            <div class="catalogo-empty">
                <h3>No se encontraron productos</h3>
                <p>Intenta con otros filtros o términos de búsqueda.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = products.map(p => {
        const images = p.images || (p.image ? [p.image] : []);
        const mainImg = images[0] || 'https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=600&q=80';
        const statusBadge = getStatusBadge(p.status);
        const opacityClass = p.status === 'agotado' ? 'product-agotado' : '';

        return `
        <div class="product-card fade-in ${opacityClass}" onclick="openProductDetailModal(${p.id})">
            <div class="product-gallery-main">
                <img src="${mainImg}" alt="${p.name}" class="product-image" onerror="this.src='https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=600&q=80'">
                ${images.length > 1 ? `<div class="product-gallery-count">${images.length} fotos</div>` : ''}
                <div class="product-status-overlay">${statusBadge}</div>
            </div>
            <div class="product-info">
                <p class="product-category">${p.category}</p>
                <h3 class="product-name">${p.name}</h3>
                <p class="product-desc">${p.description}</p>
                <div class="product-footer">
                    <span class="product-price">${formatPrice(p.price)}</span>
                    <span class="product-btn" style="pointer-events:none;">Ver Detalle →</span>
                </div>
            </div>
        </div>
    `}).join('');
}

function updateCount() {
    const count = getFilteredProducts().length;
    const total = allProducts.length;
    document.getElementById('catalogoCount').textContent = 
        `${count} producto${count !== 1 ? 's' : ''} mostrado${count !== 1 ? 's' : ''} de ${total}`;
}

function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('sortFilter').value = 'newest';
    currentFilter = { search: '', category: '', status: '', sort: 'newest' };
    renderCatalogo();
    updateCount();
    if (window.history.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

// ===== PRODUCT DETAIL MODAL =====
let currentDetailImages = [];
let currentDetailIndex = 0;

function openProductDetailModal(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    const images = product.images || (product.image ? [product.image] : []);
    currentDetailImages = images;
    currentDetailIndex = 0;

    document.getElementById('detailMainImage').src = images[0] || '';
    document.getElementById('detailCategory').textContent = product.category;
    document.getElementById('detailStatus').innerHTML = getStatusBadge(product.status);
    document.getElementById('detailName').textContent = product.name;
    document.getElementById('detailPrice').textContent = formatPrice(product.price);
    document.getElementById('detailDesc').textContent = product.description;

    const thumbsContainer = document.getElementById('detailThumbs');
    if (images.length > 1) {
        thumbsContainer.innerHTML = images.map((img, i) => 
            `<img src="${img}" class="${i === 0 ? 'active' : ''}" onclick="setDetailImage(${i})" alt="">`
        ).join('');
        thumbsContainer.style.display = 'flex';
    } else {
        thumbsContainer.innerHTML = '';
        thumbsContainer.style.display = 'none';
    }

    const actionsContainer = document.getElementById('detailActions');
    if (product.status === 'agotado') {
        actionsContainer.innerHTML = `
            <button class="btn-disabled" disabled>Producto Agotado</button>
            <button class="btn-back" onclick="closeProductDetail()">Cerrar</button>
        `;
    } else {
        const btnText = product.status === 'bajo pedido' ? 'Hacer Pedido por WhatsApp' : 'Consultar por WhatsApp';
        actionsContainer.innerHTML = `
            <a href="https://wa.me/584241403937?text=Hola,%20estoy%20interesado%20en%20${encodeURIComponent(product.name)}" target="_blank" class="btn-whatsapp">${btnText}</a>
            <button class="btn-back" onclick="closeProductDetail()">Cerrar</button>
        `;
    }

    document.getElementById('productDetailOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function setDetailImage(index) {
    currentDetailIndex = index;
    document.getElementById('detailMainImage').src = currentDetailImages[index];
    document.querySelectorAll('.product-detail-thumbs img').forEach((img, i) => {
        img.classList.toggle('active', i === index);
    });
}

function closeProductDetail(e) {
    if (e && e.target !== e.currentTarget) return;
    document.getElementById('productDetailOverlay').classList.remove('active');
    document.body.style.overflow = '';
}

// ===== SHARED FUNCTIONS =====
function checkLoginState() {
    const user = JSON.parse(localStorage.getItem('housesulvaranUser'));
    const loginBtn = document.getElementById('loginBtn');
    const adminBtn = document.getElementById('adminBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    if (!loginBtn) return;

    if (user) {
        loginBtn.textContent = user.name || 'Mi Cuenta';
        loginBtn.href = '#';
        logoutBtn.classList.remove('hidden');
        if (user.role === 'admin') adminBtn.classList.remove('hidden');
    } else {
        loginBtn.textContent = 'Ingresar';
        loginBtn.href = 'login.html';
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

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeProductDetail();
});

document.addEventListener('DOMContentLoaded', initCatalogo);
