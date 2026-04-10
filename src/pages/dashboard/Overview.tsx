import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, User, CheckCircle2, XCircle, AlertCircle, Plus, Scissors, Copy, ExternalLink, Globe, Zap } from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy, addDoc, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { Appointment, Service, Professional, Automation, Client, Staff } from '../../types';
import { format, isToday, parseISO, differenceInDays, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { getWhatsAppLink } from '../../lib/whatsapp';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export default function Overview() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [completionData, setCompletionData] = useState({
    finalAmount: '',
    additionalServices: [] as { name: string, price: number }[],
    newServiceName: '',
    newServicePrice: ''
  });
  
  // Form state for manual appointment
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    serviceId: '',
    staffId: '',
    date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
  });

  const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
    const errInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified,
      },
      operationType,
      path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    toast.error('Erro de permissão no banco de dados. Verifique suas configurações.');
    throw new Error(JSON.stringify(errInfo));
  };

  useEffect(() => {
    if (!auth.currentUser) return;

    // Fetch professional data for the slug
    const profRef = doc(db, 'professionals', auth.currentUser.uid);
    getDoc(profRef).then(snap => {
      if (snap.exists()) {
        setProfessional(snap.data() as Professional);
        // Default staffId to master if not set
        setFormData(prev => ({ ...prev, staffId: auth.currentUser?.uid || '' }));
      }
    });

    // Fetch services for the modal
    const servicesQuery = query(collection(db, 'services'), where('professionalId', '==', auth.currentUser.uid));
    onSnapshot(servicesQuery, (snap) => {
      setServices(snap.docs.map(d => ({ id: d.id, ...d.data() } as Service)));
    });

    // Fetch staff
    const staffQuery = query(collection(db, 'staff'), where('professionalId', '==', auth.currentUser.uid));
    onSnapshot(staffQuery, (snap) => {
      const allStaff = snap.docs.map(d => ({ id: d.id, ...d.data() } as Staff));
      setStaff(allStaff.filter(s => s.active));
    });

    // Fetch automations
    const autoQuery = query(collection(db, 'automations'), where('professionalId', '==', auth.currentUser.uid), where('active', '==', true));
    onSnapshot(autoQuery, (snap) => {
      setAutomations(snap.docs.map(d => ({ id: d.id, ...d.data() } as Automation)));
    });

    const q = query(
      collection(db, 'appointments'),
      where('professionalId', '==', auth.currentUser.uid),
      orderBy('date', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
      const todayDocs = docs.filter(app => isToday(parseISO(app.date)));
      setAppointments(todayDocs);
      
      // Calculate suggestions based on automations and all appointments
      generateSuggestions(docs);
      
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'appointments');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [automations.length]); // Re-run when automations change

  const generateSuggestions = (allApps: Appointment[]) => {
    const newSuggestions: any[] = [];
    
    // Group appointments by client phone to find last visit
    const clientsMap = new Map<string, { name: string, lastVisit: Date }>();
    allApps.forEach(app => {
      const date = parseISO(app.date);
      const existing = clientsMap.get(app.clientPhone);
      if (!existing || date > existing.lastVisit) {
        clientsMap.set(app.clientPhone, { name: app.clientName, lastVisit: date });
      }
    });

    automations.forEach(auto => {
      if (auto.triggerType === 'days_since_last_visit') {
        clientsMap.forEach((client, phone) => {
          const daysSince = differenceInDays(new Date(), client.lastVisit);
          if (daysSince >= auto.triggerValue) {
            newSuggestions.push({
              id: `${auto.id}-${phone}`,
              clientName: client.name,
              clientPhone: phone,
              message: auto.messageTemplate.replace('{clientName}', client.name),
              type: 'reactivation',
              automationName: auto.name
            });
          }
        });
      }
    });

    setSuggestions(newSuggestions.slice(0, 3)); // Show top 3
  };

  const handleManualBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !formData.serviceId || !formData.staffId) return;

    const selectedService = services.find(s => s.id === formData.serviceId);
    if (!selectedService) return;

    const appointmentDate = new Date(formData.date).toISOString();

    // Check for double booking
    const q = query(
      collection(db, 'appointments'), 
      where('staffId', '==', formData.staffId),
      where('date', '==', appointmentDate)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      toast.error('Este profissional já tem um agendamento neste horário!');
      return;
    }

    try {
      await addDoc(collection(db, 'appointments'), {
        professionalId: auth.currentUser.uid,
        staffId: formData.staffId,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        clientName: formData.clientName,
        clientPhone: formData.clientPhone,
        date: appointmentDate,
        status: 'confirmed', // Manual bookings are usually confirmed
        createdAt: new Date().toISOString()
      });
      toast.success('Agendamento realizado!');
      setIsModalOpen(false);
      setFormData({ 
        clientName: '', 
        clientPhone: '', 
        serviceId: '', 
        staffId: auth.currentUser.uid, 
        date: format(new Date(), "yyyy-MM-dd'T'HH:mm") 
      });
    } catch (error) {
      toast.error('Erro ao agendar.');
    }
  };

  const copyLink = () => {
    if (!professional?.slug) {
      toast.error('Configure seu link nas configurações primeiro!');
      return;
    }
    const link = `${window.location.origin}/b/${professional.slug}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copiado para a área de transferência!');
  };

  const handleStatusUpdate = async (appId: string, status: Appointment['status']) => {
    try {
      await updateDoc(doc(db, 'appointments', appId), { status });
      toast.success(`Status atualizado para ${status === 'confirmed' ? 'confirmado' : 'cancelado'}`);
    } catch (error) {
      toast.error('Erro ao atualizar status.');
    }
  };

  const openCompletionModal = (app: Appointment) => {
    setSelectedAppointment(app);
    const service = services.find(s => s.id === app.serviceId);
    setCompletionData({
      finalAmount: service?.price.toString() || '0',
      additionalServices: [],
      newServiceName: '',
      newServicePrice: ''
    });
    setIsCompletionModalOpen(true);
  };

  const addAdditionalService = () => {
    if (!completionData.newServiceName || !completionData.newServicePrice) return;
    const price = parseFloat(completionData.newServicePrice);
    setCompletionData(prev => ({
      ...prev,
      additionalServices: [...prev.additionalServices, { name: prev.newServiceName, price }],
      finalAmount: (parseFloat(prev.finalAmount) + price).toString(),
      newServiceName: '',
      newServicePrice: ''
    }));
  };

  const handleCompleteService = async () => {
    if (!selectedAppointment || !auth.currentUser) return;

    try {
      const finalAmount = parseFloat(completionData.finalAmount);
      
      // Calculate commission
      let commissionAmount = 0;
      const staffMember = staff.find(s => s.id === selectedAppointment.staffId);
      if (staffMember && staffMember.commissionPercentage > 0) {
        commissionAmount = (finalAmount * staffMember.commissionPercentage) / 100;
      }

      // 1. Update appointment status
      try {
        await updateDoc(doc(db, 'appointments', selectedAppointment.id), { 
          status: 'completed',
          finalAmount: finalAmount,
          commissionAmount: commissionAmount
        });
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `appointments/${selectedAppointment.id}`);
      }

      // 2. Add to finance (cash flow)
      try {
        await addDoc(collection(db, 'transactions'), {
          professionalId: auth.currentUser.uid,
          type: 'income',
          category: 'service',
          amount: finalAmount,
          description: `Serviço: ${selectedAppointment.serviceName} - Cliente: ${selectedAppointment.clientName}`,
          date: new Date().toISOString().split('T')[0],
          relatedId: selectedAppointment.id,
          createdAt: new Date().toISOString()
        });
      } catch (e) {
        handleFirestoreError(e, OperationType.CREATE, 'transactions');
      }

      // 3. Update/Create Client (CRM & Loyalty)
      const clientsRef = collection(db, 'clients');
      const clientQuery = query(clientsRef, where('professionalId', '==', auth.currentUser.uid), where('phone', '==', selectedAppointment.clientPhone));
      
      let clientSnap;
      try {
        clientSnap = await getDocs(clientQuery);
      } catch (e) {
        handleFirestoreError(e, OperationType.LIST, 'clients');
        return;
      }

      if (clientSnap.empty) {
        try {
          await addDoc(clientsRef, {
            professionalId: auth.currentUser.uid,
            name: selectedAppointment.clientName,
            phone: selectedAppointment.clientPhone,
            lastVisit: new Date().toISOString(),
            totalSpent: finalAmount,
            appointmentsCount: 1,
            loyaltyPoints: 1,
            createdAt: new Date().toISOString()
          });
        } catch (e) {
          handleFirestoreError(e, OperationType.CREATE, 'clients');
        }
      } else {
        const clientDoc = clientSnap.docs[0];
        const clientData = clientDoc.data();
        try {
          await updateDoc(doc(db, 'clients', clientDoc.id), {
            lastVisit: new Date().toISOString(),
            totalSpent: (clientData.totalSpent || 0) + finalAmount,
            appointmentsCount: (clientData.appointmentsCount || 0) + 1,
            loyaltyPoints: (clientData.loyaltyPoints || 0) + 1
          });
        } catch (e) {
          handleFirestoreError(e, OperationType.UPDATE, `clients/${clientDoc.id}`);
        }
      }

      toast.success('Serviço finalizado! Financeiro, comissão e fidelidade atualizados.');
      setIsCompletionModalOpen(false);
    } catch (error) {
      console.error("Error completing service:", error);
      // Error already handled by handleFirestoreError if it was a permission issue
    }
  };

  const stats = [
    { label: 'Total Hoje', value: appointments.length, icon: Calendar, color: 'text-blue-500' },
    { label: 'Confirmados', value: appointments.filter(a => a.status === 'confirmed').length, icon: CheckCircle2, color: 'text-green-500' },
    { label: 'Pendentes', value: appointments.filter(a => a.status === 'pending').length, icon: AlertCircle, color: 'text-orange-500' },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#4A3F3F]">Olá, Bem-vinda!</h1>
          <p className="text-[#6D5D5D]">Veja o que temos para hoje, {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[#D48C8C] text-white rounded-full shadow-lg hover:bg-[#C27B7B] transition-all font-medium"
        >
          <Plus size={20} /> Novo Agendamento
        </button>
      </header>

      {/* Booking Link Card */}
      <div className="bg-white p-6 rounded-3xl border border-[#F8E8E8] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-[#FFF9F9] text-[#D48C8C]">
            <Globe size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-[#4A3F3F]">Seu Link de Agendamento</p>
            <p className="text-xs text-[#9E8E8E]">
              {professional?.slug ? `beautyflow.com/b/${professional.slug}` : 'Link não configurado'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={copyLink}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-[#D48C8C] border border-[#F8E8E8] rounded-xl hover:bg-[#FFF9F9] transition-all"
          >
            <Copy size={16} /> Copiar Link
          </button>
          {professional?.slug && (
            <a 
              href={`/b/${professional.slug}`} 
              target="_blank" 
              rel="noreferrer"
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-[#6D5D5D] border border-[#F8E8E8] rounded-xl hover:bg-[#FFF9F9] transition-all"
            >
              <ExternalLink size={16} /> Ver Página
            </a>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-[#F8E8E8] shadow-sm flex items-center gap-4"
          >
            <div className={cn("p-3 rounded-2xl bg-opacity-10", stat.color.replace('text', 'bg'))}>
              <stat.icon className={stat.color} size={24} />
            </div>
            <div>
              <p className="text-sm text-[#9E8E8E]">{stat.label}</p>
              <p className="text-2xl font-bold text-[#4A3F3F]">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Agenda */}
        <section className="lg:col-span-2 bg-white rounded-3xl border border-[#F8E8E8] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#F8E8E8] flex items-center justify-between">
            <h2 className="font-serif font-bold text-lg">Agenda de Hoje</h2>
            <span className="text-xs font-medium px-3 py-1 bg-[#F8E8E8] text-[#D48C8C] rounded-full">
              {appointments.length} atendimentos
            </span>
          </div>

          <div className="divide-y divide-[#F8E8E8]">
            {loading ? (
              <div className="p-10 text-center text-[#9E8E8E]">Carregando agenda...</div>
            ) : appointments.length === 0 ? (
              <div className="p-10 text-center text-[#9E8E8E]">Nenhum agendamento para hoje.</div>
            ) : (
              appointments.map((app) => (
                <div key={app.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FFF9F9] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#F8E8E8] rounded-full flex items-center justify-center text-[#D48C8C] font-bold">
                      {app.clientName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-medium text-[#4A3F3F]">{app.clientName}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-[#6D5D5D] mt-1">
                        <span className="flex items-center gap-1"><Clock size={14} /> {format(parseISO(app.date), 'HH:mm')}</span>
                        <span className="flex items-center gap-1"><Scissors size={14} /> {app.serviceName}</span>
                        <span className="flex items-center gap-1 text-[#D48C8C] font-medium">
                          <User size={14} /> 
                          {app.staffId === auth.currentUser?.uid ? 'Você' : staff.find(s => s.id === app.staffId)?.name || 'Profissional'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {app.status === 'pending' && (
                      <button 
                        onClick={() => handleStatusUpdate(app.id, 'confirmed')}
                        className="px-4 py-2 text-xs font-medium bg-orange-50 text-orange-600 rounded-full hover:bg-orange-100 transition-colors"
                      >
                        Confirmar
                      </button>
                    )}
                    {app.status === 'confirmed' && (
                      <button 
                        onClick={() => openCompletionModal(app)}
                        className="px-4 py-2 text-xs font-medium bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
                      >
                        Realizado
                      </button>
                    )}
                    <StatusBadge status={app.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Automation Suggestions */}
        <section className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-[#F8E8E8] shadow-sm">
            <h2 className="font-serif font-bold text-lg mb-4 flex items-center gap-2">
              <Zap size={20} className="text-[#D48C8C]" /> Sugestões de Hoje
            </h2>
            
            <div className="space-y-4">
              {suggestions.length === 0 ? (
                <p className="text-sm text-[#9E8E8E] text-center py-4">Nenhuma sugestão de automação para agora.</p>
              ) : (
                suggestions.map((sug) => (
                  <div key={sug.id} className="p-4 bg-[#FFF9F9] rounded-2xl border border-[#F8E8E8] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#D48C8C] uppercase tracking-wider">{sug.automationName}</span>
                      <span className="text-[10px] text-[#9E8E8E]">{sug.clientPhone}</span>
                    </div>
                    <p className="text-sm font-bold text-[#4A3F3F]">{sug.clientName}</p>
                    <p className="text-xs text-[#6D5D5D] line-clamp-2 italic">"{sug.message}"</p>
                    <a 
                      href={getWhatsAppLink(sug.clientPhone, sug.message)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2 bg-green-500 text-white rounded-xl text-xs font-bold hover:bg-green-600 transition-all"
                    >
                      Enviar no WhatsApp
                    </a>
                  </div>
                ))
              )}
            </div>
            
            <Link 
              to="/dashboard/automations"
              className="mt-6 block text-center text-xs font-medium text-[#D48C8C] hover:underline"
            >
              Configurar mais automações
            </Link>
          </div>
        </section>
      </div>

      {/* Manual Appointment Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black bg-opacity-20 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-[#F8E8E8] flex items-center justify-between">
                <h2 className="text-xl font-serif font-bold">Novo Agendamento</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-[#9E8E8E] hover:text-[#4A3F3F]">
                  <Plus className="rotate-45" />
                </button>
              </div>
              <form onSubmit={handleManualBooking} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#6D5D5D] mb-1">Nome da Cliente</label>
                  <input 
                    required
                    type="text" 
                    value={formData.clientName}
                    onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#F8E8E8] focus:outline-none focus:border-[#D48C8C]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#6D5D5D] mb-1">WhatsApp</label>
                  <input 
                    required
                    type="tel" 
                    value={formData.clientPhone}
                    onChange={e => setFormData({ ...formData, clientPhone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#F8E8E8] focus:outline-none focus:border-[#D48C8C]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#6D5D5D] mb-1">Serviço</label>
                  <select 
                    required
                    value={formData.serviceId}
                    onChange={e => setFormData({ ...formData, serviceId: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#F8E8E8] focus:outline-none focus:border-[#D48C8C]"
                  >
                    <option value="">Selecione um serviço</option>
                    {services.map(s => (
                      <option key={s.id} value={s.id}>{s.name} - R$ {s.price.toFixed(2)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#6D5D5D] mb-1">Profissional</label>
                  <select 
                    required
                    value={formData.staffId}
                    onChange={e => setFormData({ ...formData, staffId: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#F8E8E8] focus:outline-none focus:border-[#D48C8C]"
                  >
                    <option value={auth.currentUser?.uid}>Você (Master)</option>
                    {staff.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#6D5D5D] mb-1">Data e Hora</label>
                  <input 
                    required
                    type="datetime-local" 
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#F8E8E8] focus:outline-none focus:border-[#D48C8C]"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full py-4 bg-[#D48C8C] text-white rounded-xl font-medium shadow-lg hover:bg-[#C27B7B] transition-all mt-4"
                >
                  Agendar Cliente
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Completion Modal */}
      <AnimatePresence>
        {isCompletionModalOpen && selectedAppointment && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black bg-opacity-20 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-[#F8E8E8] flex items-center justify-between">
                <h2 className="text-xl font-serif font-bold">Finalizar Atendimento</h2>
                <button onClick={() => setIsCompletionModalOpen(false)} className="text-[#9E8E8E] hover:text-[#4A3F3F]">
                  <Plus className="rotate-45" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="p-4 bg-[#FFF9F9] rounded-2xl border border-[#F8E8E8]">
                  <p className="text-xs text-[#9E8E8E] uppercase font-bold mb-1">Cliente</p>
                  <p className="font-bold text-[#4A3F3F]">{selectedAppointment.clientName}</p>
                  <p className="text-sm text-[#6D5D5D] mt-2">{selectedAppointment.serviceName}</p>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-bold text-[#4A3F3F]">Adicionar Extras (Serviços/Produtos)</p>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      placeholder="Nome"
                      value={completionData.newServiceName}
                      onChange={e => setCompletionData({ ...completionData, newServiceName: e.target.value })}
                      className="flex-1 px-3 py-2 text-sm rounded-xl border border-[#F8E8E8] focus:outline-none focus:border-[#D48C8C]"
                    />
                    <input 
                      type="number"
                      placeholder="R$"
                      value={completionData.newServicePrice}
                      onChange={e => setCompletionData({ ...completionData, newServicePrice: e.target.value })}
                      className="w-20 px-3 py-2 text-sm rounded-xl border border-[#F8E8E8] focus:outline-none focus:border-[#D48C8C]"
                    />
                    <button 
                      onClick={addAdditionalService}
                      className="p-2 bg-[#D48C8C] text-white rounded-xl hover:bg-[#C27B7B]"
                    >
                      <Plus size={20} />
                    </button>
                  </div>

                  {completionData.additionalServices.length > 0 && (
                    <div className="space-y-2">
                      {completionData.additionalServices.map((s, i) => (
                        <div key={i} className="flex justify-between text-sm text-[#6D5D5D] bg-gray-50 p-2 rounded-lg">
                          <span>{s.name}</span>
                          <span className="font-bold">R$ {s.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#4A3F3F] mb-1">Valor Total Final (R$)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={completionData.finalAmount}
                    onChange={e => setCompletionData({ ...completionData, finalAmount: e.target.value })}
                    className="w-full px-4 py-4 text-xl font-bold text-[#D48C8C] rounded-2xl border-2 border-[#D48C8C] focus:outline-none bg-[#FFF9F9]"
                  />
                </div>

                <button 
                  onClick={handleCompleteService}
                  className="w-full py-5 bg-[#D48C8C] text-white rounded-2xl font-bold shadow-lg hover:bg-[#C27B7B] transition-all"
                >
                  Confirmar e Finalizar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatusBadge({ status }: { status: Appointment['status'] }) {
  const configs = {
    pending: { label: 'Pendente', color: 'bg-orange-100 text-orange-600' },
    confirmed: { label: 'Confirmado', color: 'bg-green-100 text-green-600' },
    cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-600' },
    completed: { label: 'Concluído', color: 'bg-blue-100 text-blue-600' },
  };

  const config = configs[status];
  return (
    <span className={cn("px-3 py-1 rounded-full text-xs font-medium", config.color)}>
      {config.label}
    </span>
  );
}

