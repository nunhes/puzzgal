# i

#programación web #en galego #formación

Quixera que me axudaras a crear un promt para indicarlle a unha IA que faga unha aplicación para o aprendizaxe do Galego. A aplicación consiste nun xogo de crucigramas aleatorios onde o usuario terá acceso a n letras que deberá asociar formando palabras que iran completando o crucigrama. cada vez que o usuario complete un crucigrama premiaráselle por menor tempo empregado, por o menor numero de intentos por palabra, e poderá optar por sair da aplicación ou por seguir xogando. Se quere seguir xogando a aplicación xerará outro crucigrama aleatorio e proderá seguir xogando e acumulando puntos, cantas veces queira

# ii
Claro! Aquí tes un **prompt detallado en galego** para pedirlle a unha IA (como ChatGPT, Claude, Gemini ou modelos de código) que desenvolva a aplicación de aprendizaxe de galego que describiches.

---

### **Prompt para IA: Desenvolvemento dun Xogo de Aprendizaxe de Galego**

**Contexto:** Quero desenvolver unha aplicación web lúdica para practicar e aprender vocabulario en galego. A aplicación consiste nun xogo de crucigramas aleatorios con mecánicas de premios por eficiencia.

---

**Obxectivo principal:**  
Crear un xogo interactivo no que o usuario deba formar palabras a partir dun conxunto de letras dispoñibles para completar un crucigrama. O xogo premiará a velocidade e o menor número de intentos, cun sistema de puntos acumulables.

---

**Requisitos funcionais:**

1. **Xeración aleatoria de crucigramas:**
   - Cada crucigrama debe ter un tema (ex: natureza, cociña, deportes, etc.) con palabras en galego.
   - As palabras deben ser adecuadas para estudantes de galego (nivel básico a intermedio).
   - A grella (tamaño variable) xérase automaticamente, coas pistas visibles (definicións ou sinónimos).

2. **Mecánica de xogo:**
   - O usuario recibe **n letras desordenadas** (as necesarias para formar cada palabra, máis algunhas extra de distracción).
   - Para cada palabra do crucigrama, o usuario debe **seleccionar e ordenar** as letras correctas a partir dese conxunto.
   - Cada palabra ten unha pista (definición breve en galego).
   - O usuario pode enviar unha palabra para validala. Se é correcta, colócase no crucigrama.

3. **Sistema de puntuación e premios:**
   - **Tempo:** A menor tempo total para completar o crucigrama, maior puntuación.
   - **Intentos:** A menor cantidade de intentos por palabra, bonificación extra.
   - **Puntos acumulables:** Cada crucigrama completado outorga puntos base + bonos por tempo e eficiencia.
   - Os puntos acumúlanse en total global mentres o usuario siga xogando.

4. **Fluxo de xogo:**
   - Ao entrar, preséntase un crucigrama novo.
   - Unha vez completado, móstrase:
     - Puntuación obtida na partida.
     - Total acumulado.
     - Dúas opcións: **"Seguir xogando"** (xera novo crucigrama aleatorio) ou **"Saír"** (pecha a aplicación/volve ao inicio).

5. **Interfaz de usuario (UI) básica:**
   - Zona do crucigrama (táboa con numeración e pistas ao lado).
   - Panel de letras dispoñibles (arrastrables ou clicables para formar palabras).
   - Cronómetro visible.
   - Contador de intentos por palabra/global.
   - Marcador de puntos (actual e acumulado).
   - Botóns: "Validar palabra", "Seguir xogando", "Saír".

6. **Persistencia mínima:**
   - Gardar a puntuación total durante a sesión (ata pechar o navegador).
   - Opcional: gardar récords en `localStorage`.

---

**Requisitos técnicos (suxestións para a IA):**

- Tecnoloxía web: HTML, CSS, JavaScript (puro ou con框架 lixeiro se é necesario).
- Estrutura modular para facilitar mantemento.
- Xeración de crucigramas aleatorios: podes usar un listado de palabras por temas e un algoritmo simple de colocación en grella.
- A IU debe ser responsiva e visualmente amigable.

---

**Saídas esperadas da IA:**

1. **Código fonte completo** da aplicación (HTML, CSS, JS) funcionando nun único arquivo ou en varios segundo a complexidade.
2. **Explicación breve** de como se xera o crucigrama, como se calculan os puntos e como se xestiona o fluxo de xogo.
3. **Lista de vocabulario** de exemplo (50-100 palabras en galego con temas variados e as súas pistas).

---

**Exemplo de funcionamento (para clarificar):**

1. O usuario abre a app.
2. Aparece un crucigrama de 5 palabras sobre "**Animais**".
3. Dispoñible: letras desordenadas como "C, A, O, R, B, L, L, E, ...".
4. Primeira pista: "Mamífero acuático grande" (Balea). O usuario selecciona B,A,L,E,A das letras dispoñibles e válidaa.
5. Así sucesivamente ata completar o crucigrama.
6. Fin: tempo= 2:30 min, intentos totais= 8. Puntos: 1000 (base) + 200 (bonus tempo) + 150 (bonus intentos) = **1350 puntos**.
7. Total acumulado: 3200 puntos.
8. Elixe **"Seguir xogando"** → novo crucigrama aleatorio (tema: "Verduras").

---

**Petición final:**  
Quero que me desenvolves este proxecto completo, listo para executar nun navegador, co código ben comentado en galego (ou en inglés se é máis cómodo, pero as pistas e interface en galego). Inclúe tamén instrucións de como probalo.

---

### **Notas adicionais para a IA:**
- Podes simplificar a xeración do crucigrama se é moi complexa; unha grella fixa con palabras que cambian é válida para un primeiro prototipo.
- O importante é que sexa **xogable, en galego e que cumpre coa mecánica de letras desordenadas e puntuación por tempo/intentos**.

---

Este prompt está listo para copiar e pegar nunha IA. Axustao se precisas engadir máis detalles ou cambiar algún aspecto. **Moita sorte co proxecto!** 💻🌱

----
# iii
