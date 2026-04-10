import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Scissors, Clock, DollarSign } from 'lucide-react';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { Service } from '../../types';
import { toast } from 'sonner';

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({ name: '', duration: 30, price: 0, description: '' });

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(collection(db, 'services'), where('professionalId', '==', auth.currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service)));
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    try {
      if (editingService) {
        await updateDoc(doc(db, 'services', editingService.id), formData);
        toast.success('Serviço atualizado!');
      } else {
        await addDoc(collection(db, 'services'), {
          ...formData,
          professionalId: auth.currentUser.uid,
          createdAt: new Date().toISOString()
        });
        toast.success('Serviço adicionado!');
      }
      setIsModalOpen(false);
      setEditingService(null);
      setFormData({ name: '', duration: 30, price: 0, description: '' });
    } catch (error) {
      toast.error('Erro ao salvar serviço.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este serviço?')) {
      try {
        await deleteDoc(doc(db, 'services', id));
        toast.success('Serviço excluído.');
      } catch (error) {
        toast.error('Erro ao excluir.');
      }
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#4A3F3F]">Meus Serviços</h1>
          <p className="text-[#6D5D5D]">Gerencie os procedimentos que você oferece.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#D48C8C] text-white rounded-full shadow-lg hover:bg-[#C27B7B] transition-all font-medium"
        >
          <Plus size={20} /> Adicionar Serviço
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div key={service.id} className="bg-white p-6 rounded-3xl border border-[#F8E8E8] shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-2xl bg-[#F8E8E8] text-[#D48C8C]">
                <Scissors size={24} />
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => {
                    setEditingService(service);
                    setFormData({ name: service.name, duration: service.duration, price: service.price, description: service.description || '' });
                    setIsModalOpen(true);
                  }}
                  className="p-2 text-[#9E8E8E] hover:text-[#D48C8C]"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(service.id)}
                  className="p-2 text-[#9E8E8E] hover:text-red-500"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <h3 className="text-lg font-bold text-[#4A3F3F] mb-1">{service.name}</h3>
            <p className="text-sm text-[#9E8E8E] mb-4 line-clamp-2">{service.description || 'Sem descrição.'}</p>
            <div className="flex items-center justify-between pt-4 border-t border-[#F8E8E8]">
              <div className="flex items-center gap-1 text-sm text-[#6D5D5D]">
                <Clock size={14} /> {service.duration} min
              </div>
              <div className="font-bold text-[#D48C8C]">
                R$ {service.price.toFixed(2)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black bg-opacity-20 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-[#F8E8E8] flex items-center justify-between">
              <h2 className="text-xl font-serif font-bold">{editingService ? 'Editar Serviço' : 'Novo Serviço'}</h2>
              <button onClick={() => { setIsModalOpen(false); setEditingService(null); }} className="text-[#9E8E8E] hover:text-[#4A3F3F]">
                <Plus className="rotate-45" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#6D5D5D] mb-1">Nome do Serviço</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Extensão de Cílios"
                  className="w-full px-4 py-3 rounded-xl border border-[#F8E8E8] focus:outline-none focus:border-[#D48C8C]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#6D5D5D] mb-1">Duração (min)</label>
                  <input 
                    required
                    type="number" 
                    value={formData.duration}
                    onChange={e => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl border border-[#F8E8E8] focus:outline-none focus:border-[#D48C8C]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#6D5D5D] mb-1">Preço (R$)</label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl border border-[#F8E8E8] focus:outline-none focus:border-[#D48C8C]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#6D5D5D] mb-1">Descrição (opcional)</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[#F8E8E8] focus:outline-none focus:border-[#D48C8C] h-24 resize-none"
                />
              </div>
              <button 
                type="submit"
                className="w-full py-4 bg-[#D48C8C] text-white rounded-xl font-medium shadow-lg hover:bg-[#C27B7B] transition-all mt-4"
              >
                {editingService ? 'Salvar Alterações' : 'Adicionar Serviço'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
