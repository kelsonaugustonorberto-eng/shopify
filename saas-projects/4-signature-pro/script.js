// SignaturePro - Gerador de Assinaturas de Email
class SignaturePro {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSavedData();
        this.updatePreview();
    }

    setupEventListeners() {
        // Input events
        const inputs = document.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.updatePreview();
                this.saveData();
            });
        });

        // Logo checkbox
        document.getElementById('includeLogo').addEventListener('change', (e) => {
            document.getElementById('logoUrlGroup').style.display = e.target.checked ? 'block' : 'none';
            this.updatePreview();
        });

        // Buttons
        document.getElementById('copyBtn').addEventListener('click', () => this.copyHTML());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearForm());
        document.getElementById('refreshPreviewBtn').addEventListener('click', () => this.updatePreview());
    }

    updatePreview() {
        const data = this.getFormData();
        const html = this.generateSignatureHTML(data);
        document.getElementById('signaturePreview').innerHTML = html;
    }

    getFormData() {
        return {
            fullName: document.getElementById('fullName').value,
            jobTitle: document.getElementById('jobTitle').value,
            company: document.getElementById('company').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            website: document.getElementById('website').value,
            address: document.getElementById('address').value,
            linkedin: document.getElementById('linkedin').value,
            twitter: document.getElementById('twitter').value,
            instagram: document.getElementById('instagram').value,
            facebook: document.getElementById('facebook').value,
            style: document.getElementById('style').value,
            primaryColor: document.getElementById('primaryColor').value,
            includeLogo: document.getElementById('includeLogo').checked,
            logoUrl: document.getElementById('logoUrl').value
        };
    }

    generateSignatureHTML(data) {
        const styleClass = `signature-${data.style}`;
        const color = data.primaryColor;

        let html = `<div class="${styleClass}" style="--sig-color: ${color};">`;

        // Logo
        if (data.includeLogo && data.logoUrl) {
            html += `<img src="${this.escapeHtml(data.logoUrl)}" alt="Logo" class="sig-logo">`;
        }

        // Name
        if (data.fullName) {
            html += `<div class="sig-name">${this.escapeHtml(data.fullName)}</div>`;
        }

        // Job Title
        if (data.jobTitle) {
            html += `<div class="sig-title">${this.escapeHtml(data.jobTitle)}</div>`;
        }

        // Company
        if (data.company) {
            html += `<div class="sig-company">${this.escapeHtml(data.company)}</div>`;
        }

        // Divider
        if (data.fullName || data.jobTitle || data.company) {
            html += `<div class="sig-divider"></div>`;
        }

        // Contact info
        const hasContact = data.email || data.phone || data.website || data.address;
        if (hasContact) {
            html += `<div class="sig-contact">`;

            if (data.email) {
                html += `
                    <div class="sig-contact-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                            <polyline points="22,6 12,13 2,6"/>
                        </svg>
                        <a href="mailto:${this.escapeHtml(data.email)}">${this.escapeHtml(data.email)}</a>
                    </div>
                `;
            }

            if (data.phone) {
                html += `
                    <div class="sig-contact-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
                        </svg>
                        <a href="tel:${this.escapeHtml(data.phone)}">${this.escapeHtml(data.phone)}</a>
                    </div>
                `;
            }

            if (data.website) {
                html += `
                    <div class="sig-contact-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="2" y1="12" x2="22" y2="12"/>
                            <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
                        </svg>
                        <a href="${this.formatUrl(data.website)}" target="_blank">${this.escapeHtml(data.website)}</a>
                    </div>
                `;
            }

            if (data.address) {
                html += `
                    <div class="sig-contact-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                        </svg>
                        <span>${this.escapeHtml(data.address)}</span>
                    </div>
                `;
            }

            html += `</div>`;
        }

        // Social media
        const hasSocial = data.linkedin || data.twitter || data.instagram || data.facebook;
        if (hasSocial) {
            html += `<div class="sig-social">`;

            if (data.linkedin) {
                html += `
                    <a href="${this.formatUrl(data.linkedin)}" target="_blank" title="LinkedIn">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                        </svg>
                    </a>
                `;
            }

            if (data.twitter) {
                html += `
                    <a href="${this.formatUrl(data.twitter)}" target="_blank" title="Twitter">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                        </svg>
                    </a>
                `;
            }

            if (data.instagram) {
                html += `
                    <a href="${this.formatUrl(data.instagram)}" target="_blank" title="Instagram">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                            <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" fill="none" stroke="white" stroke-width="2"/>
                            <circle cx="17.5" cy="6.5" r="1.5" fill="white"/>
                        </svg>
                    </a>
                `;
            }

            if (data.facebook) {
                html += `
                    <a href="${this.formatUrl(data.facebook)}" target="_blank" title="Facebook">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                    </a>
                `;
            }

            html += `</div>`;
        }

        html += `</div>`;

        return html;
    }

    generateCleanHTML(data) {
        // Generate HTML without CSS classes for email compatibility
        const color = data.primaryColor;
        let baseStyles = 'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 20px;';

        switch (data.style) {
            case 'classic':
                baseStyles += ` border-top: 2px solid ${color}; border-bottom: 2px solid ${color};`;
                break;
            case 'modern':
                baseStyles += ` border-left: 4px solid ${color};`;
                break;
            case 'colorful':
                baseStyles += ` background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%); border-radius: 12px;`;
                break;
        }

        let html = `<div style="${baseStyles}">`;

        // Logo
        if (data.includeLogo && data.logoUrl) {
            html += `<img src="${this.escapeHtml(data.logoUrl)}" alt="Logo" style="max-width: 150px; max-height: 60px; margin-bottom: 12px;">`;
        }

        // Name
        if (data.fullName) {
            html += `<div style="font-size: 20px; font-weight: 700; margin-bottom: 4px; color: ${color};">${this.escapeHtml(data.fullName)}</div>`;
        }

        // Job Title
        if (data.jobTitle) {
            html += `<div style="font-size: 15px; color: #64748b; margin-bottom: 2px;">${this.escapeHtml(data.jobTitle)}</div>`;
        }

        // Company
        if (data.company) {
            html += `<div style="font-size: 15px; font-weight: 600; color: #0f172a; margin-bottom: 12px;">${this.escapeHtml(data.company)}</div>`;
        }

        // Divider
        if (data.fullName || data.jobTitle || data.company) {
            html += `<div style="width: 60px; height: 2px; background: ${color}; margin: 12px 0;"></div>`;
        }

        // Contact info
        if (data.email) {
            html += `<div style="font-size: 13px; color: #64748b; margin: 6px 0;">✉ <a href="mailto:${this.escapeHtml(data.email)}" style="color: #64748b; text-decoration: none;">${this.escapeHtml(data.email)}</a></div>`;
        }

        if (data.phone) {
            html += `<div style="font-size: 13px; color: #64748b; margin: 6px 0;">📞 <a href="tel:${this.escapeHtml(data.phone)}" style="color: #64748b; text-decoration: none;">${this.escapeHtml(data.phone)}</a></div>`;
        }

        if (data.website) {
            html += `<div style="font-size: 13px; color: #64748b; margin: 6px 0;">🌐 <a href="${this.formatUrl(data.website)}" style="color: #64748b; text-decoration: none;">${this.escapeHtml(data.website)}</a></div>`;
        }

        if (data.address) {
            html += `<div style="font-size: 13px; color: #64748b; margin: 6px 0;">📍 ${this.escapeHtml(data.address)}</div>`;
        }

        // Social media (simplified)
        const socials = [];
        if (data.linkedin) socials.push(`<a href="${this.formatUrl(data.linkedin)}" style="margin-right: 10px; text-decoration: none;">LinkedIn</a>`);
        if (data.twitter) socials.push(`<a href="${this.formatUrl(data.twitter)}" style="margin-right: 10px; text-decoration: none;">Twitter</a>`);
        if (data.instagram) socials.push(`<a href="${this.formatUrl(data.instagram)}" style="margin-right: 10px; text-decoration: none;">Instagram</a>`);
        if (data.facebook) socials.push(`<a href="${this.formatUrl(data.facebook)}" style="margin-right: 10px; text-decoration: none;">Facebook</a>`);

        if (socials.length > 0) {
            html += `<div style="margin-top: 12px; font-size: 13px;">${socials.join(' | ')}</div>`;
        }

        html += `</div>`;

        return html;
    }

    copyHTML() {
        const data = this.getFormData();
        const html = this.generateCleanHTML(data);

        const tempTextarea = document.createElement('textarea');
        tempTextarea.value = html;
        tempTextarea.style.position = 'fixed';
        tempTextarea.style.opacity = '0';
        document.body.appendChild(tempTextarea);
        tempTextarea.select();

        try {
            document.execCommand('copy');
            this.showSuccess('HTML copiado! Cole nas configurações do seu email.');
        } catch (err) {
            this.showError('Erro ao copiar. Tente novamente.');
        }

        document.body.removeChild(tempTextarea);
    }

    clearForm() {
        if (!confirm('Tem certeza que deseja limpar o formulário?')) return;

        document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[type="url"]').forEach(input => {
            input.value = '';
        });

        document.getElementById('style').value = 'modern';
        document.getElementById('primaryColor').value = '#3b82f6';
        document.getElementById('includeLogo').checked = false;
        document.getElementById('logoUrlGroup').style.display = 'none';

        localStorage.removeItem('signature_data');
        this.updatePreview();
    }

    saveData() {
        const data = this.getFormData();
        localStorage.setItem('signature_data', JSON.stringify(data));
    }

    loadSavedData() {
        const saved = localStorage.getItem('signature_data');
        if (!saved) return;

        try {
            const data = JSON.parse(saved);

            document.getElementById('fullName').value = data.fullName || '';
            document.getElementById('jobTitle').value = data.jobTitle || '';
            document.getElementById('company').value = data.company || '';
            document.getElementById('email').value = data.email || '';
            document.getElementById('phone').value = data.phone || '';
            document.getElementById('website').value = data.website || '';
            document.getElementById('address').value = data.address || '';
            document.getElementById('linkedin').value = data.linkedin || '';
            document.getElementById('twitter').value = data.twitter || '';
            document.getElementById('instagram').value = data.instagram || '';
            document.getElementById('facebook').value = data.facebook || '';
            document.getElementById('style').value = data.style || 'modern';
            document.getElementById('primaryColor').value = data.primaryColor || '#3b82f6';

            if (data.includeLogo) {
                document.getElementById('includeLogo').checked = true;
                document.getElementById('logoUrlGroup').style.display = 'block';
                document.getElementById('logoUrl').value = data.logoUrl || '';
            }
        } catch (error) {
            console.error('Error loading saved data:', error);
        }
    }

    formatUrl(url) {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        return 'https://' + url;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showSuccess(message) {
        alert(message);
    }

    showError(message) {
        alert(message);
    }
}

// Initialize app
const app = new SignaturePro();
