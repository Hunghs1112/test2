document.addEventListener('DOMContentLoaded', () => {
    const loggedInUser = localStorage.getItem('loggedInUser');
    const loginContainer = document.getElementById('loginContainer');
    const mainContainer = document.getElementById('mainContainer');
    if (loggedInUser) {
        loginContainer.style.display = 'none';
        mainContainer.style.display = 'block';
        renderTodos();
    } else {
        loginContainer.style.display = 'block';
        mainContainer.style.display = 'none';
        switchTab('login');
    }
});

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    document.querySelector(`.tab-btn[onclick="switchTab('${tabName}')"]`).classList.add('active');
}

// Todo App functionality
let todos = JSON.parse(localStorage.getItem('todos')) || [];

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function addTodo() {
    const input = document.getElementById('todoInput');
    const text = input.value.trim();
    if (text) {
        todos.push({ id: Date.now(), text, completed: false });
        input.value = '';
        saveTodos();
        renderTodos();
    }
}

function toggleTodo(id) {
    todos = todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo);
    saveTodos();
    renderTodos();
}

function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodos();
}

function filterTodos(filter) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.filter-btn[onclick="filterTodos('${filter}')"]`).classList.add('active');
    renderTodos(filter);
}

function clearAll() {
    if (confirm('Are you sure you want to delete all tasks?')) {
        todos = [];
        saveTodos();
        renderTodos();
    }
}

function renderTodos(filter = 'all') {
    const todoList = document.getElementById('todoList');
    todoList.innerHTML = '';
    let filteredTodos = todos;
    if (filter === 'active') filteredTodos = todos.filter(todo => !todo.completed);
    if (filter === 'completed') filteredTodos = todos.filter(todo => todo.completed);
    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = 'todo-item';
        li.innerHTML = `
            <input type="checkbox" ${todo.completed ? 'checked' : ''} onchange="toggleTodo(${todo.id})">
            <span ${todo.completed ? 'class="completed"' : ''}>${todo.text}</span>
            <button class="delete-btn" onclick="deleteTodo(${todo.id})">🗑️</button>
        `;
        todoList.appendChild(li);
    });
}

// User Management functionality
function login() {
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value.trim();
    const resultDiv = document.getElementById('loginResult');
    if (!email || !password) {
        resultDiv.textContent = 'Hãy nhập đầy đủ thông tin';
        return;
    }
    const user = users.find(u => u.email.toLowerCase() === email && u.password === password);
    if (user) {
        localStorage.setItem('loggedInUser', email);
        resultDiv.textContent = `Xin chào ${user.first_name} ${user.last_name}! Đang chuyển...`;
        setTimeout(() => {
            document.getElementById('loginContainer').style.display = 'none';
            document.getElementById('mainContainer').style.display = 'block';
            renderTodos();
        }, 1000);
    } else {
        resultDiv.textContent = 'Thông tin tài khoản không chính xác';
    }
}

function register() {
    const firstName = document.getElementById('registerFirstName').value.trim();
    const lastName = document.getElementById('registerLastName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value.trim();
    const resultDiv = document.getElementById('registerResult');
    if (!firstName || !lastName || !email || !password) {
        resultDiv.textContent = 'Hãy nhập đầy đủ thông tin';
        return;
    }
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        resultDiv.textContent = 'Email này đã có tài khoản';
        return;
    }
    const newId = Math.max(...users.map(u => u.id), 0) + 1;
    users.push({ id: newId, first_name: firstName, last_name: lastName, email: email.toLowerCase(), password });
    resultDiv.textContent = 'Đăng ký thành công! Đang chuyển...';
    setTimeout(() => {
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('mainContainer').style.display = 'block';
        renderTodos();
    }, 1000);
}

function searchUsers() {
    const keyword = document.getElementById('userSearchKeyword').value.trim().toLowerCase();
    const resultDiv = document.getElementById('usersResult');
    const filteredUsers = keyword ? users.filter(u => 
        `${u.first_name} ${u.last_name}`.toLowerCase().includes(keyword) || u.email.toLowerCase().includes(keyword)
    ) : users;
    resultDiv.innerHTML = filteredUsers.map(u => 
        `<div>ID: ${u.id}, Name: ${u.first_name} ${u.last_name}, Email: ${u.email}</div>`
    ).join('') || 'No users found';
}

function showAllPosts() {
    const resultDiv = document.getElementById('postsResult');
    resultDiv.innerHTML = posts.map(p => {
        const user = users.find(u => u.id === p.user_id);
        return `<div>ID: ${p.id}, Title: ${p.title}, Created: ${p.created_at}, Author: ${user ? `${user.first_name} ${user.last_name}` : 'Unknown'}</div>`;
    }).join('');
}

function showPostDetail() {
    const id = parseInt(document.getElementById('postDetailId').value);
    const resultDiv = document.getElementById('postsResult');
    const post = posts.find(p => p.id === id);
    if (!post) {
        resultDiv.textContent = 'Post not found';
        return;
    }
    const user = users.find(u => u.id === post.user_id);
    resultDiv.innerHTML = `
        ID: ${post.id}, Title: ${post.title}, Content: ${post.content}, 
        Image: <a href="${post.image}" target="_blank">${post.image}</a>, 
        Author: ${user ? `${user.first_name} ${user.last_name}` : 'Unknown'}, 
        Created: ${post.created_at}, Updated: ${post.updated_at}
    `;
}

function searchPostsByUser() {
    const email = document.getElementById('postSearchEmail').value.trim();
    const resultDiv = document.getElementById('postsResult');
    const user = users.find(u => u.email === email);
    if (!user) {
        resultDiv.textContent = 'User not found';
        return;
    }
    const userPosts = posts.filter(p => p.user_id === user.id);
    resultDiv.innerHTML = userPosts.map(p => 
        `<div>ID: ${p.id}, Title: ${p.title}, Created: ${p.created_at}, Author: ${user.first_name} ${user.last_name}</div>`
    ).join('') || 'No posts found';
}

function logout() {
    localStorage.removeItem('loggedInUser');
    document.getElementById('loginContainer').style.display = 'block';
    document.getElementById('mainContainer').style.display = 'none';
    switchTab('login');
}