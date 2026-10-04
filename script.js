// 1. Supabase 클라이언트 초기화
const SUPABASE_URL = 'https://ngepqszitpuqxttktete.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nZXBxc3ppdHB1cXh0dGt0ZXRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEwNjQ4MzMsImV4cCI6MjEwNjY0MDgzM30.c1jGHnHZsMMZ1E9fHZUNkLQcs-JilKKSi843SImvdBs';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===== 전역 상태 =====
let selectedTheme = 'colorful';
let currentUser = null; // { id, email, name }
let currentLocation = '위치 설정';
let loadedProducts = []; // Supabase에서 로드된 상품 목록
let selectedProduct = null;
let likedProducts = new Set();
let currentBgMode = 'default';

// ===== DOM 요소 =====
const productsContainer = document.getElementById('productsContainer');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const priceFilter = document.getElementById('priceFilter');
const statusFilter = document.getElementById('statusFilter');
const currentLocationEl = document.getElementById('currentLocation');

// ===== 유틸리티 함수 =====
function formatPrice(value) {
    return new Intl.NumberFormat('ko-KR').format(value) + '원';
}

function getStatusLabel(value) {
    const map = { new: '새 제품', good: '상태 좋음', normal: '일반' };
    return map[value] || '상태 정보 없음';
}

function getCategoryLabel(value) {
    const map = {
        electronics: '전자기기',
        furniture: '가구',
        clothing: '의류',
        books: '책',
        sports: '스포츠',
        etc: '기타'
    };
    return map[value] || '기타';
}

function getCategoryEmoji(value) {
    const map = {
        electronics: '📱',
        furniture: '🪑',
        clothing: '👕',
        books: '📚',
        sports: '⚽',
        etc: '🎁'
    };
    return map[value] || '📦';
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ===== Supabase 데이터베이스 조회 (물품 목록) =====
async function loadProducts() {
    try {
        let query = supabaseClient
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        const keyword = searchInput.value.trim();
        const category = categoryFilter.value;
        const price = priceFilter.value;
        const status = statusFilter.value;

        if (category) {
            query = query.eq('category', category);
        }
        if (status) {
            query = query.eq('status', status);
        }
        if (price) {
            const [min, max] = price.split('-').map(Number);
            query = query.gte('price', min).lte('price', max);
        }
        if (keyword) {
            query = query.ilike('title', `%${keyword}%`);
        }

        const { data, error } = await query;

        if (error) throw error;

        loadedProducts = data || [];
        renderProducts(loadedProducts);
    } catch (err) {
        console.error('상품 목록 불러오기 실패:', err.message);
    }
}

// ===== 상품 렌더링 =====
function renderProducts(items = []) {
    productsContainer.innerHTML = '';

    if (!items.length) {
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    items.forEach((product, index) => {
        const card = document.createElement('article');
        card.className = 'product-card';
        card.style.animation = `fadeIn 0.4s ease ${index * 0.05}s both`;

        const isLiked = likedProducts.has(product.id);
        const imageUrl = product.image || 'https://via.placeholder.com/300?text=No+Image';

        card.innerHTML = `
            <div class="product-image">
                <img src="${imageUrl}" alt="${product.title}" loading="lazy">
                <span class="product-badge">${getCategoryEmoji(product.category)} ${getCategoryLabel(product.category)}</span>
            </div>
            <div class="product-info">
                <div class="product-top">
                    <h3 class="product-title">${product.title}</h3>
                </div>
                <div class="product-price">${formatPrice(product.price)}</div>
                <div class="product-meta">
                    <span>📍 ${product.location || '전국'}</span>
                    <span>${getStatusLabel(product.status)}</span>
                </div>
                <p class="product-desc">${product.description || ''}</p>
                <div class="product-actions">
                    <button class="btn-secondary" onclick="toggleLike(${product.id})" data-product-id="${product.id}">
                        ${isLiked ? '❤️' : '🤍'} 찜
                    </button>
                    <button class="btn-primary" onclick="openProductDetail(${product.id})">상세보기</button>
                </div>
            </div>
        `;

        card.addEventListener('click', (e) => {
            if (!e.target.closest('button')) {
                openProductDetail(product.id);
            }
        });

        productsContainer.appendChild(card);
    });
}

function searchProducts() {
    loadProducts();
}

function filterProducts() {
    loadProducts();
}

// ===== 인증 처리 (Supabase Auth) =====
async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    if (!email || !password) {
        alert('이메일과 비밀번호를 모두 입력해주세요.');
        return;
    }

    if (!isValidEmail(email)) {
        alert('올바른 이메일 형식이 아닙니다.');
        return;
    }

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        alert('로그인 실패: ' + error.message);
        return;
    }

    const userName = data.user.user_metadata?.full_name || email.split('@')[0];
    currentUser = { id: data.user.id, email: data.user.email, name: userName };
    updateUserDisplay();
    closeLoginModal();
    alert(`${userName}님, 환영합니다!`);
}

async function handleSignup(event) {
    event.preventDefault();
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value.trim();
    const confirm = document.getElementById('signupPasswordConfirm').value.trim();

    if (!name || !email || !password || !confirm) {
        alert('모든 항목을 입력해주세요.');
        return;
    }

    if (!isValidEmail(email)) {
        alert('올바른 이메일 형식을 입력해 주세요.');
        return;
    }

    if (password.length < 6) {
        alert('비밀번호는 최소 6자 이상이어야 합니다.');
        return;
    }

    if (password !== confirm) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
    }

    const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password,
        options: {
            data: { full_name: name }
        }
    });

    if (error) {
        alert('회원가입 실패: ' + error.message);
        return;
    }

    alert('회원가입이 완료되었습니다! 로그인해 주세요.');
    closeSignupModal();
    openLoginModal();
}

async function checkUserSession() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session && session.user) {
        const user = session.user;
        const userName = user.user_metadata?.full_name || user.email.split('@')[0];
        currentUser = { id: user.id, email: user.email, name: userName };
    } else {
        currentUser = null;
    }
    updateUserDisplay();
}

function updateUserDisplay() {
    const userDisplay = document.getElementById('userDisplay');
    const loginBtn = document.getElementById('loginBtn');
    const userName = document.getElementById('userName');

    if (currentUser) {
        userName.textContent = currentUser.name;
        userDisplay.style.display = 'inline-flex';
        loginBtn.style.display = 'none';
    } else {
        userDisplay.style.display = 'none';
        loginBtn.style.display = 'inline-flex';
    }
}

async function logout() {
    await supabaseClient.auth.signOut();
    currentUser = null;
    updateUserDisplay();
    likedProducts.clear();
    alert('로그아웃 되었습니다.');
    renderProducts(loadedProducts);
}

// ===== 물품 등록 및 이미지 업로드 (Supabase Storage + DB) =====
async function handleProductSubmit(event) {
    event.preventDefault();

    if (!currentUser) {
        alert('로그인이 필요합니다.');
        openLoginModal();
        return;
    }

    const title = document.getElementById('productTitle').value.trim();
    const description = document.getElementById('productDescription').value.trim();
    const category = document.getElementById('productCategory').value;
    const price = Number(document.getElementById('productPrice').value);
    const status = document.getElementById('productStatus').value;
    const imageInput = document.getElementById('productImage');
    const submitBtn = document.getElementById('submitProductBtn');

    if (!title || !description || !category || !price || !status || !imageInput.files[0]) {
        alert('모든 항목을 입력하고 사진을 등록해주세요.');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = '업로드 중...';

    try {
        const file = imageInput.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;

        // 1. Supabase Storage에 이미지 업로드
        const { data: uploadData, error: uploadError } = await supabaseClient.storage
            .from('product-images')
            .upload(fileName, file);

        if (uploadError) throw uploadError;

        // 2. 이미지 Public URL 획득
        const { data: { publicUrl } } = supabaseClient.storage
            .from('product-images')
            .getPublicUrl(fileName);

        // 3. Supabase products 테이블에 데이터 등록
        const { error: insertError } = await supabaseClient
            .from('products')
            .insert([
                {
                    title,
                    description,
                    category,
                    price,
                    status,
                    seller: currentUser.name,
                    location: currentLocation !== '위치 설정' ? currentLocation : '서울 강남구',
                    image: publicUrl
                }
            ]);

        if (insertError) throw insertError;

        alert('물품이 성공적으로 등록되었습니다! 🎉');
        closeProductModal();
        loadProducts(); // 목록 다시 불러오기
    } catch (err) {
        console.error('물품 등록 오류:', err);
        alert('물품 등록 중 오류가 발생했습니다: ' + err.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = '등록';
    }
}

// ===== 모달 제어 =====
function openSettings() { document.getElementById('settingsModal').classList.add('open'); }
function closeSettings() { document.getElementById('settingsModal').classList.remove('open'); }
function openLoginModal() { if (!currentUser) document.getElementById('loginModal').classList.add('open'); }
function closeLoginModal() {
    document.getElementById('loginModal').classList.remove('open');
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
}
function openSignupModal() {
    closeLoginModal();
    document.getElementById('signupModal').classList.add('open');
}
function closeSignupModal() {
    document.getElementById('signupModal').classList.remove('open');
    document.getElementById('signupName').value = '';
    document.getElementById('signupEmail').value = '';
    document.getElementById('signupPassword').value = '';
    document.getElementById('signupPasswordConfirm').value = '';
}
function openLocationModal() {
    document.getElementById('locationModal').classList.add('open');
    document.getElementById('locationInput').focus();
}
function closeLocationModal() { document.getElementById('locationModal').classList.remove('open'); }
function openProductModal() {
    if (!currentUser) {
        alert('로그인 후 물품을 등록할 수 있습니다.');
        openLoginModal();
        return;
    }
    document.getElementById('productModal').classList.add('open');
}
function closeProductModal() {
    document.getElementById('productModal').classList.remove('open');
    document.getElementById('productTitle').value = '';
    document.getElementById('productDescription').value = '';
    document.getElementById('productCategory').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productStatus').value = '';
    document.getElementById('productImage').value = '';
}

function openProductDetail(productId) {
    const product = loadedProducts.find((item) => item.id === productId);
    if (!product) return;

    selectedProduct = product;
    const isLiked = likedProducts.has(product.id);

    document.getElementById('detailImage').src = product.image || 'https://via.placeholder.com/300';
    document.getElementById('detailTitle').textContent = product.title;
    document.getElementById('detailSeller').textContent = product.seller || '익명';
    document.getElementById('detailLocation').textContent = product.location || '전국';
    document.getElementById('detailPrice').textContent = formatPrice(product.price);
    document.getElementById('detailStatus').textContent = getStatusLabel(product.status);
    document.getElementById('detailDescription').textContent = product.description;

    const likeBtn = document.getElementById('likeBtn');
    likeBtn.textContent = isLiked ? '❤️ 찜 완료' : '🤍 찜하기';
    likeBtn.onclick = () => toggleLike(product.id);

    document.getElementById('productDetailModal').classList.add('open');
}

function closeProductDetail() {
    document.getElementById('productDetailModal').classList.remove('open');
}

// ===== 테마 및 배경 설정 =====
function setTheme(themeName) {
    selectedTheme = themeName;
    localStorage.setItem('selectedTheme', themeName);

    document.querySelectorAll('.theme-btn').forEach((button) => {
        button.classList.toggle('active', button.dataset.theme === themeName);
    });

    const root = document.documentElement;

    if (themeName === 'minimal') {
        root.style.setProperty('--bg-color', '#f9f9f9');
        root.style.setProperty('--bg-gradient', 'linear-gradient(135deg, #f7f7f7 0%, #ebe8e4 100%)');
        root.style.setProperty('--primary', '#2d2d2d');
        root.style.setProperty('--primary-dark', '#111111');
        root.style.setProperty('--accent', '#d9d9d9');
    } else if (themeName === 'modern') {
        root.style.setProperty('--bg-color', '#f3f6ff');
        root.style.setProperty('--bg-gradient', 'linear-gradient(135deg, #edf3ff 0%, #f5f1ff 100%)');
        root.style.setProperty('--primary', '#4a67ff');
        root.style.setProperty('--primary-dark', '#243ad8');
        root.style.setProperty('--accent', '#7db1ff');
    } else {
        root.style.setProperty('--bg-color', '#fffaf3');
        root.style.setProperty('--bg-gradient', 'linear-gradient(135deg, #fff7ef 0%, #ffe3d6 100%)');
        root.style.setProperty('--primary', '#ff7a00');
        root.style.setProperty('--primary-dark', '#e86800');
        root.style.setProperty('--accent', '#ffb15e');
    }

    applyBgMode(currentBgMode);
}

function triggerImageUpload() {
    document.getElementById('bgImage').click();
}

function setBgSelectionState(mode) {
    document.querySelectorAll('.bg-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.bg === mode);
    });

    const infoEl = document.getElementById('bgImageInfo');
    if (infoEl) {
        if (mode === 'default') infoEl.textContent = '현재 배경: 기본 색상';
        else if (mode === 'gradient') infoEl.textContent = '현재 배경: 그라데이션';
        else if (mode === 'image') infoEl.textContent = '현재 배경: 사진';
    }
}

function setBgColor(mode) {
    currentBgMode = mode;
    localStorage.setItem('bgMode', mode);

    if (mode !== 'image') {
        localStorage.removeItem('bgImage');
    }

    applyBgMode(mode);
}

function applyBgMode(mode) {
    document.body.classList.remove('with-image');
    document.body.style.backgroundImage = '';

    if (mode === 'gradient') {
        if (selectedTheme === 'minimal') {
            document.body.style.background = 'linear-gradient(135deg, #f7f7f7 0%, #ababab 50%, #f7f7f7 100%)';
        } else if (selectedTheme === 'modern') {
            document.body.style.background = 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 50%, #a1c4fd 100%)';
        } else {
            document.body.style.background = 'linear-gradient(135deg, #f6d365 0%, #fda085 50%, #f6d365 100%)';
        }
        setBgSelectionState('gradient');
    } else if (mode === 'image') {
        const savedBgImage = localStorage.getItem('bgImage');
        if (savedBgImage) {
            document.body.classList.add('with-image');
            document.body.style.backgroundImage = `linear-gradient(rgba(255,255,255,0.45), rgba(255,255,255,0.55)), url('${savedBgImage}')`;
            setBgSelectionState('image');
        } else {
            setBgColor('default');
        }
    } else {
        const root = document.documentElement;
        const bgGradient = getComputedStyle(root).getPropertyValue('--bg-gradient');
        document.body.style.background = bgGradient;
        setBgSelectionState('default');
    }
}

function uploadBgImage(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const imageData = e.target.result;
        currentBgMode = 'image';
        localStorage.setItem('bgImage', imageData);
        localStorage.setItem('bgMode', 'image');
        applyBgMode('image');
    };
    reader.readAsDataURL(file);
}

// ===== 위치 설정 =====
function suggestLocation() {
    const query = document.getElementById('locationInput').value.trim();
    const suggestions = document.getElementById('locationSuggestions');
    const locations = ['서울 강남구', '서울 마포구', '서울 송파구', '부산 해운대구', '인천 연수구', '대구 수성구', '경기 성남시', '경기 수원시'];

    if (!query) {
        suggestions.innerHTML = '';
        return;
    }

    const filtered = locations.filter((item) => item.includes(query));
    suggestions.innerHTML = filtered
        .map((item) => `<div class="suggestion-item" onclick="selectLocation('${item}')">${item}</div>`)
        .join('');
}

function selectLocation(location) {
    document.getElementById('locationInput').value = location;
    currentLocation = location;
    document.getElementById('locationSuggestions').innerHTML = '';
}

function confirmLocation() {
    const location = document.getElementById('locationInput').value.trim() || '위치 설정';
    currentLocation = location;
    currentLocationEl.textContent = location;
    closeLocationModal();
    localStorage.setItem('currentLocation', location);
}

// ===== 찜하기 =====
function toggleLike(productId) {
    if (!currentUser) {
        alert('로그인 후 찜할 수 있습니다.');
        openLoginModal();
        return;
    }

    if (likedProducts.has(productId)) {
        likedProducts.delete(productId);
    } else {
        likedProducts.add(productId);
    }

    renderProducts(loadedProducts);

    if (selectedProduct && selectedProduct.id === productId) {
        const isLiked = likedProducts.has(productId);
        const likeBtn = document.getElementById('likeBtn');
        likeBtn.textContent = isLiked ? '❤️ 찜 완료' : '🤍 찜하기';
    }
}

// ===== 모달 닫기 및 키 이벤트 =====
window.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('open');
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal.open').forEach(modal => {
            modal.classList.remove('open');
        });
    }
});

// ===== 설정 복원 =====
function loadSavedSettings() {
    const savedLocation = localStorage.getItem('currentLocation');
    if (savedLocation) {
        currentLocation = savedLocation;
        currentLocationEl.textContent = savedLocation;
    }

    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) {
        setTheme(savedTheme);
    }

    const savedBgMode = localStorage.getItem('bgMode') || 'default';
    currentBgMode = savedBgMode;
    applyBgMode(savedBgMode);
}

// ===== 초기화 실행 =====
document.addEventListener('DOMContentLoaded', () => {
    loadSavedSettings();
    checkUserSession();
    loadProducts();
});