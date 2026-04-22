import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';
import { logger } from './logger';

// Inicializamos los "cerebros" de ambas empresas
const geminiAi = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const openaiAi = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function runAgentPhase(roleName: string, systemPrompt: string, inputData: string): Promise<string> {
    
    // 🚀 INTENTO 1: Gemini 2.5 Flash (Principal)
    try {
        logger.info(roleName, `Intento 1: Llamando a Gemini 2.5 Flash...`);
        const response = await geminiAi.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: inputData,
            config: { systemInstruction: systemPrompt, temperature: 0.7 }
        });
        logger.info(roleName, `✅ Éxito con Gemini 2.5.`);
        return response.text || "";
    } catch (error) {
        logger.info(roleName, `⚠️ Gemini 2.5 saturado/límite. Activando Plan B...`);
    }

    // 🛡️ INTENTO 2: Gemini 1.5 Flash 8B (Respaldo Rápido)
    try {
        logger.info(roleName, `Intento 2: Llamando a Gemini 1.5 8B...`);
        const response = await geminiAi.models.generateContent({
            model: 'gemini-1.5-flash-8b',
            contents: inputData,
            config: { systemInstruction: systemPrompt, temperature: 0.7 }
        });
        logger.info(roleName, `✅ Éxito con Gemini 1.5 8B.`);
        return response.text || "";
    } catch (error) {
        logger.info(roleName, `⚠️ Gemini 1.5 falló. Activando Plan C (OpenAI)...`);
    }

    // 🤖 INTENTO 3: OpenAI GPT-4o-mini (Respaldo Externo)
    try {
        logger.info(roleName, `Intento 3: Llamando a OpenAI GPT...`);
        const response = await openaiAi.chat.completions.create({
            model: 'gpt-4o-mini', // Modelo ultra rápido e inteligente de OpenAI
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: inputData }
            ],
            temperature: 0.7,
        });
        logger.info(roleName, `✅ Éxito con OpenAI.`);
        return response.choices[0].message.content || "";
    } catch (error) {
        // Si llegamos aquí, se cayó el internet global
        logger.error(roleName, `❌ Fallo crítico. Ninguna IA está disponible.`);
        throw new Error(`${roleName} falló en todos los intentos (Gemini y GPT).`);
    }
}