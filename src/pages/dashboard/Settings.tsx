import { useState, useEffect } from 'react';
import { User, Phone, Mail, Globe, Clock, Save, Image as ImageIcon, CreditCard, Plus, Trash2 } from 'lucide-react';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { Professional } from '../../types';
import { toast } from 'sonner';

export default function Settings() {
  const [profile, setProfile] = useState<Partial<Professional>>({
    businessName: '',
    phone: '',
    slug: '',
    pixKey: '',
    depositPercentage: 0,
    gallery: [],
    availability: {
      '1': { start: '09:00', end: '18:00', active: true },
      '2': { start: '09:00', end: '18:00', active: true },
      '3': { start: '09:00', end: '18:00', active: true },
      '4': { start: '09:00', end: '18:00', active: true },
      '5': { start: '09:00', end: '18:00', active: true },
      '6': { start: '09:00', end: '14:00', active: false },
      '0': { start: '09:00', end: '14:00', active: false },
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;
    const docRef = doc(db, 'professionals', auth.currentUser.uid);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data() as Professional);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    if (!auth.currentUser) return;
    try {
      await setDoc(doc(db, 'professionals', auth.currentUser.uid), {
        ...profile,
        id: auth.currentUser.uid,
        email: auth.currentUser.email,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      toast.success('Configurações salvas!');
    } catch (error) {
      toast.error('Erro ao salvar.');
    }
  };

  const days = [
    { id: '1', label: 'Segunda' },
    { id: '2', label: 'Terça' },
    { id: '3', label: 'Quarta' },
    { id: '4', label: 'Quinta' },
    { id: '5', label: 'Sexta' },
    { id: '6', label: 'Sábado' },
    { id: '0', label: 'Domingo' },
  ];

  const addGalleryImage = () => {
    const url = prompt('Insira a URL da imagem:');
    if (url) {
      setProfile(prev => ({ ...prev, gallery: [...(prev.gallery || []), url] }));
    }
  };

  const removeGalleryImage = (index: number) => {
    setProfile(prev => ({
      ...prev,
      gallery: prev.gallery?.filter((_, i) => i !== index)
    }));
  };

  if (loading) return <div className="p-10 text-center text-[#9E8E8E]">Carregando configurações...</div>;

  return (
    <div className="max-w-4xl space-y-8 pb-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#4A3F3F]">Configurações</h1>
          <p className="text-[#6D5D5D]">Personalize seu perfil e horários.</p>
        </div>
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 bg-[#D48C8C] text-white rounded-full shadow-lg hover:bg-[#C27B7B] transition-all font-medium"
        >
          <Save size={20} /> Salvar Alterações
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Section */}
        <section className="bg-white p-8 rounded-3xl border border-[#F8E8E8] shadow-sm space-y-6">
          <h2 className="text-lg font-serif font-bold flex items-center gap-2">
            <User size={20} className="text-[#D48C8C]" /> Perfil do Negócio
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#6D5D5D] mb-1">Nome do Espaço / Profissional</label>
              <input 
                type="text" 
                value={profile.businessName}
                onChange={e => setProfile({ ...profile, businessName: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-[#F8E8E8] focus:outline-none focus:border-[#D48C8C]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6D5D5D] mb-1">WhatsApp de Contato</label>
              <input 
                type="text" 
                value={profile.phone}
                onChange={e => setProfile({ ...profile, phone: e.target.value })}
                placeholder="Ex: 11999999999"
                className="w-full px-4 py-3 rounded-xl border border-[#F8E8E8] focus:outline-none focus:border-[#D48C8C]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6D5D5D] mb-1">Link de Agendamento Personalizado</label>
              <p className="text-xs text-[#9E8E8E] mb-2">Este é o link que você enviará para suas clientes.</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center bg-[#FFF9F9] border border-[#F8E8E8] rounded-xl overflow-hidden focus-within:border-[#D48C8C] transition-all">
                  <span className="pl-4 text-xs font-medium text-[#9E8E8E] whitespace-nowrap">auralumi.com/b/</span>
                  <input 
                    type="text" 
                    value={profile.slug}
                    onChange={e => setProfile({ ...profile, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                    placeholder="seu-nome"
                    className="w-full px-2 py-3 bg-transparent focus:outline-none text-[#4A3F3F] font-medium"
                  />
                </div>
              </div>
              <p className="text-[10px] text-[#D48C8C] mt-1 italic">* Use apenas letras, números e hifens.</p>
            </div>

          </div>
        </section>

        {/* Availability Section */}
        <section className="bg-white p-8 rounded-3xl border border-[#F8E8E8] shadow-sm space-y-6">
          <h2 className="text-lg font-serif font-bold flex items-center gap-2">
            <Clock size={20} className="text-[#D48C8C]" /> Horários de Atendimento
          </h2>
          
          <div className="space-y-4">
            {days.map((day) => (
              <div key={day.id} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-24">
                  <input 
                    type="checkbox" 
                    checked={profile.availability?.[day.id]?.active}
                    onChange={e => {
                      const newAvail = { ...profile.availability };
                      newAvail[day.id] = { ...newAvail[day.id], active: e.target.checked };
                      setProfile({ ...profile, availability: newAvail });
                    }}
                    className="w-4 h-4 accent-[#D48C8C]"
                  />
                  <span className="text-sm font-medium text-[#4A3F3F]">{day.label}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <input 
                    type="time" 
                    value={profile.availability?.[day.id]?.start}
                    disabled={!profile.availability?.[day.id]?.active}
                    onChange={e => {
                      const newAvail = { ...profile.availability };
                      newAvail[day.id] = { ...newAvail[day.id], start: e.target.value };
                      setProfile({ ...profile, availability: newAvail });
                    }}
                    className="px-2 py-1 rounded-lg border border-[#F8E8E8] text-sm disabled:opacity-50"
                  />
                  <span className="text-[#9E8E8E]">-</span>
                  <input 
                    type="time" 
                    value={profile.availability?.[day.id]?.end}
                    disabled={!profile.availability?.[day.id]?.active}
                    onChange={e => {
                      const newAvail = { ...profile.availability };
                      newAvail[day.id] = { ...newAvail[day.id], end: e.target.value };
                      setProfile({ ...profile, availability: newAvail });
                    }}
                    className="px-2 py-1 rounded-lg border border-[#F8E8E8] text-sm disabled:opacity-50"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Gallery Section */}
        <section className="bg-white p-8 rounded-3xl border border-[#F8E8E8] shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-serif font-bold flex items-center gap-2">
              <ImageIcon size={20} className="text-[#D48C8C]" /> Galeria de Fotos
            </h2>
            <button 
              onClick={addGalleryImage}
              className="p-2 bg-[#FFF9F9] text-[#D48C8C] rounded-xl hover:bg-[#F8E8E8] transition-all"
            >
              <Plus size={20} />
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {profile.gallery?.map((url, i) => (
              <div key={i} className="relative group aspect-square rounded-2xl overflow-hidden border border-[#F8E8E8]">
                <img src={url} alt={`Gallery ${i}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <button 
                  onClick={() => removeGalleryImage(i)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            {(!profile.gallery || profile.gallery.length === 0) && (
              <div className="col-span-3 py-10 text-center text-[#9E8E8E] border-2 border-dashed border-[#F8E8E8] rounded-2xl">
                Nenhuma foto adicionada.
              </div>
            )}
          </div>
          <p className="text-[10px] text-[#9E8E8E] italic">Dica: Use links de imagens do seu Instagram ou Google Drive (públicos).</p>
        </section>

        {/* Deposit Section */}
        <section className="bg-white p-8 rounded-3xl border border-[#F8E8E8] shadow-sm space-y-6">
          <h2 className="text-lg font-serif font-bold flex items-center gap-2">
            <CreditCard size={20} className="text-[#D48C8C]" /> Pagamento de Sinal (Reserva)
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#6D5D5D] mb-1">Chave PIX para Recebimento</label>
              <input 
                type="text" 
                value={profile.pixKey || ''}
                onChange={e => setProfile({ ...profile, pixKey: e.target.value })}
                placeholder="CPF, E-mail ou Chave Aleatória"
                className="w-full px-4 py-3 rounded-xl border border-[#F8E8E8] focus:outline-none focus:border-[#D48C8C]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6D5D5D] mb-1">Porcentagem de Sinal (%)</label>
              <p className="text-xs text-[#9E8E8E] mb-2">Valor que a cliente deve pagar para garantir a vaga.</p>
              <input 
                type="number" 
                min="0"
                max="100"
                value={profile.depositPercentage || 0}
                onChange={e => setProfile({ ...profile, depositPercentage: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 rounded-xl border border-[#F8E8E8] focus:outline-none focus:border-[#D48C8C]"
              />
              <p className="text-[10px] text-[#D48C8C] mt-1 italic">* Deixe 0 para não cobrar sinal.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
