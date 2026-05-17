
if (!localStorage.getItem('ts_users')) {
    const fakeUsers = [
        { username: "Валік", role: "Замовник" },
        { username: "Аня", role: "Виконавець" },
        { username: "Адмін", role: "Модератор" }
    ];
    localStorage.setItem('ts_users', JSON.stringify(fakeUsers));
}

function saveMessage(taskIndex, sender, text) {
    let chats = JSON.parse(localStorage.getItem('ts_chats')) || {};
    
    if (!chats[taskIndex]) {
        chats[taskIndex] = [];
    }
    
    chats[taskIndex].push({
        sender: sender,
        text: text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    
    localStorage.setItem('ts_chats', JSON.stringify(chats));
}

function getMessages(taskIndex) {
    let chats = JSON.parse(localStorage.getItem('ts_chats')) || {};
    return chats[taskIndex] || [];
}