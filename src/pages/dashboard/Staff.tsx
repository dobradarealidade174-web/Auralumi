import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Plus, 
  Trash2, 
  Mail, 
  Phone, 
  User, 
  ToggleLeft as Toggle, 
  ToggleRight as ToggleActive,
  Shield,
  Search,
  DollarSign
} from 'lucide-react';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, updateDoc, orderBy } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { Staff } from '../../types';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

export default function StaffManagement() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    commissionPercentage: 0,
    active: true
  });

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'staff'),
      where('professionalId', '==', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const staffData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Staff));
      // Sort in memory to avoid index requirement
      staffData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setStaff(staffData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleFirestoreError = (error: any, operation: string) => {
    console.error(`Firestore Error (${operation}):`, error);
    const errInfo = {
      error: error.message || String(error),
      operation,
      auth: auth.currentUser ? {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email
      } : 'not authenticated'
    };
    toast.error(`Erro ao ${operation === 'create' ? 'cadastrar' : 'atualizar'} funcionário. Verifique as permissões.`);
    throw new Error(JSON.stringify(errInfo));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    try {
      if (editingId) {
        await updateDoc(doc(db, 'staff', editingId), {
          ...formData,
          updatedAt: new Date().toISOString()
        });
        toast.success('Funcionário atualizado!');
      } else {
        await addDoc(collection(db, 'staff'), {
          ...formData,
          professionalId: auth.currentUser.uid,
          createdAt: new Date().toISOString()
        });
        toast.success('Funcionário cadastrado!');
      }
      closeModal();
    } catch (error) {
      handleFirestoreError(error, editingId ? 'update' : 'create');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este funcionário?')) return;
    try {
      await deleteDoc(doc(db, 'staff', id));
      toast.success('Funcionário removido.');
    } catch (error) {
      toast.error('Erro ao remover.');
    }
  };

  const toggleActive = async (member: Staff) => {
    try {
      await updateDoc(doc(db, 'staff', member.id), {
        active: !member.active
      });
    } catch (error) {
      toast.error('Erro ao alterar status.');
    }
  };

  const openModal = (member?: Staff) => {
    if (member) {
      setEditingId(member.id);
      setFormData({
        name: member.name,
        email: member.email,
        phone: member.phone || '',
        commissionPercentage: member.commissionPercentage || 0,
        active: member.active
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        commissionPercentage: 0,
        active: true
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const filteredStaff = staff.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#4A3F3F]">Equipe e Funcionários</h1>
          <p className="text-[#6D5D5D]">Gerencie quem presta serviços no seu negócio.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[#D48C8C] text-white rounded-full shadow-lg hover:bg-[#C27B7B] transition-all font-medium"
        >
          <Plus size={20} /> Novo Funcionário
        </button>
      </header>

      {/* Search and Info */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9E8E8E]" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou e-mail..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border border-[#F8E8E8] focus:outline-none focus:border-[#D48C8C]"
          />
        </div>
        <div className="text-sm text-[#9E8E8E] bg-[#FFF9F9] px-4 py-2 rounded-xl border border-[#F8E8E8]">
          Total: <span className="font-bold text-[#D48C8C]">{staff.length + 1}</span> (Incluindo você)
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Master Card (Always First) */}
        <div className="bg-[#FFF9F9] p-6 rounded-[2.5rem] border border-[#D48C8C] border-opacity-30 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <Shield size={20} className="text-[#D48C8C]" />
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#D48C8C] font-bold text-xl shadow-sm">
              {auth.currentUser?.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-[#4A3F3F]">Você (Master)</h3>
              <p className="text-xs text-[#D48C8C] font-medium">Proprietária</p>
            </div>
          </div>
          <div className="space-y-2 text-sm text-[#6D5D5D]">
            <p className="flex items-center gap-2"><Mail size={14} /> {auth.currentUser?.email}</p>
          </div>
          <div className="mt-6 pt-4 border-t border-[#F8E8E8]">
            <span className="text-[10px] font-bold text-[#D48C8C] uppercase tracking-wider bg-white px-3 py-1 rounded-full">Sempre Ativo</span>
          </div>
        </div>

        {loading ? (
          <div className="col-span-full p-10 text-center text-[#9E8E8E]">Carregando equipe...</div>
        ) : filteredStaff.map((member) => (
          <motion.div 
            key={member.id}
            layout
            className={cn(
              "bg-white p-6 rounded-[2.5rem] border shadow-sm flex flex-col justify-between transition-all",
              member.active ? "border-[#F8E8E8]" : "border-gray-100 opacity-60"
            )}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-[#FFF9F9] rounded-2xl flex items-center justify-center text-[#D48C8C] font-bold text-xl">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <button onClick={() => toggleActive(member)} className="transition-colors">
                  {member.active ? (
                    <ToggleActive size={32} className="text-[#D48C8C]" />
                  ) : (
                    <Toggle size={32} className="text-gray-300" />
                  )}
                </button>
              </div>
              <h3 className="font-bold text-[#4A3F3F]">{member.name}</h3>
              <div className="mt-3 space-y-2 text-sm text-[#6D5D5D]">
                <p className="flex items-center gap-2"><Mail size={14} /> {member.email}</p>
                {member.phone && <p className="flex items-center gap-2"><Phone size={14} /> {member.phone}</p>}
                <p className="flex items-center gap-2 font-bold text-[#D48C8C]">
                  <DollarSign size={14} /> Comissão: {member.commissionPercentage}%
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-[#F8E8E8]">
              <button 
                onClick={() => openModal(member)}
                className="p-2 text-[#6D5D5D] hover:bg-[#FFF9F9] rounded-lg transition-colors"
              >
                <User size={18} />
              </button>
              <button 
                onClick={() => handleDelete(member.id)}
                className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black bg-opacity-20 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-[#F8E8E8] flex items-center justify-between">
                <h2 className="text-xl font-serif font-bold">
                  {editingId ? 'Editar Funcionário' : 'Novo Funcionário'}
                </h2>
                <button onClick={closeModal} className="text-[#9E8E8E] hover:text-[#4A3F3F]">
                  <Plus className="rotate-45" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#6D5D5D] mb-1">Nome Completo</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-[#F8E8E8] focus:outline-none focus:border-[#D48C8C]"
                    placeholder="Ex: Maria Silva"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#6D5D5D] mb-1">E-mail</label>
                  <input 
                    required
                    type="email" 
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-[#F8E8E8] focus:outline-none focus:border-[#D48C8C]"
                    placeholder="maria@exemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#6D5D5D] mb-1">WhatsApp (Opcional)</label>
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-[#F8E8E8] focus:outline-none focus:border-[#D48C8C]"
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#6D5D5D] mb-1">Comissão (%)</label>
                  <input 
                    required
                    type="number" 
                    min="0"
                    max="100"
                    value={formData.commissionPercentage}
                    onChange={e => setFormData({ ...formData, commissionPercentage: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 rounded-2xl border border-[#F8E8E8] focus:outline-none focus:border-[#D48C8C]"
                    placeholder="Ex: 30"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-4 border border-[#F8E8E8] text-[#6D5D5D] rounded-2xl font-medium hover:bg-gray-50 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-[#D48C8C] text-white rounded-2xl font-bold shadow-lg hover:bg-[#C27B7B] transition-all"
                  >
                    {editingId ? 'Salvar Alterações' : 'Cadastrar'}
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
