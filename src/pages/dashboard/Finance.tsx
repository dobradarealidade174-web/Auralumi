import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Calendar, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight,
  Package,
  Scissors,
  Tag,
  Search,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { collection, query, where, onSnapshot, addDoc, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { Transaction } from '../../types';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
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

export default function Finance() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [dateFilter, setDateFilter] = useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });

  const [formData, setFormData] = useState({
    type: 'income' as Transaction['type'],
    category: 'service' as Transaction['category'],
    amount: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd')
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

    const q = query(
      collection(db, 'transactions'),
      where('professionalId', '==', auth.currentUser.uid),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'transactions');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    try {
      await addDoc(collection(db, 'transactions'), {
        ...formData,
        amount: parseFloat(formData.amount),
        professionalId: auth.currentUser.uid,
        createdAt: new Date().toISOString()
      });
      toast.success('Transação registrada!');
      setIsModalOpen(false);
      setFormData({
        type: 'income',
        category: 'service',
        amount: '',
        description: '',
        date: format(new Date(), 'yyyy-MM-dd')
      });
    } catch (error) {
      toast.error('Erro ao registrar transação.');
    }
  };

  const filteredByDateTransactions = transactions.filter(t => {
    const date = parseISO(t.date);
    return isWithinInterval(date, {
      start: parseISO(dateFilter.start),
      end: parseISO(dateFilter.end)
    });
  });

  const totalIncome = filteredByDateTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = filteredByDateTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const chartData = [
    { name: 'Entradas', value: totalIncome, color: '#10B981' },
    { name: 'Saídas', value: totalExpense, color: '#EF4444' }
  ];

  // Group by day for the bar chart
  const dailyData = filteredByDateTransactions.reduce((acc: any[], t) => {
    const day = format(parseISO(t.date), 'dd/MM');
    const existing = acc.find(a => a.day === day);
    if (existing) {
      if (t.type === 'income') existing.income += t.amount;
      else existing.expense += t.amount;
    } else {
      acc.push({ 
        day, 
        income: t.type === 'income' ? t.amount : 0, 
        expense: t.type === 'expense' ? t.amount : 0 
      });
    }
    return acc;
  }, []).sort((a, b) => a.day.localeCompare(b.day));

  const filteredTransactions = filteredByDateTransactions.filter(t => {
    if (filterType === 'all') return true;
    return t.type === filterType;
  });

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#4A3F3F]">Financeiro</h1>
          <p className="text-[#6D5D5D]">Controle seu fluxo de caixa e lucros.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[#D48C8C] text-white rounded-full shadow-lg hover:bg-[#C27B7B] transition-all font-medium"
        >
          <Plus size={20} /> Nova Transação
        </button>
      </header>

      {/* Summary Cards */}
      <div className="bg-white p-6 rounded-3xl border border-[#F8E8E8] shadow-sm mb-8">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-2 text-[#6D5D5D]">
            <Filter size={18} />
            <span className="text-sm font-medium">Filtrar por período:</span>
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="date" 
              value={dateFilter.start}
              onChange={e => setDateFilter({ ...dateFilter, start: e.target.value })}
              className="px-3 py-2 text-sm rounded-xl border border-[#F8E8E8] focus:outline-none focus:border-[#D48C8C]"
            />
            <span className="text-[#9E8E8E]">até</span>
            <input 
              type="date" 
              value={dateFilter.end}
              onChange={e => setDateFilter({ ...dateFilter, end: e.target.value })}
              className="px-3 py-2 text-sm rounded-xl border border-[#F8E8E8] focus:outline-none focus:border-[#D48C8C]"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-[#F8E8E8] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-2xl bg-green-50 text-green-500">
              <TrendingUp size={24} />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">Este mês</span>
          </div>
          <p className="text-sm text-[#9E8E8E]">Entradas</p>
          <p className="text-2xl font-bold text-[#4A3F3F]">R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#F8E8E8] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-2xl bg-red-50 text-red-500">
              <TrendingDown size={24} />
            </div>
            <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">Este mês</span>
          </div>
          <p className="text-sm text-[#9E8E8E]">Saídas</p>
          <p className="text-2xl font-bold text-[#4A3F3F]">R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>

        <div className={cn(
          "p-6 rounded-3xl border shadow-sm",
          balance >= 0 ? "bg-[#FFF9F9] border-[#F8E8E8]" : "bg-red-50 border-red-100"
        )}>
          <div className="flex items-center justify-between mb-4">
            <div className={cn("p-3 rounded-2xl bg-white", balance >= 0 ? "text-[#D48C8C]" : "text-red-500")}>
              <DollarSign size={24} />
            </div>
            <span className="text-xs font-medium text-[#D48C8C] bg-white px-2 py-1 rounded-full shadow-sm">Saldo</span>
          </div>
          <p className="text-sm text-[#9E8E8E]">Saldo Líquido</p>
          <p className={cn("text-2xl font-bold", balance >= 0 ? "text-[#4A3F3F]" : "text-red-600")}>
            R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-3xl border border-[#F8E8E8] shadow-sm">
          <h3 className="font-bold text-[#4A3F3F] mb-6 flex items-center gap-2">
            <BarChartIcon size={18} className="text-[#D48C8C]" /> Fluxo Diário
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F8E8E8" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9E8E8E' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9E8E8E' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  cursor={{ fill: '#FFF9F9' }}
                />
                <Bar dataKey="income" name="Entradas" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Saídas" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#F8E8E8] shadow-sm">
          <h3 className="font-bold text-[#4A3F3F] mb-6 flex items-center gap-2">
            <PieChartIcon size={18} className="text-[#D48C8C]" /> Distribuição
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <section className="bg-white rounded-3xl border border-[#F8E8E8] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#F8E8E8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="font-serif font-bold text-lg">Histórico de Transações</h2>
          <div className="flex bg-[#F8E8E8] p-1 rounded-xl">
            {(['all', 'income', 'expense'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={cn(
                  "px-4 py-1.5 text-xs font-medium rounded-lg transition-all",
                  filterType === type ? "bg-white text-[#D48C8C] shadow-sm" : "text-[#9E8E8E] hover:text-[#6D5D5D]"
                )}
              >
                {type === 'all' ? 'Todos' : type === 'income' ? 'Entradas' : 'Saídas'}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#FFF9F9] text-[#9E8E8E] text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-bold">Data</th>
                <th className="px-6 py-4 font-bold">Descrição</th>
                <th className="px-6 py-4 font-bold">Categoria</th>
                <th className="px-6 py-4 font-bold text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F8E8E8]">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-10 text-center text-[#9E8E8E]">Carregando...</td></tr>
              ) : filteredTransactions.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-10 text-center text-[#9E8E8E]">Nenhuma transação encontrada.</td></tr>
              ) : (
                filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-[#FFF9F9] transition-colors">
                    <td className="px-6 py-4 text-sm text-[#6D5D5D]">{format(parseISO(t.date), 'dd/MM/yyyy')}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-[#4A3F3F]">{t.description}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F8E8E8] text-[#D48C8C]">
                        {t.category === 'service' ? <Scissors size={10} /> : <Package size={10} />}
                        {t.category}
                      </span>
                    </td>
                    <td className={cn(
                      "px-6 py-4 text-sm font-bold text-right",
                      t.type === 'income' ? "text-green-600" : "text-red-600"
                    )}>
                      {t.type === 'income' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-[#F8E8E8] flex items-center justify-between">
                <h2 className="text-xl font-serif font-bold">Nova Transação</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-[#9E8E8E] hover:text-[#4A3F3F]">
                  <Plus className="rotate-45" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="flex bg-[#F8E8E8] p-1 rounded-xl mb-4">
                  {(['income', 'expense'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, type })}
                      className={cn(
                        "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
                        formData.type === type ? "bg-white text-[#D48C8C] shadow-sm" : "text-[#9E8E8E]"
                      )}
                    >
                      {type === 'income' ? 'Entrada' : 'Saída'}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#6D5D5D] mb-1">Valor (R$)</label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#F8E8E8] focus:outline-none focus:border-[#D48C8C]"
                    placeholder="0,00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#6D5D5D] mb-1">Descrição</label>
                  <input 
                    required
                    type="text" 
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#F8E8E8] focus:outline-none focus:border-[#D48C8C]"
                    placeholder="Ex: Venda de Shampoo"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#6D5D5D] mb-1">Categoria</label>
                    <select 
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                      className="w-full px-4 py-3 rounded-xl border border-[#F8E8E8] focus:outline-none focus:border-[#D48C8C]"
                    >
                      <option value="service">Serviço</option>
                      <option value="product">Produto</option>
                      <option value="rent">Aluguel</option>
                      <option value="supplies">Insumos</option>
                      <option value="other">Outros</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#6D5D5D] mb-1">Data</label>
                    <input 
                      required
                      type="date" 
                      value={formData.date}
                      onChange={e => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-[#F8E8E8] focus:outline-none focus:border-[#D48C8C]"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-[#D48C8C] text-white rounded-xl font-medium shadow-lg hover:bg-[#C27B7B] transition-all mt-4"
                >
                  Registrar
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
