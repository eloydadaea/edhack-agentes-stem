import { GoogleGenAI } from '@google/genai';
import { logger } from './logger';

// Inicializamos el cliente de Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function runAgentPhase(roleName: string, systemPrompt: string, inputData: string): Promise<string> {
    logger.info(roleName, `Iniciando procesamiento con Gemini...`);
    
    try {
        const response = await ai.models.generateContent({
            // 👇 AQUÍ ESTÁ EL CAMBIO 👇
            model: 'gemini-2.5-flash', 
            // 👆👆👆👆👆👆👆👆👆👆👆👆
            contents: inputData, 
            config: {
                systemInstruction: systemPrompt, 
                temperature: 0.7, 
            }
        });
        
        const result = response.text || "";
        logger.info(roleName, `Procesamiento completado con éxito.`);
        return result;
        
    } catch (error) {
        logger.error(roleName, error);
        throw new Error(`${roleName} falló en su ejecución con la API de Gemini.`);
    }
}