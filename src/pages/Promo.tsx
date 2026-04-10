import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  Star, 
  TrendingUp, 
  Clock, 
  Smartphone, 
  ShieldCheck,
  ArrowRight,
  Play
} from 'lucide-react';

export default function Promo() {
  return (
    <div className="min-h-screen bg-[#FFF9F9] text-[#4A3F3F] font-sans overflow-x-hidden">
      {/* Floating CTA for Mobile */}
      <div className="fixed bottom-6 left-6 right-6 z-50 md:hidden">
        <Link to="/login" className="w-full py-4 bg-[#D48C8C] text-white rounded-full font-bold shadow-2xl flex items-center justify-center gap-2 animate-bounce">
          Começar Agora Grátis <ArrowRight size={18} />
        </Link>
      </div>

      {/* Header */}
      <nav className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <Link to="/" className="text-2xl font-serif font-bold text-[#D48C8C]">auralumi</Link>
        <Link to="/login" className="hidden md:block px-6 py-2 border-2 border-[#D48C8C] text-[#D48C8C] rounded-full font-bold hover:bg-[#D48C8C] hover:text-white transition-all">
          Área do Cliente
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-16 md:py-24 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#F8E8E8] text-[#D48C8C] rounded-full text-sm font-bold mb-6">
            <Star size={16} fill="currentColor" />
            <span>O sistema nº 1 para Estética e Beleza</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold leading-tight mb-8">
            Transforme seu talento em um <span className="text-[#D48C8C] italic">império lucrativo.</span>
          </h1>
          <p className="text-xl text-[#6D5D5D] mb-10 leading-relaxed">
            Pare de perder horas no WhatsApp e foque no que você faz de melhor. O <strong>auralumi</strong> cuida da sua agenda, financeiro e clientes enquanto você brilha.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/login" className="px-10 py-5 bg-[#D48C8C] text-white rounded-full text-lg font-bold shadow-xl hover:bg-[#C27B7B] hover:scale-105 transition-all flex items-center justify-center gap-2">
              Quero crescer com a auralumi <ArrowRight size={20} />
            </Link>
          </div>
          <p className="mt-4 text-sm text-[#9E8E8E] flex items-center gap-2">
            <CheckCircle2 size={16} className="text-green-500" /> Teste grátis por 14 dias. Sem cartão de crédito.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="relative z-10 bg-white p-4 rounded-[2.5rem] shadow-2xl border border-[#F8E8E8]">
            <div className="aspect-[4/5] bg-[#FFF9F9] rounded-[2rem] overflow-hidden flex items-center justify-center relative group">
              <img 
                src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=1000" 
                alt="Profissional de beleza usando o sistema" 
                className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <div className="w-20 h-20 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-transform">
                  <Play size={32} fill="currentColor" />
                </div>
              </div>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#D48C8C] rounded-full blur-3xl opacity-20 -z-10"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#F8E8E8] rounded-full blur-3xl opacity-60 -z-10"></div>
        </motion.div>
      </section>

      {/* Social Proof Stats */}
      <section className="bg-white py-12 border-y border-[#F8E8E8]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-[#D48C8C] mb-1">+5.000</div>
            <div className="text-sm text-[#6D5D5D]">Profissionais</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-[#D48C8C] mb-1">80%</div>
            <div className="text-sm text-[#6D5D5D]">Menos Faltas</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-[#D48C8C] mb-1">24/7</div>
            <div className="text-sm text-[#6D5D5D]">Agendamento</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-[#D48C8C] mb-1">4.9/5</div>
            <div className="text-sm text-[#6D5D5D]">Avaliação</div>
          </div>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">Você ainda usa papel e caneta?</h2>
          <p className="text-xl text-[#6D5D5D] max-w-2xl mx-auto">
            O mundo mudou, e suas clientes também. Se você não está no digital, você está perdendo dinheiro.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <PainCard 
            title="Agenda Lotada de 'Vácuo'"
            description="Clientes que marcam e não aparecem? Nossos lembretes automáticos via WhatsApp reduzem as faltas drasticamente."
            icon={<Clock className="text-red-400" />}
          />
          <PainCard 
            title="Escrava do WhatsApp"
            description="Passa o dia respondendo 'tem horário'? Deixe que a auralumi agende para você enquanto você atende."
            icon={<Smartphone className="text-red-400" />}
          />
          <PainCard 
            title="Financeiro na Sorte"
            description="Não sabe quanto lucrou no mês? Tenha relatórios automáticos de faturamento e comissões."
            icon={<TrendingUp className="text-red-400" />}
          />
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[#F8E8E8]/30 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-center mb-16">Quem usa, <span className="text-[#D48C8C]">brilha mais.</span></h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TestimonialCard 
              name="Juliana Silva"
              role="Designer de Sobrancelhas"
              content="Depois da auralumi, minha agenda vive lotada e eu não preciso mais ficar 24h no celular. Minhas clientes amam a facilidade!"
              image="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150"
            />
            <TestimonialCard 
              name="Renata Costa"
              role="Dona de Esmalteria"
              content="O controle financeiro mudou meu negócio. Agora sei exatamente onde estou investindo e quanto estou lucrando de verdade."
              image="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150"
            />
            <TestimonialCard 
              name="Dra. Beatriz"
              role="Esteta"
              content="A reativação de clientes é mágica. O sistema me avisa quem não volta há 30 dias e eu só clico em enviar. Faturamento subiu 30%!"
              image="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150"
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 text-center max-w-4xl mx-auto">
        <div className="bg-[#D48C8C] rounded-[3rem] p-12 md:p-20 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-serif font-bold mb-8">Pronta para o próximo nível?</h2>
            <p className="text-xl mb-12 opacity-90">
              Junte-se a milhares de profissionais que já transformaram seus negócios com a auralumi.
            </p>
            <Link to="/login" className="inline-flex items-center gap-2 px-12 py-6 bg-white text-[#D48C8C] rounded-full text-xl font-bold hover:bg-[#FFF9F9] hover:scale-105 transition-all shadow-xl">
              Começar Agora Grátis <ArrowRight size={24} />
            </Link>
            <p className="mt-6 text-sm opacity-70">Não pedimos cartão de crédito para o teste.</p>
          </div>
          {/* Decorative circles */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[#F8E8E8] text-center">
        <div className="text-2xl font-serif font-bold text-[#D48C8C] mb-4">auralumi</div>
        <p className="text-[#9E8E8E] text-sm mb-8 max-w-md mx-auto">
          A essência da beleza e a luz da gestão. O parceiro ideal para o seu crescimento profissional.
        </p>
        <div className="flex justify-center gap-6 mb-8">
          <a href="#" className="text-[#6D5D5D] hover:text-[#D48C8C]">Instagram</a>
          <a href="#" className="text-[#6D5D5D] hover:text-[#D48C8C]">WhatsApp</a>
          <a href="#" className="text-[#6D5D5D] hover:text-[#D48C8C]">Suporte</a>
        </div>
        <p className="text-[#9E8E8E] text-xs">&copy; 2026 auralumi. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

function PainCard({ title, description, icon }: { title: string, description: string, icon: React.ReactNode }) {
  return (
    <div className="p-8 rounded-3xl bg-white border border-[#F8E8E8] shadow-sm hover:shadow-md transition-all">
      <div className="w-12 h-12 bg-[#FFF9F9] rounded-xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-serif font-bold mb-4">{title}</h3>
      <p className="text-[#6D5D5D] leading-relaxed">{description}</p>
    </div>
  );
}

function TestimonialCard({ name, role, content, image }: { name: string, role: string, content: string, image: string }) {
  return (
    <div className="p-8 rounded-3xl bg-white shadow-xl border border-[#F8E8E8] relative">
      <div className="flex items-center gap-4 mb-6">
        <img src={image} alt={name} className="w-14 h-14 rounded-full object-cover border-2 border-[#D48C8C]" referrerPolicy="no-referrer" />
        <div>
          <h4 className="font-bold text-[#4A3F3F]">{name}</h4>
          <p className="text-xs text-[#D48C8C] font-medium">{role}</p>
        </div>
      </div>
      <p className="text-[#6D5D5D] italic leading-relaxed">"{content}"</p>
      <div className="absolute -top-4 -right-4 w-10 h-10 bg-[#D48C8C] rounded-full flex items-center justify-center text-white shadow-lg">
        <Star size={20} fill="currentColor" />
      </div>
    </div>
  );
}
