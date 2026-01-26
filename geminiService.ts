
import { GoogleGenAI } from "@google/genai";

export const analyzeResources = async (data: any) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Analise os seguintes dados de recursos humanos de uma operação de SCI (Sistema de Controle de Incidentes):
    Efetivo Militar: ${JSON.stringify(data.militares)}
    Efetivo Civil: ${JSON.stringify(data.civis)}
    Chamadas do Turno Atual: ${JSON.stringify(data.chamadas)}

    Forneça um breve resumo situacional em português, destacando:
    1. Quantidade total de pessoal.
    2. Alerta sobre restrições médicas.
    3. Capacidade de transporte (motoristas civis).
    4. Uma recomendação operacional rápida.
    Limite-se a 3 parágrafos curtos.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Erro na análise AI:", error);
    return "Não foi possível gerar a análise no momento.";
  }
};
