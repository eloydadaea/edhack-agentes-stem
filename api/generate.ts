import type { VercelRequest, VercelResponse } from '@vercel/node';
import { runAgentPhase } from './agents';
import { logger } from './logger';

// 🛡️ SOLUCIÓN ANTI-429: Función para pausar la ejecución unos segundos
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { topic } = req.body;

    if (!topic) {
        return res.status(400).json({ error: 'El tema (topic) es requerido' });
    }

    logger.info('Orquestador', `Iniciando pipeline para el tema: ${topic}`);

    try {
        // 1. Agente Investigador
        const investigacion = await runAgentPhase(
            "Agente Investigador",
            "Eres un investigador científico experto en STEM. Tu objetivo es buscar, estructurar y resumir los conceptos clave, marco teórico y descubrimientos recientes sobre el tema proporcionado. Sé detallado y riguroso.",
            `Tema a investigar: ${topic}`
        );

        logger.info('Orquestador', '⏳ Pausando 3 segundos para evitar Rate Limit...');
        await delay(3000);

        // 2. Agente Verificador
        const validacion = await runAgentPhase(
            "Agente Verificador",
            "Eres un revisor académico y pedagogo. Recibirás una investigación científica. Tu tarea es filtrar la información, confirmar que tenga sustento sólido y adaptar el lenguaje técnico para que sea perfectamente comprensible para estudiantes de secundaria, sin perder rigor científico.",
            investigacion
        );

        logger.info('Orquestador', '⏳ Pausando 3 segundos para evitar Rate Limit...');
        await delay(3000);

        // 3. Agente Pedagógico
        const casoEstudio = await runAgentPhase(
            "Agente Pedagógico",
            "Eres un diseñador instruccional innovador. Toma la siguiente información validada y crea un 'Caso Científico' o una situación problemática interactiva para resolver en clase. Debe atrapar la atención de los estudiantes y desafiarlos a pensar.",
            validacion
        );

        logger.info('Orquestador', '⏳ Pausando 3 segundos para evitar Rate Limit...');
        await delay(3000);

        // 4. Agente Evaluador
        const evaluacion = await runAgentPhase(
            "Agente Evaluador",
            "Eres un profesor estructurado y justo. A partir del caso de estudio proporcionado, genera una rúbrica de evaluación clara (con 3 criterios de desempeño) y 3 preguntas de pensamiento crítico para evaluar si los alumnos comprendieron el concepto STEM.",
            casoEstudio
        );

        logger.info('Orquestador', `Pipeline finalizado exitosamente.`);

        res.status(200).json({
            investigacion,
            validacion,
            casoEstudio,
            evaluacion
        });

    } catch (error) {
        res.status(500).json({ error: 'Ocurrió un error en el pipeline de agentes de Gemini.' });
    }
}