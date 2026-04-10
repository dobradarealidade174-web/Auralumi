import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Calculator, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Lightbulb, 
  DollarSign,
  Loader2,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { analyzePricing, PricingAnalysis } from '../../services/geminiService';

export default function PricingConsultant() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PricingAnalysis | null>(null);
  const [formData, setFormData] = useState({
    service_name: '',
    duration: 60,
    current_price: 0,
    supplies_cost: 0,
    monthly_cost: 0,
    monthly_clients: 0,
    hourly_rate: 0,
    level: 'intermediário',
    region: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const analysis = await analyzePricing(formData);
      setResult(analysis);
    } catch (error) {
      console.error('Erro na análise:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#4A3F3F] mb-2 flex items-center gap-2">
          <Calculator className="text-[#D48C8C]" />
          Consultoria de Preços Inteligente
        </h1>
        <p className="text-[#6D5D5D]">
          Descubra se você está cobrando o valor justo e como aumentar seu lucro com a ajuda da nossa IA especialista.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-8 rounded-[2rem] shadow-sm border border-[#F8E8E8]"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#6D5D5D] mb-1">Nome do Serviço</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Limpeza de Pele, Design de Sobrancelhas"
                  value={formData.service_name}
                  onChange={e => setFormData({...formData, service_name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-[#F8E8E8] focus:outline-none focus:border-[#D48C8C]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#6D5D5D] mb-1">Duração (minutos)</label>
                <input 
                  type="number" 
                  required
                  value={formData.duration}
                  onChange={e => setFormData({...formData, duration: Number(e.target.value)})}
                  className="w-full px-4 py-3 rounded-xl border border-[#F8E8E8] focus:outline-none focus:border-[#D48C8C]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#6D5D5D] mb-1">Preço Atual (R$)</label>
                <input 
                  type="number" 
                  required
                  value={formData.current_price}
                  onChange={e => setFormData({...formData, current_price: Number(e.target.value)})}
                  className="w-full px-4 py-3 rounded-xl border border-[#F8E8E8] focus:outline-none focus:border-[#D48C8C]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#6D5D5D] mb-1">Custo Insumos (R$)</label>
                <input 
                  type="number" 
                  required
                  value={formData.supplies_cost}
                  onChange={e => setFormData({...formData, supplies_cost: Number(e.target.value)})}
                  className="w-full px-4 py-3 rounded-xl border border-[#F8E8E8] focus:outline-none focus:border-[#D48C8C]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#6D5D5D] mb-1">Custo Fixo Mensal (R$)</label>
                <input 
                  type="number" 
                  required
                  value={formData.monthly_cost}
                  onChange={e => setFormData({...formData, monthly_cost: Number(e.target.value)})}
                  className="w-full px-4 py-3 rounded-xl border border-[#F8E8E8] focus:outline-none focus:border-[#D48C8C]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#6D5D5D] mb-1">Atendimentos/Mês</label>
                <input 
                  type="number" 
                  required
                  value={formData.monthly_clients}
                  onChange={e => setFormData({...formData, monthly_clients: Number(e.target.value)})}
                  className="w-full px-4 py-3 rounded-xl border border-[#F8E8E8] focus:outline-none focus:border-[#D48C8C]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#6D5D5D] mb-1">Valor da sua Hora (R$)</label>
                <input 
                  type="number" 
                  required
                  value={formData.hourly_rate}
                  onChange={e => setFormData({...formData, hourly_rate: Number(e.target.value)})}
                  className="w-full px-4 py-3 rounded-xl border border-[#F8E8E8] focus:outline-none focus:border-[#D48C8C]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#6D5D5D] mb-1">Seu Nível</label>
                <select 
                  value={formData.level}
                  onChange={e => setFormData({...formData, level: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-[#F8E8E8] focus:outline-none focus:border-[#D48C8C]"
                >
                  <option value="iniciante">Iniciante</option>
                  <option value="intermediário">Intermediário</option>
                  <option value="avançado">Avançado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#6D5D5D] mb-1">Sua Cidade/Região</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: São Paulo - SP"
                  value={formData.region}
                  onChange={e => setFormData({...formData, region: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-[#F8E8E8] focus:outline-none focus:border-[#D48C8C]"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#D48C8C] text-white rounded-xl font-bold shadow-lg hover:bg-[#C27B7B] transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" /> Analisando...
                </>
              ) : (
                <>
                  <Sparkles size={20} /> Gerar Análise Financeira
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Results Section */}
        <div className="space-y-6">
          {!result && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white/50 border-2 border-dashed border-[#F8E8E8] rounded-[2rem]">
              <Calculator size={48} className="text-[#F8E8E8] mb-4" />
              <p className="text-[#9E8E8E]">Preencha os dados ao lado para receber sua consultoria personalizada.</p>
            </div>
          )}

          {loading && (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-[2rem] shadow-sm border border-[#F8E8E8]">
              <div className="relative mb-6">
                <div className="w-16 h-16 border-4 border-[#F8E8E8] border-t-[#D48C8C] rounded-full animate-spin"></div>
                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#D48C8C]" />
              </div>
              <h3 className="text-xl font-serif font-bold mb-2">Nossa IA está calculando...</h3>
              <p className="text-[#6D5D5D]">Analisando custos, concorrência e margem de lucro ideal para você.</p>
            </div>
          )}

          {result && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              {/* Diagnosis Card */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#F8E8E8]">
                <div className="flex items-center gap-2 text-[#D48C8C] font-bold mb-3">
                  <TrendingUp size={20} />
                  Diagnóstico Geral
                </div>
                <p className="text-[#4A3F3F] font-medium leading-relaxed">{result.diagnostico}</p>
                <div className="mt-4 p-4 bg-[#FFF9F9] rounded-2xl border border-[#F8E8E8] text-sm text-[#6D5D5D]">
                  {result.analise_preco_atual}
                </div>
              </div>

              {/* Pricing Suggestions */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#D48C8C] p-6 rounded-3xl text-white shadow-lg">
                  <div className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">Preço Ideal</div>
                  <div className="text-2xl font-bold">{result.preco_sugerido}</div>
                  <p className="text-[10px] mt-2 opacity-90">Margem de lucro recomendada para crescimento.</p>
                </div>
                <div className="bg-[#4A3F3F] p-6 rounded-3xl text-white shadow-lg">
                  <div className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">Preço Premium</div>
                  <div className="text-2xl font-bold">{result.preco_premium}</div>
                  <p className="text-[10px] mt-2 opacity-90">Para clientes que buscam exclusividade.</p>
                </div>
              </div>

              {/* Errors & Suggestions */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-[#F8E8E8]">
                  <h4 className="text-sm font-bold text-red-400 flex items-center gap-2 mb-4">
                    <AlertCircle size={16} /> Erros Comuns
                  </h4>
                  <ul className="space-y-2">
                    {result.erros_identificados.map((erro, i) => (
                      <li key={i} className="text-xs text-[#6D5D5D] flex gap-2">
                        <span className="text-red-300">•</span> {erro}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-[#F8E8E8]">
                  <h4 className="text-sm font-bold text-green-500 flex items-center gap-2 mb-4">
                    <CheckCircle2 size={16} /> Sugestões
                  </h4>
                  <ul className="space-y-2">
                    {result.sugestoes.map((sug, i) => (
                      <li key={i} className="text-xs text-[#6D5D5D] flex gap-2">
                        <span className="text-green-300">•</span> {sug}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Strategic Tip */}
              <div className="bg-[#FFF9F9] p-6 rounded-3xl border-2 border-dashed border-[#D48C8C]">
                <h4 className="text-[#D48C8C] font-bold flex items-center gap-2 mb-2">
                  <Lightbulb size={20} /> Dica de Ouro
                </h4>
                <p className="text-sm text-[#4A3F3F] italic leading-relaxed">
                  {result.dica_estrategica}
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
