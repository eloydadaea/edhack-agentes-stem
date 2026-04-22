document.getElementById('stemForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const topic = document.getElementById('topicInput').value;
    const loader = document.getElementById('loader');
    const resultsDiv = document.getElementById('results');
    const btn = document.getElementById('submitBtn');
    const statusText = document.getElementById('loaderStatus');
    const spinner = document.querySelector('.spinner');

    // Preparar UI para nueva búsqueda
    loader.classList.remove('hidden');
    resultsDiv.classList.add('hidden');
    btn.disabled = true;
    spinner.style.display = 'block'; // Asegurar que la ruedita sea visible

    // --- EL CARGADOR INTELIGENTE (Simulador de Fallback en tiempo real) ---
    let secondsPassed = 0;
    statusText.innerHTML = "🚀 Iniciando Orquestador...<br><span style='font-size: 0.85rem; color: #666;'>Intentando con Gemini 2.5 Flash (Principal)</span>";

    const loadingInterval = setInterval(() => {
        secondsPassed++;

        if (secondsPassed === 4) {
            // A los 4 segundos, asumimos que el 2.5 falló o está lento
            statusText.innerHTML = "⚠️ Gemini 2.5 saturado.<br><span style='font-size: 0.85rem; color: #d97706;'>Activando Plan B: Gemini 1.5 8B...</span>";
        } else if (secondsPassed === 8) {
            // A los 8 segundos, asumimos que el 1.5 también falló
            statusText.innerHTML = "⚠️ Red de Google sin respuesta.<br><span style='font-size: 0.85rem; color: #dc2626;'>Activando Plan C: OpenAI GPT-4o-mini...</span>";
        } else if (secondsPassed === 14) {
            // Mensaje de paciencia para procesos largos
            statusText.innerHTML = "⚙️ Procesando con los Agentes...<br><span style='font-size: 0.85rem; color: #0070f3;'>Ensamblando el caso científico. Por favor espera.</span>";
        }
    }, 1000); // Este reloj hace "tic" cada 1 segundo

    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic })
        });

        // Detenemos el reloj apenas llegue la respuesta
        clearInterval(loadingInterval);

        if (!response.ok) {
            throw new Error('Fallback fallido'); // Dispara el catch abajo
        }

        const data = await response.json();

        // Renderizar resultados si hubo éxito
        resultsDiv.innerHTML = `
            <div class="agent-card">
                <h3>🔍 1. Agente Investigador (Fuentes)</h3>
                <div class="markdown-content">${marked.parse(data.investigacion)}</div>
            </div>
            <div class="agent-card">
                <h3>✅ 2. Agente Verificador (Validación Escolar)</h3>
                <div class="markdown-content">${marked.parse(data.validacion)}</div>
            </div>
            <div class="agent-card">
                <h3>🎓 3. Agente Pedagógico (Caso Clínico/Actividad)</h3>
                <div class="markdown-content">${marked.parse(data.casoEstudio)}</div>
            </div>
            <div class="agent-card">
                <h3>📝 4. Agente Evaluador (Rúbrica y Preguntas)</h3>
                <div class="markdown-content">${marked.parse(data.evaluacion)}</div>
            </div>
        `;
        
        resultsDiv.classList.remove('hidden');
        loader.classList.add('hidden'); // Ocultar loader si todo salió bien

    } catch (error) {
        clearInterval(loadingInterval);
        
        // MANEJO DE ERROR VISUAL (En lugar del alert)
        spinner.style.display = 'none'; // Ocultamos la ruedita de carga
        statusText.innerHTML = `
            ❌ <b>Fallo Crítico del Sistema</b><br>
            <span style='font-size: 0.9rem; color: #dc2626;'>
                Los 3 intentos fallaron. Ni Gemini ni GPT están disponibles en este momento (Posible límite de cuota).<br>
                Por favor, intenta de nuevo en unos minutos.
            </span>
        `;
    } finally {
        btn.disabled = false; // Reactivar el botón siempre
    }
});