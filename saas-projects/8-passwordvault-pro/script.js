class PasswordVaultPro {
    constructor() {
        this.masterPass = localStorage.getItem('masterPass') || null;
        this.passwords = JSON.parse(localStorage.getItem('passwords') || '[]');
        this.locked = true;
        this.init();
    }

    init() {
        document.getElementById('unlockBtn').onclick = () => this.unlock();
        document.getElementById('lockBtn').onclick = () => this.lock();
        document.getElementById('generateBtn').onclick = () => this.generatePassword();
        document.getElementById('addBtn').onclick = () => this.addPassword();
        document.getElementById('masterPassword').onkeypress = e => e.key === 'Enter' && this.unlock();
    }

    unlock() {
        const pass = document.getElementById('masterPassword').value;
        if (!this.masterPass) {
            this.masterPass = pass;
            localStorage.setItem('masterPass', pass);
        }
        if (pass === this.masterPass) {
            this.locked = false;
            document.getElementById('loginScreen').style.display = 'none';
            document.getElementById('vaultScreen').style.display = 'block';
            this.renderPasswords();
            this.generatePassword();
        } else {
            alert('Senha incorreta!');
        }
    }

    lock() {
        this.locked = true;
        document.getElementById('loginScreen').style.display = 'block';
        document.getElementById('vaultScreen').style.display = 'none';
        document.getElementById('masterPassword').value = '';
    }

    generatePassword() {
        const length = parseInt(document.getElementById('passLength').value);
        const upper = document.getElementById('useUppercase').checked;
        const lower = document.getElementById('useLowercase').checked;
        const numbers = document.getElementById('useNumbers').checked;
        const symbols = document.getElementById('useSymbols').checked;

        let chars = '';
        if (upper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (lower) chars += 'abcdefghijklmnopqrstuvwxyz';
        if (numbers) chars += '0123456789';
        if (symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

        let password = '';
        for (let i = 0; i < length; i++) {
            password += chars[Math.floor(Math.random() * chars.length)];
        }

        document.getElementById('generatedPassword').value = password;
        document.getElementById('password').value = password;
    }

    addPassword() {
        const site = document.getElementById('site').value.trim();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!site || !username || !password) return alert('Preencha todos os campos!');

        this.passwords.push({ site, username, password, date: new Date().toISOString() });
        localStorage.setItem('passwords', JSON.stringify(this.passwords));

        document.getElementById('site').value = '';
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';

        this.renderPasswords();
    }

    renderPasswords() {
        const html = this.passwords.map((p, i) => `
            <div class="password-item">
                <div class="password-info">
                    <strong>${p.site}</strong>
                    <span>${p.username}</span>
                </div>
                <div class="password-actions">
                    <button class="icon-btn" onclick="app.showPassword(${i})">👁️</button>
                    <button class="icon-btn" onclick="app.copyPassword(${i})">📋</button>
                    <button class="icon-btn" onclick="app.deletePassword(${i})">🗑️</button>
                </div>
            </div>
        `).join('') || '<p>Nenhuma senha salva</p>';
        document.getElementById('passwordsList').innerHTML = html;
    }

    showPassword(i) {
        alert(`Senha: ${this.passwords[i].password}`);
    }

    copyPassword(i) {
        navigator.clipboard.writeText(this.passwords[i].password);
        alert('Senha copiada!');
    }

    deletePassword(i) {
        if (confirm('Excluir esta senha?')) {
            this.passwords.splice(i, 1);
            localStorage.setItem('passwords', JSON.stringify(this.passwords));
            this.renderPasswords();
        }
    }
}

const app = new PasswordVaultPro();
