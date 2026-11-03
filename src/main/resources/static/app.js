const API_URL = 'http://localhost:8080/api';

// Состояние приложения в оперативной памяти
let currentUser = JSON.parse(sessionStorage.getItem('currentUser')) || null;
let activeRental = null;
let timerInterval = null;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    updateUserInterface();
    loadCars('ALL');
});

// ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));

    const targetTab = document.getElementById(`tab-${tabId}`);
    if (targetTab) targetTab.classList.add('active');

    const clickedBtn = Array.from(document.querySelectorAll('.nav-btn'))
        .find(b => b.getAttribute('onclick') && b.getAttribute('onclick').includes(tabId));
    if (clickedBtn) clickedBtn.classList.add('active');

    if (tabId === 'history') loadRentalHistory();
    if (tabId === 'maintenance') loadMaintenanceRecords();
    if (tabId === 'analytics') loadAnalytics();
}

// ЗАГРУЗКА АВТОМОБИЛЕЙ
async function loadCars(filter) {
    try {
        const url = (filter === 'AVAILABLE') ? `${API_URL}/cars/available` : `${API_URL}/cars`;
        const res = await fetch(url);
        const cars = await res.json();

        const grid = document.getElementById('cars-grid');
        grid.innerHTML = '';

        cars.forEach(car => {
            const isAvailable = car.status === 'AVAILABLE';
            const card = document.createElement('div');
            card.className = 'car-card';
            card.innerHTML = `
                <div>
                    <div class="car-card-header">
                        <div>
                            <div class="car-title">${car.brand} ${car.model}</div>
                            <span class="plate-badge">${car.plateNumber}</span>
                        </div>
                        <span class="car-status-tag status-${car.status}">${car.status}</span>
                    </div>
                    <div class="car-info-row">
                        <span>Локация:</span>
                        <span>${car.location || 'Центр'}</span>
                    </div>
                    <div class="car-info-row">
                        <span>Топливо / Заряд:</span>
                        <span>${car.fuelLevel}%</span>
                    </div>
                    <div class="fuel-bar">
                        <div class="fuel-fill" style="width: ${car.fuelLevel}%"></div>
                    </div>
                    <div class="car-info-row">
                        <span>Тариф:</span>
                        <span class="car-price">${car.pricePerMinute} <small style="font-size:12px">руб/мин</small></span>
                    </div>
                </div>

                <div class="car-card-actions">
                    <button class="btn btn-primary" ${!isAvailable ? 'disabled style="opacity:0.4;cursor:not-allowed"' : ''} 
                        onclick="handleStartRent(${car.id})">Поехать</button>
                    <button class="btn btn-primary" style="background: rgba(255,255,255,0.06); color: var(--primary-cyan); border: 1px solid var(--primary-cyan)" 
                        ${!isAvailable ? 'disabled style="opacity:0.4;cursor:not-allowed"' : ''} 
                        onclick="handleReserve(${car.id})">Бронь</button>
                </div>
            `;
            grid.appendChild(card);
        });
    } catch (err) {
        showToast('Ошибка загрузки авто: ' + err.message, 'danger');
    }
}

// СТАРТ АРЕНДЫ
async function handleStartRent(carId) {
    if (!currentUser) { openAuthModal(); return; }
    try {
        const res = await fetch(`${API_URL}/rentals/start?userId=${currentUser.id}&carId=${carId}`, { method: 'POST' });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'Ошибка старта поездки');
        }
        activeRental = await res.json();
        showToast('Поездка началась! Счастливого пути!', 'success');
        startActiveHud('ACTIVE');
        loadCars('ALL');
    } catch (e) {
        showToast(e.message, 'danger');
    }
}

// БРОНИРОВАНИЕ
async function handleReserve(carId) {
    if (!currentUser) { openAuthModal(); return; }
    try {
        const res = await fetch(`${API_URL}/rentals/reserve?userId=${currentUser.id}&carId=${carId}`, { method: 'POST' });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'Ошибка бронирования');
        }
        activeRental = await res.json();
        showToast('Машина забронирована на 20 минут', 'success');
        startActiveHud('RESERVED');
        loadCars('ALL');
    } catch (e) {
        showToast(e.message, 'danger');
    }
}

// ЖИВОЙ HUD АКТИВНОЙ ПОЕЗДКИ / ТАЙМЕР
function startActiveHud(status) {
    const hud = document.getElementById('active-rental-hud');
    hud.classList.remove('hidden');

    document.getElementById('hud-car-name').innerText = `${activeRental.carBrand} ${activeRental.carModel}`;
    document.getElementById('hud-car-plate').innerText = activeRental.plateNumber;

    const actionBtn = document.getElementById('hud-action-btn');
    const statusTitle = document.getElementById('hud-status-title');

    if (status === 'RESERVED') {
        statusTitle.innerText = 'АВТОМОБИЛЬ ЗАБРОНИРОВАН';
        actionBtn.innerText = 'Отменить бронь';
    } else {
        statusTitle.innerText = 'ПОЕЗДКА АКТИВНА';
        actionBtn.innerText = 'Завершить поездку';
    }

    const startTime = new Date(activeRental.startTime).getTime();
    clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        const now = new Date().getTime();
        const diff = Math.max(0, Math.floor((now - startTime) / 1000));
        const mins = Math.floor(diff / 60);
        const secs = diff % 60;
        document.getElementById('hud-timer').innerText =
            `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

        // Живой подсчет суммы
        const estimatedMinutes = Math.max(1, mins);
        const liveCost = (estimatedMinutes * 0.45).toFixed(2);
        document.getElementById('hud-cost').innerText = `${liveCost} руб.`;
    }, 1000);
}

// ЗАВЕРШЕНИЕ ПОЕЗДКИ / ОТМЕНА БРОНИ
async function handleActiveAction() {
    if (!activeRental) return;

    if (activeRental.status === 'RESERVED') {
        // Отмена брони
        try {
            await fetch(`${API_URL}/rentals/${activeRental.id}/cancel?userId=${currentUser.id}`, { method: 'PATCH' });
            showToast('Бронь отменена', 'success');
            stopHud();
            loadCars('ALL');
        } catch (e) { showToast(e.message, 'danger'); }
    } else {
        // Завершение аренды
        try {
            const res = await fetch(`${API_URL}/rentals/${activeRental.id}/end?tariffName=minuteTariffStrategy`, { method: 'POST' });
            const completed = await res.json();
            showToast(`Поездка завершена! Чек: ${completed.totalPrice} руб.`, 'success');
            stopHud();
            loadCars('ALL');
        } catch (e) { showToast(e.message, 'danger'); }
    }
}

function stopHud() {
    clearInterval(timerInterval);
    activeRental = null;
    document.getElementById('active-rental-hud').classList.add('hidden');
}

// ИСТОРИЯ ПОЕЗДОК
async function loadRentalHistory() {
    if (!currentUser) return;
    try {
        const res = await fetch(`${API_URL}/rentals/user/${currentUser.id}`);
        const history = await res.json();
        const tbody = document.getElementById('history-tbody');
        tbody.innerHTML = '';
        history.forEach(r => {
            tbody.innerHTML += `
                <tr>
                    <td>#${r.id}</td>
                    <td><strong>${r.carBrand} ${r.carModel}</strong> (${r.plateNumber})</td>
                    <td>${r.startTime ? r.startTime.replace('T', ' ').substring(0, 16) : '—'}</td>
                    <td>${r.endTime ? r.endTime.replace('T', ' ').substring(0, 16) : '—'}</td>
                    <td><span class="car-status-tag status-${r.status}">${r.status}</span></td>
                    <td class="text-accent"><strong>${r.totalPrice ? r.totalPrice + ' руб.' : '—'}</strong></td>
                </tr>
            `;
        });
    } catch (e) { showToast('Ошибка истории: ' + e.message, 'danger'); }
}

// АНАЛИТИКА
async function loadAnalytics() {
    try {
        const res = await fetch(`${API_URL}/analytics/summary`);
        const data = await res.json();
        document.getElementById('stat-revenue').innerText = `${data.totalRevenue} руб.`;
        document.getElementById('stat-profit').innerText = `${data.netProfit} руб.`;
        document.getElementById('stat-utilization').innerText = `${data.fleetUtilizationRate}%`;
        document.getElementById('stat-top-brand').innerText = data.topRevenueBrand;
    } catch (e) { showToast('Ошибка загрузки аналитики: ' + e.message, 'danger'); }
}

// ВХОД И РЕГИСТРАЦИЯ
async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        const res = await fetch(`${API_URL}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (!res.ok) throw new Error('Неверный логин или пароль');

        currentUser = await res.json();
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        closeAuthModal();
        updateUserInterface();
        showToast(`Добро пожаловать, ${currentUser.username}!`, 'success');
    } catch (err) {
        showToast(err.message, 'danger');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const payload = {
        username: document.getElementById('reg-username').value,
        password: document.getElementById('reg-password').value,
        firstName: document.getElementById('reg-firstname').value,
        lastName: document.getElementById('reg-lastname').value,
        phone: document.getElementById('reg-phone').value
    };

    try {
        const res = await fetch(`${API_URL}/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Ошибка регистрации');

        currentUser = await res.json();
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        closeAuthModal();
        updateUserInterface();
        showToast('Регистрация успешна!', 'success');
    } catch (err) {
        showToast(err.message, 'danger');
    }
}

function logout() {
    currentUser = null;
    sessionStorage.removeItem('currentUser');
    stopHud();
    updateUserInterface();
    switchTab('catalog');
    showToast('Вы вышли из системы', 'success');
}

function updateUserInterface() {
    const pill = document.getElementById('user-pill');
    const loginBtn = document.getElementById('login-open-btn');
    const isManager = currentUser && (currentUser.userStatus === 'ROLE_MANAGER' || currentUser.userStatus === 'ROLE_ADMIN');

    if (currentUser) {
        pill.classList.remove('hidden');
        loginBtn.classList.add('hidden');
        document.getElementById('user-display-name').innerText = currentUser.username;
        document.getElementById('user-role-badge').innerText = currentUser.userStatus;
    } else {
        pill.classList.add('hidden');
        loginBtn.classList.remove('hidden');
    }

    // Показываем вкладки менеджера только для руководства
    document.querySelectorAll('.manager-only').forEach(el => {
        el.style.display = isManager ? 'block' : 'none';
    });
}

// МОДАЛКА
function openAuthModal() { document.getElementById('auth-modal').classList.remove('hidden'); }
function closeAuthModal() { document.getElementById('auth-modal').classList.add('hidden'); }
function switchAuthTab(type) {
    const isLogin = type === 'login';
    document.getElementById('auth-tab-login').classList.toggle('active', isLogin);
    document.getElementById('auth-tab-register').classList.toggle('active', !isLogin);
    document.getElementById('form-login').classList.toggle('hidden', !isLogin);
    document.getElementById('form-register').classList.toggle('hidden', isLogin);
}

// TOAST УВЕДОМЛЕНИЯ
function showToast(msg, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.style.cssText = `
        background: #15102a;
        color: #fff;
        padding: 14px 24px;
        margin-top: 10px;
        border-radius: 12px;
        border: 1px solid ${type === 'danger' ? '#ef4444' : '#00f2fe'};
        box-shadow: 0 0 20px rgba(0, 242, 254, 0.3);
        font-weight: 600;
        font-size: 14px;
        animation: fadeIn 0.3s ease;
    `;
    toast.innerText = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}