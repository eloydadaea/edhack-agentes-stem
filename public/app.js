document.getElementById('stemForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const topic = document.getElementById('topicInput').value;
    const loader = document.getElementById('loader');
    const resultsDiv = document.getElementById('results');
    const btn = document.getElementById('submitBtn');
    const statusText = document.getElementById('loaderStatus');

    // UI Updates
    loader.classList.remove('hidden');
    resultsDiv.classList.add('hidden');
    btn.disabled = true;

    // --- MAGIA VISUAL: Mensajes rotativos ---
    const messages = [
        "🔍 Agente Investigador: Consultando Gemini 2.5 Flash...",
        "⚙️ Verificando disponibilidad y cuotas de API...",
        "✅ Agente Verificador: Estructurando contenido pedagógico...",
        "🔄 Manteniendo red estable (Modelos de respaldo en guardia)...",
        "🎓 Agente Pedagógico: Diseñando el caso clínico interactivo...",
        "📝 Agente Evaluador: Construyendo rúbrica de calificación...",
        "🚀 Consolidando el reporte final. ¡Casi listo!"
    ];
    
    let messageIndex = 0;
    statusText.innerText = messages[0];
    
    // Cambiar el mensaje cada 3.5 segundos para mantener al usuario atento
    const loadingInterval = setInterval(() => {
        messageIndex++;
        if (messageIndex < messages.length) {
            statusText.innerText = messages[messageIndex];
        }
    }, 3500);

    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic })
        });

        if (!response.ok) throw new Error('Error en el servidor');

        const data = await response.json();

        // Renderizar resultados con MARKED.PARSE para que se vea hermoso
        resultsDiv.innerHTML = `
            <div class="agent-card">
                <div class="markdown-content">${marked.parse(data.investigacion)}</div>
            </div>
            <div class="agent-card">
                <div class="markdown-content">${marked.parse(data.validacion)}</div>
            </div>
            <div class="agent-card">
                <div class="markdown-content">${marked.parse(data.casoEstudio)}</div>
            </div>
            <div class="agent-card">
                <div class="markdown-content">${marked.parse(data.evaluacion)}</div>
            </div>
        `;
        resultsDiv.classList.remove('hidden');
    } catch (error) {
        alert('Hubo un error procesando la solicitud. Revisa los logs.');
    } finally {
        // Limpiamos todo cuando termine
        clearInterval(loadingInterval);
        loader.classList.add('hidden');
        btn.disabled = false;
    }
});