class TimeTrackPro {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('timetrack_tasks')) || [];
        this.currentTask = null;
        this.currentInterval = null;
        this.pomodoroInterval = null;
        this.pomodoroTime = 25 * 60;
        this.isPomodoro = true;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderTasks();
        this.updateStats();
    }

    setupEventListeners() {
        document.getElementById('startPomodoro').onclick = () => this.startPomodoro();
        document.getElementById('pausePomodoro').onclick = () => this.pausePomodoro();
        document.getElementById('resetPomodoro').onclick = () => this.resetPomodoro();
        document.getElementById('startTracking').onclick = () => this.startTracking();
        document.getElementById('stopTracking').onclick = () => this.stopTracking();
        document.getElementById('exportBtn').onclick = () => this.exportData();
        document.getElementById('clearBtn').onclick = () => this.clearTasks();
    }

    startPomodoro() {
        const workTime = parseInt(document.getElementById('workTime').value) || 25;
        this.pomodoroTime = workTime * 60;
        this.pomodoroInterval = setInterval(() => {
            this.pomodoroTime--;
            this.updatePomodoroDisplay();
            if (this.pomodoroTime <= 0) {
                this.pausePomodoro();
                alert('Pomodoro concluído! Hora de uma pausa.');
                this.pomodoroTime = (document.getElementById('breakTime').value || 5) * 60;
            }
        }, 1000);
    }

    pausePomodoro() {
        clearInterval(this.pomodoroInterval);
    }

    resetPomodoro() {
        this.pausePomodoro();
        this.pomodoroTime = (document.getElementById('workTime').value || 25) * 60;
        this.updatePomodoroDisplay();
    }

    updatePomodoroDisplay() {
        const mins = Math.floor(this.pomodoroTime / 60);
        const secs = this.pomodoroTime % 60;
        document.getElementById('pomodoroDisplay').textContent =
            `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    startTracking() {
        const taskName = document.getElementById('taskName').value.trim();
        if (!taskName) return alert('Digite o nome da tarefa');

        this.currentTask = {
            name: taskName,
            startTime: Date.now(),
            duration: 0
        };

        document.getElementById('currentTaskName').textContent = taskName;
        document.getElementById('currentTask').style.display = 'flex';
        document.getElementById('taskName').value = '';

        this.currentInterval = setInterval(() => {
            this.currentTask.duration = Math.floor((Date.now() - this.currentTask.startTime) / 1000);
            this.updateCurrentTaskTimer();
        }, 1000);
    }

    stopTracking() {
        if (!this.currentTask) return;

        clearInterval(this.currentInterval);

        this.tasks.push({
            ...this.currentTask,
            endTime: Date.now(),
            date: new Date().toISOString()
        });

        this.saveTasks();
        this.renderTasks();
        this.updateStats();

        this.currentTask = null;
        document.getElementById('currentTask').style.display = 'none';
    }

    updateCurrentTaskTimer() {
        const duration = this.currentTask.duration;
        const hours = Math.floor(duration / 3600);
        const mins = Math.floor((duration % 3600) / 60);
        const secs = duration % 60;
        document.getElementById('currentTaskTimer').textContent =
            `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    renderTasks() {
        const today = new Date().toDateString();
        const todayTasks = this.tasks.filter(t => new Date(t.date).toDateString() === today);

        const html = todayTasks.length ? todayTasks.map(task => `
            <div class="task-item">
                <div>
                    <strong>${task.name}</strong><br>
                    <span>${new Date(task.date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}</span>
                </div>
                <div class="task-duration">${this.formatDuration(task.duration)}</div>
            </div>
        `).join('') : '<p style="text-align:center;color:#64748b;">Nenhuma tarefa hoje</p>';

        document.getElementById('tasksList').innerHTML = html;
    }

    updateStats() {
        const today = new Date().toDateString();
        const todayTasks = this.tasks.filter(t => new Date(t.date).toDateString() === today);
        const totalSeconds = todayTasks.reduce((sum, t) => sum + t.duration, 0);

        document.getElementById('totalTime').textContent = this.formatDuration(totalSeconds);
        document.getElementById('tasksCompleted').textContent = todayTasks.length;
    }

    formatDuration(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    exportData() {
        const data = JSON.stringify(this.tasks, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `timetrack-${Date.now()}.json`;
        a.click();
    }

    clearTasks() {
        if (!confirm('Limpar todas as tarefas?')) return;
        this.tasks = [];
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
    }

    saveTasks() {
        localStorage.setItem('timetrack_tasks', JSON.stringify(this.tasks));
    }
}

new TimeTrackPro();
