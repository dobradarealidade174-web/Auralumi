import React from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  Zap, 
  Calendar, 
  DollarSign, 
  Package, 
  Users, 
  Smartphone, 
  MessageSquare,
  ShieldCheck,
  ArrowRight,
  Star
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function Features() {
  const features = [
    {
      icon: Calendar,
      title: "Agendamento Online 24/7",
      description: "Sua cliente agenda sozinha, a qualquer hora, sem você precisar parar o atendimento para atender o telefone.",
      color: "text-blue-500",
      bg: "bg-blue-50"
    },
    {
      icon: MessageSquare,
      title: "Automação de WhatsApp",
      description: "Lembretes de confirmação e mensagens de reativação para clientes sumidas. Reduza faltas em até 80%.",
      color: "text-green-500",
      bg: "bg-green-50"
    },
    {
      icon: DollarSign,
      title: "Gestão Financeira",
      description: "Controle total de entradas e saídas. Saiba exatamente quanto lucrou no final do dia, semana ou mês.",
      color: "text-[#D48C8C]",
      bg: "bg-[#FFF9F9]"
    },
    {
      icon: Package,
      title: "Controle de Estoque",
      description: "Gerencie seus produtos de venda e insumos. Receba alertas quando o estoque estiver acabando.",
      color: "text-orange-500",
      bg: "bg-orange-50"
    },
    {
      icon: Users,
      title: "Fidelização de Clientes",
      description: "Histórico completo de cada cliente, preferências e frequência. Transforme clientes em fãs.",
      color: "text-purple-500",
      bg: "bg-purple-50"
    },
    {
      icon: Smartphone,
      title: "Mobile First",
      description: "Feito para ser usado no celular. Gerencie todo o seu negócio na palma da sua mão, de onde estiver.",
      color: "text-indigo-500",
      bg: "bg-indigo-50"
    }
  ];

  const problems = [
    {
      before: "Agenda de papel bagunçada e difícil de ler.",
      after: "Agenda digital organizada e acessível de qualquer lugar."
    },
    {
      before: "Clientes esquecem o horário e não avisam.",
      after: "Lembretes automáticos garantem que elas compareçam."
    },
    {
      before: "Perda de tempo respondendo preço no WhatsApp.",
      after: "Link de agendamento com todos os serviços e preços."
    },
    {
      before: "Não saber se teve lucro ou prejuízo no mês.",
      after: "Relatórios financeiros claros e automáticos."
    }
  ];

  return (
    <div className="min-h-screen bg-[#FFF9F9] text-[#4A3F3F]">
      {/* Hero Section */}
      <nav className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <Link to="/" className="text-2xl font-serif font-bold text-[#D48C8C]">auralumi</Link>
        <Link to="/login" className="px-6 py-2 bg-[#D48C8C] text-white rounded-full font-medium shadow-md hover:bg-[#C27B7B] transition-all">
          Entrar no Sistema
        </Link>
      </nav>

      <header className="py-20 px-6 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-[#F8E8E8] text-[#D48C8C] text-sm font-bold mb-6"
        >
          <Star size={16} fill="currentColor" /> O Sistema Mais Completo para Estética
        </motion.div>
        <h1 className="text-5xl md:text-6xl font-serif font-bold leading-tight mb-6">
          Tudo o que você precisa para <span className="text-[#D48C8C]">brilhar</span> no seu negócio.
        </h1>
        <p className="text-xl text-[#6D5D5D] mb-10 leading-relaxed">
          Do agendamento ao financeiro, do estoque à fidelização. O auralumi é o parceiro que ajuda você a crescer com organização e sofisticação.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/login" className="w-full sm:w-auto px-10 py-5 bg-[#D48C8C] text-white rounded-full text-lg font-bold shadow-xl hover:bg-[#C27B7B] hover:scale-105 transition-all flex items-center justify-center gap-2">
            Começar Agora Grátis <ArrowRight size={20} />
          </Link>
          <p className="text-sm text-[#9E8E8E]">Teste grátis por 14 dias. Sem cartão de crédito.</p>
        </div>
      </header>

      {/* Features Grid */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Funcionalidades que encantam</h2>
          <p className="text-[#6D5D5D]">Desenhado especificamente para a rotina de quem trabalha com beleza.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-[2.5rem] border border-[#F8E8E8] shadow-sm hover:shadow-md transition-all group"
            >
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform", f.bg, f.color)}>
                <f.icon size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">{f.title}</h3>
              <p className="text-[#6D5D5D] leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Before/After Section */}
      <section className="py-20 bg-white border-y border-[#F8E8E8]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Diga adeus à bagunça</h2>
            <p className="text-[#6D5D5D]">O auralumi resolve os problemas que travam o seu crescimento.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {problems.map((p, i) => (
              <div key={i} className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 p-6 bg-red-50 rounded-3xl border border-red-100">
                  <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">Antes</p>
                  <p className="text-[#4A3F3F]">{p.before}</p>
                </div>
                <div className="flex-1 p-6 bg-green-50 rounded-3xl border border-green-100">
                  <p className="text-xs font-bold text-green-400 uppercase tracking-wider mb-2">Com auralumi</p>
                  <p className="text-[#4A3F3F] font-medium">{p.after}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 text-center">
        <div className="max-w-3xl mx-auto bg-[#D48C8C] p-12 md:p-20 rounded-[3rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-8 relative z-10">
            Pronta para levar seu negócio ao próximo nível?
          </h2>
          <Link to="/login" className="inline-flex items-center gap-2 px-12 py-5 bg-white text-[#D48C8C] rounded-full text-xl font-bold shadow-xl hover:bg-[#FFF9F9] hover:scale-105 transition-all relative z-10">
            Criar Minha Conta Grátis
          </Link>
          <p className="mt-6 text-white/80 text-sm relative z-10">Junte-se a centenas de profissionais que já transformaram sua rotina.</p>
        </div>
      </section>

      <footer className="py-12 px-6 border-t border-[#F8E8E8] text-center text-sm text-[#9E8E8E]">
        <p>&copy; 2026 auralumi. O sistema que entende a sua beleza.</p>
      </footer>
    </div>
  );
}
