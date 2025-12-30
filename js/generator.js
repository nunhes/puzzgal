/**
 * ARQUIVO: generator.js
 * OBXECTIVO: Crear a grella do crucigrama.
 * 
 * Esta clase encárgase do traballo matemático "difícil": coller unha lista de palabras
 * e intentar encaixalas nunha cuadrícula de xeito que se crucen entre elas.
 */

export class CrosswordGenerator {
    /**
     * O constructor configúrase co tamaño desexado da grella.
     * @param {number} width - Ancho da grella (columnas)
     * @param {number} height - Alto da grella (filas)
     */
    constructor(width, height) {
        this.width = width;
        this.height = height;
        // Inicializamos unha grella baleira. Usamos 'null' para dicir que unha cela está baleira.
        // Array(height).fill() crea as filas, e o map() convérteas en columnas.
        this.grid = Array(height).fill().map(() => Array(width).fill(null));
        this.placedWords = [];
    }

    /**
     * Método principal que tenta xerar un crucigrama.
     * @param {Array} words - Lista de obxectos con {word, clue}
     * @returns {Object} - Devolve a grella final e a lista de palabras colocadas.
     */
    generate(words) {
        // Reiniciamos todo por se acaso se usa a mesma instancia varias veces
        this.grid = Array(this.height).fill().map(() => Array(this.width).fill(null));
        this.placedWords = [];

        // CONCEPTO: Ordenar por lonxitude.
        // É máis fácil colocar as palabras longas ao principio (teñen máis opcións)
        // e logo encaixar as curtas nos ocos.
        const sortedWords = [...words].sort((a, b) => b.word.length - a.word.length);

        for (const wordObj of sortedWords) {
            this.tryPlaceWord(wordObj);
            // NOTA: Se tryPlaceWord devolve false, a palabra ignórase e pasamos á seguinte.
        }

        return {
            grid: this.grid,
            words: this.placedWords
        };
    }

    /**
     * Intenta colocar unha única palabra na grella.
     */
    tryPlaceWord(wordObj) {
        const word = wordObj.word;

        // CASO 1: A primeira palabra.
        // Colocámola sempre no centro para ter espazo arredor.
        if (this.placedWords.length === 0) {
            const row = Math.floor(this.height / 2);
            // Centramos horizontalmente restando a lonxitude da palabra
            const col = Math.floor((this.width - word.length) / 2);
            this.place(word, row, col, 'across', wordObj);
            return true;
        }

        // CASO 2: Resto de palabras.
        // Temos que buscar se teñen algunha letra común coas palabras xa colocadas.
        for (const placed of this.placedWords) {
            for (let i = 0; i < word.length; i++) {
                const char = word[i]; // Letra da nova palabra que queremos colocar

                // Buscamos se esa letra existe na palabra que xa está no taboleiro ('placed')

                if (placed.direction === 'across') {
                    // Se a palabra xa posta está en horizontal (ACROSS), 
                    // nós intentaremos poñer a nova en vertical (DOWN) cruzando esa letra.

                    for (let j = 0; j < placed.word.length; j++) {
                        if (placed.word[j] === char) {
                            // Atopamos unha coincidencia! (Intersección)
                            // Calculamos onde tería que empezar a nosa nova palabra
                            // para que a letra 'i' coincida coa letra 'j' da posta.

                            const startRow = placed.row - i;
                            const startCol = placed.col + j;

                            // Comprobamos se cabe e non choca con nada máis
                            if (this.canPlace(word, startRow, startCol, 'down')) {
                                this.place(word, startRow, startCol, 'down', wordObj);
                                return true; // Éxito!
                            }
                        }
                    }
                } else {
                    // Se a palabra xa posta é vertical (DOWN), a nova será horizontal (ACROSS).
                    // A lóxica é a mesma, pero invertendo eixos.
                    for (let j = 0; j < placed.word.length; j++) {
                        if (placed.word[j] === char) {
                            const startRow = placed.row + j;
                            const startCol = placed.col - i;

                            if (this.canPlace(word, startRow, startCol, 'across')) {
                                this.place(word, startRow, startCol, 'across', wordObj);
                                return true;
                            }
                        }
                    }
                }
            }
        }
        return false; // Non se puido colocar
    }

    /**
     * Verifica regras de colocación para evitar colisións ilegais.
     * Esta é a parte máis complexa do algoritmo.
     */
    canPlace(word, row, col, direction) {
        // 1. Comprobar límites do taboleiro
        if (row < 0 || col < 0) return false;

        if (direction === 'across') {
            if (col + word.length > this.width) return false;

            // 2. Comprobar que non pegamos a palabra a outra ("efecto sándwich")
            // Non pode haber nada xusto á esquerda da primeira letra
            if (col > 0 && this.grid[row][col - 1] !== null) return false;
            // Non pode haber nada xusto á dereita da última letra
            if (col + word.length < this.width && this.grid[row][col + word.length] !== null) return false;

            // 3. Comprobar cada cela da palabra
            for (let i = 0; i < word.length; i++) {
                const r = row;
                const c = col + i;
                const cell = this.grid[r][c];

                // Se a cela xa ten unha letra, DEBE ser a mesma (intersección válida)
                if (cell !== null && cell !== word[i]) return false;

                // Se a cela está baleira, temos que mirar os seus veciños de arriba e abaixo.
                // Non queremos colocar unha letra pegada a outra palabra paralela por erro.
                if (cell === null) {
                    if (r > 0 && this.grid[r - 1][c] !== null) return false;
                    if (r < this.height - 1 && this.grid[r + 1][c] !== null) return false;
                }
            }
        } else { // dirección 'down'
            // Mesmas comprobacións pero para vertical
            if (row + word.length > this.height) return false;
            if (row > 0 && this.grid[row - 1][col] !== null) return false; // Comprobación superior
            if (row + word.length < this.height && this.grid[row + word.length][col] !== null) return false; // Comprobación inferior

            for (let i = 0; i < word.length; i++) {
                const r = row + i;
                const c = col;
                const cell = this.grid[r][c];

                if (cell !== null && cell !== word[i]) return false;

                if (cell === null) {
                    // Comprobamos laterais para evitar adxacencias non desexadas
                    if (c > 0 && this.grid[r][c - 1] !== null) return false;
                    if (c < this.width - 1 && this.grid[r][c + 1] !== null) return false;
                }
            }
        }
        return true;
    }

    /**
     * Escribe a palabra na matriz 'grid' e gárdaa na lista.
     */
    place(word, row, col, direction, wordObj) {
        for (let i = 0; i < word.length; i++) {
            if (direction === 'across') {
                this.grid[row][col + i] = word[i];
            } else {
                this.grid[row + i][col] = word[i];
            }
        }
        // Gardamos metadatos que a UI necesitará despois (onde empeza, pista, número...)
        this.placedWords.push({
            word: word,
            clue: wordObj.clue,
            row: row,
            col: col,
            direction: direction,
            num: this.placedWords.length + 1 // O número que se ve no crucigrama (ex: 1, 2, 3...)
        });
    }
}
