// TaskFlow Pro - Gerenciador de Tarefas Kanban
class TaskFlowPro {
    constructor() {
        this.tasks = this.loadTasks();
        this.draggedElement = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderAllTasks();
        this.updateStats();
    }

    setupEventListeners() {
        // Add task buttons
        document.getElementById('addTodoBtn').addEventListener('click', () => this.addTask('todo'));
        document.getElementById('addProgressBtn').addEventListener('click', () => this.addTask('progress'));
        document.getElementById('addDoneBtn').addEventListener('click', () => this.addTask('done'));

        // Enter key to add tasks
        document.getElementById('todoInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask('todo');
        });
        document.getElementById('progressInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask('progress');
        });
        document.getElementById('doneInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask('done');
        });

        // Action buttons
        document.getElementById('clearAllBtn').addEventListener('click', () => this.clearAll());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportData());

        // Drag and drop for columns
        const columns = document.querySelectorAll('.tasks-list');
        columns.forEach(column => {
            column.addEventListener('dragover', (e) => this.handleDragOver(e));
            column.addEventListener('drop', (e) => this.handleDrop(e));
        });
    }

    addTask(column) {
        const input = document.getElementById(`${column}Input`);
        const title = input.value.trim();

        if (!title) {
            input.focus();
            return;
        }

        const task = {
            id: Date.now(),
            title: title,
            column: column,
            createdAt: new Date().toISOString()
        };

        this.tasks.push(task);
        this.saveTasks();
        this.renderTask(task);
        this.updateStats();

        input.value = '';
        input.focus();
    }

    renderTask(task) {
        const taskCard = document.createElement('div');
        taskCard.className = 'task-card';
        taskCard.draggable = true;
        taskCard.dataset.id = task.id;
        taskCard.dataset.column = task.column;

        const date = new Date(task.createdAt);
        const formattedDate = date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });

        taskCard.innerHTML = `
            <div class="task-header">
                <div class="task-title">${this.escapeHtml(task.title)}</div>
                <div class="task-actions">
                    <button class="btn-icon btn-edit" onclick="app.editTask(${task.id})" title="Editar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button class="btn-icon btn-delete" onclick="app.deleteTask(${task.id})" title="Excluir">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="task-meta">
                <div class="task-date">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    ${formattedDate}
                </div>
            </div>
        `;

        // Drag events
        taskCard.addEventListener('dragstart', (e) => this.handleDragStart(e));
        taskCard.addEventListener('dragend', (e) => this.handleDragEnd(e));

        const list = document.getElementById(`${task.column}List`);
        list.appendChild(taskCard);
    }

    renderAllTasks() {
        // Clear all lists
        document.getElementById('todoList').innerHTML = '';
        document.getElementById('progressList').innerHTML = '';
        document.getElementById('doneList').innerHTML = '';

        // Render tasks
        this.tasks.forEach(task => this.renderTask(task));
    }

    editTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) return;

        const newTitle = prompt('Editar tarefa:', task.title);
        if (newTitle && newTitle.trim()) {
            task.title = newTitle.trim();
            this.saveTasks();
            this.renderAllTasks();
        }
    }

    deleteTask(id) {
        if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return;

        this.tasks = this.tasks.filter(t => t.id !== id);
        this.saveTasks();
        this.renderAllTasks();
        this.updateStats();
    }

    handleDragStart(e) {
        this.draggedElement = e.target;
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target.innerHTML);
    }

    handleDragEnd(e) {
        e.target.classList.remove('dragging');
    }

    handleDragOver(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }
        e.dataTransfer.dropEffect = 'move';
        return false;
    }

    handleDrop(e) {
        if (e.stopPropagation) {
            e.stopPropagation();
        }

        if (!this.draggedElement) return false;

        const taskId = parseInt(this.draggedElement.dataset.id);
        const newColumn = e.currentTarget.dataset.column;

        const task = this.tasks.find(t => t.id === taskId);
        if (task && task.column !== newColumn) {
            task.column = newColumn;
            this.saveTasks();
            this.renderAllTasks();
            this.updateStats();
        }

        return false;
    }

    updateStats() {
        const todoCount = this.tasks.filter(t => t.column === 'todo').length;
        const progressCount = this.tasks.filter(t => t.column === 'progress').length;
        const doneCount = this.tasks.filter(t => t.column === 'done').length;

        document.getElementById('todoCount').textContent = todoCount;
        document.getElementById('progressCount').textContent = progressCount;
        document.getElementById('doneCount').textContent = doneCount;

        document.getElementById('todoColumnCount').textContent = todoCount;
        document.getElementById('progressColumnCount').textContent = progressCount;
        document.getElementById('doneColumnCount').textContent = doneCount;
    }

    clearAll() {
        if (!confirm('Tem certeza que deseja limpar todas as tarefas? Esta ação não pode ser desfeita.')) return;

        this.tasks = [];
        this.saveTasks();
        this.renderAllTasks();
        this.updateStats();
    }

    exportData() {
        const data = {
            exportDate: new Date().toISOString(),
            tasks: this.tasks,
            stats: {
                total: this.tasks.length,
                todo: this.tasks.filter(t => t.column === 'todo').length,
                progress: this.tasks.filter(t => t.column === 'progress').length,
                done: this.tasks.filter(t => t.column === 'done').length
            }
        };

        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `taskflow-export-${Date.now()}.json`;
        link.click();

        URL.revokeObjectURL(url);
    }

    saveTasks() {
        localStorage.setItem('taskflow_tasks', JSON.stringify(this.tasks));
    }

    loadTasks() {
        const saved = localStorage.getItem('taskflow_tasks');
        return saved ? JSON.parse(saved) : [];
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize app
const app = new TaskFlowPro();
