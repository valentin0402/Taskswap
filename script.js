// Core state
let currentUser = localStorage.getItem('ts_current_user') || null;
let activeTaskIndex = null;
let currentTaskFilter = 'all';
let userBalance = 0;

const form = document.getElementById('taskForm');
const container = document.getElementById('tasksContainer');

function loadTasks() {
    const savedTasks = localStorage.getItem('student_tasks');
    if (savedTasks) {
        try {
            tasks = JSON.parse(savedTasks);
        } catch (e) {
            tasks = [];
        }
    }

    if (!tasks || tasks.length === 0) {
        tasks = [
            {
                title: "Практична робота: Глюкоза та амінокислоти",
                category: "Хімія",
                deadline: "Завтра вранці",
                price: "350",
                author: "Система",
                status: "Пошук виконавця"
            }
        ];
    }

    renderTasks();
}

function renderTasks() {
    if (!container) return;
    container.innerHTML = '';

    // Optional header area stays if present in HTML
    const header = document.createElement('div');
    header.innerHTML = `<h2>Біржа завдань</h2>`;
    container.appendChild(header);

    const filters = document.createElement('div');
    filters.style.display = 'flex';
    filters.style.gap = '10px';
    filters.innerHTML = `
        <button id="filterAllBtn" class="btn">Усі</button>
        <button id="filterMyBtn" class="btn">Мої</button>
    `;
    container.appendChild(filters);

    const allBtn = document.getElementById('filterAllBtn');
    const myBtn = document.getElementById('filterMyBtn');
    if (allBtn && myBtn) {
        allBtn.addEventListener('click', () => filterTasks('all'));
        myBtn.addEventListener('click', () => filterTasks('my'));
    }

    tasks.forEach((task, index) => {
        if (currentTaskFilter === 'my' && task.author !== currentUser) return;

        const newTaskCard = document.createElement('div');
        newTaskCard.className = 'task-card';

        const fileBadge = task.fileName ? `<div style="color: #888; font-size: 12px; margin-top: 5px;">📎 Файл: ${task.fileName}</div>` : '';

        let actionButton = `<button class="btn btn-action" data-idx="${index}">Відгукнутись</button>`;
        if (task.author === currentUser) {
            if (task.status === "Пошук виконавця") {
                actionButton = `<button class="btn btn-action btn-close" data-idx="${index}">Закрити/Виплатити</button>`;
            } else {
                actionButton = `<span style="color: #888; font-size: 14px; font-weight: bold;">🔒 Виконано</span>`;
            }
        }

        newTaskCard.innerHTML = `
            <div>
                <div class="task-title">${task.title}</div>
                <div class="task-meta">
                    <span class="task-tag">${task.category}</span>
                    Дедлайн: ${task.deadline} | Автор: <b>${task.author || 'Анонім'}</b>
                </div>
                <div style="margin-top: 5px;"><span style="color: ${task.status === 'Виконано' ? '#888' : '#00ffcc'}; font-size: 13px;">📊 Статус: ${task.status}</span></div>
                ${fileBadge}
            </div>
            <div class="task-right">
                <div class="task-price">${task.price} ₴</div>
                ${actionButton}
            </div>
        `;

        container.appendChild(newTaskCard);
    });

    // Attach delegated listeners for dynamic buttons
    container.querySelectorAll('.btn-action').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(btn.getAttribute('data-idx'));
            if (btn.classList.contains('btn-close')) {
                completeTask(idx);
            } else {
                respondToTask(idx);
            }
        });
    });
}

function filterTasks(mode) {
    currentTaskFilter = mode;
    const allBtn = document.getElementById('filterAllBtn');
    const myBtn = document.getElementById('filterMyBtn');
    if (mode === 'all') {
        if (allBtn) { allBtn.style.background = '#00ffcc'; allBtn.style.color = '#121212'; }
        if (myBtn) { myBtn.style.background = 'transparent'; myBtn.style.color = '#00ffcc'; }
    } else {
        if (allBtn) { allBtn.style.background = 'transparent'; allBtn.style.color = '#00ffcc'; }
        if (myBtn) { myBtn.style.background = '#00ffcc'; myBtn.style.color = '#121212'; }
    }
    renderTasks();
}

function completeTask(index) {
    if (!tasks[index]) return;
    tasks[index].status = "Виконано";
    localStorage.setItem('student_tasks', JSON.stringify(tasks));
    alert("✅ Завдання успішно закрите! Кошти перераховані виконавцю на баланс (мінус 5% комісії платформи).");
    renderTasks();
}

if (form) {
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        if (!currentUser) {
            alert("⚠️ Щоб створити завдання, потрібно увійти в профіль!");
            openLoginModal();
            return;
        }

        const taskType = document.getElementById('typeSelect') ? document.getElementById('typeSelect').value : '';
        const taskTitle = document.getElementById('titleInput') ? document.getElementById('titleInput').value : '';
        const category = document.getElementById('categorySelect') ? document.getElementById('categorySelect').value : '';
        const deadline = document.getElementById('deadlineInput') ? document.getElementById('deadlineInput').value : '';
        const price = document.getElementById('priceInput') ? document.getElementById('priceInput').value : '';
        const fileInput = document.getElementById('taskFileInput');
        const fileName = fileInput && fileInput.files && fileInput.files.length > 0 ? fileInput.files[0].name : null;
        const fullTitle = (taskType ? taskType + ': ' : '') + taskTitle;

        const newTask = {
            title: fullTitle,
            category: category,
            deadline: deadline,
            price: price,
            author: currentUser,
            fileName: fileName,
            status: "Пошук виконавця"
        };

        tasks.unshift(newTask);
        localStorage.setItem('student_tasks', JSON.stringify(tasks));

        alert("🎉 Завдання опубліковано на біржу!");
        form.reset();
        renderTasks();
    });
}

// Auth / modal logic
let authMode = 'login';
function toggleAuthMode(mode) {
    authMode = mode;
    const lf = document.getElementById('loginFormFields');
    const rf = document.getElementById('regFormFields');
    const tl = document.getElementById('tabLoginBtn');
    const tr = document.getElementById('tabRegBtn');
    if (mode === 'login') {
        if (lf) lf.style.display = 'block';
        if (rf) rf.style.display = 'none';
        if (tl) { tl.style.background = '#00ffcc'; tl.style.color = '#121212'; }
        if (tr) { tr.style.background = '#333'; tr.style.color = '#fff'; }
    } else {
        if (lf) lf.style.display = 'none';
        if (rf) rf.style.display = 'block';
        if (tl) { tl.style.background = '#333'; tl.style.color = '#fff'; }
        if (tr) { tr.style.background = '#00ffcc'; tr.style.color = '#121212'; }
    }
}

function openLoginModal() {
    toggleAuthMode('login');
    const modal = document.getElementById('loginModal');
    if (modal) modal.style.display = 'flex';
}
function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) modal.style.display = 'none';
}

function processRegistration() {
    const nickEl = document.getElementById('regNickInput');
    const emailEl = document.getElementById('regEmailInput');
    const passEl = document.getElementById('regPasswordInput');
    const nick = nickEl ? nickEl.value.trim() : '';
    const email = emailEl ? emailEl.value.trim() : '';
    const pass = passEl ? passEl.value.trim() : '';

    if (!nick || !email || !pass) {
        alert("⚠️ Заповни всі поля для реєстрації!");
        return;
    }

    let users = JSON.parse(localStorage.getItem('ts_users')) || [];
    if (users.some(u => u.username && u.username.toLowerCase() === nick.toLowerCase())) {
        alert("❌ Цей нікнейм уже зайнятий! Придумай інший.");
        return;
    }

    users.push({ username: nick, email: email, password: pass, role: "Користувач" });
    localStorage.setItem('ts_users', JSON.stringify(users));

    alert("🎉 Реєстрація успішна! Тепер увійди під своїм ніком.");
    toggleAuthMode('login');
}

function processLogin() {
    const nickEl = document.getElementById('loginNickInput');
    const passEl = document.getElementById('loginPasswordInput');
    const nick = nickEl ? nickEl.value.trim() : '';
    const pass = passEl ? passEl.value.trim() : '';

    let users = JSON.parse(localStorage.getItem('ts_users')) || [];
    const userFound = users.find(u => u.username && u.username.toLowerCase() === nick.toLowerCase() && u.password === pass);

    if (userFound || nick === "Ванька 10-Г") {
        currentUser = userFound ? userFound.username : nick;
        localStorage.setItem('ts_current_user', currentUser);
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) loginBtn.innerText = `Профіль: ${currentUser}`;
        const mainNav = document.getElementById('mainNav');
        if (mainNav) mainNav.style.display = 'flex';
        closeLoginModal();
        alert(`👋 Привіт, ${currentUser}! Раді бачити.`);
        renderTasks();
    } else {
        alert("❌ Неправильний нік або пароль! Перевір дані.");
    }
}

function logoutUser() {
    currentUser = null;
    localStorage.removeItem('ts_current_user');
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) loginBtn.innerText = 'Увійти';
    const mainNav = document.getElementById('mainNav');
    if (mainNav) mainNav.style.display = 'none';
    alert('👋 Ви вийшли з системи');
}

const loginBtnEl = document.getElementById('loginBtn');
if (loginBtnEl) {
    loginBtnEl.addEventListener('click', function() {
        if (currentUser) {
            logoutUser();
        } else {
            openLoginModal();
        }
    });
}

function respondToTask(index) {
    if (!currentUser) {
        alert("⚠️ Спочатку увійдіть в систему (кнопка вгорі), щоб відкрити чат з замовником!");
        openLoginModal();
        return;
    }
    if (!tasks[index]) return;
    activeTaskIndex = index;
    const task = tasks[index];
    const chatTitle = document.getElementById('chatTitle');
    if (chatTitle) chatTitle.innerText = `💬 Чат: ${task.title}`;
    const chatModal = document.getElementById('chatModal');
    if (chatModal) chatModal.style.display = 'flex';
    renderMessages();
}

function closeChatModal() {
    const chatModal = document.getElementById('chatModal');
    if (chatModal) chatModal.style.display = 'none';
    activeTaskIndex = null;
}

function renderMessages() {
    const chatMessagesContainer = document.getElementById('chatMessages');
    if (!chatMessagesContainer || activeTaskIndex === null) return;
    chatMessagesContainer.innerHTML = '';

    const messages = getMessages(activeTaskIndex);
    messages.forEach(msg => {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'msg';
        msgDiv.style.backgroundColor = msg.sender === currentUser ? '#2a2a2a' : '#1e1e1e';
        msgDiv.style.borderLeft = msg.sender === currentUser ? '3px solid #00ffcc' : '3px solid #888';
        msgDiv.style.alignSelf = msg.sender === currentUser ? 'flex-end' : 'flex-start';

        msgDiv.innerHTML = `
            <div class="msg-sender">${msg.sender} (${msg.time})</div>
            <div class="msg-text">${msg.text}</div>
        `;
        chatMessagesContainer.appendChild(msgDiv);
    });
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const text = input ? input.value.trim() : '';
    if (text && activeTaskIndex !== null) {
        saveMessage(activeTaskIndex, currentUser || 'Гість', text);
        if (input) input.value = '';
        renderMessages();
    }
}

function switchTab(tabId) {
    const market = document.getElementById('marketTab');
    const wallet = document.getElementById('walletTab');
    const support = document.getElementById('supportTab');
    const marketBtn = document.getElementById('marketTabBtn');
    const walletBtn = document.getElementById('walletTabBtn');
    const supportBtn = document.getElementById('supportTabBtn');

    // hide all
    if (market) market.style.display = 'none';
    if (wallet) wallet.style.display = 'none';
    if (support) support.style.display = 'none';

    // reset buttons
    if (marketBtn) marketBtn.classList.remove('active');
    if (walletBtn) walletBtn.classList.remove('active');
    if (supportBtn) supportBtn.classList.remove('active');

    if (tabId === 'market') {
        if (market) market.style.display = 'block';
        if (marketBtn) marketBtn.classList.add('active');
    } else if (tabId === 'wallet') {
        if (wallet) wallet.style.display = 'block';
        if (walletBtn) walletBtn.classList.add('active');
    } else if (tabId === 'support') {
        if (support) support.style.display = 'block';
        if (supportBtn) supportBtn.classList.add('active');
        loadSupportMessages();
    }
}

function mockTransaction(type) {
    const amountInput = type === 'deposit' ? document.getElementById('depositAmount') : document.getElementById('withdrawAmount');
    const amount = amountInput ? parseInt(amountInput.value) : 0;

    if (!amount || amount <= 0) {
        alert("⚠️ Введіть коректну суму!");
        return;
    }

    if (type === 'withdraw' && amount > userBalance) {
        alert("❌ Недостатньо коштів на балансі!");
        return;
    }

    alert("⏳ З'єднання з платіжним шлюзом... Зачекайте.");
    setTimeout(() => {
        if (type === 'deposit') {
            userBalance += amount;
            alert(`✅ Баланс успішно поповнено на ${amount} ₴`);
        }
        if (type === 'withdraw') {
            const fee = Math.round(amount * 0.05);
            const finalAmount = amount - fee;
            userBalance -= amount;
            alert(`✅ Виведено ${finalAmount} ₴ (Комісія платформи: ${fee} ₴). Гроші надійдуть на картку протягом 24 годин.`);
        }
        const bal = document.getElementById('balanceDisplay');
        if (bal) bal.innerText = userBalance;
        if (amountInput) amountInput.value = '';
    }, 1500);
}

function loadSupportMessages() {
    const containerMessages = document.getElementById('supportMessages');
    if (!containerMessages) return;
    containerMessages.innerHTML = '';
    let supportChats = JSON.parse(localStorage.getItem('ts_support_messages')) || [
        { sender: "Система TaskSwap", text: "Вітаємо! Якщо у вас виник спір з виконавцем або проблема з оплатою, опишіть ситуацію сюди.", time: '' }
    ];

    supportChats.forEach(msg => {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'msg';
        msgDiv.style.backgroundColor = msg.sender === currentUser ? '#2a2a2a' : '#1e1e1e';
        msgDiv.style.borderLeft = msg.sender === currentUser ? '3px solid #00ffcc' : '3px solid #ffaa00';
        msgDiv.style.alignSelf = msg.sender === currentUser ? 'flex-end' : 'flex-start';

        msgDiv.innerHTML = `
            <div class="msg-sender">${msg.sender}</div>
            <div class="msg-text">${msg.text}</div>
        `;
        containerMessages.appendChild(msgDiv);
    });
    containerMessages.scrollTop = containerMessages.scrollHeight;
}

function sendSupportMessage() {
    const input = document.getElementById('supportInput');
    const text = input ? input.value.trim() : '';
    if (!text) return;

    let supportChats = JSON.parse(localStorage.getItem('ts_support_messages')) || [];
    supportChats.push({ sender: currentUser || "Гість", text: text, time: new Date().toLocaleTimeString() });
    localStorage.setItem('ts_support_messages', JSON.stringify(supportChats));
    if (input) input.value = '';
    loadSupportMessages();

    setTimeout(() => {
        supportChats.push({ sender: "Адміністратор Олег", text: "Прийнято в обробку. Ми розглянемо вашу заявку.", time: new Date().toLocaleTimeString() });
        localStorage.setItem('ts_support_messages', JSON.stringify(supportChats));
        loadSupportMessages();
    }, 2000);
}

loadTasks();
if (currentUser) {
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) loginBtn.innerText = `Профіль: ${currentUser}`;
    const mainNav = document.getElementById('mainNav');
    if (mainNav) mainNav.style.display = 'flex';
}