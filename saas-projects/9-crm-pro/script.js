class CRMPro {
    constructor() {
        this.leads = JSON.parse(localStorage.getItem('crm_leads')) || [];
        this.contacts = JSON.parse(localStorage.getItem('crm_contacts')) || [];
        this.deals = JSON.parse(localStorage.getItem('crm_deals')) || [];
        this.tasks = JSON.parse(localStorage.getItem('crm_tasks')) || [];
        this.currentTab = 'dashboard';
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupButtons();
        this.renderDashboard();
    }

    setupNavigation() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.onclick = (e) => {
                e.preventDefault();
                const tab = item.dataset.tab;
                this.switchTab(tab);
            };
        });
    }

    switchTab(tab) {
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        document.getElementById(tab).classList.add('active');
        this.currentTab = tab;

        // Render content
        switch(tab) {
            case 'dashboard': this.renderDashboard(); break;
            case 'leads': this.renderLeads(); break;
            case 'contacts': this.renderContacts(); break;
            case 'deals': this.renderDeals(); break;
            case 'tasks': this.renderTasks(); break;
        }
    }

    setupButtons() {
        document.getElementById('addLeadBtn').onclick = () => this.showLeadModal();
        document.getElementById('addContactBtn').onclick = () => this.showContactModal();
        document.getElementById('addDealBtn').onclick = () => this.showDealModal();
        document.getElementById('addTaskBtn').onclick = () => this.showTaskModal();
        document.getElementById('closeModal').onclick = () => this.closeModal();
        document.getElementById('cancelBtn').onclick = () => this.closeModal();
        document.getElementById('refreshDashboard').onclick = () => this.renderDashboard();
    }

    renderDashboard() {
        // Stats
        document.getElementById('totalLeads').textContent = this.leads.length;
        document.getElementById('totalContacts').textContent = this.contacts.length;
        const totalDealsValue = this.deals.reduce((sum, d) => sum + (d.value || 0), 0);
        document.getElementById('totalDeals').textContent = `R$ ${totalDealsValue.toLocaleString('pt-BR')}`;
        const completedTasks = this.tasks.filter(t => t.completed).length;
        document.getElementById('completedTasks').textContent = completedTasks;

        // Pipeline Chart
        const stages = {
            prospecting: this.deals.filter(d => d.stage === 'prospecting').length,
            proposal: this.deals.filter(d => d.stage === 'proposal').length,
            negotiation: this.deals.filter(d => d.stage === 'negotiation').length,
            closed: this.deals.filter(d => d.stage === 'closed').length
        };

        const maxDeals = Math.max(...Object.values(stages), 1);
        document.getElementById('pipelineChart').innerHTML = `
            ${Object.entries(stages).map(([stage, count]) => `
                <div class="chart-bar">
                    <div class="chart-label">${this.translateStage(stage)}</div>
                    <div class="chart-value">
                        <div class="chart-fill" style="width: ${(count/maxDeals)*100}%"></div>
                    </div>
                    <span>${count}</span>
                </div>
            `).join('')}
        `;

        // Recent Activities
        const activities = [
            ...this.leads.slice(-5).map(l => ({ text: `Novo lead: ${l.name}`, date: l.createdAt })),
            ...this.deals.slice(-5).map(d => ({ text: `Novo negócio: ${d.name}`, date: d.createdAt })),
            ...this.tasks.filter(t => t.completed).slice(-5).map(t => ({ text: `Tarefa concluída: ${t.name}`, date: t.completedAt }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

        document.getElementById('recentActivities').innerHTML = activities.length ?
            activities.map(a => `
                <div class="activity-item">
                    ${a.text}
                    <span style="color:#64748b;font-size:12px;display:block;margin-top:4px;">
                        ${new Date(a.date).toLocaleString('pt-BR')}
                    </span>
                </div>
            `).join('') : '<p>Nenhuma atividade recente</p>';
    }

    renderLeads() {
        const html = this.leads.map((l, i) => `
            <tr>
                <td><strong>${l.name}</strong></td>
                <td>${l.email}</td>
                <td>${l.phone || '-'}</td>
                <td><span class="status-badge status-${l.status}">${this.translateStatus(l.status)}</span></td>
                <td>${l.source || '-'}</td>
                <td>
                    <button class="btn btn-small" onclick="app.convertLead(${i})">Converter</button>
                    <button class="btn btn-small btn-secondary" onclick="app.deleteLead(${i})">Excluir</button>
                </td>
            </tr>
        `).join('') || '<tr><td colspan="6" style="text-align:center;padding:40px;">Nenhum lead cadastrado</td></tr>';

        document.getElementById('leadsTable').innerHTML = html;
    }

    renderContacts() {
        const html = this.contacts.map((c, i) => `
            <div class="contact-card">
                <div class="contact-avatar">${c.name.charAt(0).toUpperCase()}</div>
                <div class="contact-name">${c.name}</div>
                <div class="contact-email">${c.email}</div>
                <div>${c.phone || 'Sem telefone'}</div>
                <div style="margin-top:16px;">
                    <button class="btn btn-small btn-secondary" onclick="app.deleteContact(${i})">Excluir</button>
                </div>
            </div>
        `).join('') || '<p>Nenhum contato cadastrado</p>';

        document.getElementById('contactsList').innerHTML = html;
    }

    renderDeals() {
        const stages = ['prospecting', 'proposal', 'negotiation', 'closed'];
        stages.forEach(stage => {
            const deals = this.deals.filter(d => d.stage === stage);
            const html = deals.map((d, i) => `
                <div class="deal-card" draggable="true">
                    <strong>${d.name}</strong>
                    <div class="deal-value">R$ ${d.value.toLocaleString('pt-BR')}</div>
                    <div style="margin-top:8px;font-size:14px;color:#64748b;">${d.company}</div>
                </div>
            `).join('');
            document.querySelector(`[data-stage="${stage}"]`).innerHTML = html || '<p style="text-align:center;color:#64748b;">Vazio</p>';
        });
    }

    renderTasks() {
        const html = this.tasks.map((t, i) => `
            <div class="task-item">
                <div class="task-info">
                    <strong>${t.name}</strong>
                    <span>${t.description || 'Sem descrição'}</span>
                </div>
                <div>
                    ${!t.completed ? `
                        <button class="btn btn-small" onclick="app.completeTask(${i})">✓ Concluir</button>
                    ` : `
                        <span style="color:#10b981;font-weight:600;">✓ Concluída</span>
                    `}
                    <button class="btn btn-small btn-secondary" onclick="app.deleteTask(${i})">Excluir</button>
                </div>
            </div>
        `).join('') || '<p>Nenhuma tarefa cadastrada</p>';

        document.getElementById('tasksList').innerHTML = html;
    }

    showLeadModal() {
        document.getElementById('modalTitle').textContent = 'Adicionar Lead';
        document.getElementById('modalBody').innerHTML = `
            <div class="form-group">
                <label>Nome *</label>
                <input type="text" id="leadName" required>
            </div>
            <div class="form-group">
                <label>Email *</label>
                <input type="email" id="leadEmail" required>
            </div>
            <div class="form-group">
                <label>Telefone</label>
                <input type="tel" id="leadPhone">
            </div>
            <div class="form-group">
                <label>Status</label>
                <select id="leadStatus">
                    <option value="new">Novo</option>
                    <option value="contacted">Contatado</option>
                    <option value="qualified">Qualificado</option>
                </select>
            </div>
            <div class="form-group">
                <label>Fonte</label>
                <input type="text" id="leadSource" placeholder="Site, Indicação, etc.">
            </div>
        `;

        document.getElementById('saveBtn').onclick = () => this.saveLead();
        document.getElementById('modal').classList.add('show');
    }

    saveLead() {
        const name = document.getElementById('leadName').value.trim();
        const email = document.getElementById('leadEmail').value.trim();
        if (!name || !email) return alert('Preencha os campos obrigatórios');

        this.leads.push({
            name,
            email,
            phone: document.getElementById('leadPhone').value,
            status: document.getElementById('leadStatus').value,
            source: document.getElementById('leadSource').value,
            createdAt: new Date().toISOString()
        });

        this.save('leads');
        this.closeModal();
        this.renderLeads();
    }

    showContactModal() {
        document.getElementById('modalTitle').textContent = 'Adicionar Contato';
        document.getElementById('modalBody').innerHTML = `
            <div class="form-group">
                <label>Nome *</label>
                <input type="text" id="contactName" required>
            </div>
            <div class="form-group">
                <label>Email *</label>
                <input type="email" id="contactEmail" required>
            </div>
            <div class="form-group">
                <label>Telefone</label>
                <input type="tel" id="contactPhone">
            </div>
            <div class="form-group">
                <label>Empresa</label>
                <input type="text" id="contactCompany">
            </div>
        `;

        document.getElementById('saveBtn').onclick = () => this.saveContact();
        document.getElementById('modal').classList.add('show');
    }

    saveContact() {
        const name = document.getElementById('contactName').value.trim();
        const email = document.getElementById('contactEmail').value.trim();
        if (!name || !email) return alert('Preencha os campos obrigatórios');

        this.contacts.push({
            name,
            email,
            phone: document.getElementById('contactPhone').value,
            company: document.getElementById('contactCompany').value,
            createdAt: new Date().toISOString()
        });

        this.save('contacts');
        this.closeModal();
        this.renderContacts();
    }

    showDealModal() {
        document.getElementById('modalTitle').textContent = 'Adicionar Negócio';
        document.getElementById('modalBody').innerHTML = `
            <div class="form-group">
                <label>Nome do Negócio *</label>
                <input type="text" id="dealName" required>
            </div>
            <div class="form-group">
                <label>Valor (R$) *</label>
                <input type="number" id="dealValue" required>
            </div>
            <div class="form-group">
                <label>Empresa</label>
                <input type="text" id="dealCompany">
            </div>
            <div class="form-group">
                <label>Estágio</label>
                <select id="dealStage">
                    <option value="prospecting">Prospecção</option>
                    <option value="proposal">Proposta</option>
                    <option value="negotiation">Negociação</option>
                    <option value="closed">Fechado</option>
                </select>
            </div>
        `;

        document.getElementById('saveBtn').onclick = () => this.saveDeal();
        document.getElementById('modal').classList.add('show');
    }

    saveDeal() {
        const name = document.getElementById('dealName').value.trim();
        const value = parseFloat(document.getElementById('dealValue').value);
        if (!name || !value) return alert('Preencha os campos obrigatórios');

        this.deals.push({
            name,
            value,
            company: document.getElementById('dealCompany').value,
            stage: document.getElementById('dealStage').value,
            createdAt: new Date().toISOString()
        });

        this.save('deals');
        this.closeModal();
        this.renderDeals();
    }

    showTaskModal() {
        document.getElementById('modalTitle').textContent = 'Adicionar Tarefa';
        document.getElementById('modalBody').innerHTML = `
            <div class="form-group">
                <label>Nome da Tarefa *</label>
                <input type="text" id="taskName" required>
            </div>
            <div class="form-group">
                <label>Descrição</label>
                <textarea id="taskDescription" rows="3"></textarea>
            </div>
        `;

        document.getElementById('saveBtn').onclick = () => this.saveTask();
        document.getElementById('modal').classList.add('show');
    }

    saveTask() {
        const name = document.getElementById('taskName').value.trim();
        if (!name) return alert('Preencha o nome da tarefa');

        this.tasks.push({
            name,
            description: document.getElementById('taskDescription').value,
            completed: false,
            createdAt: new Date().toISOString()
        });

        this.save('tasks');
        this.closeModal();
        this.renderTasks();
    }

    convertLead(index) {
        const lead = this.leads[index];
        this.contacts.push({
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            company: '',
            createdAt: new Date().toISOString()
        });
        this.leads.splice(index, 1);
        this.save('leads');
        this.save('contacts');
        alert('Lead convertido em contato!');
        this.renderLeads();
    }

    deleteLead(i) {
        if (confirm('Excluir este lead?')) {
            this.leads.splice(i, 1);
            this.save('leads');
            this.renderLeads();
        }
    }

    deleteContact(i) {
        if (confirm('Excluir este contato?')) {
            this.contacts.splice(i, 1);
            this.save('contacts');
            this.renderContacts();
        }
    }

    deleteTask(i) {
        if (confirm('Excluir esta tarefa?')) {
            this.tasks.splice(i, 1);
            this.save('tasks');
            this.renderTasks();
        }
    }

    completeTask(i) {
        this.tasks[i].completed = true;
        this.tasks[i].completedAt = new Date().toISOString();
        this.save('tasks');
        this.renderTasks();
    }

    translateStatus(status) {
        const map = { new: 'Novo', contacted: 'Contatado', qualified: 'Qualificado' };
        return map[status] || status;
    }

    translateStage(stage) {
        const map = { prospecting: 'Prospecção', proposal: 'Proposta', negotiation: 'Negociação', closed: 'Fechado' };
        return map[stage] || stage;
    }

    closeModal() {
        document.getElementById('modal').classList.remove('show');
    }

    save(type) {
        localStorage.setItem(`crm_${type}`, JSON.stringify(this[type]));
        this.renderDashboard();
    }
}

const app = new CRMPro();
