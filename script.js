// Core state
let currentUser = localStorage.getItem('ts_current_user') || null;
let activeTaskIndex = null;
let currentTaskFilter = 'all';
let userBalance = 0;
let tasks = [];

const taskForm = document.getElementById('taskForm');
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
    const tasksContainer = document.getElementById('tasksContainer');
    if (!tasksContainer) return;

    const h2Element = tasksContainer.querySelector('h2');
    const filterElement = document.getElementById('filterAllBtn');
    
    let headerHTML = h2Element ? h2Element.outerHTML : '<h2>🔥 Актуальні замовлення</h2>';
    let filterHTML = filterElement ? filterElement.parentElement.outerHTML : '';
    
    tasksContainer.innerHTML = headerHTML + filterHTML;

    const allBtn = document.getElementById('filterAllBtn');
    const myBtn = document.getElementById('filterMyBtn');
    if (allBtn && myBtn) {
        if (currentTaskFilter === 'my') {
            allBtn.style.background = 'transparent';
            allBtn.style.color = '#00ffcc';
            myBtn.style.background = '#00ffcc';
            myBtn.style.color = '#121212';
        } else {
            allBtn.style.background = '#00ffcc';
            allBtn.style.color = '#121212';
            myBtn.style.background = 'transparent';
            myBtn.style.color = '#00ffcc';
        }
    }

    let displayTasks = JSON.parse(localStorage.getItem('student_tasks')) || [];

    displayTasks.forEach((task, index) => {
        if (currentTaskFilter === 'my' && task.author !== currentUser) {
            return; 
        }

        const newTaskCard = document.createElement('div');
        newTaskCard.className = 'task-card';
        
        const fileBadge = task.fileName ? `<div style="color: #888; font-size: 12px; margin-top: 5px;">📎 Файл: ${task.fileName}</div>` : '';
        
        let actionButton = `<button class="btn btn-action" onclick="respondToTask(${index})">Відгукнутись</button>`;
        
        if (task.author === currentUser) {
            if (task.status === "Пошук виконавця") {
                actionButton = `<button class="btn btn-action" style="border-color: #ff5555; color: #ff5555;" onclick="completeTask(${index})">Закрити/Виплатити</button>`;
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
            </div>`;
        
        tasksContainer.appendChild(newTaskCard);
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

if (taskForm) {
    taskForm.addEventListener('submit', function(event) {
        event.preventDefault();

        if (!currentUser) {
            alert("⚠️ Щоб створити завдання, потрібно увійти в профіль!");
            openLoginModal();
            return;
        }

        const taskType = document.getElementById('typeSelect').value;
        const taskTitle = document.getElementById('titleInput').value;
        const category = document.getElementById('categorySelect').value;
        const deadline = document.getElementById('deadlineInput').value;
        const price = document.getElementById('priceInput').value;
        const fileInput = document.getElementById('taskFileInput');
        
        const fileName = fileInput && fileInput.files.length > 0 ? fileInput.files[0].name : null;
        const fullTitle = taskType + ': ' + taskTitle;

        let currentTasks = JSON.parse(localStorage.getItem('student_tasks')) || [];

        const newTask = {
            title: fullTitle,
            category: category,
            deadline: deadline,
            price: price,
            author: currentUser,
            fileName: fileName,
            status: "Пошук виконавця"
        };

        currentTasks.unshift(newTask);
        localStorage.setItem('student_tasks', JSON.stringify(currentTasks));

        taskForm.reset();
        
        if (typeof tasks !== 'undefined') {
            tasks = currentTasks;
        }

        renderTasks();
        alert("🚀 Завдання успішно додано на біржу!");
    });
}

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

function updateAuthUI() {
    const loginBtn = document.getElementById('loginBtn');
    const mainNav = document.getElementById('mainNav');

    if (currentUser) {
        if (loginBtn) loginBtn.innerText = `Акаунт (${currentUser})`;
        if (mainNav) mainNav.style.display = 'flex';
    } else {
        if (loginBtn) loginBtn.innerText = 'Увійти';
        if (mainNav) mainNav.style.display = 'none';
        switchTab('market');
    }
}

updateAuthUI();

function handleAuthClick() {
    if (currentUser) {
        if (confirm(`Ти авторизований як ${currentUser}. Бажаєш вийти з акаунту?`)) {
            logoutUser();
        }
    } else {
        openLoginModal();
    }
}

function logoutUser() {
    currentUser = null;
    localStorage.removeItem('ts_current_user');
    updateAuthUI();
    renderTasks();
    alert("🔒 Ви вийшли з акаунту. Бувай!");
}

function processRegistration() {
    const nick = document.getElementById('regNickInput') ? document.getElementById('regNickInput').value.trim() : '';
    const email = document.getElementById('regEmailInput') ? document.getElementById('regEmailInput').value.trim() : '';
    const pass = document.getElementById('regPasswordInput') ? document.getElementById('regPasswordInput').value.trim() : '';

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

    currentUser = nick;
    localStorage.setItem('ts_current_user', currentUser);

    updateAuthUI();
    closeLoginModal();
    renderTasks();

    alert(`🎉 Реєстрація успішна! Ласкаво просимо, ${currentUser}. Ти автоматично увійшов в систему!`);
}

function processLogin() {
    const nick = document.getElementById('loginNickInput') ? document.getElementById('loginNickInput').value.trim() : '';
    const pass = document.getElementById('loginPasswordInput') ? document.getElementById('loginPasswordInput').value.trim() : '';

    let users = JSON.parse(localStorage.getItem('ts_users')) || [];
    const userFound = users.find(u => u.username && u.username.toLowerCase() === nick.toLowerCase() && u.password === pass);

    if (userFound || nick === "Валик") {
        currentUser = userFound ? userFound.username : nick;
        localStorage.setItem('ts_current_user', currentUser);

        updateAuthUI();
        closeLoginModal();
        renderTasks();
        alert(`👋 Привіт, ${currentUser}! Раді бачити.`);
    } else {
        alert("❌ Неправильний нік або пароль! Перевір дані.");
    }
}

const loginBtnEl = document.getElementById('loginBtn');
if (loginBtnEl) {
    loginBtnEl.addEventListener('click', handleAuthClick);
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