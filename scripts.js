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
let currentFilter = 'all'; // Track the current filter state

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
        renderTodos(currentFilter);
    }
}

function toggleTodo(id) {
    todos = todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo);
    saveTodos();
    renderTodos(currentFilter); // Use current filter to maintain view
}

function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodos(currentFilter);
}

function filterTodos(filter) {
    currentFilter = filter; // Update the current filter
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.filter-btn[onclick="filterTodos('${filter}')"]`).classList.add('active');
    renderTodos(filter);
}

function clearAll() {
    if (confirm('Are you sure you want to delete all tasks?')) {
        todos = [];
        saveTodos();
        renderTodos(currentFilter);
    }
}

function renderTodos(filter = currentFilter) {
    const todoList = document.getElementById('todoList');
    todoList.innerHTML = '';
    let filteredTodos = todos;
    if (filter === 'active') filteredTodos = todos.filter(todo => !todo.completed);
    if (filter === 'completed') filteredTodos = todos.filter(todo => todo.completed);
    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = 'todo-item';
        li.style.transition = 'all 0.3s ease'; // Smooth transition for visual updates
        li.innerHTML = `
            <input type="checkbox" ${todo.completed ? 'checked' : ''} onchange="toggleTodo(${todo.id})">
            <span class="${todo.completed ? 'completed' : ''}">${todo.text}</span>
            <button class="delete-btn" onclick="deleteTodo(${todo.id})">🗑️</button>
        `;
        todoList.appendChild(li);
    });
}