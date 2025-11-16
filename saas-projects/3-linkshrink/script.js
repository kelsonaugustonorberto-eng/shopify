// LinkShrink - Encurtador de URLs Profissional
class LinkShrink {
    constructor() {
        this.links = this.loadLinks();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderLinks();
        this.updateStats();
    }

    setupEventListeners() {
        // Shorten button
        document.getElementById('shortenBtn').addEventListener('click', () => this.shortenUrl());

        // Enter key on URL input
        document.getElementById('longUrl').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.shortenUrl();
        });

        // Custom alias checkbox
        document.getElementById('customAlias').addEventListener('change', (e) => {
            document.getElementById('customAliasInput').disabled = !e.target.checked;
            if (e.target.checked) {
                document.getElementById('customAliasInput').focus();
            }
        });

        // Copy button
        document.getElementById('copyBtn').addEventListener('click', () => this.copyToClipboard());

        // Download QR button
        document.getElementById('downloadQrBtn').addEventListener('click', () => this.downloadQRCode());

        // Search
        document.getElementById('searchInput').addEventListener('input', (e) => this.searchLinks(e.target.value));

        // Clear all
        document.getElementById('clearAllBtn').addEventListener('click', () => this.clearAll());

        // Export
        document.getElementById('exportBtn').addEventListener('click', () => this.exportData());
    }

    shortenUrl() {
        const longUrl = document.getElementById('longUrl').value.trim();

        if (!longUrl) {
            this.showError('Por favor, insira uma URL');
            return;
        }

        if (!this.isValidUrl(longUrl)) {
            this.showError('Por favor, insira uma URL válida');
            return;
        }

        const customAlias = document.getElementById('customAlias').checked
            ? document.getElementById('customAliasInput').value.trim()
            : null;

        // Check if custom alias already exists
        if (customAlias && this.links.some(link => link.alias === customAlias)) {
            this.showError('Este alias já está em uso. Escolha outro.');
            return;
        }

        const link = {
            id: Date.now(),
            longUrl: longUrl,
            alias: customAlias || this.generateAlias(),
            shortUrl: this.generateShortUrl(customAlias || this.generateAlias()),
            clicks: 0,
            createdAt: new Date().toISOString()
        };

        this.links.unshift(link);
        this.saveLinks();
        this.showResult(link);
        this.renderLinks();
        this.updateStats();

        // Clear form
        document.getElementById('longUrl').value = '';
        document.getElementById('customAliasInput').value = '';
        document.getElementById('customAlias').checked = false;
        document.getElementById('customAliasInput').disabled = true;
    }

    generateAlias() {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let alias = '';
        for (let i = 0; i < 6; i++) {
            alias += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return alias;
    }

    generateShortUrl(alias) {
        return `https://lnk.sh/${alias}`;
    }

    showResult(link) {
        const resultSection = document.getElementById('resultSection');
        const shortUrlDisplay = document.getElementById('shortUrlDisplay');

        shortUrlDisplay.value = link.shortUrl;
        resultSection.style.display = 'block';

        // Generate QR Code
        this.generateQRCode(link.shortUrl);

        // Scroll to result
        resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    generateQRCode(text) {
        const qrContainer = document.getElementById('qrCode');
        qrContainer.innerHTML = '';

        // Simple QR Code generation using a library-free approach
        // For production, you would use QRCode.js or similar
        const qrCanvas = document.createElement('canvas');
        const size = 200;
        qrCanvas.width = size;
        qrCanvas.height = size;
        const ctx = qrCanvas.getContext('2d');

        // Draw a simple placeholder pattern (in production, use a proper QR code library)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);
        ctx.fillStyle = '#000000';

        // Create a simple grid pattern as placeholder
        const gridSize = 10;
        const cellSize = size / gridSize;

        // Draw random pattern (this is just a placeholder - use QRCode.js in production)
        const hash = this.hashCode(text);
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                if ((hash + i * j) % 2 === 0) {
                    ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
                }
            }
        }

        qrContainer.appendChild(qrCanvas);
    }

    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash = hash & hash;
        }
        return Math.abs(hash);
    }

    copyToClipboard() {
        const shortUrl = document.getElementById('shortUrlDisplay');
        shortUrl.select();
        document.execCommand('copy');

        const copyBtn = document.getElementById('copyBtn');
        copyBtn.classList.add('copied');
        copyBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
            </svg>
        `;

        setTimeout(() => {
            copyBtn.classList.remove('copied');
            copyBtn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                </svg>
            `;
        }, 2000);
    }

    downloadQRCode() {
        const canvas = document.querySelector('#qrCode canvas');
        if (!canvas) return;

        const link = document.createElement('a');
        link.download = 'qrcode.png';
        link.href = canvas.toDataURL();
        link.click();
    }

    renderLinks(links = this.links) {
        const linksList = document.getElementById('linksList');

        if (links.length === 0) {
            linksList.innerHTML = `
                <div class="empty-state">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
                        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
                    </svg>
                    <h3>Nenhum link encontrado</h3>
                    <p>Tente uma busca diferente</p>
                </div>
            `;
            return;
        }

        linksList.innerHTML = links.map(link => this.createLinkCard(link)).join('');
    }

    createLinkCard(link) {
        const date = new Date(link.createdAt);
        const formattedDate = date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        return `
            <div class="link-card" data-id="${link.id}">
                <div class="link-card-header">
                    <div class="link-info">
                        <div class="link-short">${this.escapeHtml(link.shortUrl)}</div>
                        <div class="link-original">${this.escapeHtml(link.longUrl)}</div>
                    </div>
                    <div class="link-actions">
                        <button class="btn-icon" onclick="app.copyLink('${link.shortUrl}')" title="Copiar">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                            </svg>
                        </button>
                        <button class="btn-icon" onclick="app.incrementClick(${link.id})" title="Visitar">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                                <polyline points="15 3 21 3 21 9"/>
                                <line x1="10" y1="14" x2="21" y2="3"/>
                            </svg>
                        </button>
                        <button class="btn-icon delete" onclick="app.deleteLink(${link.id})" title="Excluir">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="link-stats">
                    <div class="link-stat">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                        <span class="link-stat-value">${link.clicks}</span> cliques
                    </div>
                    <div class="link-stat">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        ${formattedDate}
                    </div>
                </div>
            </div>
        `;
    }

    copyLink(url) {
        const tempInput = document.createElement('input');
        tempInput.value = url;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);

        // Show feedback
        alert('Link copiado!');
    }

    incrementClick(id) {
        const link = this.links.find(l => l.id === id);
        if (link) {
            link.clicks++;
            this.saveLinks();
            this.renderLinks();
            this.updateStats();

            // Simulate opening the link
            alert(`Redirecionando para: ${link.longUrl}`);
        }
    }

    deleteLink(id) {
        if (!confirm('Tem certeza que deseja excluir este link?')) return;

        this.links = this.links.filter(l => l.id !== id);
        this.saveLinks();
        this.renderLinks();
        this.updateStats();
    }

    searchLinks(query) {
        if (!query.trim()) {
            this.renderLinks();
            return;
        }

        const filtered = this.links.filter(link =>
            link.shortUrl.toLowerCase().includes(query.toLowerCase()) ||
            link.longUrl.toLowerCase().includes(query.toLowerCase()) ||
            link.alias.toLowerCase().includes(query.toLowerCase())
        );

        this.renderLinks(filtered);
    }

    clearAll() {
        if (!confirm('Tem certeza que deseja excluir todos os links? Esta ação não pode ser desfeita.')) return;

        this.links = [];
        this.saveLinks();
        this.renderLinks();
        this.updateStats();
    }

    exportData() {
        const data = {
            exportDate: new Date().toISOString(),
            links: this.links,
            stats: {
                total: this.links.length,
                totalClicks: this.links.reduce((sum, link) => sum + link.clicks, 0)
            }
        };

        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `linkshrink-export-${Date.now()}.json`;
        link.click();

        URL.revokeObjectURL(url);
    }

    updateStats() {
        document.getElementById('totalLinks').textContent = this.links.length;
        document.getElementById('totalClicks').textContent =
            this.links.reduce((sum, link) => sum + link.clicks, 0);
    }

    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    showError(message) {
        alert(message);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveLinks() {
        localStorage.setItem('linkshrink_links', JSON.stringify(this.links));
    }

    loadLinks() {
        const saved = localStorage.getItem('linkshrink_links');
        return saved ? JSON.parse(saved) : [];
    }
}

// Initialize app
const app = new LinkShrink();
