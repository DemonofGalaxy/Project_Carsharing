const API_URL = 'http://localhost:8080/api';

let currentUser = JSON.parse(sessionStorage.getItem('currentUser')) || null;
let activeRental = null;
let timerInterval = null;
let currentCarFilter = 'ALL';

document.addEventListener('DOMContentLoaded', () => {
    updateUserInterface();
    loadCars();
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

    if (tabId === 'profile') loadUserProfile();
    if (tabId === 'fleet') loadFleetTable();
    if (tabId === 'maintenance') loadMaintenanceRecords();
    if (tabId === 'analytics') loadAnalytics();
    if (tabId === 'users') loadUsersTable();
}

// ФИЛЬТРАЦИЯ КАТАЛОГА (НЕОНОВЫЕ КНОПКИ)
function setCarFilter(filter, btn) {
    currentCarFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadCars();
}

// ЗАГРУЗКА КАТАЛОГА
async function loadCars() {
    try {
        const url = (currentCarFilter === 'AVAILABLE') ? `${API_URL}/cars/available` : `${API_URL}/cars`;
        const res = await fetch(url);
        let cars = await res.json();

        if (currentCarFilter === 'IN_USE') {
            cars = cars.filter(c => c.status === 'IN_USE');
        }

        const grid = document.getElementById('cars-grid');
        grid.innerHTML = '';

        if (cars.length === 0) {
            grid.innerHTML = '<p class="text-muted" style="grid-column: 1/-1; text-align: center; padding: 40px;">Автомобили по выбранному фильтру не найдены</p>';
            return;
        }

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
                        <span>Пробег:</span>
                        <span>${car.mileAge ? car.mileAge + ' км' : '0 км'}</span>
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
                    <button class="btn btn-primary" ${!isAvailable ? 'disabled style="opacity:0.35;cursor:not-allowed"' : ''} 
                        onclick="handleStartRent(${car.id})">Поехать</button>
                    <button class="btn btn-primary" style="background: rgba(255,255,255,0.06); color: var(--primary-cyan); border: 1px solid var(--primary-cyan)" 
                        ${!isAvailable ? 'disabled style="opacity:0.35;cursor:not-allowed"' : ''} 
                        onclick="handleReserve(${car.id})">Бронь</button>
                </div>
            `;
            grid.appendChild(card);
        });
    } catch (err) {
        showToast('Ошибка загрузки авто: ' + err.message, 'danger');
    }
}

// СТАРТ И БРОНЬ
async function handleStartRent(carId) {
    if (!currentUser) { openAuthModal(); return; }
    try {
        const res = await fetch(`${API_URL}/rentals/start?userId=${currentUser.id}&carId=${carId}`, { method: 'POST' });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'Ошибка старта');
        }
        activeRental = await res.json();
        showToast('Поездка началась! Приятной дороги!', 'success');
        startActiveHud('ACTIVE');
        loadCars();
    } catch (e) { showToast(e.message, 'danger'); }
}

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
        loadCars();
    } catch (e) { showToast(e.message, 'danger'); }
}

// HUD ПОЕЗДКИ
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

        const estimatedMinutes = Math.max(1, mins);
        const liveCost = (estimatedMinutes * 0.45).toFixed(2);
        document.getElementById('hud-cost').innerText = `${liveCost} руб.`;
    }, 1000);
}

async function handleActiveAction() {
    if (!activeRental) return;
    if (activeRental.status === 'RESERVED') {
        try {
            await fetch(`${API_URL}/rentals/${activeRental.id}/cancel?userId=${currentUser.id}`, { method: 'PATCH' });
            showToast('Бронь отменена', 'success');
            stopHud();
            loadCars();
        } catch (e) { showToast(e.message, 'danger'); }
    } else {
        try {
            const res = await fetch(`${API_URL}/rentals/${activeRental.id}/end?tariffName=minuteTariffStrategy`, { method: 'POST' });
            const completed = await res.json();
            showToast(`Поездка завершена! Итоговый чек: ${completed.totalPrice} руб.`, 'success');
            stopHud();
            loadCars();
        } catch (e) { showToast(e.message, 'danger'); }
    }
}

function stopHud() {
    clearInterval(timerInterval);
    activeRental = null;
    document.getElementById('active-rental-hud').classList.add('hidden');
}

// ================= ЛИЧНЫЙ КАБИНЕТ =================
async function loadUserProfile() {
    if (!currentUser) return;
    document.getElementById('prof-fullname').innerText = `${currentUser.firstName || ''} ${currentUser.lastName || ''}`;
    document.getElementById('prof-username').innerText = `@${currentUser.username}`;
    document.getElementById('prof-phone').innerText = currentUser.phone || '—';
    document.getElementById('prof-role').innerText = currentUser.userStatus;
    document.getElementById('prof-avatar').innerText = currentUser.username.charAt(0).toUpperCase();

    // Загрузка персональной истории
    try {
        const res = await fetch(`${API_URL}/rentals/user/${currentUser.id}`);
        const history = await res.json();

        document.getElementById('prof-total-rides').innerText = history.length;
        const totalSpent = history
            .filter(r => r.totalPrice)
            .reduce((sum, r) => sum + parseFloat(r.totalPrice), 0);
        document.getElementById('prof-total-spent').innerText = `${totalSpent.toFixed(2)} руб.`;

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
                    <td class="text-cyan"><strong>${r.totalPrice ? r.totalPrice + ' руб.' : '—'}</strong></td>
                </tr>
            `;
        });
    } catch (e) { showToast('Ошибка истории: ' + e.message, 'danger'); }
}

// ================= ДИСПЕТЧЕР ПАРКА (МЕНЕДЖЕР) =================
async function loadFleetTable() {
    try {
        const res = await fetch(`${API_URL}/cars`);
        const cars = await res.json();
        const tbody = document.getElementById('fleet-tbody');
        tbody.innerHTML = '';

        cars.forEach(c => {
            tbody.innerHTML += `
                <tr>
                    <td>#${c.id}</td>
                    <td><strong>${c.brand} ${c.model}</strong></td>
                    <td><span class="plate-badge">${c.plateNumber}</span></td>
                    <td>${c.mileAge || 0} км</td>
                    <td>${c.fuelLevel}%</td>
                    <td><span class="car-status-tag status-${c.status}">${c.status}</span></td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="openSendToMaintModal(${c.id})">На СТО</button>
                        <button class="btn btn-sm btn-danger" onclick="handleDeactivateCar(${c.id})">Блок</button>
                    </td>
                </tr>
            `;
        });
    } catch (e) { showToast(e.message, 'danger'); }
}

async function handleAddCar(e) {
    e.preventDefault();
    const payload = {
        brand: document.getElementById('car-add-brand').value,
        model: document.getElementById('car-add-model').value,
        plateNumber: document.getElementById('car-add-plate').value,
        pricePerMinute: parseFloat(document.getElementById('car-add-price').value),
        fuelLevel: parseInt(document.getElementById('car-add-fuel').value),
        mileAge: parseInt(document.getElementById('car-add-mileage').value),
        location: document.getElementById('car-add-loc').value
    };

    try {
        const res = await fetch(`${API_URL}/cars`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Ошибка добавления авто');
        closeAddCarModal();
        showToast('Автомобиль успешно добавлен в автопарк!', 'success');
        loadFleetTable();
        loadCars();
    } catch (err) { showToast(err.message, 'danger'); }
}

async function handleDeactivateCar(carId) {
    if (!confirm('Вы уверены, что хотите заблокировать автомобиль?')) return;
    try {
        await fetch(`${API_URL}/cars/${carId}/deactivate`, { method: 'PATCH' });
        showToast('Автомобиль заблокирован', 'success');
        loadFleetTable();
        loadCars();
    } catch (e) { showToast(e.message, 'danger'); }
}

// ================= ЖУРНАЛ СТО (МЕНЕДЖЕР) =================
async function loadMaintenanceRecords() {
    try {
        const res = await fetch(`${API_URL}/maintenance`);
        const records = await res.json();
        const tbody = document.getElementById('maintenance-tbody');
        tbody.innerHTML = '';

        records.forEach(r => {
            tbody.innerHTML += `
                <tr>
                    <td>#${r.id}</td>
                    <td><strong>${r.carBrand} ${r.carModel}</strong> (${r.plateNumber})</td>
                    <td>${r.description}</td>
                    <td><strong>${r.cost ? r.cost + ' руб.' : '—'}</strong></td>
                    <td>${r.startDate ? r.startDate.replace('T', ' ').substring(0, 16) : '—'}</td>
                    <td>${r.endDate ? r.endDate.replace('T', ' ').substring(0, 16) : '—'}</td>
                    <td><span class="tag ${r.isCompleted ? 'tag-success' : 'tag-danger'}">${r.isCompleted ? 'Завершено' : 'В ремонте'}</span></td>
                    <td>
                        ${!r.isCompleted ? `<button class="btn btn-sm btn-primary" onclick="handleCompleteMaint(${r.id})">Забрать с СТО</button>` : '—'}
                    </td>
                </tr>
            `;
        });
    } catch (e) { showToast(e.message, 'danger'); }
}

async function handleSendToMaint(e) {
    e.preventDefault();
    const payload = {
        carId: parseInt(document.getElementById('maint-car-id').value),
        description: document.getElementById('maint-desc').value,
        estimatedCost: parseFloat(document.getElementById('maint-cost').value)
    };
    try {
        const res = await fetch(`${API_URL}/maintenance/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Ошибка отправки на СТО');
        closeMaintModal();
        showToast('Машина отправлена на СТО', 'success');
        loadMaintenanceRecords();
        loadFleetTable();
    } catch (err) { showToast(err.message, 'danger'); }
}

async function handleCompleteMaint(recordId) {
    const cost = prompt('Введите финальную стоимость ремонта (руб.):', '150.00');
    if (!cost) return;
    try {
        await fetch(`${API_URL}/maintenance/${recordId}/complete?actualCost=${cost}`, { method: 'PATCH' });
        showToast('Ремонт завершен, машина вернулась на линию!', 'success');
        loadMaintenanceRecords();
        loadFleetTable();
    } catch (e) { showToast(e.message, 'danger'); }
}

// ================= АНАЛИТИКА (БУХГАЛТЕР) =================
async function loadAnalytics() {
    try {
        const res = await fetch(`${API_URL}/analytics/summary`);
        const d = await res.json();
        document.getElementById('stat-revenue').innerText = `${d.totalRevenue || 0} руб.`;
        document.getElementById('stat-maint-cost').innerText = `${d.totalMaintenanceCost || 0} руб.`;
        document.getElementById('stat-profit').innerText = `${d.netProfit || 0} руб.`;
        document.getElementById('stat-utilization').innerText = `${d.fleetUtilizationRate || 0}%`;
    } catch (e) { showToast(e.message, 'danger'); }
}

// ================= ПОЛЬЗОВАТЕЛИ (АДМИНИСТРАТОР) =================
async function loadUsersTable() {
    try {
        const res = await fetch(`${API_URL}/users`);
        const users = await res.json();
        const tbody = document.getElementById('users-tbody');
        tbody.innerHTML = '';

        users.forEach(u => {
            tbody.innerHTML += `
                <tr>
                    <td>#${u.id}</td>
                    <td><strong>@${u.username}</strong></td>
                    <td>${u.firstName || ''} ${u.lastName || ''}</td>
                    <td>${u.phone || '—'}</td>
                    <td><span class="badge">${u.userStatus}</span></td>
                    <td><span class="tag ${u.isActive ? 'tag-success' : 'tag-danger'}">${u.isActive ? 'Активен' : 'Заблокирован'}</span></td>
                    <td>
                        <button class="btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-primary'}" 
                            onclick="handleToggleUser(${u.id}, ${u.isActive})">
                            ${u.isActive ? 'Заблокировать' : 'Разблокировать'}
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (e) { showToast(e.message, 'danger'); }
}

async function handleToggleUser(userId, currentStatus) {
    const action = currentStatus ? 'deactivate' : 'activate';
    try {
        await fetch(`${API_URL}/users/${userId}/${action}`, { method: 'PATCH' });
        showToast(`Пользователь ${currentStatus ? 'заблокирован' : 'разблокирован'}`, 'success');
        loadUsersTable();
    } catch (e) { showToast(e.message, 'danger'); }
}

// ================= АВТОРИЗАЦИЯ =================
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
    } catch (err) { showToast(err.message, 'danger'); }
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
    } catch (err) { showToast(err.message, 'danger'); }
}

function logout() {
    currentUser = null;
    sessionStorage.removeItem('currentUser');
    stopHud();
    updateUserInterface();
    switchTab('catalog');
    showToast('Сессия завершена', 'success');
}

// ДИНАМИЧЕСКИЙ ИНТЕРФЕЙС РОЛЕЙ
function updateUserInterface() {
    const pill = document.getElementById('user-pill');
    const loginBtn = document.getElementById('login-open-btn');

    if (currentUser) {
        pill.classList.remove('hidden');
        loginBtn.classList.add('hidden');
        document.getElementById('user-display-name').innerText = currentUser.username;
        document.getElementById('user-role-badge').innerText = currentUser.userStatus;
        document.getElementById('user-avatar').innerText = currentUser.username.charAt(0).toUpperCase();
    } else {
        pill.classList.add('hidden');
        loginBtn.classList.remove('hidden');
    }

    const role = currentUser ? currentUser.userStatus : 'GUEST';
    const isManager = role === 'ROLE_MANAGER' || role === 'ROLE_ADMIN';
    const isAccountant = role === 'ROLE_ACCOUNTANT' || role === 'ROLE_ADMIN';
    const isAdmin = role === 'ROLE_ADMIN';

    // Включаем вкладки по правам доступа
    document.querySelectorAll('.auth-only').forEach(el => el.style.display = currentUser ? 'block' : 'none');
    document.querySelectorAll('.manager-only').forEach(el => el.classList.toggle('hidden', !isManager));
    document.querySelectorAll('.accountant-only').forEach(el => el.classList.toggle('hidden', !isAccountant));
    document.querySelectorAll('.admin-only').forEach(el => el.classList.toggle('hidden', !isAdmin));
}

// МОДАЛКИ
function openAuthModal() { document.getElementById('auth-modal').classList.remove('hidden'); }
function closeAuthModal() { document.getElementById('auth-modal').classList.add('hidden'); }
function switchAuthTab(type) {
    const isLogin = type === 'login';
    document.getElementById('auth-tab-login').classList.toggle('active', isLogin);
    document.getElementById('auth-tab-register').classList.toggle('active', !isLogin);
    document.getElementById('form-login').classList.toggle('hidden', !isLogin);
    document.getElementById('form-register').classList.toggle('hidden', isLogin);
}

function openAddCarModal() { document.getElementById('add-car-modal').classList.remove('hidden'); }
function closeAddCarModal() { document.getElementById('add-car-modal').classList.add('hidden'); }

function openSendToMaintModal(carId) {
    document.getElementById('maint-car-id').value = carId;
    document.getElementById('maint-modal').classList.remove('hidden');
}
function closeMaintModal() { document.getElementById('maint-modal').classList.add('hidden'); }

function showToast(msg, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.style.cssText = `
        background: #120d24; color: #fff; padding: 12px 20px; margin-top: 10px;
        border-radius: 10px; border: 1px solid ${type === 'danger' ? '#ef4444' : '#00f2fe'};
        box-shadow: 0 0 20px rgba(0, 242, 254, 0.3); font-weight: 600; font-size: 13px;
        animation: fadeIn 0.3s ease;
    `;
    toast.innerText = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}