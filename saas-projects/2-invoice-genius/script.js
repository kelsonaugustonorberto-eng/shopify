// InvoiceGenius - Gerador de Faturas Profissionais
class InvoiceGenius {
    constructor() {
        this.items = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setDefaultDate();
        this.addItem(); // Add one default item
        this.loadSavedData();
    }

    setupEventListeners() {
        // Company info
        document.getElementById('companyName').addEventListener('input', () => this.updatePreview());
        document.getElementById('companyCnpj').addEventListener('input', () => this.updatePreview());
        document.getElementById('companyPhone').addEventListener('input', () => this.updatePreview());
        document.getElementById('companyAddress').addEventListener('input', () => this.updatePreview());
        document.getElementById('companyCity').addEventListener('input', () => this.updatePreview());
        document.getElementById('companyEmail').addEventListener('input', () => this.updatePreview());

        // Client info
        document.getElementById('clientName').addEventListener('input', () => this.updatePreview());
        document.getElementById('clientCnpj').addEventListener('input', () => this.updatePreview());
        document.getElementById('clientPhone').addEventListener('input', () => this.updatePreview());
        document.getElementById('clientAddress').addEventListener('input', () => this.updatePreview());
        document.getElementById('clientEmail').addEventListener('input', () => this.updatePreview());

        // Invoice details
        document.getElementById('invoiceNumber').addEventListener('input', () => this.updatePreview());
        document.getElementById('invoiceDate').addEventListener('input', () => this.updatePreview());
        document.getElementById('dueDate').addEventListener('input', () => this.updatePreview());

        // Notes
        document.getElementById('notes').addEventListener('input', () => this.updatePreview());

        // Discount
        document.getElementById('discount').addEventListener('input', () => this.calculateTotal());

        // Buttons
        document.getElementById('addItemBtn').addEventListener('click', () => this.addItem());
        document.getElementById('clearFormBtn').addEventListener('click', () => this.clearForm());
        document.getElementById('generatePdfBtn').addEventListener('click', () => this.generatePDF());

        // Auto-save
        setInterval(() => this.saveData(), 5000);
    }

    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('invoiceDate').value = today;

        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);
        document.getElementById('dueDate').value = dueDate.toISOString().split('T')[0];

        // Set default invoice number
        document.getElementById('invoiceNumber').value = '#' + String(Date.now()).slice(-6);
    }

    addItem() {
        const itemId = Date.now();
        const itemRow = document.createElement('div');
        itemRow.className = 'item-row';
        itemRow.dataset.id = itemId;

        itemRow.innerHTML = `
            <input type="text" placeholder="Descrição do item" class="item-description" data-id="${itemId}">
            <input type="number" placeholder="Qtd" min="1" value="1" class="item-quantity" data-id="${itemId}">
            <input type="number" placeholder="R$ 0,00" min="0" step="0.01" value="0" class="item-price" data-id="${itemId}">
            <input type="text" placeholder="R$ 0,00" class="item-total" data-id="${itemId}" readonly>
            <button class="btn-remove" onclick="app.removeItem(${itemId})">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        `;

        document.getElementById('itemsList').appendChild(itemRow);

        // Add event listeners for the new item
        itemRow.querySelector('.item-description').addEventListener('input', () => this.calculateTotal());
        itemRow.querySelector('.item-quantity').addEventListener('input', () => this.updateItemTotal(itemId));
        itemRow.querySelector('.item-price').addEventListener('input', () => this.updateItemTotal(itemId));

        this.items.push({ id: itemId, description: '', quantity: 1, price: 0 });
        this.calculateTotal();
    }

    removeItem(itemId) {
        const itemRow = document.querySelector(`[data-id="${itemId}"]`);
        if (itemRow) {
            itemRow.remove();
            this.items = this.items.filter(item => item.id !== itemId);
            this.calculateTotal();
        }
    }

    updateItemTotal(itemId) {
        const quantity = parseFloat(document.querySelector(`.item-quantity[data-id="${itemId}"]`).value) || 0;
        const price = parseFloat(document.querySelector(`.item-price[data-id="${itemId}"]`).value) || 0;
        const total = quantity * price;

        document.querySelector(`.item-total[data-id="${itemId}"]`).value = this.formatCurrency(total);

        // Update item in array
        const item = this.items.find(i => i.id === itemId);
        if (item) {
            item.quantity = quantity;
            item.price = price;
            item.description = document.querySelector(`.item-description[data-id="${itemId}"]`).value;
        }

        this.calculateTotal();
    }

    calculateTotal() {
        let subtotal = 0;

        this.items.forEach(item => {
            const quantity = parseFloat(document.querySelector(`.item-quantity[data-id="${item.id}"]`)?.value) || 0;
            const price = parseFloat(document.querySelector(`.item-price[data-id="${item.id}"]`)?.value) || 0;
            subtotal += quantity * price;
        });

        const discount = parseFloat(document.getElementById('discount').value) || 0;
        const discountAmount = (subtotal * discount) / 100;
        const total = subtotal - discountAmount;

        document.getElementById('subtotal').textContent = this.formatCurrency(subtotal);
        document.getElementById('total').textContent = this.formatCurrency(total);

        this.updatePreview();
    }

    updatePreview() {
        // Company info
        document.getElementById('previewCompanyName').textContent =
            document.getElementById('companyName').value || 'Sua Empresa';
        document.getElementById('previewCompanyCnpj').textContent =
            'CNPJ: ' + (document.getElementById('companyCnpj').value || '-');
        document.getElementById('previewCompanyAddress').textContent =
            'Endereço: ' + (document.getElementById('companyAddress').value || '-');
        document.getElementById('previewCompanyCity').textContent =
            'Cidade: ' + (document.getElementById('companyCity').value || '-');
        document.getElementById('previewCompanyPhone').textContent =
            'Tel: ' + (document.getElementById('companyPhone').value || '-');
        document.getElementById('previewCompanyEmail').textContent =
            'Email: ' + (document.getElementById('companyEmail').value || '-');

        // Client info
        document.getElementById('previewClientName').textContent =
            document.getElementById('clientName').value || '-';
        document.getElementById('previewClientCnpj').textContent =
            'CNPJ/CPF: ' + (document.getElementById('clientCnpj').value || '-');
        document.getElementById('previewClientAddress').textContent =
            document.getElementById('clientAddress').value || '-';
        document.getElementById('previewClientPhone').textContent =
            'Tel: ' + (document.getElementById('clientPhone').value || '-');
        document.getElementById('previewClientEmail').textContent =
            document.getElementById('clientEmail').value || '-';

        // Invoice details
        document.getElementById('previewInvoiceNumber').textContent =
            document.getElementById('invoiceNumber').value || '-';
        document.getElementById('previewInvoiceDate').textContent =
            this.formatDate(document.getElementById('invoiceDate').value);
        document.getElementById('previewDueDate').textContent =
            this.formatDate(document.getElementById('dueDate').value);

        // Items
        this.updatePreviewItems();

        // Totals
        document.getElementById('previewSubtotal').textContent = document.getElementById('subtotal').textContent;
        document.getElementById('previewDiscount').textContent =
            document.getElementById('discount').value + '%';
        document.getElementById('previewTotal').textContent = document.getElementById('total').textContent;

        // Notes
        const notes = document.getElementById('notes').value;
        const notesSection = document.getElementById('previewNotesSection');
        if (notes.trim()) {
            notesSection.style.display = 'block';
            document.getElementById('previewNotes').textContent = notes;
        } else {
            notesSection.style.display = 'none';
        }
    }

    updatePreviewItems() {
        const previewItems = document.getElementById('previewItems');
        previewItems.innerHTML = '';

        if (this.items.length === 0) {
            previewItems.innerHTML = '<tr><td colspan="4" class="empty-state">Nenhum item adicionado</td></tr>';
            return;
        }

        this.items.forEach(item => {
            const description = document.querySelector(`.item-description[data-id="${item.id}"]`)?.value || '-';
            const quantity = parseFloat(document.querySelector(`.item-quantity[data-id="${item.id}"]`)?.value) || 0;
            const price = parseFloat(document.querySelector(`.item-price[data-id="${item.id}"]`)?.value) || 0;
            const total = quantity * price;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${this.escapeHtml(description)}</td>
                <td>${quantity}</td>
                <td>${this.formatCurrency(price)}</td>
                <td>${this.formatCurrency(total)}</td>
            `;
            previewItems.appendChild(row);
        });
    }

    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('pt-BR');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    generatePDF() {
        window.print();
    }

    clearForm() {
        if (!confirm('Tem certeza que deseja limpar o formulário? Esta ação não pode ser desfeita.')) return;

        // Clear all inputs
        document.querySelectorAll('input, textarea').forEach(input => {
            if (input.type !== 'button') {
                input.value = '';
            }
        });

        // Reset items
        this.items = [];
        document.getElementById('itemsList').innerHTML = '';
        this.addItem();

        // Reset dates
        this.setDefaultDate();

        // Reset discount
        document.getElementById('discount').value = 0;

        // Clear saved data
        localStorage.removeItem('invoice_data');

        this.updatePreview();
    }

    saveData() {
        const data = {
            company: {
                name: document.getElementById('companyName').value,
                cnpj: document.getElementById('companyCnpj').value,
                phone: document.getElementById('companyPhone').value,
                address: document.getElementById('companyAddress').value,
                city: document.getElementById('companyCity').value,
                email: document.getElementById('companyEmail').value
            },
            client: {
                name: document.getElementById('clientName').value,
                cnpj: document.getElementById('clientCnpj').value,
                phone: document.getElementById('clientPhone').value,
                address: document.getElementById('clientAddress').value,
                email: document.getElementById('clientEmail').value
            },
            invoice: {
                number: document.getElementById('invoiceNumber').value,
                date: document.getElementById('invoiceDate').value,
                dueDate: document.getElementById('dueDate').value,
                discount: document.getElementById('discount').value,
                notes: document.getElementById('notes').value
            },
            items: this.items.map(item => ({
                id: item.id,
                description: document.querySelector(`.item-description[data-id="${item.id}"]`)?.value || '',
                quantity: parseFloat(document.querySelector(`.item-quantity[data-id="${item.id}"]`)?.value) || 0,
                price: parseFloat(document.querySelector(`.item-price[data-id="${item.id}"]`)?.value) || 0
            }))
        };

        localStorage.setItem('invoice_data', JSON.stringify(data));
    }

    loadSavedData() {
        const saved = localStorage.getItem('invoice_data');
        if (!saved) return;

        try {
            const data = JSON.parse(saved);

            // Load company data
            if (data.company) {
                document.getElementById('companyName').value = data.company.name || '';
                document.getElementById('companyCnpj').value = data.company.cnpj || '';
                document.getElementById('companyPhone').value = data.company.phone || '';
                document.getElementById('companyAddress').value = data.company.address || '';
                document.getElementById('companyCity').value = data.company.city || '';
                document.getElementById('companyEmail').value = data.company.email || '';
            }

            this.updatePreview();
        } catch (error) {
            console.error('Error loading saved data:', error);
        }
    }
}

// Initialize app
const app = new InvoiceGenius();
