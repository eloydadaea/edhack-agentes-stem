document.getElementById('stemForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const topic = document.getElementById('topicInput').value;
    const loader = document.getElementById('loader');
    const resultsDiv = document.getElementById('results');
    const btn = document.getElementById('submitBtn');

    // UI Updates
    loader.classList.remove('hidden');
    resultsDiv.classList.add('hidden');
    btn.disabled = true;

    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic })
        });

        if (!response.ok) throw new Error('Error en el servidor');

        const data = await response.json();

        // Renderizar resultados
        resultsDiv.innerHTML = `
            <div class="agent-card">
                <h3>🔍 1. Agente Investigador (Fuentes)</h3>
                <p>${formatText(data.investigacion)}</p>
            </div>
            <div class="agent-card">
                <h3>✅ 2. Agente Verificador (Validación Escolar)</h3>
                <p>${formatText(data.validacion)}</p>
            </div>
            <div class="agent-card">
                <h3>🎓 3. Agente Pedagógico (Caso Clínico/Actividad)</h3>
                <p>${formatText(data.casoEstudio)}</p>
            </div>
            <div class="agent-card">
                <h3>📝 4. Agente Evaluador (Rúbrica y Preguntas)</h3>
                <p>${formatText(data.evaluacion)}</p>
            </div>
        `;
        resultsDiv.classList.remove('hidden');
    } catch (error) {
        alert('Hubo un error procesando la solicitud. Revisa los logs.');
    } finally {
        loader.classList.add('hidden');
        btn.disabled = false;
    }
});

function formatText(text) {
    // Convierte saltos de línea en <br> para HTML simple
    return text.replace(/\n/g, '<br>');
}