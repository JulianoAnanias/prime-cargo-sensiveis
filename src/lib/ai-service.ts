// Serviço de IA integrado ao Google Gemini usando a chave de API oficial do projeto

export interface AnalisePesquisaResult {
  resumo: string;
  temas: string[];
  pontosAtencao: string[];
  acoesSugeridas: string[];
  classificacaoSentimento: 'Positivo' | 'Neutro' | 'Negativo';
}

export const analyzePesquisa = async (text: string): Promise<AnalisePesquisaResult> => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY || '';
  const model = process.env.AI_MODEL || 'gemini-3.5-flash';

  const prompt = `Você é o auditor e analista sênior de qualidade da Prime Cargo (Logística de Equipamentos Sensíveis).
Analise o seguinte feedback/pesquisa de satisfação de atendimento do cliente (IPP 35):

---
${text}
---

Gere uma avaliação criteriosa e estruturada estritamente no formato JSON, sem blocos de markdown adicionais, com as seguintes chaves:
{
  "resumo": "Breve resumo executivo da avaliação do cliente (máximo 2 linhas)",
  "temas": ["Lista de temas relevantes identificados, ex: Atendimento, Conservação, Pontualidade"],
  "pontosAtencao": ["Pontos de atenção ou não-conformidades mencionadas, se houver"],
  "acoesSugeridas": ["Ações preventivas ou corretivas recomendadas para a operação Prime Cargo"],
  "classificacaoSentimento": "Positivo" | "Neutro" | "Negativo"
}`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Erro na API Gemini:', errText);
      throw new Error(`Falha na API Gemini: ${response.statusText}`);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error('Resposta vazia do modelo Gemini');
    }

    const parsed: AnalisePesquisaResult = JSON.parse(candidateText);
    return parsed;
  } catch (error: any) {
    console.warn('Fallback para análise padrão devido a:', error.message);
    return {
      resumo: `Feedback registrado: ${text.slice(0, 100)}...`,
      temas: ['Logística de Sensíveis', 'Atendimento'],
      pontosAtencao: text.toLowerCase().includes('ruim') || text.toLowerCase().includes('avaria') 
        ? ['Alerta de insatisfação ou possível avaria sinalizada pelo cliente'] 
        : [],
      acoesSugeridas: ['Acompanhamento de rotina pelo setor de Qualidade Prime Cargo'],
      classificacaoSentimento: text.toLowerCase().includes('ruim') ? 'Negativo' : 'Positivo'
    };
  }
};
