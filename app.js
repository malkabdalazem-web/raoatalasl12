// App State
let products = [];
let siteSettings = {
    introTitle: "شركة روعة العسل للتجارة العامة المحدودة",
    introText: "شركة متخصصة في منتجات العناية بالبشرة والشعر\nمبيع مفرد وجملة",
    facebookUrl: "https://www.facebook.com/profile.php?id=61570371899928",
    logoPath: "assets/logo.png"
};
let currentProduct = null;
const WHATSAPP_NUMBER = "9647713390381";
const ADMIN_PASS = "hbh71hbh";

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    loadSettings();
    updateAdminUI();
    handleRouting();
    window.addEventListener('hashchange', handleRouting);
});

// --- Data Management ---

function loadProducts() {
    const stored = localStorage.getItem('rawaat_products');
    if (stored) {
        products = JSON.parse(stored);
    } else {
        products = [
            {
                id: 1708220000001,
                title: "كريم الترطيب العميق",
                category: "كريمات",
                price: "25,000 د.ع",
                shortDescription: "كريم مرطب غني بفيتامين E لجميع أنواع البشرة.",
                fullDescription: "يعمل كريم الترطيب العميق على توفير حماية تدوم 24 ساعة من الجفاف.",
                images: ["uploads/demo1-1.jpg", "uploads/demo1-2.jpg"]
            },
            {
                id: 1708220000002,
                title: "سيروم الشعر الذهبي",
                category: "شعر",
                price: "18,000 د.ع",
                shortDescription: "سيروم مغذي لإصلاح الشعر التالف والمتقصف.",
                fullDescription: "يحتوي هذا السيروم على مزيج من الزيوت الطبيعية.",
                images: ["uploads/demo2-1.jpg"]
            }
        ];
        saveToStorage();
    }
}

function loadSettings() {
    const storedSettings = localStorage.getItem('rawaat_settings');
    if (storedSettings) {
        siteSettings = JSON.parse(storedSettings);
    }
    applySettingsToUI();
}

function applySettingsToUI() {
    const titleEl = document.querySelector('.home-hero h1');
    const textEl = document.querySelector('.home-hero .intro-text');
    const fbEl = document.querySelector('.fb-btn');
    const logoEls = document.querySelectorAll('img[alt*="Logo"], .logo-large img');

    if (titleEl) titleEl.textContent = siteSettings.introTitle;
    if (textEl) textEl.innerHTML = siteSettings.introText.replace(/\n/g, '<br>');
    if (fbEl) fbEl.href = siteSettings.facebookUrl;
    logoEls.forEach(img => img.src = siteSettings.logoPath);
}

function saveToStorage() {
    try {
        localStorage.setItem('rawaat_products', JSON.stringify(products));
        localStorage.setItem('rawaat_settings', JSON.stringify(siteSettings));
    } catch (e) {
        console.error("Storage Error:", e);
        alert("خطأ: حجم الصور كبير جداً، يرجى حذف بعض الصور أو استخدام صور أصغر.");
    }
}

// --- Routing ---

function handleRouting() {
    const hash = window.location.hash || '#home';
    const section = hash.split('-')[0].substring(1);

    if (hash.startsWith('#product-')) {
        const id = hash.split('-')[1];
        showProductDetails(id);
        return;
    }

    if (['home', 'products', 'booking'].includes(section)) {
        showSection(section);
        if (section === 'products') renderProducts(products);
        if (section === 'booking') populateBookingSelect();
    }
}

function navigateTo(section, param = '') {
    if (section === 'category') {
        window.location.hash = '#products';
        setTimeout(() => {
            const filtered = products.filter(p => p.category === param);
            renderProducts(filtered);
            document.getElementById('section-title').textContent = `قسم: ${param}`;
            showSection('products');
        }, 50);
    } else {
        window.location.hash = '#' + section;
    }
}

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => {
        s.classList.remove('active');
        s.style.display = 'none';
    });
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('active');
        section.style.display = 'block';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- Rendering ---

function renderProducts(productsToRender) {
    const isAdmin = isAdminLoggedIn();
    const container = document.getElementById('products-list');
    if (!container) return;

    container.innerHTML = productsToRender.map(p => `
        <div class="product-card">
            <div class="product-thumb">
                <img src="${p.images[0] || 'assets/placeholder.png'}" alt="${p.title}">
            </div>
            <div class="product-info">
                <h3 class="product-title">${p.title}</h3>
                <p class="product-desc">${p.shortDescription}</p>
                <div class="product-price">${p.price || ''}</div>
                ${isAdmin ? `
                    <div style="margin-top: 10px; display: flex; gap: 5px;">
                        <button class="btn btn-edit btn-small" onclick="editProduct('${p.id}')" style="flex:1">تعديل</button>
                        <button class="btn btn-delete btn-small" onclick="deleteProduct('${p.id}')" style="flex:1">حذف</button>
                    </div>
                ` : ''}
            </div>
            <div class="product-actions">
                <button class="btn btn-details" onclick="navigateToProduct('${p.id}')">التفاصيل</button>
                <button class="btn btn-book" onclick="openBookingModal('${p.id}')">حجز</button>
                <button class="btn btn-whatsapp" onclick="sendInquiry('${p.title}')">واتساب</button>
            </div>
        </div>
    `).join('');
}

function navigateToProduct(id) {
    window.location.hash = `#product-${id}`;
}

function showProductDetails(id) {
    const product = products.find(p => p.id == id);
    if (!product) { navigateTo('products'); return; }
    currentProduct = product;
    showSection('product-details');

    const container = document.getElementById('details-content');
    container.innerHTML = `
        <div class="gallery-column">
            <div class="main-img-container">
                <img src="${product.images[0] || 'assets/placeholder.png'}" id="main-detail-img">
            </div>
            <div class="thumb-gallery">
                ${product.images.map((img, idx) => `
                    <div class="thumb-item ${idx === 0 ? 'active' : ''}" onclick="updateMainImage('${img}', ${idx})">
                        <img src="${img}">
                    </div>
                `).join('')}
            </div>
        </div>
        <div class="info-column">
            <span class="category-tag">${product.category}</span>
            <h1>${product.title}</h1>
            <div class="product-price" style="font-size: 1.5rem; margin-bottom: 20px;">${product.price || ''}</div>
            <div class="full-desc">${product.fullDescription}</div>
            <div class="details-actions">
                <button class="btn btn-book" onclick="openBookingModal('${product.id}')">حجز الآن</button>
                <button class="btn btn-details" onclick="shareProduct('${product.id}')">مشاركة</button>
            </div>
        </div>
    `;
}

function updateMainImage(src, index) {
    document.getElementById('main-detail-img').src = src;
    document.querySelectorAll('.thumb-item').forEach((item, idx) => item.classList.toggle('active', idx === index));
}

// --- Admin System ---

function openAdminModal() {
    document.getElementById('admin-modal')?.classList.add('active');
}

function closeModal(id) {
    document.getElementById(id)?.classList.remove('active');
}

function doAdminLogin() {
    const passInput = document.getElementById('admin-pass-input');
    if (passInput.value === ADMIN_PASS) {
        sessionStorage.setItem('rawaat_admin', 'true');
        passInput.value = '';
        closeModal('admin-modal');
        updateAdminUI();
    } else {
        alert("كلمة مرور خاطئة");
    }
}

function isAdminLoggedIn() {
    return sessionStorage.getItem('rawaat_admin') === 'true';
}

function adminLogout() {
    sessionStorage.removeItem('rawaat_admin');
    updateAdminUI();
}

function updateAdminUI() {
    const isAdmin = isAdminLoggedIn();
    const controls = document.getElementById('admin-controls');
    if (controls) controls.style.display = isAdmin ? 'flex' : 'none';
    renderProducts(products);
}

function openAddProductModal() {
    clearAdminForm();
    document.getElementById('modal-title-text').textContent = "إضافة منتج جديد";
    document.getElementById('product-modal').classList.add('active');
}

function editProduct(id) {
    const p = products.find(prod => prod.id == id);
    if (!p) return;
    document.getElementById('modal-title-text').textContent = "تعديل المنتج";
    document.getElementById('edit-id').value = p.id;
    document.getElementById('prod-title').value = p.title;
    document.getElementById('prod-category').value = p.category;
    document.getElementById('prod-price').value = p.price;
    document.getElementById('prod-short').value = p.shortDescription;
    document.getElementById('prod-full').value = p.fullDescription;

    // Clear and populate dynamic image rows
    const container = document.getElementById('modal-image-inputs');
    container.innerHTML = '';
    p.images.forEach(img => addImageLinkRow(img));
    if (p.images.length === 0) addImageLinkRow('');

    document.getElementById('product-modal').classList.add('active');
}

function addImageLinkRow(value = '') {
    const container = document.getElementById('modal-image-inputs');
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.gap = '5px';
    row.style.marginBottom = '5px';
    row.innerHTML = `
        <input type="text" class="prod-img" value="${value}" placeholder="رابط الصورة أو مسارها" style="flex:1">
        <button class="btn btn-delete btn-small" type="button" onclick="this.parentElement.remove()" style="padding: 5px 10px;">&times;</button>
    `;
    container.appendChild(row);
}

function handleFileSelect(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
            // Resize and compress
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const max = 800;

            if (width > height && width > max) {
                height *= max / width;
                width = max;
            } else if (height > max) {
                width *= max / height;
                height = max;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Convert to small JPEG
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
            addImageLinkRow(compressedBase64);
        };
        img.src = e.target.result;
        input.value = '';
    };
    reader.readAsDataURL(file);
}

function openSettingsModal() {
    document.getElementById('set-title').value = siteSettings.introTitle;
    document.getElementById('set-text').value = siteSettings.introText;
    document.getElementById('set-fb').value = siteSettings.facebookUrl;
    document.getElementById('set-logo').value = siteSettings.logoPath;
    document.getElementById('settings-modal').classList.add('active');
}

function saveSiteSettings() {
    siteSettings.introTitle = document.getElementById('set-title').value;
    siteSettings.introText = document.getElementById('set-text').value;
    siteSettings.facebookUrl = document.getElementById('set-fb').value;
    siteSettings.logoPath = document.getElementById('set-logo').value;

    saveToStorage();
    applySettingsToUI();
    closeModal('settings-modal');
    alert("تم حفظ إعدادات الموقع بنجاح");
}

function saveProduct() {
    const id = document.getElementById('edit-id').value;
    const title = document.getElementById('prod-title').value;
    const category = document.getElementById('prod-category').value;
    const price = document.getElementById('prod-price').value;
    const short = document.getElementById('prod-short').value;
    const full = document.getElementById('prod-full').value;
    const images = Array.from(document.querySelectorAll('#modal-image-inputs .prod-img')).map(i => i.value).filter(v => v);

    if (!title || !category || !short) {
        alert("يرجى ملء الحقول الأساسية (الاسم، التصنيف، الوصف)");
        return;
    }

    const pData = {
        id: id ? parseInt(id) : Date.now(),
        title,
        category,
        price,
        shortDescription: short,
        fullDescription: full,
        images
    };

    if (id) {
        const idx = products.findIndex(p => p.id == id);
        if (idx !== -1) {
            products[idx] = pData;
        }
    } else {
        products.push(pData);
    }

    saveToStorage();
    closeModal('product-modal');
    renderProducts(products);
    alert("تم حفظ المنتج بنجاح");
}

function deleteProduct(id) {
    if (confirm("هل أنت متأكد؟")) {
        products = products.filter(p => p.id != id);
        saveToStorage();
        renderProducts(products);
    }
}

function clearAdminForm() {
    document.getElementById('edit-id').value = '';
    document.getElementById('prod-title').value = '';
    document.getElementById('prod-price').value = '';
    document.getElementById('prod-short').value = '';
    document.getElementById('prod-full').value = '';
    document.getElementById('modal-image-inputs').innerHTML = '';
    addImageLinkRow(''); // Add one empty row by default
}

// --- WhatsApp & Other ---
function openBookingModal(id) {
    const p = products.find(prod => prod.id == id);
    currentProduct = p;

    // Update modal preview
    const previewContainer = document.getElementById('modal-product-preview');
    if (previewContainer) {
        previewContainer.innerHTML = `
            <img src="${p.images[0] || 'assets/placeholder.png'}" style="width: 80px; height: 80px; border-radius: 10px; object-fit: cover;">
            <div style="text-align: right;">
                <div style="font-weight: bold; color: var(--gold);">${p.title}</div>
                <div style="font-size: 0.9rem; color: var(--text-muted);">${p.price || ''}</div>
            </div>
        `;
    }

    document.getElementById('booking-modal').classList.add('active');
}

function submitBooking() {
    const name = document.getElementById('modal-name')?.value;
    const phone = document.getElementById('modal-phone')?.value;
    const address = document.getElementById('modal-address')?.value;

    if (!name || !phone || !address) {
        alert("يرجى ملء جميع الحقول المطلوبة");
        return;
    }

    const productName = currentProduct ? currentProduct.title : "غير معروف";
    const message = `طلب حجز جديد من الموقع:\n\nالمنتج: ${productName}\nالاسم: ${name}\nالهاتف: ${phone}\nالعنوان: ${address}`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    window.open(url, '_blank');
    closeModal('booking-modal');
}

function populateBookingSelect() {
    const select = document.getElementById('booking-select-product');
    if (!select) return;

    select.innerHTML = '<option value="">-- اختر المنتج --</option>' +
        products.map(p => `<option value="${p.id}">${p.title}</option>`).join('');
}

function updateBookingPreview() {
    const select = document.getElementById('booking-select-product');
    const preview = document.getElementById('general-booking-preview');
    const img = document.getElementById('booking-preview-img');
    const name = document.getElementById('booking-preview-name');

    const product = products.find(p => p.id == select.value);
    if (product) {
        preview.style.display = 'flex';
        img.src = product.images[0] || 'assets/placeholder.png';
        name.textContent = product.title;
    } else {
        preview.style.display = 'none';
    }
}

function submitGeneralBooking() {
    const productId = document.getElementById('booking-select-product')?.value;
    const name = document.getElementById('booking-name')?.value;
    const phone = document.getElementById('booking-phone')?.value;
    const address = document.getElementById('booking-address')?.value;

    if (!productId || !name || !phone || !address) {
        alert("يرجى اختيار المنتج وملء جميع الحقول");
        return;
    }

    const product = products.find(p => p.id == productId);
    const productName = product ? product.title : "غير معروف";

    const message = `طلب حجز جديد من الموقع:\n\nالمنتج: ${productName}\nالاسم: ${name}\nالهاتف: ${phone}\nالعنوان: ${address}`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    window.open(url, '_blank');
}

function sendInquiry(productTitle) {
    const message = `مرحباً، أود الاستفسار عن منتج: ${productTitle}`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

function shareProduct(id) {
    const url = window.location.origin + window.location.pathname + `#product-${id}`;
    navigator.clipboard.writeText(url).then(() => alert("تم نسخ الرابط"));
}

