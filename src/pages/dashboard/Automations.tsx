import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Plus, 
  Trash2, 
  MessageSquare, 
  Clock, 
  Calendar, 
  ToggleLeft as Toggle, 
  ToggleRight as ToggleActive,
  AlertCircle,
  Info
} from 'lucide-react';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { Automation } from '../../types';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

export default function Automations() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    triggerType: 'days_since_last_visit' as Automation['triggerType'],
    triggerValue: 30,
    messageTemplate: '',
    active: true
  });

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(collection(db, 'automations'), where('professionalId', '==', auth.currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAutomations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Automation)));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    try {
      if (editingId) {
        await updateDoc(doc(db, 'automations', editingId), {
          ...formData,
          updatedAt: new Date().toISOString()
        });
        toast.success('Automação atualizada!');
      } else {
        await addDoc(collection(db, 'automations'), {
          ...formData,
          professionalId: auth.currentUser.uid,
          createdAt: new Date().toISOString()
        });
        toast.success('Automação criada!');
      }
      closeModal();
    } catch (error) {
      toast.error('Erro ao salvar automação.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta automação?')) return;
    try {
      await deleteDoc(doc(db, 'automations', id));
      toast.success('Automação excluída.');
    } catch (error) {
      toast.error('Erro ao excluir.');
    }
  };

  const toggleActive = async (automation: Automation) => {
    try {
      await updateDoc(doc(db, 'automations', automation.id), {
        active: !automation.active
      });
    } catch (error) {
      toast.error('Erro ao alterar status.');
    }
  };

  const openModal = (automation?: Automation) => {
    if (automation) {
      setEditingId(automation.id);
      setFormData({
        name: automation.name,
        triggerType: automation.triggerType,
        triggerValue: automation.triggerValue,
        messageTemplate: automation.messageTemplate,
        active: automation.active
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        triggerType: 'days_since_last_visit',
        triggerValue: 30,
        messageTemplate: 'Olá {clientName}! Sentimos sua falta aqui na auralumi. Que tal agendar um novo horário? ✨',
        active: true
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const getTriggerLabel = (type: Automation['triggerType'], value: number) => {
    switch (type) {
      case 'days_since_last_visit':
        return `${value} dias sem comparecer`;
      case 'after_booking':
        return `${value} horas após o atendimento`;
      case 'before_booking':
        return `${value} horas antes do agendamento`;
      default:
        return '';
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#4A3F3F]">Automações de Mensagens</h1>
          <p className="text-[#6D5D5D]">Configure disparos automáticos para suas clientes.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 px-6 py-3 bg-[#D48C8C] text-white rounded-full shadow-lg hover:bg-[#C27B7B] transition-all font-medium"
        >
          <Plus size={20} /> Nova Automação
        </button>
      </header>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-100 p-6 rounded-3xl flex gap-4">
        <div className="p-2 bg-white rounded-xl text-blue-500 h-fit">
          <Info size={20} />
        </div>
        <div className="space-y-1">
          <p className="font-bold text-blue-900 text-sm">Como funciona o "Bot"?</p>
          <p className="text-blue-800 text-xs leading-relaxed">
            As automações geram sugestões de mensagens no seu painel principal. Quando uma condição é atingida, 
            você verá um alerta e poderá disparar a mensagem personalizada com um clique via WhatsApp Web. 
            Isso garante que você tenha controle total sobre o que é enviado.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-10 text-center text-[#9E8E8E]">Carregando automações...</div>
        ) : automations.length === 0 ? (
          <div className="col-span-full p-10 text-center text-[#9E8E8E] bg-white rounded-3xl border border-dashed border-[#F8E8E8]">
            Nenhuma automação configurada. Comece criando uma!
          </div>
        ) : (
          automations.map((auto) => (
            <motion.div 
              key={auto.id}
              layout
              className={cn(
                "bg-white p-6 rounded-3xl border shadow-sm flex flex-col justify-between gap-4 transition-all",
                auto.active ? "border-[#F8E8E8]" : "border-gray-100 opacity-60"
              )}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={cn("p-2 rounded-xl", auto.active ? "bg-[#FFF9F9] text-[#D48C8C]" : "bg-gray-50 text-gray-400")}>
                    <Zap size={20} />
                  </div>
                  <button onClick={() => toggleActive(auto)} className="transition-colors">
                    {auto.active ? (
                      <ToggleActive size={32} className="text-[#D48C8C]" />
                    ) : (
                      <Toggle size={32} className="text-gray-300" />
                    )}
                  </button>
                </div>
                <div>
                  <h3 className="font-bold text-[#4A3F3F]">{auto.name}</h3>
                  <p className="text-xs text-[#9E8E8E] flex items-center gap-1 mt-1">
                    <Clock size={12} /> {getTriggerLabel(auto.triggerType, auto.triggerValue)}
                  </p>
                </div>
                <div className="p-3 bg-[#FFF9F9] rounded-xl border border-[#F8E8E8]">
                  <p className="text-xs text-[#6D5D5D] line-clamp-3 italic">"{auto.messageTemplate}"</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F8E8E8]">
                <button 
                  onClick={() => openModal(auto)}
                  className="p-2 text-[#6D5D5D] hover:bg-[#FFF9F9] rounded-lg transition-colors"
                >
                  <MessageSquare size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(auto.id)}
                  className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black bg-opacity-20 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-[#F8E8E8] flex items-center justify-between">
                <h2 className="text-xl font-serif font-bold">
                  {editingId ? 'Editar Automação' : 'Nova Automação'}
                </h2>
                <button onClick={closeModal} className="text-[#9E8E8E] hover:text-[#4A3F3F]">
                  <Plus className="rotate-45" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#6D5D5D] mb-1">Nome da Automação</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Ex: Reativação de Clientes"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#F8E8E8] focus:outline-none focus:border-[#D48C8C]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#6D5D5D] mb-1">Gatilho (Quando?)</label>
                    <select 
                      value={formData.triggerType}
                      onChange={e => setFormData({ ...formData, triggerType: e.target.value as any })}
                      className="w-full px-4 py-3 rounded-xl border border-[#F8E8E8] focus:outline-none focus:border-[#D48C8C]"
                    >
                      <option value="days_since_last_visit">Dias sem visita</option>
                      <option value="after_booking">Horas após agendamento</option>
                      <option value="before_booking">Horas antes do agendamento</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#6D5D5D] mb-1">Valor (Tempo)</label>
                    <input 
                      required
                      type="number" 
                      value={formData.triggerValue}
                      onChange={e => setFormData({ ...formData, triggerValue: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl border border-[#F8E8E8] focus:outline-none focus:border-[#D48C8C]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#6D5D5D] mb-1">Mensagem Personalizada</label>
                  <textarea 
                    required
                    rows={4}
                    value={formData.messageTemplate}
                    onChange={e => setFormData({ ...formData, messageTemplate: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#F8E8E8] focus:outline-none focus:border-[#D48C8C] resize-none"
                    placeholder="Use {clientName} para o nome da cliente..."
                  />
                  <div className="flex gap-2 mt-2">
                    {['{clientName}', '{serviceName}', '{date}'].map(tag => (
                      <button 
                        key={tag}
                        type="button"
                        onClick={() => setFormData({ ...formData, messageTemplate: formData.messageTemplate + tag })}
                        className="text-[10px] px-2 py-1 bg-[#F8E8E8] text-[#D48C8C] rounded-md hover:bg-[#D48C8C] hover:text-white transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-4 border border-[#F8E8E8] text-[#6D5D5D] rounded-xl font-medium hover:bg-gray-50 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-[#D48C8C] text-white rounded-xl font-medium shadow-lg hover:bg-[#C27B7B] transition-all"
                  >
                    {editingId ? 'Salvar Alterações' : 'Criar Automação'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
