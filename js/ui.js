/**
 * ARQUIVO: ui.js
 * OBXECTIVO: Controlador da Interface de Usuario (UI).
 * 
 * Esta clase é a ponte entre o usuario (HTML/DOM) e a lóxica do xogo (Game).
 * Encárgase de:
 * 1. Escoitar eventos (clics, teclado).
 * 2. Actualizar o DOM (pintar a grella, mostrar puntos, cambiar textos).
 * 3. Xestionar as animacións ou estilos CSS necesarios.
 */

export class UI {
    constructor(game) {
        this.game = game;

        // Cacheamos referencias aos elementos do DOM para non buscalos todo o tempo
        // (Mellora de rendemento leve e código máis limpo)
        this.gridElement = document.getElementById('grid');
        this.clueElement = document.getElementById('clue-text');
        this.rackElement = document.getElementById('letter-rack');
        this.timerElement = document.getElementById('timer');
        this.scoreElement = document.getElementById('score');
        this.themeElement = document.getElementById('theme-display');
        this.modalElement = document.getElementById('game-modal');

        // Estado interno da UI
        this.activeWordIndex = null;  // Palabra seleccionada
        this.refreshInterval = null;  // Identificador do intervalo do reloxo

        // Iniciamos os "listeners" de eventos
        this.bindEvents();
    }

    bindEvents() {
        // Eventos de botóns principais
        document.getElementById('validate-btn').addEventListener('click', () => this.handleValidate());
        document.getElementById('next-btn').addEventListener('click', () => this.handleNextGame());
        document.getElementById('restart-btn').addEventListener('click', () => this.handleRestart());

        // Evento global de teclado (para poder escribir sen usar o rato)
        document.addEventListener('keydown', (e) => this.handleKeyInput(e));
    }

    init() {
        // Arrancar o bucle de actualización do reloxo (cada 1 segundo)
        this.startRefreshLoop();
        // Renderizar a primeira partida
        this.render();
    }

    startRefreshLoop() {
        if (this.refreshInterval) clearInterval(this.refreshInterval);
        this.refreshInterval = setInterval(() => {
            this.updateTimer();
        }, 1000);
    }

    /**
     * Función principal de debuxado.
     * Pide un novo estado ao xogo e actualiza toda a pantalla.
     */
    render() {
        const state = this.game.startNewGame();

        this.renderGrid(state.grid, state.words);
        this.updateScore(state.totalScore);
        this.updateTheme(state.theme);
        this.hideModal();

        // Mensaxes iniciais
        this.rackElement.innerHTML = '<p class="placeholder-text">Selecciona unha palabra no crucigrama</p>';
        this.clueElement.textContent = 'Toca unha palabra para comezar';

        // MELLORA UX (Experiencia de Usuario): 
        // Seleccionamos automaticamente a primeira palabra para que non haxa que facer clic.
        if (state.words.length > 0) {
            // Buscamos a palabra que ten o número 1
            const firstWord = state.words.find(w => w.num === 1) || state.words[0];
            this.activateWord(firstWord.index);
        }
    }

    /**
     * Debuxa a grella do crucigrama usando CSS Grid.
     */
    renderGrid(grid, words) {
        this.gridElement.innerHTML = ''; // Limpar anterior
        const rows = grid.length;
        const cols = grid[0].length;

        // Configurar columnas CSS dinamicamente segundo o tamaño da grella
        this.gridElement.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                // Crear a cela (div)
                const cell = document.createElement('div');
                cell.classList.add('f-cell');
                const char = grid[r][c]; // O caracter real (A, B, C...) ou null

                if (char) {
                    // Se hai letra, é unha cela activa do crucigrama
                    cell.classList.add('active-cell');
                    cell.dataset.row = r;
                    cell.dataset.col = c; // Gardamos coordenadas como atributos de datos

                    // Comprobar se esta cela é o inicio dunha palabra para porlle o númeriño
                    const startingWord = words.find(w => w.row === r && w.col === c);
                    if (startingWord) {
                        const num = document.createElement('span');
                        num.classList.add('cell-num');
                        num.textContent = startingWord.num;
                        cell.appendChild(num);
                    }

                    // Evento de clic na cela
                    // Usamos closure para capturar 'r' e 'c'
                    cell.onclick = (e) => {
                        e.stopPropagation(); // Evitar comportamentos raros se hai elementos solapados
                        this.handleCellClick(r, c);
                    };
                } else {
                    // Cela baleira (fondo negro/transparente)
                    cell.classList.add('empty-cell');
                }
                this.gridElement.appendChild(cell);
            }
        }

        // Lóxica de escalado automático para que caiba na pantalla (Responsividade avanzada)
        // Usamos setTimeout(0) para esperar a que o navegador pinte e poidamos medir tamaños.
        setTimeout(() => this.fitGrid(), 0);

        // Engadir listener para recalcular tamaño se a ventá cambia de tamaño
        if (!this.resizeListener) {
            this.resizeListener = window.addEventListener('resize', () => this.fitGrid());
        }
    }

    /**
     * Calcula o zoom necesario (transform: scale) para que a grella caiba no contedor.
     */
    fitGrid() {
        const container = this.gridElement.parentElement;
        const grid = this.gridElement;

        grid.style.transform = 'scale(1)'; // Resetear para medir ben

        const containerWidth = container.clientWidth - 20;
        const containerHeight = container.clientHeight - 20;

        const gridWidth = grid.scrollWidth;
        const gridHeight = grid.scrollHeight;

        if (gridWidth === 0 || gridHeight === 0) return;

        const scaleX = containerWidth / gridWidth;
        const scaleY = containerHeight / gridHeight;

        // Usamos o menor dos factores de escala para que caiba todo.
        // Limitamos a 1.2x para que non se vexa xigante e pixelado.
        let scale = Math.min(scaleX, scaleY);
        if (scale > 1.2) scale = 1.2;

        grid.style.transform = `scale(${scale})`;
    }

    handleCellClick(r, c) {
        // Cando falemos clic nunha cela, temos que saber a que palabra pertence.
        // Unha cela pode pertencer a dúas palabras (cruzamento).
        const words = this.game.currentWords;

        // Buscamos todas as palabras que pasen por esa coordenada (r, c)
        const candidates = words.filter(w => {
            if (w.direction === 'across') {
                return r === w.row && c >= w.col && c < w.col + w.word.length;
            } else {
                return c === w.col && r >= w.row && r < w.row + w.word.length;
            }
        });

        if (candidates.length === 0) return;

        // Se hai dúas (cruzamento), preferimos a que non estea activa aínda.
        // O usuario fai clic para cambiar de dirección normalmente.
        let foundWord = candidates[0];
        if (candidates.length > 1 && this.activeWordIndex === candidates[0].index) {
            foundWord = candidates[1];
        }

        if (this.game.completedWords.has(foundWord.index)) return; // Se xa está resolta, ignorar.

        this.activateWord(foundWord.index);
    }

    /**
     * Pon unha palabra en modo "Edición".
     */
    activateWord(index) {
        // Pedimos ao xogo os datos necesarios para editar esta palabra
        const output = this.game.selectWord(index);
        if (!output) return;

        this.activeWordIndex = index;

        // VISUAL: Iluminar no crucigrama as celas da palabra seleccionada
        document.querySelectorAll('.active-cell').forEach(el => el.classList.remove('selected-word'));
        const w = output.activeWord;
        for (let i = 0; i < w.word.length; i++) {
            let r = w.row, c = w.col;
            if (w.direction === 'across') c += i;
            else r += i;

            const cell = this.getCell(r, c);
            if (cell) cell.classList.add('selected-word');
        }

        // Mostrar pista e letras
        this.clueElement.textContent = `Pista: ${w.clue}`;
        this.renderRack(output.rackLetters, output.currentGuess);
    }

    /**
     * Debuxa o panel inferior coa palabra oca e as letras dispoñibles.
     * @param {Array} letters - Todas as letras dispoñibles (incluídas distraccións)
     * @param {Array} guess - O estado actual do que escribiu o usuario (letras ou null)
     */
    renderRack(letters, guess) {
        this.rackElement.innerHTML = '';

        // 1. ZONA DE OCOS (SLOTS) - A palabra a formar
        const slotsContainer = document.createElement('div');
        slotsContainer.className = 'word-slots';

        guess.forEach((char, i) => {
            const slot = document.createElement('div');
            slot.className = 'slot';
            // Se o usuario puxo letra, mostámola e poñémoslle a clase 'filled'
            if (char) {
                slot.textContent = char;
                slot.classList.add('filled');
                // Ao facer clic no oco, borramos a letra (devolver ao pool)
                slot.onclick = () => {
                    this.game.removeLetter(i);
                    // Re-renderizamos para actualizar a vista
                    this.renderRack(letters, this.game.userGuess);
                }
            }
            slotsContainer.appendChild(slot);
        });

        this.rackElement.appendChild(slotsContainer);

        // 2. ZONA DE LETRAS (POOL) - Botóns para pulsar
        const poolContainer = document.createElement('div');
        poolContainer.className = 'letter-pool';

        // Calculamos cantas letras de cada tipo quedan dispoñibles
        // (Contamos totais - usadas)
        const usedCounts = {};
        guess.forEach(l => {
            if (l) usedCounts[l] = (usedCounts[l] || 0) + 1;
        });

        letters.forEach(l => {
            if (usedCounts[l] > 0) {
                // Se esta instancia da letra 'l' está usada, decrementar contador e mostrala desactivada
                usedCounts[l]--;
                const letterDiv = document.createElement('button');
                letterDiv.className = 'letter-btn used'; // Clase CSS para vela gris
                letterDiv.textContent = l;
                letterDiv.disabled = true;
                poolContainer.appendChild(letterDiv);
            } else {
                // Se está libre, botón clicable
                const letterDiv = document.createElement('button');
                letterDiv.className = 'letter-btn';
                letterDiv.textContent = l;
                letterDiv.onclick = () => {
                    // Buscar o primeiro oco baleiro
                    const firstEmpty = guess.findIndex(x => x === null);
                    if (firstEmpty !== -1) {
                        this.game.placeLetter(l, firstEmpty);
                        this.renderRack(letters, this.game.userGuess);
                    }
                };
                poolContainer.appendChild(letterDiv);
            }
        });

        this.rackElement.appendChild(poolContainer);
    }

    /**
     * Lóxica para validar a palabra ao pulsar ENTER ou o botón.
     */
    handleValidate() {
        // Preguntar ao xogo se é correcta
        if (this.game.validateCurrentWord()) {
            this.showFeedback(true); // Animación verde

            // ACTUALIZAR O CRUCIGRAMA FINAL (poñer as letras fixas)
            const w = this.game.activeWord;
            for (let i = 0; i < w.word.length; i++) {
                let r = w.row, c = w.col;
                if (w.direction === 'across') c += i;
                else r += i;

                const cell = this.getCell(r, c);
                if (cell) {
                    cell.textContent = w.word[i]; // Escribir letra
                    cell.classList.add('solved');
                }
            }

            this.activeWordIndex = null;
            this.rackElement.innerHTML = '<p class="success-msg">Palabra correcta! (Escolle a seguinte)</p>';
            this.clueElement.textContent = 'Moi ben! Segue coa seguinte.';

            // Comprobar se gañou o nivel completo
            if (this.game.checkGameComplete()) {
                this.handleLevelComplete();
            }

        } else {
            this.showFeedback(false); // Animación vermella
        }
    }

    // Pequena animación visual para feedback (UX)
    showFeedback(success) {
        const slots = document.querySelector('.word-slots');
        if (slots) {
            slots.classList.add(success ? 'pulse-green' : 'shake-red');
            setTimeout(() => {
                slots.classList.remove('pulse-green', 'shake-red');
            }, 500);
        }
    }

    handleLevelComplete() {
        this.game.stopTimer();
        const results = this.game.calculateFinalScore();

        // Usamos Template Literals (``) para inxectar HTML dinámico
        const modalBody = this.modalElement.querySelector('.modal-body');
        modalBody.innerHTML = `
            <h2>¡Noraboa!</h2>
            <p>Completaches o crucigrama.</p>
            <div class="stats-box">
                <p>Tempo: ${this.formatTime(results.details.time)}</p>
                <p>Puntos Base: ${results.details.base}</p>
                <p>Bonus Tempo: +${results.details.timeBonus}</p>
                <p>Penalizacións: -${results.details.penalty}</p>
                <hr>
                <h3>Total: ${results.score}</h3>
            </div>
            <p>Puntuación Global: <strong>${results.totalScore}</strong></p>
        `;

        this.modalElement.classList.remove('hidden'); // Mostrar modal
    }

    handleNextGame() {
        this.render(); // Simplemente render() inicia un novo xogo porque chama a game.startNewGame()
    }

    handleRestart() {
        if (confirm('Seguro que queres saír? Perderás o progreso actual.')) {
            location.reload();
        }
    }

    updateTimer() {
        const seconds = this.game.getElapsedTime();
        this.timerElement.textContent = this.formatTime(seconds);
    }

    updateScore(score) {
        this.scoreElement.textContent = score;
    }

    updateTheme(theme) {
        this.themeElement.textContent = theme.toUpperCase();
    }

    // Formateo de segundos a mm:ss (ex: 65 -> 01:05)
    formatTime(s) {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    }

    // Helper para seleccionar un div concreto da grella
    getCell(r, c) {
        return this.gridElement.querySelector(`.f-cell[data-row="${r}"][data-col="${c}"]`);
    }

    // Xestión entrada Teclado
    handleKeyInput(e) {
        if (!this.game.activeWord) return;

        const key = e.key.toUpperCase();

        // BORRAR
        if (key === 'BACKSPACE') {
            const guess = this.game.userGuess;
            // Buscar última letra non nula
            let lastIdx = -1;
            for (let i = guess.length - 1; i >= 0; i--) {
                if (guess[i] !== null) {
                    lastIdx = i;
                    break;
                }
            }
            if (lastIdx !== -1) {
                this.game.removeLetter(lastIdx);
                // Actualizar vista
                const out = this.game.selectWord(this.game.activeWord.index);
                this.renderRack(out.rackLetters, out.currentGuess);
            }
            return;
        }

        // ENTER
        if (key === 'ENTER') {
            this.handleValidate();
            return;
        }

        // LETRAS (A-Z ou Ñ)
        if (key.length === 1 && key.match(/[A-ZÑ]/i)) {
            // Comprobar se a temos no "rack" (dispoñible)
            const out = this.game.selectWord(this.game.activeWord.index);
            const rack = out.rackLetters;
            const guess = out.currentGuess;

            // Contar cantas hai no rack e cantas usamos xa
            const usedCounts = {};
            guess.forEach(l => { if (l) usedCounts[l] = (usedCounts[l] || 0) + 1; });
            const rackCounts = {};
            rack.forEach(l => { rackCounts[l] = (rackCounts[l] || 0) + 1; });

            const availableCount = (rackCounts[key] || 0) - (usedCounts[key] || 0);

            if (availableCount > 0) {
                // Buscar oco baleiro
                const firstEmpty = guess.findIndex(x => x === null);
                if (firstEmpty !== -1) {
                    this.game.placeLetter(key, firstEmpty);
                    this.renderRack(rack, this.game.userGuess);
                }
            } else {
                this.showFeedback(false); // Letra non dispoñible
            }
        }
    }

    hideModal() {
        this.modalElement.classList.add('hidden');
    }
}
