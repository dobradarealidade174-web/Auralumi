import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || (import.meta as any).env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY não encontrada. A consultoria IA não funcionará até que a chave seja configurada nas variáveis de ambiente.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export interface PricingAnalysis {
  diagnostico: string;
  analise_preco_atual: string;
  preco_sugerido: string;
  preco_premium: string;
  erros_identificados: string[];
  sugestoes: string[];
  dica_estrategica: string;
}

export async function analyzePricing(data: {
  service_name: string;
  duration: number;
  current_price: number;
  supplies_cost: number;
  monthly_cost: number;
  monthly_clients: number;
  hourly_rate: number;
  level: string;
  region: string;
}): Promise<PricingAnalysis> {
  const prompt = `
Você é um especialista em gestão financeira para profissionais de estética e beleza no Brasil.

Seu objetivo é ajudar a usuária a definir o preço ideal de um serviço, garantindo que ela tenha lucro e não trabalhe no prejuízo.

Analise os dados abaixo:

--- DADOS DO SERVIÇO ---
Nome do serviço: ${data.service_name}
Tempo de execução (minutos): ${data.duration}
Preço atual cobrado: R$ ${data.current_price}

--- CUSTOS ---
Custo com insumos por atendimento: R$ ${data.supplies_cost}
Custo fixo mensal: R$ ${data.monthly_cost}
Quantidade de atendimentos por mês: ${data.monthly_clients}
Valor da hora de trabalho: R$ ${data.hourly_rate}

--- CONTEXTO ---
Nível da profissional: ${data.level}
Cidade/Região: ${data.region}

--- CÁLCULO BASE ---
Considere:
- custo por atendimento = insumos + (custo mensal / atendimentos) + (valor hora * tempo)
- lucro saudável entre 50% e 150% sobre o custo

--- SUA TAREFA ---

1. Explique se o preço atual está correto, baixo ou alto
2. Aponte erros comuns que ela pode estar cometendo
3. Sugira melhorias práticas
4. Sugira um preço ideal
5. Sugira um preço premium (posicionamento mais alto)
6. Dê uma dica estratégica para aumentar o faturamento

--- REGRAS IMPORTANTES ---

- Use linguagem simples e direta (como se estivesse explicando para uma profissional iniciante)
- Seja prático e objetivo
- Nunca use termos técnicos difíceis
- Sempre incentive melhoria de lucro
- Considere a realidade do Brasil (preços acessíveis, concorrência local)
`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          diagnostico: { type: Type.STRING },
          analise_preco_atual: { type: Type.STRING },
          preco_sugerido: { type: Type.STRING },
          preco_premium: { type: Type.STRING },
          erros_identificados: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          sugestoes: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          dica_estrategica: { type: Type.STRING }
        },
        required: [
          "diagnostico", 
          "analise_preco_atual", 
          "preco_sugerido", 
          "preco_premium", 
          "erros_identificados", 
          "sugestoes", 
          "dica_estrategica"
        ]
      }
    }
  });

  return JSON.parse(response.text);
}
