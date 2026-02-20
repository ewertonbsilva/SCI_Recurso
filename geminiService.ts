import { GoogleGenAI } from "@google/genai";

// Tenta pegar a chave de API do ambiente Vite
const genAI = new GoogleGenAI({
    apiKey: import.meta.env.VITE_GEMINI_API_KEY || ""
});

export const analyzeResources = async (data: {
    militares: any[];
    civis: any[];
    chamadas: {
        militar: any[];
        equipes: any[];
    };
}) => {
    try {
        const prompt = `
      Como um especialista em gestão estratégica de efetivo militar e defesa civil, analise os seguintes dados de prontidão para hoje:

      DADOS DE HOJE:
      - Total de Militares Cadastrados: ${data.militares.length}
      - Total de Recursos Civis (VTRs/Motoristas): ${data.civis.length}
      - Militares na Escala (Chamada): ${data.chamadas.militar.length}
      - Total de Equipes Operacionais: ${data.chamadas.equipes.length}

      POR FAVOR, FORNEÇA:
      1. Uma breve análise da capacidade de resposta atual.
      2. Identificação de possíveis gargalos ou riscos (ex: baixo efetivo em relação aos recursos).
      3. Uma recomendação estratégica rápida.

      Responda de forma profissional, executiva e em Português do Brasil. Seja conciso e use parágrafos curtos.
    `;

        const response = await genAI.models.generateContent({
            model: "gemini-1.5-flash",
            contents: prompt
        });

        return response.text;
    } catch (error) {
        console.error("Erro ao analisar recursos com Gemini:", error);
        return "Não foi possível gerar a análise estratégica no momento. Verifique sua chave de API e conexão.";
    }
};
