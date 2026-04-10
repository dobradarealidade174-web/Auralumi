import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle, 
  Edit2, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownRight,
  ShoppingCart,
  Tag,
  BarChart3
} from 'lucide-react';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, updateDoc, orderBy } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { Product } from '../../types';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    costPrice: '',
    stock: '',
    minStock: '',
    category: ''
  });

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'products'),
      where('professionalId', '==', auth.currentUser.uid),
      orderBy('name', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      costPrice: parseFloat(formData.costPrice || '0'),
      stock: parseInt(formData.stock),
      minStock: parseInt(formData.minStock || '0'),
      professionalId: auth.currentUser.uid,
      updatedAt: new Date().toISOString()
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'products', editingId), productData);
        toast.success('Produto atualizado!');
      } else {
        await addDoc(collection(db, 'products'), {
          ...productData,
          createdAt: new Date().toISOString()
        });
        toast.success('Produto adicionado!');
      }
      closeModal();
    } catch (error) {
      toast.error('Erro ao salvar produto.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      toast.success('Produto excluído.');
    } catch (error) {
      toast.error('Erro ao excluir.');
    }
  };

  const openModal = (product?: Product) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        name: product.name,
        price: product.price.toString(),
        costPrice: product.costPrice?.toString() || '',
        stock: product.stock.toString(),
        minStock: product.minStock?.toString() || '',
        category: product.category || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        price: '',
        costPrice: '',
        stock: '',
        minStock: '5',
        category: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockProducts = products.filter(p => p.stock <= (p.minStock || 0));

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#4A3F3F]">Estoque de Produtos</h1>
          <p className="text-[#6D5D5D]">Gerencie seus produtos e controle de vendas.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[#D48C8C] text-white rounded-full shadow-lg hover:bg-[#C27B7B] transition-all font-medium"
        >
          <Plus size={20} /> Adicionar Produto
        </button>
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-[#F8E8E8] shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-[#FFF9F9] text-[#D48C8C]">
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm text-[#9E8E8E]">Total de Itens</p>
            <p className="text-2xl font-bold text-[#4A3F3F]">{products.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#F8E8E8] shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-orange-50 text-orange-500">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm text-[#9E8E8E]">Estoque Baixo</p>
            <p className="text-2xl font-bold text-[#4A3F3F]">{lowStockProducts.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#F8E8E8] shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-green-50 text-green-500">
            <BarChart3 size={24} />
          </div>
          <div>
            <p className="text-sm text-[#9E8E8E]">Valor em Estoque</p>
            <p className="text-2xl font-bold text-[#4A3F3F]">
              R$ {products.reduce((acc, p) => acc + (p.price * p.stock), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Inventory List */}
      <section className="bg-white rounded-3xl border border-[#F8E8E8] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#F8E8E8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9E8E8E]" size={18} />
            <input 
              type="text" 
              placeholder="Buscar produto ou categoria..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#FFF9F9] border border-[#F8E8E8] focus:outline-none focus:border-[#D48C8C] text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#FFF9F9] text-[#9E8E8E] text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-bold">Produto</th>
                <th className="px-6 py-4 font-bold">Categoria</th>
                <th className="px-6 py-4 font-bold text-center">Estoque</th>
                <th className="px-6 py-4 font-bold text-right">Preço Venda</th>
                <th className="px-6 py-4 font-bold text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F8E8E8]">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-[#9E8E8E]">Carregando...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-[#9E8E8E]">Nenhum produto encontrado.</td></tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-[#FFF9F9] transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-[#4A3F3F]">{p.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-[#6D5D5D] bg-[#F8E8E8] px-2 py-1 rounded-md">{p.category || 'Geral'}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={cn(
                        "text-sm font-bold px-3 py-1 rounded-full",
                        p.stock <= (p.minStock || 0) ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                      )}>
                        {p.stock} un
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-[#4A3F3F] text-right">
                      R$ {p.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => openModal(p)}
                          className="p-2 text-[#6D5D5D] hover:bg-[#FFF9F9] rounded-lg transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(p.id)}
                          className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

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
                  {editingId ? 'Editar Produto' : 'Novo Produto'}
                </h2>
                <button onClick={closeModal} className="text-[#9E8E8E] hover:text-[#4A3F3F]">
                  <Plus className="rotate-45" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#6D5D5D] mb-1">Nome do Produto</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#F8E8E8] focus:outline-none focus:border-[#D48C8C]"
                    placeholder="Ex: Shampoo Pós-Química"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#6D5D5D] mb-1">Preço de Venda (R$)</label>
                    <input 
                      required
                      type="number" 
                      step="0.01"
                      value={formData.price}
                      onChange={e => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-[#F8E8E8] focus:outline-none focus:border-[#D48C8C]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#6D5D5D] mb-1">Preço de Custo (R$)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={formData.costPrice}
                      onChange={e => setFormData({ ...formData, costPrice: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-[#F8E8E8] focus:outline-none focus:border-[#D48C8C]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#6D5D5D] mb-1">Estoque Atual</label>
                    <input 
                      required
                      type="number" 
                      value={formData.stock}
                      onChange={e => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-[#F8E8E8] focus:outline-none focus:border-[#D48C8C]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#6D5D5D] mb-1">Estoque Mínimo</label>
                    <input 
                      type="number" 
                      value={formData.minStock}
                      onChange={e => setFormData({ ...formData, minStock: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-[#F8E8E8] focus:outline-none focus:border-[#D48C8C]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#6D5D5D] mb-1">Categoria</label>
                  <input 
                    type="text" 
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#F8E8E8] focus:outline-none focus:border-[#D48C8C]"
                    placeholder="Ex: Cabelo, Rosto, etc."
                  />
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
                    {editingId ? 'Salvar Alterações' : 'Adicionar Produto'}
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
