import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Calendar, MessageSquare, Users, Zap, ArrowRight } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#FFF9F9] text-[#4A3F3F] font-sans">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="text-2xl font-serif font-bold text-[#D48C8C]">auralumi</div>
        <div className="flex gap-6 items-center">
          <Link to="/funcionalidades" className="text-sm font-medium hover:text-[#D48C8C] transition-colors">Funcionalidades</Link>
          <Link to="/login" className="px-4 py-2 text-sm font-medium hover:text-[#D48C8C] transition-colors">Entrar</Link>
          <Link to="/login" className="px-4 py-2 text-sm font-medium bg-[#D48C8C] text-white rounded-full shadow-sm hover:bg-[#C27B7B] transition-all">Começar Grátis</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="px-6 pt-16 pb-24 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-6xl font-serif font-bold leading-tight mb-6">
            Sua agenda de estética <br />
            <span className="text-[#D48C8C]">no piloto automático.</span>
          </h1>
          <p className="text-lg md:text-xl text-[#6D5D5D] max-w-2xl mx-auto mb-10">
            Agendamento online, lembretes automáticos via WhatsApp e gestão de clientes em um só lugar. Feito para profissionais que amam o que fazem.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-[#D48C8C] text-white rounded-full text-lg font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2">
              Criar minha agenda agora <ArrowRight size={20} />
            </Link>
          </div>
        </motion.div>

        {/* Mockup Preview */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mt-20 relative max-w-4xl mx-auto"
        >
          <div className="aspect-video bg-white rounded-2xl shadow-2xl border border-[#F8E8E8] overflow-hidden flex items-center justify-center text-[#D48C8C] font-serif italic text-2xl">
            [ auralumi Dashboard Preview ]
          </div>
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#F8E8E8] rounded-full -z-10 blur-2xl opacity-60"></div>
          <div className="absolute -top-6 -left-6 w-32 h-32 bg-[#D48C8C] rounded-full -z-10 blur-2xl opacity-20"></div>
        </motion.div>
      </header>

      {/* Features */}
      <section className="bg-white py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Tudo o que você precisa</h2>
            <p className="text-[#6D5D5D]">Simples, rápido e focado no seu crescimento.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<Calendar className="text-[#D48C8C]" />}
              title="Agendamento Online"
              description="Seu link exclusivo para clientes agendarem 24h por dia, sem você precisar responder."
            />
            <FeatureCard 
              icon={<MessageSquare className="text-[#D48C8C]" />}
              title="WhatsApp Automático"
              description="Confirmações e lembretes enviados automaticamente para reduzir faltas em até 80%."
            />
            <FeatureCard 
              icon={<Users className="text-[#D48C8C]" />}
              title="Gestão de Clientes"
              description="Histórico completo de atendimentos e preferências de cada cliente na palma da mão."
            />
            <FeatureCard 
              icon={<Zap className="text-[#D48C8C]" />}
              title="Reativação Inteligente"
              description="O sistema avisa quando uma cliente sumiu e sugere uma mensagem de retorno."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[#F8E8E8] text-center text-sm text-[#9E8E8E]">
        <p>&copy; 2026 auralumi. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-2xl bg-[#FFF9F9] border border-[#F8E8E8] hover:border-[#D48C8C] transition-colors group">
      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-serif font-bold mb-3">{title}</h3>
      <p className="text-[#6D5D5D] leading-relaxed">{description}</p>
    </div>
  );
}
