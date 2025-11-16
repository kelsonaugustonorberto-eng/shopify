// FormCraft - Construtor de Formulários
class FormCraft {
    constructor() {
        this.fields = [];
        this.fieldCounter = 0;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updatePreview();
    }

    setupEventListeners() {
        // Field buttons
        document.querySelectorAll('.field-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.dataset.type;
                this.addField(type);
            });
        });

        // Form settings
        document.getElementById('formTitle').addEventListener('input', () => this.updatePreview());
        document.getElementById('formDescription').addEventListener('input', () => this.updatePreview());
        document.getElementById('submitButtonText').addEventListener('input', () => this.updatePreview());
        document.getElementById('showLabels').addEventListener('change', () => this.updatePreview());
        document.getElementById('requiredFields').addEventListener('change', () => this.updatePreview());

        // Buttons
        document.getElementById('clearFormBtn').addEventListener('click', () => this.clearForm());
        document.getElementById('exportCodeBtn').addEventListener('click', () => this.exportCode());
        document.getElementById('testFormBtn').addEventListener('click', () => this.testForm());

        // Modal
        document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
        document.getElementById('closeModalBtn').addEventListener('click', () => this.closeModal());
        document.getElementById('copyCodeBtn').addEventListener('click', () => this.copyCode());

        // Close modal on outside click
        document.getElementById('exportModal').addEventListener('click', (e) => {
            if (e.target.id === 'exportModal') {
                this.closeModal();
            }
        });
    }

    addField(type) {
        const field = {
            id: ++this.fieldCounter,
            type: type,
            label: this.getDefaultLabel(type),
            placeholder: this.getDefaultPlaceholder(type),
            required: document.getElementById('requiredFields').checked,
            options: type === 'select' || type === 'radio' ? 'Opção 1\nOpção 2\nOpção 3' : ''
        };

        this.fields.push(field);
        this.renderFields();
        this.updatePreview();
        this.updateFieldCount();
    }

    getDefaultLabel(type) {
        const labels = {
            text: 'Campo de Texto',
            email: 'Email',
            tel: 'Telefone',
            number: 'Número',
            textarea: 'Mensagem',
            select: 'Selecione uma opção',
            checkbox: 'Aceito os termos',
            radio: 'Escolha uma opção',
            date: 'Data'
        };
        return labels[type] || 'Campo';
    }

    getDefaultPlaceholder(type) {
        const placeholders = {
            text: 'Digite aqui...',
            email: 'seu@email.com',
            tel: '(00) 00000-0000',
            number: '0',
            textarea: 'Digite sua mensagem...',
            date: ''
        };
        return placeholders[type] || '';
    }

    renderFields() {
        const builder = document.getElementById('formBuilder');

        if (this.fields.length === 0) {
            builder.innerHTML = `
                <div class="empty-state">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    <h3>Comece adicionando campos</h3>
                    <p>Clique nos botões à esquerda para adicionar campos ao formulário</p>
                </div>
            `;
            return;
        }

        builder.innerHTML = this.fields.map(field => this.renderFieldConfig(field)).join('');

        // Add event listeners to field inputs
        this.fields.forEach(field => {
            const labelInput = document.getElementById(`label-${field.id}`);
            const placeholderInput = document.getElementById(`placeholder-${field.id}`);
            const requiredInput = document.getElementById(`required-${field.id}`);
            const optionsInput = document.getElementById(`options-${field.id}`);

            if (labelInput) {
                labelInput.addEventListener('input', (e) => {
                    field.label = e.target.value;
                    this.updatePreview();
                });
            }

            if (placeholderInput) {
                placeholderInput.addEventListener('input', (e) => {
                    field.placeholder = e.target.value;
                    this.updatePreview();
                });
            }

            if (requiredInput) {
                requiredInput.addEventListener('change', (e) => {
                    field.required = e.target.checked;
                    this.updatePreview();
                });
            }

            if (optionsInput) {
                optionsInput.addEventListener('input', (e) => {
                    field.options = e.target.value;
                    this.updatePreview();
                });
            }
        });
    }

    renderFieldConfig(field) {
        const hasOptions = field.type === 'select' || field.type === 'radio';
        const hasPlaceholder = !['checkbox', 'radio', 'select'].includes(field.type);

        return `
            <div class="form-field" data-id="${field.id}">
                <div class="field-header">
                    <span class="field-type-badge">${field.type}</span>
                    <div class="field-actions">
                        <button class="btn-icon delete" onclick="app.deleteField(${field.id})" title="Excluir">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="field-config">
                    <div class="config-row">
                        <label>Label:</label>
                        <input type="text" id="label-${field.id}" value="${this.escapeHtml(field.label)}">
                    </div>
                    ${hasPlaceholder ? `
                        <div class="config-row">
                            <label>Placeholder:</label>
                            <input type="text" id="placeholder-${field.id}" value="${this.escapeHtml(field.placeholder)}">
                        </div>
                    ` : ''}
                    ${hasOptions ? `
                        <div class="config-row">
                            <label>Opções:</label>
                            <textarea id="options-${field.id}" rows="3" placeholder="Uma opção por linha">${this.escapeHtml(field.options)}</textarea>
                        </div>
                    ` : ''}
                    <div class="config-row">
                        <label>Obrigatório:</label>
                        <input type="checkbox" id="required-${field.id}" ${field.required ? 'checked' : ''}>
                    </div>
                </div>
            </div>
        `;
    }

    deleteField(id) {
        this.fields = this.fields.filter(f => f.id !== id);
        this.renderFields();
        this.updatePreview();
        this.updateFieldCount();
    }

    updatePreview() {
        const formTitle = document.getElementById('formTitle').value || 'Meu Formulário';
        const formDescription = document.getElementById('formDescription').value;
        const submitButtonText = document.getElementById('submitButtonText').value || 'Enviar';
        const showLabels = document.getElementById('showLabels').checked;

        document.getElementById('previewTitle').textContent = formTitle;
        document.getElementById('previewDescription').textContent = formDescription;
        document.getElementById('previewDescription').style.display = formDescription ? 'block' : 'none';
        document.getElementById('previewSubmit').textContent = submitButtonText;

        const previewFields = document.getElementById('previewFields');
        previewFields.innerHTML = this.fields.map(field => this.renderPreviewField(field, showLabels)).join('');
    }

    renderPreviewField(field, showLabels) {
        const required = field.required ? 'required' : '';
        const requiredMark = field.required ? ' *' : '';

        switch (field.type) {
            case 'textarea':
                return `
                    <div class="preview-field">
                        ${showLabels ? `<label>${this.escapeHtml(field.label)}${requiredMark}</label>` : ''}
                        <textarea placeholder="${this.escapeHtml(field.placeholder)}" ${required}></textarea>
                    </div>
                `;

            case 'select':
                const options = field.options.split('\n').filter(o => o.trim());
                return `
                    <div class="preview-field">
                        ${showLabels ? `<label>${this.escapeHtml(field.label)}${requiredMark}</label>` : ''}
                        <select ${required}>
                            <option value="">Selecione...</option>
                            ${options.map(opt => `<option value="${this.escapeHtml(opt)}">${this.escapeHtml(opt)}</option>`).join('')}
                        </select>
                    </div>
                `;

            case 'checkbox':
                return `
                    <div class="preview-field">
                        <div class="preview-checkbox">
                            <input type="checkbox" ${required}>
                            ${showLabels ? `<label>${this.escapeHtml(field.label)}${requiredMark}</label>` : ''}
                        </div>
                    </div>
                `;

            case 'radio':
                const radioOptions = field.options.split('\n').filter(o => o.trim());
                return `
                    <div class="preview-field">
                        ${showLabels ? `<label>${this.escapeHtml(field.label)}${requiredMark}</label>` : ''}
                        ${radioOptions.map((opt, idx) => `
                            <div class="preview-radio">
                                <input type="radio" name="radio-${field.id}" value="${this.escapeHtml(opt)}" ${required && idx === 0 ? required : ''}>
                                <label>${this.escapeHtml(opt)}</label>
                            </div>
                        `).join('')}
                    </div>
                `;

            default:
                return `
                    <div class="preview-field">
                        ${showLabels ? `<label>${this.escapeHtml(field.label)}${requiredMark}</label>` : ''}
                        <input type="${field.type}" placeholder="${this.escapeHtml(field.placeholder)}" ${required}>
                    </div>
                `;
        }
    }

    updateFieldCount() {
        document.getElementById('fieldCount').textContent = this.fields.length;
    }

    clearForm() {
        if (!confirm('Tem certeza que deseja limpar o formulário? Esta ação não pode ser desfeita.')) return;

        this.fields = [];
        this.fieldCounter = 0;
        document.getElementById('formTitle').value = '';
        document.getElementById('formDescription').value = '';
        document.getElementById('submitButtonText').value = 'Enviar';
        document.getElementById('showLabels').checked = true;
        document.getElementById('requiredFields').checked = false;

        this.renderFields();
        this.updatePreview();
        this.updateFieldCount();
    }

    exportCode() {
        const html = this.generateHTML();
        document.getElementById('exportCode').value = html;
        document.getElementById('exportModal').classList.add('show');
    }

    generateHTML() {
        const formTitle = document.getElementById('formTitle').value || 'Meu Formulário';
        const formDescription = document.getElementById('formDescription').value;
        const submitButtonText = document.getElementById('submitButtonText').value || 'Enviar';
        const showLabels = document.getElementById('showLabels').checked;

        let html = `<form class="custom-form" method="post" action="#">\n`;
        html += `  <h2>${this.escapeHtml(formTitle)}</h2>\n`;

        if (formDescription) {
            html += `  <p class="form-description">${this.escapeHtml(formDescription)}</p>\n`;
        }

        this.fields.forEach(field => {
            html += this.generateFieldHTML(field, showLabels);
        });

        html += `  <button type="submit">${this.escapeHtml(submitButtonText)}</button>\n`;
        html += `</form>`;

        return html;
    }

    generateFieldHTML(field, showLabels) {
        const required = field.required ? ' required' : '';
        const requiredMark = field.required ? ' *' : '';

        switch (field.type) {
            case 'textarea':
                return `
  <div class="form-field">
    ${showLabels ? `<label>${this.escapeHtml(field.label)}${requiredMark}</label>` : ''}
    <textarea name="${this.slugify(field.label)}" placeholder="${this.escapeHtml(field.placeholder)}"${required}></textarea>
  </div>\n`;

            case 'select':
                const options = field.options.split('\n').filter(o => o.trim());
                return `
  <div class="form-field">
    ${showLabels ? `<label>${this.escapeHtml(field.label)}${requiredMark}</label>` : ''}
    <select name="${this.slugify(field.label)}"${required}>
      <option value="">Selecione...</option>
${options.map(opt => `      <option value="${this.escapeHtml(opt)}">${this.escapeHtml(opt)}</option>`).join('\n')}
    </select>
  </div>\n`;

            case 'checkbox':
                return `
  <div class="form-field">
    <label>
      <input type="checkbox" name="${this.slugify(field.label)}"${required}>
      ${this.escapeHtml(field.label)}${requiredMark}
    </label>
  </div>\n`;

            case 'radio':
                const radioOptions = field.options.split('\n').filter(o => o.trim());
                return `
  <div class="form-field">
    ${showLabels ? `<label>${this.escapeHtml(field.label)}${requiredMark}</label>` : ''}
${radioOptions.map(opt => `    <label><input type="radio" name="${this.slugify(field.label)}" value="${this.escapeHtml(opt)}"${required}> ${this.escapeHtml(opt)}</label>`).join('\n')}
  </div>\n`;

            default:
                return `
  <div class="form-field">
    ${showLabels ? `<label>${this.escapeHtml(field.label)}${requiredMark}</label>` : ''}
    <input type="${field.type}" name="${this.slugify(field.label)}" placeholder="${this.escapeHtml(field.placeholder)}"${required}>
  </div>\n`;
        }
    }

    testForm() {
        alert('Esta é uma demonstração. Em produção, o formulário seria enviado para o servidor.');
    }

    closeModal() {
        document.getElementById('exportModal').classList.remove('show');
    }

    copyCode() {
        const code = document.getElementById('exportCode');
        code.select();
        document.execCommand('copy');
        alert('Código HTML copiado para a área de transferência!');
    }

    slugify(text) {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/(^_|_$)/g, '');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize app
const app = new FormCraft();
