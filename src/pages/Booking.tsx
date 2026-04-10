import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, where, getDocs, addDoc, limit, doc, getDoc } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../firebase';
import { Professional, Service, Appointment, Staff } from '../types';
import { format, addDays, startOfDay, isSameDay, parseISO, setHours, setMinutes, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, Clock, Scissors, CheckCircle2, ChevronRight, ChevronLeft, User, LogIn, UserPlus, Image as ImageIcon, CreditCard, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

export default function Booking() {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Selection state
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<{ id: string, name: string } | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [busySlots, setBusySlots] = useState<string[]>([]);
  const [clientInfo, setClientInfo] = useState({ name: '', phone: '' });
  const [bookingMode, setBookingMode] = useState<'choice' | 'guest' | 'login'>('choice');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        setClientInfo({ name: u.displayName || '', phone: '' });
        setBookingMode('login');
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(collection(db, 'professionals'), where('slug', '==', slug), limit(1));
        const snap = await getDocs(q);
        if (snap.empty) {
          toast.error('Profissional não encontrado.');
          navigate('/');
          return;
        }
        const profData = { id: snap.docs[0].id, ...snap.docs[0].data() } as Professional;
        setProfessional(profData);

        // Fetch services
        const sq = query(collection(db, 'services'), where('professionalId', '==', profData.id));
        const sSnap = await getDocs(sq);
        setServices(sSnap.docs.map(d => ({ id: d.id, ...d.data() } as Service)));

        // Fetch staff
        try {
          const stq = query(collection(db, 'staff'), where('professionalId', '==', profData.id));
          const stSnap = await getDocs(stq);
          const allStaff = stSnap.docs.map(d => ({ id: d.id, ...d.data() } as Staff));
          setStaff(allStaff.filter(s => s.active));
        } catch (err) {
          console.error("Error fetching staff:", err);
          setStaff([]); // Fallback to empty staff if permissions fail
        }

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  useEffect(() => {
    const fetchBusySlots = async () => {
      if (!selectedStaff || !selectedDate) return;
      
      const start = startOfDay(selectedDate).toISOString();
      const end = addDays(startOfDay(selectedDate), 1).toISOString();
      
      const q = query(
        collection(db, 'appointments'),
        where('staffId', '==', selectedStaff.id),
        where('date', '>=', start),
        where('date', '<', end)
      );
      
      const snap = await getDocs(q);
      const busy = snap.docs
        .filter(d => d.data().status !== 'cancelled')
        .map(d => format(parseISO(d.data().date), 'HH:mm'));
      setBusySlots(busy);
    };
    
    fetchBusySlots();
  }, [selectedStaff, selectedDate]);

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast.success('Login realizado!');
    } catch (error) {
      toast.error('Erro ao fazer login.');
    }
  };

  const handleBooking = async () => {
    if (!professional || !selectedService || !selectedTime || !selectedStaff) return;
    
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const appointmentDate = setMinutes(setHours(selectedDate, hours), minutes);
    const dateIso = appointmentDate.toISOString();

    // Double booking check
    const q = query(
      collection(db, 'appointments'),
      where('staffId', '==', selectedStaff.id),
      where('date', '==', dateIso)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      toast.error('Este horário acabou de ser preenchido. Por favor, escolha outro.');
      setStep(3); // Go back to time selection
      return;
    }

    try {
      await addDoc(collection(db, 'appointments'), {
        professionalId: professional.id,
        staffId: selectedStaff.id,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        clientId: user?.uid || 'guest',
        clientName: clientInfo.name,
        clientPhone: clientInfo.phone,
        date: dateIso,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      
      if (professional.pixKey && (professional.depositPercentage || 0) > 0) {
        setStep(7); // Deposit step
      } else {
        setStep(6); // Success step
      }
    } catch (error) {
      toast.error('Erro ao agendar. Tente novamente.');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FFF9F9] text-[#D48C8C]">Carregando...</div>;
  if (!professional) return null;

  return (
    <div className="min-h-screen bg-[#FFF9F9] py-10 px-6">
      <div className="max-w-xl mx-auto">
        {/* Gallery */}
        {professional.gallery && professional.gallery.length > 0 && (
          <div className="mb-8 flex gap-3 overflow-x-auto pb-4 no-scrollbar">
            {professional.gallery.map((url, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="flex-shrink-0 w-48 h-48 rounded-[2rem] overflow-hidden shadow-lg border-2 border-white"
              >
                <img src={url} alt={`Gallery ${i}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </motion.div>
            ))}
          </div>
        )}

        <header className="text-center mb-10">
          <div className="w-20 h-20 bg-white rounded-full mx-auto mb-4 shadow-md flex items-center justify-center text-2xl font-bold text-[#D48C8C] border-2 border-[#F8E8E8]">
            {professional.businessName.charAt(0)}
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#4A3F3F]">{professional.businessName}</h1>
          <p className="text-sm text-[#9E8E8E]">Agendamento Online</p>
        </header>

        <div className="bg-white rounded-3xl shadow-xl border border-[#F8E8E8] overflow-hidden">
          {/* Progress Bar */}
          <div className="h-1.5 bg-[#F8E8E8] flex">
            <div 
              className="bg-[#D48C8C] transition-all duration-500" 
              style={{ width: `${(step / 6) * 100}%` }}
            />
          </div>

          <div className="p-8">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className="text-xl font-serif font-bold flex items-center gap-2">
                    <Scissors size={20} className="text-[#D48C8C]" /> Escolha o serviço
                  </h2>
                  <div className="space-y-3">
                    {services.map(service => (
                      <button
                        key={service.id}
                        onClick={() => { setSelectedService(service); setStep(2); }}
                        className="w-full p-5 rounded-2xl border border-[#F8E8E8] hover:border-[#D48C8C] hover:bg-[#FFF9F9] transition-all flex items-center justify-between group"
                      >
                        <div className="text-left">
                          <p className="font-bold text-[#4A3F3F] group-hover:text-[#D48C8C]">{service.name}</p>
                          <p className="text-xs text-[#9E8E8E]">{service.duration} min • R$ {service.price.toFixed(2)}</p>
                        </div>
                        <ChevronRight size={20} className="text-[#F8E8E8] group-hover:text-[#D48C8C]" />
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-serif font-bold flex items-center gap-2">
                      <User size={20} className="text-[#D48C8C]" /> Com quem?
                    </h2>
                    <button onClick={() => setStep(1)} className="text-xs text-[#D48C8C] font-medium">Alterar serviço</button>
                  </div>
                  <div className="space-y-3">
                    {/* Master Professional */}
                    <button
                      onClick={() => { setSelectedStaff({ id: professional.id, name: professional.name }); setStep(3); }}
                      className="w-full p-5 rounded-2xl border border-[#F8E8E8] hover:border-[#D48C8C] hover:bg-[#FFF9F9] transition-all flex items-center gap-4 group"
                    >
                      <div className="w-12 h-12 bg-[#FFF9F9] rounded-xl flex items-center justify-center text-[#D48C8C] font-bold">
                        {(professional.name || professional.businessName || 'P').charAt(0).toUpperCase()}
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-bold text-[#4A3F3F] group-hover:text-[#D48C8C]">{professional.name || 'Proprietária'}</p>
                        <p className="text-xs text-[#9E8E8E]">Proprietária</p>
                      </div>
                      <ChevronRight size={20} className="text-[#F8E8E8] group-hover:text-[#D48C8C]" />
                    </button>

                    {/* Staff members */}
                    {staff.map(member => (
                      <button
                        key={member.id}
                        onClick={() => { setSelectedStaff({ id: member.id, name: member.name }); setStep(3); }}
                        className="w-full p-5 rounded-2xl border border-[#F8E8E8] hover:border-[#D48C8C] hover:bg-[#FFF9F9] transition-all flex items-center gap-4 group"
                      >
                        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 font-bold">
                          {(member.name || 'F').charAt(0).toUpperCase()}
                        </div>
                        <div className="text-left flex-1">
                          <p className="font-bold text-[#4A3F3F] group-hover:text-[#D48C8C]">{member.name}</p>
                          <p className="text-xs text-[#9E8E8E]">Profissional</p>
                        </div>
                        <ChevronRight size={20} className="text-[#F8E8E8] group-hover:text-[#D48C8C]" />
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-serif font-bold flex items-center gap-2">
                      <CalendarIcon size={20} className="text-[#D48C8C]" /> Data e Horário
                    </h2>
                    <button onClick={() => setStep(2)} className="text-xs text-[#D48C8C] font-medium">Alterar profissional</button>
                  </div>

                  <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                    {[...Array(14)].map((_, i) => {
                      const date = addDays(new Date(), i);
                      const isSelected = isSameDay(date, selectedDate);
                      return (
                        <button
                          key={i}
                          onClick={() => setSelectedDate(date)}
                          className={cn(
                            "flex-shrink-0 w-16 py-3 rounded-2xl border transition-all flex flex-col items-center",
                            isSelected ? "bg-[#D48C8C] border-[#D48C8C] text-white shadow-md" : "bg-white border-[#F8E8E8] text-[#4A3F3F]"
                          )}
                        >
                          <span className="text-[10px] uppercase font-bold opacity-70">{format(date, 'EEE', { locale: ptBR })}</span>
                          <span className="text-lg font-bold">{format(date, 'd')}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'].map(time => {
                      const isBusy = busySlots.includes(time);
                      if (isBusy) return null;
                      
                      return (
                        <button
                          key={time}
                          onClick={() => { setSelectedTime(time); setStep(4); }}
                          className={cn(
                            "py-3 rounded-xl border text-sm font-medium transition-all",
                            selectedTime === time ? "bg-[#D48C8C] border-[#D48C8C] text-white shadow-md" : "bg-white border-[#F8E8E8] text-[#4A3F3F] hover:border-[#D48C8C]"
                          )}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div 
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className="text-xl font-serif font-bold text-center">Como deseja agendar?</h2>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <button 
                      onClick={() => setBookingMode('guest')}
                      className={cn(
                        "p-6 rounded-[2rem] border-2 text-left transition-all relative",
                        bookingMode === 'guest' ? "border-[#D48C8C] bg-[#FFF9F9]" : "border-[#F8E8E8] bg-white"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gray-100 rounded-2xl text-gray-500">
                          <UserPlus size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-[#4A3F3F]">Continuar sem login</p>
                          <p className="text-xs text-[#9E8E8E]">Rápido e simples</p>
                        </div>
                      </div>
                      <div className="mt-4 p-3 bg-orange-50 rounded-xl border border-orange-100">
                        <p className="text-[10px] text-orange-700 font-medium">
                          💡 Com o agendamento por login você pode ganhar cupons e promoções exclusivas
                        </p>
                      </div>
                    </button>

                    <button 
                      onClick={user ? () => setBookingMode('login') : handleGoogleLogin}
                      className={cn(
                        "p-6 rounded-[2rem] border-2 text-left transition-all",
                        bookingMode === 'login' ? "border-[#D48C8C] bg-[#FFF9F9]" : "border-[#F8E8E8] bg-white"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 rounded-2xl text-blue-500">
                          <LogIn size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-[#4A3F3F]">{user ? 'Continuar como ' + user.displayName : 'Fazer login com Google'}</p>
                          <p className="text-xs text-[#9E8E8E]">Salve seu histórico e ganhe benefícios</p>
                        </div>
                      </div>
                    </button>
                  </div>

                  <button 
                    onClick={() => setStep(5)}
                    className="w-full py-5 bg-[#D48C8C] text-white rounded-2xl font-bold shadow-lg hover:bg-[#C27B7B] transition-all"
                  >
                    Próximo Passo
                  </button>
                </motion.div>
              )}

              {step === 5 && (
                <motion.div 
                  key="step5"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-serif font-bold">Confirme seus dados</h2>
                    <button onClick={() => setStep(4)} className="text-xs text-[#D48C8C] font-medium">Voltar</button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#6D5D5D] mb-1">Nome Completo</label>
                      <input 
                        type="text" 
                        value={clientInfo.name}
                        onChange={e => setClientInfo({ ...clientInfo, name: e.target.value })}
                        className="w-full px-4 py-4 rounded-2xl border border-[#F8E8E8] focus:outline-none focus:border-[#D48C8C]"
                        placeholder="Como podemos te chamar?"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#6D5D5D] mb-1">WhatsApp</label>
                      <input 
                        type="tel" 
                        value={clientInfo.phone}
                        onChange={e => setClientInfo({ ...clientInfo, phone: e.target.value })}
                        className="w-full px-4 py-4 rounded-2xl border border-[#F8E8E8] focus:outline-none focus:border-[#D48C8C]"
                        placeholder="Ex: 11999999999"
                      />
                    </div>
                  </div>

                  <div className="p-6 bg-[#FFF9F9] rounded-2xl border border-[#F8E8E8] space-y-2">
                    <p className="text-xs text-[#9E8E8E] uppercase font-bold tracking-wider">Resumo do Agendamento</p>
                    <p className="font-bold text-[#4A3F3F]">{selectedService?.name}</p>
                    <p className="text-sm text-[#6D5D5D]">Profissional: {selectedStaff?.name}</p>
                    <p className="text-sm text-[#6D5D5D]">{format(selectedDate, "d 'de' MMMM", { locale: ptBR })} às {selectedTime}</p>
                  </div>

                  <button 
                    onClick={handleBooking}
                    disabled={!clientInfo.name || !clientInfo.phone}
                    className="w-full py-5 bg-[#D48C8C] text-white rounded-2xl font-bold shadow-lg hover:bg-[#C27B7B] transition-all disabled:opacity-50"
                  >
                    Confirmar Agendamento
                  </button>
                </motion.div>
              )}

              {step === 6 && (
                <motion.div 
                  key="step6"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-10 space-y-6"
                >
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full mx-auto flex items-center justify-center">
                    <CheckCircle2 size={40} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-serif font-bold text-[#4A3F3F]">Agendamento Realizado!</h2>
                    <p className="text-[#6D5D5D] mt-2">Enviamos uma confirmação para seu WhatsApp.</p>
                  </div>
                  <div className="p-6 bg-[#FFF9F9] rounded-2xl border border-[#F8E8E8] text-left">
                    <p className="text-sm font-bold text-[#4A3F3F]">{selectedService?.name}</p>
                    <p className="text-sm text-[#6D5D5D]">Profissional: {selectedStaff?.name}</p>
                    <p className="text-sm text-[#6D5D5D]">{format(selectedDate, "d 'de' MMMM", { locale: ptBR })} às {selectedTime}</p>
                    <p className="text-sm text-[#6D5D5D] mt-2">{professional.businessName}</p>
                  </div>
                  <button 
                    onClick={() => { setStep(1); setSelectedTime(null); }}
                    className="text-[#D48C8C] font-medium hover:underline"
                  >
                    Fazer outro agendamento
                  </button>
                </motion.div>
              )}

              {step === 7 && (
                <motion.div 
                  key="step7"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6 text-center"
                >
                  <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full mx-auto flex items-center justify-center">
                    <CreditCard size={40} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-serif font-bold text-[#4A3F3F]">Reserva de Horário</h2>
                    <p className="text-[#6D5D5D] mt-2">Para garantir sua vaga, solicitamos o pagamento de um sinal de <b>{professional.depositPercentage}%</b>.</p>
                  </div>

                  <div className="p-6 bg-[#FFF9F9] rounded-3xl border-2 border-dashed border-[#D48C8C] space-y-4">
                    <div>
                      <p className="text-xs text-[#9E8E8E] uppercase font-bold">Valor do Sinal</p>
                      <p className="text-3xl font-bold text-[#D48C8C]">
                        R$ {((selectedService?.price || 0) * (professional.depositPercentage || 0) / 100).toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="pt-4 border-t border-[#F8E8E8]">
                      <p className="text-xs text-[#9E8E8E] font-medium mb-2">Chave PIX:</p>
                      <div className="flex items-center justify-center gap-2 bg-white p-3 rounded-xl border border-[#F8E8E8]">
                        <span className="font-mono text-sm font-bold truncate">{professional.pixKey}</span>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(professional.pixKey || '');
                            toast.success('Chave PIX copiada!');
                          }}
                          className="p-2 text-[#D48C8C] hover:bg-[#FFF9F9] rounded-lg"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-[#9E8E8E] italic">
                    * Após o pagamento, envie o comprovante pelo WhatsApp. Seu agendamento ficará como "Pendente" até a nossa confirmação.
                  </div>

                  <button 
                    onClick={() => setStep(6)}
                    className="w-full py-5 bg-[#D48C8C] text-white rounded-2xl font-bold shadow-lg hover:bg-[#C27B7B] transition-all"
                  >
                    Já realizei o pagamento
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
