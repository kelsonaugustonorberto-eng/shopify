class ColorPaletteStudio {
    constructor() {
        this.currentPalette = [];
        this.mode = 'random';
        this.savedPalettes = JSON.parse(localStorage.getItem('palettes')) || [];
        this.init();
    }

    init() {
        this.generatePalette();
        this.renderSaved();
        document.getElementById('generateBtn').onclick = () => this.generatePalette();
        document.getElementById('exportBtn').onclick = () => this.exportPalette();
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.mode = btn.dataset.mode;
                this.generatePalette();
            };
        });
    }

    generatePalette() {
        const baseHue = Math.random() * 360;
        this.currentPalette = [];

        switch (this.mode) {
            case 'monochromatic':
                for (let i = 0; i < 5; i++) {
                    this.currentPalette.push(this.hslToHex(baseHue, 70, 30 + i * 15));
                }
                break;
            case 'analogous':
                for (let i = 0; i < 5; i++) {
                    this.currentPalette.push(this.hslToHex((baseHue + i * 30) % 360, 70, 60));
                }
                break;
            case 'complementary':
                this.currentPalette = [
                    this.hslToHex(baseHue, 70, 60),
                    this.hslToHex(baseHue, 70, 50),
                    this.hslToHex(baseHue, 70, 70),
                    this.hslToHex((baseHue + 180) % 360, 70, 60),
                    this.hslToHex((baseHue + 180) % 360, 70, 50)
                ];
                break;
            case 'triadic':
                for (let i = 0; i < 3; i++) {
                    const hue = (baseHue + i * 120) % 360;
                    this.currentPalette.push(this.hslToHex(hue, 70, 50));
                    this.currentPalette.push(this.hslToHex(hue, 70, 70));
                }
                this.currentPalette = this.currentPalette.slice(0, 5);
                break;
            default:
                for (let i = 0; i < 5; i++) {
                    this.currentPalette.push(this.randomColor());
                }
        }

        this.renderPalette();
    }

    randomColor() {
        return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    }

    hslToHex(h, s, l) {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    }

    renderPalette() {
        document.getElementById('palette').innerHTML = this.currentPalette.map(color => `
            <div class="color-card" style="background:${color}" onclick="app.copyColor('${color}')">
                <div class="color-code">${color.toUpperCase()}</div>
            </div>
        `).join('');
    }

    copyColor(color) {
        navigator.clipboard.writeText(color);
        alert(`Cor ${color} copiada!`);
    }

    exportPalette() {
        this.savedPalettes.push({
            colors: [...this.currentPalette],
            date: new Date().toISOString(),
            mode: this.mode
        });
        localStorage.setItem('palettes', JSON.stringify(this.savedPalettes));
        this.renderSaved();
        alert('Paleta salva!');
    }

    renderSaved() {
        const html = this.savedPalettes.map((p, i) => `
            <div class="saved-item" onclick="app.loadPalette(${i})">
                <div>${p.mode} - ${new Date(p.date).toLocaleDateString('pt-BR')}</div>
                <div class="saved-colors">
                    ${p.colors.map(c => `<div class="saved-color" style="background:${c}"></div>`).join('')}
                </div>
            </div>
        `).join('') || '<p>Nenhuma paleta salva</p>';
        document.getElementById('savedList').innerHTML = html;
    }

    loadPalette(index) {
        this.currentPalette = this.savedPalettes[index].colors;
        this.renderPalette();
    }
}

const app = new ColorPaletteStudio();
