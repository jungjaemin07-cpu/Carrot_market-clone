// 1. Supabase 클라이언트 초기화 (1단계에서 복사한 값 입력)
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-public-key';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. 물품 등록 함수 예시 (DB에 데이터 저장)
async function addProduct(productData) {
    const { data, error } = await supabase
        .from('products') // 2단계에서 만든 테이블 이름
        .insert([
            { 
                title: productData.title, 
                price: productData.price, 
                description: productData.description,
                status: productData.status
            }
        ]);

    if (error) {
        console.error('등록 실패:', error.message);
        alert('물품 등록에 실패했습니다.');
    } else {
        alert('물품이 성공적으로 등록되었습니다!');
        loadProducts(); // 목록 새로고침
    }
}

// 3. 물품 목록 불러오기 함수 예시 (DB에서 데이터 조회)
async function loadProducts() {
    const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('조회 실패:', error.message);
        return;
    }

    // 화면에 데이터 출력 로직 작성
    console.log('불러온 물품 목록:', products);
}

// 페이지 로드 시 목록 불러오기
document.addEventListener('DOMContentLoaded', loadProducts);

// ===== 더미 데이터 =====
const productData = [
    {
        id: 1,
        title: '아이패드 프로 11세대',
        description: '거의 새 상태로 사용했고, 케이스와 펜슬 포함입니다. 배터리 상태 좋습니다.',
        category: 'electronics',
        price: 540000,
        status: 'good',
        seller: '민수',
        location: '서울 강남구',
        image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=900&q=80'
    },
    {
        id: 2,
        title: '원목 책상',
        description: '작업용으로 쓰던 책상입니다. 소형이며 심플한 디자인이라 어디에나 잘 어울려요.',
        category: 'furniture',
        price: 180000,
        status: 'normal',
        seller: '혜린',
        location: '부산 해운대구',
        image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80'
    },
    {
        id: 3,
        title: '프리미엄 자켓',
        description: '사이즈 M, 계절용으로 사용했지만 상태 매우 좋습니다.',
        category: 'clothing',
        price: 65000,
        status: 'good',
        seller: '준호',
        location: '대구 수성구',
        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80'
    },
    {
        id: 4,
        title: '프로그래밍 책 모음',
        description: '자바스크립트, 파이썬, 알고리즘 책들입니다. 공부용으로 좋아요.',
        category: 'books',
        price: 26000,
        status: 'new',
        seller: '서연',
        location: '인천 연수구',
        image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80'
    },
    {
        id: 5,
        title: '배드민턴 세트',
        description: '라켓 2개 + 셔틀콕 포함입니다. 가볍게 운동하실 분께 추천해요.',
        category: 'sports',
        price: 42000,
        status: 'good',
        seller: '승우',
        location: '서울 마포구',
        image: 'https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=900&q=80'
    },
    {
        id: 6,
        title: '중고 캠핑 테이블',
        description: '가볍고 접이식이라 캠핑이나 야외 활동에 좋아요. 살짝 흠집 있음.',
        category: 'etc',
        price: 90000,
        status: 'normal',
        seller: '도현',
        location: '경기 성남시',
        image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=900&q=80'
    },
    {
        id: 7,
        title: '무선 이어폰',
        description: '블루투스 5.0, 노이즈 캔슬링 기능. 거의 사용 안 했습니다.',
        category: 'electronics',
        price: 85000,
        status: 'new',
        seller: '지은',
        location: '서울 마포구',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80'
    },
    {
        id: 8,
        title: '요가 매트',
        description: '프리미엄 TPE 소재, 미끄럼 방지 코팅. 거의 새 것 같습니다.',
        category: 'sports',
        price: 35000,
        status: 'good',
        seller: '나연',
        location: '부산 서구',
        image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=900&q=80'
    }
];

// ===== 전역 상태 =====
let selectedTheme = 'colorful';
let currentUser = null;
let currentLocation = '위치 설정';
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
    const map = {
        new: '새 제품',
        good: '상태 좋음',
        normal: '일반'
    };
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

// ===== 상품 렌더링 =====
function renderProducts(items = productData) {
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

        card.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.title}" loading="lazy">
                <span class="product-badge">${getCategoryEmoji(product.category)} ${getCategoryLabel(product.category)}</span>
            </div>
            <div class="product-info">
                <div class="product-top">
                    <h3 class="product-title">${product.title}</h3>
                </div>
                <div class="product-price">${formatPrice(product.price)}</div>
                <div class="product-meta">
                    <span>📍 ${product.location}</span>
                    <span>${getStatusLabel(product.status)}</span>
                </div>
                <p class="product-desc">${product.description}</p>
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

// ===== 검색 및 필터링 =====
function searchProducts() {
    const keyword = searchInput.value.trim().toLowerCase();
    const category = categoryFilter.value;
    const price = priceFilter.value;
    const status = statusFilter.value;

    const filtered = productData.filter((product) => {
        const matchesKeyword = !keyword ||
            product.title.toLowerCase().includes(keyword) ||
            product.description.toLowerCase().includes(keyword) ||
            getCategoryLabel(product.category).includes(keyword);

        const matchesCategory = !category || product.category === category;

        let matchesPrice = true;
        if (price) {
            const [min, max] = price.split('-').map(Number);
            matchesPrice = product.price >= min && product.price <= max;
        }

        const matchesStatus = !status || product.status === status;

        return matchesKeyword && matchesCategory && matchesPrice && matchesStatus;
    });

    renderProducts(filtered);
}

function filterProducts() {
    searchProducts();
}

// ===== 테마 설정 =====
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

    // 현재 배경 모드에 맞게 적용만 재실행 (기존 설정을 덮어쓰지 않음)
    applyBgMode(currentBgMode);
}

function triggerImageUpload() {
    const fileInput = document.getElementById('bgImage');
    fileInput.click();
}

function setBgSelectionState(mode) {
    document.querySelectorAll('.bg-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.bg === mode);
    });

    const infoEl = document.getElementById('bgImageInfo');
    if (infoEl) {
        if (mode === 'default') {
            infoEl.textContent = '현재 배경: 기본 색상';
        } else if (mode === 'gradient') {
            infoEl.textContent = '현재 배경: 그라데이션';
        } else if (mode === 'image') {
            infoEl.textContent = '현재 배경: 사진';
        }
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
    document.body.style.backgroundSize = '';
    document.body.style.backgroundPosition = '';
    document.body.style.backgroundRepeat = '';
    document.body.style.backgroundAttachment = '';

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
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundPosition = 'center';
            document.body.style.backgroundRepeat = 'no-repeat';
            document.body.style.backgroundAttachment = 'fixed';
            setBgSelectionState('image');
        } else {
            // 사진 데이터가 없으면 기본으로 전환
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

// ===== 모달 제어 =====
function openSettings() {
    document.getElementById('settingsModal').classList.add('open');
}

function closeSettings() {
    document.getElementById('settingsModal').classList.remove('open');
}

function openLoginModal() {
    if (currentUser) return;
    document.getElementById('loginModal').classList.add('open');
}

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

function closeLocationModal() {
    document.getElementById('locationModal').classList.remove('open');
}

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
    
    // 파일명 표시 초기화 추가
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    if (fileNameDisplay) {
        fileNameDisplay.textContent = '선택된 사진 없음';
        fileNameDisplay.style.color = '#666666';
        fileNameDisplay.style.fontWeight = 'normal';
    }
}

function openProductDetail(productId) {
    const product = productData.find((item) => item.id === productId);
    if (!product) return;

    selectedProduct = product;
    const isLiked = likedProducts.has(product.id);

    document.getElementById('detailImage').src = product.image;
    document.getElementById('detailTitle').textContent = product.title;
    document.getElementById('detailSeller').textContent = product.seller;
    document.getElementById('detailLocation').textContent = product.location;
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

// ===== 이메일 유효성 검사 함수 =====
function isValidEmail(email) {
    // 올바른 이메일 형식 (예: user@example.com) 검증 정규식
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ===== 인증 처리 =====
function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    if (!email || !password) {
        alert('이메일과 비밀번호를 모두 입력해주세요.');
        return;
    }

    // 1. 이메일 형식 검증 (@dsfeafds 같은 형식 차단)
    if (!isValidEmail(email)) {
        alert('올바른 이메일 형식이 아닙니다. (예: user@example.com)');
        return;
    }

    if (password.length < 6) {
        alert('비밀번호는 최소 6자 이상이어야 합니다.');
        return;
    }

    // 2. localStorage에서 가입된 회원 목록 조회
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');

    // 3. 이메일과 비밀번호가 일치하는 계정 검색
    const matchedUser = users.find(u => u.email === email && u.password === password);

    if (!matchedUser) {
        alert('가입되지 않은 이메일이거나 비밀번호가 올바르지 않습니다.');
        return;
    }

    // 4. 로그인 성공 처리
    currentUser = matchedUser.name;
    localStorage.setItem('currentUser', currentUser);

    updateUserDisplay();
    closeLoginModal();
    alert(`${currentUser}님, 환영합니다!`);
    renderProducts();
}

function handleSignup(event) {
    event.preventDefault();
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value.trim();
    const confirm = document.getElementById('signupPasswordConfirm').value.trim();

    if (!name || !email || !password || !confirm) {
        alert('모든 항목을 입력해주세요.');
        return;
    }

    // 1. 이메일 형식 검증
    if (!isValidEmail(email)) {
        alert('올바른 이메일 형식을 입력해 주세요. (예: user@example.com)');
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

    // 2. 이미 가입된 이메일 중복 체크
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    if (users.some(u => u.email === email)) {
        alert('이미 가입된 이메일입니다.');
        return;
    }

    // 3. 회원 저장 및 로그인 처리
    users.push({ name, email, password });
    localStorage.setItem('registeredUsers', JSON.stringify(users));

    currentUser = name;
    localStorage.setItem('currentUser', currentUser);

    updateUserDisplay();
    closeSignupModal();
    alert('회원가입이 완료되었습니다!');
    renderProducts();
}

function updateUserDisplay() {
    const userDisplay = document.getElementById('userDisplay');
    const loginBtn = document.getElementById('loginBtn');
    const userName = document.getElementById('userName');

    if (currentUser) {
        userName.textContent = currentUser;
        userDisplay.style.display = 'inline-flex';
        loginBtn.style.display = 'none';
    } else {
        userDisplay.style.display = 'none';
        loginBtn.style.display = 'inline-flex';
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateUserDisplay();
    likedProducts.clear();
    alert('로그아웃 되었습니다.');
    renderProducts();
}

// ===== 위치 설정 =====
function suggestLocation() {
    const query = document.getElementById('locationInput').value.trim();
    const suggestions = document.getElementById('locationSuggestions');

    const locations = [
        '서울 강남구',
        '서울 마포구',
        '서울 송파구',
        '서울 서초구',
        '부산 해운대구',
        '부산 서구',
        '인천 연수구',
        '인천 남동구',
        '대구 수성구',
        '대구 중구',
        '경기 성남시',
        '경기 수원시',
        '경기 고양시'
    ];

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

// ===== 물품 등록 =====
function handleProductSubmit(event) {
    event.preventDefault();

    const title = document.getElementById('productTitle').value.trim();
    const description = document.getElementById('productDescription').value.trim();
    const category = document.getElementById('productCategory').value;
    const price = Number(document.getElementById('productPrice').value);
    const status = document.getElementById('productStatus').value;
    const imageInput = document.getElementById('productImage');

    if (!title || !description || !category || !price || !status || !imageInput.files[0]) {
        alert('모든 항목을 입력해주세요.');
        return;
    }

    if (price < 0) {
        alert('가격은 0 이상이어야 합니다.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const newProduct = {
            id: Date.now(),
            title,
            description,
            category,
            price,
            status,
            seller: currentUser || '익명 사용자',
            location: currentLocation !== '위치 설정' ? currentLocation : '서울 강남구',
            image: e.target.result
        };

        productData.unshift(newProduct);
        renderProducts();
        closeProductModal();
        alert('물품이 등록되었습니다! 🎉');
    };

    reader.readAsDataURL(imageInput.files[0]);
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

    renderProducts();

    if (selectedProduct && selectedProduct.id === productId) {
        const isLiked = likedProducts.has(productId);
        const likeBtn = document.getElementById('likeBtn');
        likeBtn.textContent = isLiked ? '❤️ 찜 완료' : '🤍 찜하기';
    }
}

// ===== 모달 닫기 (외부 클릭) =====
window.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('open');
    }
});

// ===== 로컬스토리지에서 복원 =====
function loadSavedSettings() {
    // 1. 저장된 사용자 복원
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = savedUser;
        updateUserDisplay();
    }

    // 2. 저장된 위치 복원
    const savedLocation = localStorage.getItem('currentLocation');
    if (savedLocation) {
        currentLocation = savedLocation;
        currentLocationEl.textContent = savedLocation;
    }

    // 3. 저장된 테마 복원 (테마 색상 변수 설정)
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) {
        selectedTheme = savedTheme;
        // setTheme 대신 색상 설정 및 버튼 활성화만 적용
        document.querySelectorAll('.theme-btn').forEach((button) => {
            button.classList.toggle('active', button.dataset.theme === savedTheme);
        });
        const root = document.documentElement;
        if (savedTheme === 'minimal') {
            root.style.setProperty('--bg-color', '#f9f9f9');
            root.style.setProperty('--bg-gradient', 'linear-gradient(135deg, #f7f7f7 0%, #ebe8e4 100%)');
            root.style.setProperty('--primary', '#2d2d2d');
            root.style.setProperty('--primary-dark', '#111111');
            root.style.setProperty('--accent', '#d9d9d9');
        } else if (savedTheme === 'modern') {
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
    }

    // 4. 저장된 배경 모드 복원
    const savedBgMode = localStorage.getItem('bgMode') || 'default';
    currentBgMode = savedBgMode;
    applyBgMode(savedBgMode);
}

// ===== 엔터 키 처리 =====
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal.open').forEach(modal => {
            modal.classList.remove('open');
        });
    }
});

// ===== 초기화 =====
document.addEventListener('DOMContentLoaded', () => {
    loadSavedSettings();
    renderProducts();
});
