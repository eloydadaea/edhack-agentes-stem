import { GoogleGenAI } from '@google/genai';
import { logger } from './logger';

// Inicializamos el cliente de Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function runAgentPhase(roleName: string, systemPrompt: string, inputData: string): Promise<string> {
    logger.info(roleName, `Iniciando procesamiento (Intento 1: Gemini 2.5)...`);
    
    try {
        // 🚀 INTENTO 1: Nuestro modelo principal (Más inteligente)
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: inputData,
            config: {
                systemInstruction: systemPrompt,
                temperature: 0.7,
            }
        });
        
        logger.info(roleName, `Completado con éxito (Usó Gemini 2.5).`);
        return response.text || "";
        
    } catch (error) {
        // Si el Intento 1 falla (por cuota 429 o saturación 503), no rompemos la app.
        // Lo atrapamos aquí y lanzamos el Plan B.
        logger.info(roleName, `⚠️ Falló el Intento 1. Activando Plan B (Fallback)...`);
        
        try {
            // 🛡️ INTENTO 2 (FALLBACK): Modelo de respaldo (Más ligero, rara vez se satura)
            // *NOTA: Si quisieras usar OpenAI, aquí inicializarías su cliente en lugar de Gemini*
            const fallbackResponse = await ai.models.generateContent({
                model: 'gemini-1.5-flash-8b', 
                contents: inputData,
                config: {
                    systemInstruction: systemPrompt,
                    temperature: 0.7,
                }
            });

            logger.info(roleName, `Completado con éxito (Usó Modelo de Respaldo).`);
            return fallbackResponse.text || "";

        } catch (fatalError) {
            // Si el Plan B también falla, entonces sí nos rendimos
            logger.error(roleName, `Fallo total en ambos modelos.`);
            throw new Error(`${roleName} falló en todos los intentos.`);
        }
    }
}