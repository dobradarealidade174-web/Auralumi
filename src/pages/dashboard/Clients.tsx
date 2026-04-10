import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Search, 
  Phone, 
  Calendar, 
  DollarSign, 
  Star, 
  FileText, 
  Image as ImageIcon,
  Plus,
  ChevronRight,
  History,
  Trash2
} from 'lucide-react';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { Client } from '../../types';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [notes, setNotes] = useState('');

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

    const q = query(
      collection(db, 'clients'),
      where('professionalId', '==', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const clientsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
      clientsData.sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0));
      setClients(clientsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'clients');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateNotes = async () => {
    if (!selectedClient) return;
    try {
      await updateDoc(doc(db, 'clients', selectedClient.id), { notes });
      toast.success('Ficha de anamnese atualizada!');
    } catch (error) {
      toast.error('Erro ao salvar notas.');
    }
  };

  const openDetail = (client: Client) => {
    setSelectedClient(client);
    setNotes(client.notes || '');
    setIsDetailOpen(true);
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-serif font-bold text-[#4A3F3F]">Gestão de Clientes (CRM)</h1>
        <p className="text-[#6D5D5D]">Histórico, fidelidade e fichas de anamnese.</p>
      </header>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9E8E8E]" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou telefone..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border border-[#F8E8E8] focus:outline-none focus:border-[#D48C8C]"
          />
        </div>
        <div className="text-sm text-[#9E8E8E] bg-[#FFF9F9] px-4 py-2 rounded-xl border border-[#F8E8E8]">
          Total de Clientes: <span className="font-bold text-[#D48C8C]">{clients.length}</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-[#F8E8E8] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#FFF9F9] text-[#9E8E8E] text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-bold">Cliente</th>
                <th className="px-6 py-4 font-bold">Última Visita</th>
                <th className="px-6 py-4 font-bold">Total Gasto</th>
                <th className="px-6 py-4 font-bold">Fidelidade</th>
                <th className="px-6 py-4 font-bold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F8E8E8]">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-[#9E8E8E]">Carregando...</td></tr>
              ) : filteredClients.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-[#9E8E8E]">Nenhum cliente encontrado.</td></tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-[#FFF9F9] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#F8E8E8] rounded-full flex items-center justify-center text-[#D48C8C] font-bold">
                          {client.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#4A3F3F]">{client.name}</p>
                          <p className="text-xs text-[#9E8E8E]">{client.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#6D5D5D]">
                      {client.lastVisit ? format(parseISO(client.lastVisit), 'dd/MM/yyyy', { locale: ptBR }) : 'Nunca'}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-[#4A3F3F]">R$ {client.totalSpent?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      <p className="text-[10px] text-[#9E8E8E]">{client.appointmentsCount || 0} visitas</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-[#D48C8C]">
                        <Star size={14} fill="currentColor" />
                        <span className="text-sm font-bold">{client.loyaltyPoints || 0} pts</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => openDetail(client)}
                        className="p-2 text-[#D48C8C] hover:bg-[#FFF9F9] rounded-xl transition-all"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Client Detail Sidebar/Modal */}
      <AnimatePresence>
        {isDetailOpen && selectedClient && (
          <div className="fixed inset-0 z-[100] flex justify-end bg-black bg-opacity-20 backdrop-blur-sm">
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-[#F8E8E8] flex items-center justify-between">
                <h2 className="text-xl font-serif font-bold">Detalhes da Cliente</h2>
                <button onClick={() => setIsDetailOpen(false)} className="text-[#9E8E8E] hover:text-[#4A3F3F]">
                  <Plus className="rotate-45" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Header Info */}
                <div className="text-center">
                  <div className="w-24 h-24 bg-[#FFF9F9] rounded-[2rem] mx-auto mb-4 flex items-center justify-center text-[#D48C8C] text-3xl font-bold border border-[#F8E8E8]">
                    {selectedClient.name.charAt(0)}
                  </div>
                  <h3 className="text-2xl font-bold text-[#4A3F3F]">{selectedClient.name}</h3>
                  <p className="text-[#6D5D5D] flex items-center justify-center gap-2 mt-1">
                    <Phone size={14} /> {selectedClient.phone}
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#FFF9F9] p-4 rounded-2xl border border-[#F8E8E8]">
                    <p className="text-[10px] uppercase font-bold text-[#9E8E8E] mb-1">Total Gasto</p>
                    <p className="text-lg font-bold text-[#D48C8C]">R$ {selectedClient.totalSpent?.toFixed(2)}</p>
                  </div>
                  <div className="bg-[#FFF9F9] p-4 rounded-2xl border border-[#F8E8E8]">
                    <p className="text-[10px] uppercase font-bold text-[#9E8E8E] mb-1">Fidelidade</p>
                    <p className="text-lg font-bold text-[#D48C8C] flex items-center gap-1">
                      <Star size={16} fill="currentColor" /> {selectedClient.loyaltyPoints} pts
                    </p>
                  </div>
                </div>

                {/* Anamnesis / Notes */}
                <div className="space-y-3">
                  <h4 className="font-bold text-[#4A3F3F] flex items-center gap-2">
                    <FileText size={18} className="text-[#D48C8C]" /> Ficha de Anamnese / Notas
                  </h4>
                  <textarea 
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Anote aqui alergias, preferências, cores favoritas ou observações importantes..."
                    className="w-full h-40 p-4 rounded-2xl border border-[#F8E8E8] focus:outline-none focus:border-[#D48C8C] text-sm resize-none"
                  />
                  <button 
                    onClick={handleUpdateNotes}
                    className="w-full py-3 bg-[#D48C8C] text-white rounded-xl font-bold text-sm shadow-md hover:bg-[#C27B7B] transition-all"
                  >
                    Salvar Notas
                  </button>
                </div>

                {/* Photos Gallery (Placeholder for now) */}
                <div className="space-y-3">
                  <h4 className="font-bold text-[#4A3F3F] flex items-center gap-2">
                    <ImageIcon size={18} className="text-[#D48C8C]" /> Galeria de Fotos (Antes/Depois)
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="aspect-square bg-gray-50 rounded-xl border border-dashed border-gray-200 flex items-center justify-center text-gray-300">
                        <Plus size={20} />
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-[#9E8E8E] text-center italic">Em breve: Upload direto de fotos</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
