# Guía didáctica: Proxecto "Galego Puzz"

## Introdución
Benvido ao código fonte de **Galego Puzz**. Este proxecto non é só un xogo: é un exemplo real de como construír unha **Single Page Application (SPA)** usando tecnoloxías web estándar (HTML, CSS e JavaScript) sen frameworks complexos.

O obxectivo deste código é ser lido e modificado. Aquí aprenderás sobre:
- **Programación Orientada a Obxectos (POO)** en JavaScript.
- **Módulos ES6** (`import`/`export`) para organizar o código.
- **Manipulación do DOM** para crear un interface dinámico.
- **Algoritmos** básicos (como xerar un crucigrama).

## Estrutura do proxecto
O proxecto sepárase en "capas", unha práctica moi común en enxeñaría de software para facer o código mantible.

### 1. A Capa de Datos (`js/data.js`)
Aquí é onde viven a información do xogo. É un simple "obxecto" JSON.
*   **Concepto clave**: Separar os datos da lóxica. Se queres traducir o xogo ou cambiar as preguntas, só tocas este arquivo.

### 2. A Capa de Lóxica (`js/game.js` e `js/generator.js`)
Aquí están as "regras do xogo".
*   **`generator.js`**: Contén o "cerebro" matemático. Como encaixar palabras nunha grella? Usa matrices (arrays de arrays) e bucles para comprobar colisións.
*   **`game.js`**: É o "árbitro". Controla o estado: Cantos puntos teño? Canto tempo pasou? É correcta a palabra?
*   **Concepto clave**: Estas clases non saben nada do HTML. Poderías usar esta mesma lóxica para unha app de móbil ou de consola.

### 3. A Capa de Presentación (`js/ui.js` e `css/style.css`)
Aquí é onde a maxia se fai visible.
*   **`ui.js`**: Escoita o que fai o usuario (clics, teclado) e debuxa o estado do xogo na pantalla.
*   **Concepto clave**: **Separación de Responsabilidades**. A UI non calcula puntos, só os amosa. `game.js` non debuxa botóns, só di "sumar puntos".

## Exercicios propostos
Para aprender, o mellor é "romper" e mellorar o código. Proba estes retos:

### Nivel básico
1.  **Cambiar as cores**: Vai a `css/style.css` e modifica as variables `:root` para darlle outro look.
2.  **Máis penalización**: En `js/game.js`, fai que cada erro reste 100 puntos en vez de 50.
3.  **Novas mensaxes**: Cambia as frases de "Noraboa" e "Pista" en `js/ui.js` para que sexan máis divertidas.

### Nivel intermedio
1.  **Botón "Rendirse"**: Engade un botón que complete a palabra actual pero que non che dea puntos.
    *   *Pista*: Necesitarás un novo método en `Game` e un novo botón en `UI`.
2.  **Son**: Engade efectos de son (un `beep`) cando se acerta ou se falla.
    *   *Pista*: Busca como usar `new Audio()` en JS.

### Nivel avanzado
1.  **Mellor xerador**: O algoritmo actual é simple. Intenta melloralo para que as palabras se crucen máis veces (máis denso).
2.  **Multixogado local**: Fai que dous xogadores poidan competir no mesmo ordenador, un tempo cada un.

---
*Este proxecto foi deseñado para ser un punto de partida limpo. Estuda os comentarios no código para entender o "porqué" de cada liña.*
