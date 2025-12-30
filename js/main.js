/**
 * ARQUIVO: main.js
 * OBXECTIVO: Punto de entrada da aplicación (Entry Point).
 * 
 * Este arquivo é o primeiro que se executa. A súa única misión é cargar as dependencias
 * e iniciar o xogo cando o navegador estea listo.
 * 
 * CONCEPTO: "Separación de Responsabilidades"
 * Mantemos o arranque separado da lóxica do xogo.
 */

// Importamos as clases necesarias doutros arquivos (Módulos ES6)
import { Game } from './game.js'; // A lóxica e regras
import { UI } from './ui.js';     // A interface visual

// 'DOMContentLoaded' é un evento que dispara o navegador cando o HTML rematou de cargarse.
// É unha boa práctica esperar a isto antes de executar código que toque o DOM.
document.addEventListener('DOMContentLoaded', () => {

    // 1. Instanciamos a clase Game. Aquí creamos o "cerebro" da partida.
    const game = new Game();

    // 2. Instanciamos a clase UI, pasándolle o xogo. 
    // A UI necesita acceso ao xogo para saber que pintar e a quen chamar.
    // Isto coñécese como "Inxección de Dependencias" (Dependency Injection) simplificada.
    const ui = new UI(game);

    // 3. Arrancamos a interface.
    ui.init();

    // NOTA PARA ESTUDANTES:
    // Proba a por un console.log("Xogo iniciado") aquí para ver cando ocorre no inspector.
});
