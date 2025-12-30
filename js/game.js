/**
 * ARQUIVO: game.js
 * OBXECTIVO: Xestión do Estado do Xogo.
 * 
 * Esta clase é o "Estado" (State) da aplicación. Garda toda a información 
 * que cambia co tempo: puntos, tempo, palabras acertadas, letras postas...
 * 
 * Non debuxa nada na pantalla (iso faille ui.js), só manipula datos.
 */

import { CrosswordGenerator } from './generator.js';
import { VOCABULARY } from './data.js';

export class Game {
    constructor() {
        // Configuramos o xerador cun tamaño fixo de 15x15
        this.generator = new CrosswordGenerator(15, 15);

        // --- ESTADO DA PARTIDA ACTUAL ---
        this.currentWords = [];      // Palabras do nivel actual
        this.score = 0;              // Puntos desta partida
        this.startTime = 0;          // Cando empezou o nivel
        this.timerInterval = null;   // Referencia ao cronómetro

        // --- ESTADO DA INTERACCIÓN ---
        this.activeWord = null;      // Palabra que o usuario está tentando resolver agora
        this.userGuess = [];         // As letras que o usuario puxo (ex: ['H', null, 'L', 'A'])
        this.currentRack = null;     // As letras desordenadas dispoñibles para arrastrar

        // --- PROGRESO ---
        this.attempts = {};          // Contador de erros por palabra
        this.completedWords = new Set(); // Conxunto de IDs de palabras xa acertadas

        // --- ESTADO GLOBAL ---
        this.totalScore = 0;         // Puntos acumulados en todas as partidas
        this.currentTheme = '';

        // --- CONFIGURACIÓN ---
        // Constantes para fácil "balanceo" do xogo
        this.BASE_SCORE = 1000;
        this.TIME_BONUS_FACTOR = 10;
        this.ATTEMPT_PENALTY = 50;

        // PERSISTENCIA: Tentamos recuperar a puntuación se recargamos a páxina
        const savedScore = sessionStorage.getItem('puzzgal_total_score');
        if (savedScore) {
            this.totalScore = parseInt(savedScore, 10);
        }
    }

    /**
     * Inicia unha partida nova.
     * Escolle tema, palabras, xera a grella e reinicia contadores.
     */
    startNewGame() {
        // 1. Escoller tema aleatorio
        const themes = Object.keys(VOCABULARY);
        this.currentTheme = themes[Math.floor(Math.random() * themes.length)];
        const themeWords = VOCABULARY[this.currentTheme];

        // 2. Escoller un subconxunto de palabras (8 para que non sexa moi difícil)
        const subset = this.getRandomSubset(themeWords, 8);

        // 3. Xerar o crucigrama
        const result = this.generator.generate(subset);

        this.currentGrid = result.grid;
        // Engadimos un 'index' único a cada palabra para identificalas facilmente
        this.currentWords = result.words.map((w, i) => ({ ...w, index: i }));

        // 4. Reiniciar estado da partida
        this.score = 0;
        this.completedWords.clear();
        this.attempts = {};
        this.currentWords.forEach((w) => this.attempts[w.index] = 0);
        this.activeWord = null;
        this.userGuess = [];
        this.currentRack = null;

        this.stopTimer();
        this.startTimer();

        // Devolvemos o estado necesario para que a UI o pinte
        return {
            grid: this.currentGrid,
            words: this.currentWords,
            theme: this.currentTheme,
            totalScore: this.totalScore
        };
    }

    // Función auxiliar para barallar e coller N elementos
    getRandomSubset(words, count) {
        // [..words] crea unha copia para non modificar o orixinal
        const shuffled = [...words].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    // --- XESTIÓN DO TEMPO ---

    startTimer() {
        this.startTime = Date.now();
    }

    stopTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
    }

    getElapsedTime() {
        // Calculamos segundos pasados dividindo milisegundos entre 1000
        return Math.floor((Date.now() - this.startTime) / 1000);
    }

    // --- LÓXICA DE XOGO (GAMEPLAY) ---

    /**
     * Selecciona unha palabra para xogar.
     * Xera as letras desordenadas (rack) se é a primeira vez.
     */
    selectWord(index) {
        const wordData = this.currentWords[index];

        // Validacións básicas
        if (!wordData || this.completedWords.has(index)) return null;

        // Se xa estamos nesta palabra, devolvemos o estado actual (non rexerar letras)
        if (this.activeWord && this.activeWord.index === index && this.currentRack) {
            return {
                activeWord: this.activeWord,
                rackLetters: this.currentRack,
                currentGuess: this.userGuess
            };
        }

        // Activamos a nova palabra
        this.activeWord = { index, ...wordData };
        // Creamos un array de ocos baleiros (null) do tamaño da palabra
        this.userGuess = Array(wordData.word.length).fill(null);

        // XESTIÓN DE LETRAS DESORDENADAS
        // 1. Letras correctas
        const correctLetters = wordData.word.split('');
        // 2. Letras de distracción (+3 letras ao azar)
        const distractions = this.generateDistractions(3);
        // 3. Xuntamos e barallamos
        const allLetters = [...correctLetters, ...distractions].sort(() => 0.5 - Math.random());
        this.currentRack = allLetters; // Lembrámolas para non cambialas se o usuario volve

        return {
            activeWord: this.activeWord,
            rackLetters: allLetters,
            currentGuess: this.userGuess
        };
    }

    generateDistractions(count) {
        const alphabet = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
        let res = [];
        for (let i = 0; i < count; i++) {
            res.push(alphabet[Math.floor(Math.random() * alphabet.length)]);
        }
        return res;
    }

    // Poñer unha letra nunha posición do intento actual
    placeLetter(letter, position) {
        if (!this.activeWord) return; // Seguridade
        if (position >= 0 && position < this.userGuess.length) {
            this.userGuess[position] = letter;
        }
        return this.userGuess;
    }

    // Borrar unha letra
    removeLetter(position) {
        if (!this.activeWord) return;
        if (position >= 0 && position < this.userGuess.length) {
            this.userGuess[position] = null;
        }
        return this.userGuess;
    }

    /**
     * Comproba se o intento actual coincide coa palabra secreta.
     */
    validateCurrentWord() {
        if (!this.activeWord) return false;

        const guessStr = this.userGuess.join('');
        const isCorrect = guessStr === this.activeWord.word;

        if (isCorrect) {
            // Marcamos como completada
            this.completedWords.add(this.activeWord.index);
            return true;
        } else {
            // Aumentamos contador de fallos para a penalización final
            this.attempts[this.activeWord.index]++;
            return false;
        }
    }

    checkGameComplete() {
        // Rematou se o número de palabras completas é igual ao total
        return this.completedWords.size === this.currentWords.length;
    }

    /**
     * Calcula a puntuación final baseándose no rendemento.
     */
    calculateFinalScore() {
        const timeElapsed = this.getElapsedTime();
        let roundScore = this.BASE_SCORE;

        // Bonus de tempo: 
        // Comeza en 300 segundos (5 min). Cada segundo que aforras, ganas puntos.
        // Se tardas máis de 5 min, o bonus é 0 (non negativo).
        const timeBonus = Math.max(0, (300 - timeElapsed) * this.TIME_BONUS_FACTOR);

        // Penalización por intentos:
        // Sumamos todos os fallos de todas as palabras.
        let totalAttempts = 0;
        Object.values(this.attempts).forEach(a => totalAttempts += a);
        const penalty = totalAttempts * this.ATTEMPT_PENALTY;

        roundScore = roundScore + timeBonus - penalty;
        if (roundScore < 100) roundScore = 100; // Nunca dar menos de 100 puntos

        this.score = roundScore;
        this.totalScore += this.score;

        // Gardar en sesión para non perder os puntos ao refrescar
        sessionStorage.setItem('puzzgal_total_score', this.totalScore);

        return {
            score: this.score,
            totalScore: this.totalScore,
            details: {
                base: this.BASE_SCORE,
                timeBonus,
                penalty,
                time: timeElapsed,
                attempts: totalAttempts
            }
        };
    }
}
