import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if professional profile exists
      const profRef = doc(db, 'professionals', user.uid);
      const profSnap = await getDoc(profRef);
      
      if (!profSnap.exists()) {
        // Create initial profile
        await setDoc(profRef, {
          id: user.uid,
          name: user.displayName || '',
          email: user.email || '',
          businessName: 'Meu Salão',
          slug: user.uid.slice(0, 8),
          plan: 'free',
          createdAt: new Date().toISOString()
        });
      }
      
      toast.success('Login realizado com sucesso!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error(error);
      toast.error('Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegistering) {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const user = result.user;
        
        // Create professional profile
        await setDoc(doc(db, 'professionals', user.uid), {
          id: user.uid,
          name: email.split('@')[0],
          email: email,
          businessName: businessName || 'Meu Salão',
          slug: user.uid.slice(0, 8),
          plan: 'free',
          createdAt: new Date().toISOString()
        });
        
        toast.success('Conta criada com sucesso!');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Bem-vinda de volta!');
      }
      navigate('/dashboard');
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Este e-mail já está em uso.');
      } else if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        toast.error('E-mail ou senha incorretos.');
      } else {
        toast.error('Erro na autenticação. Verifique seus dados.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9F9] flex items-center justify-center px-6 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-[#F8E8E8]"
      >
        <div className="text-center mb-8">
          <div className="text-3xl font-serif font-bold text-[#D48C8C] mb-2">auralumi</div>
          <p className="text-[#6D5D5D]">
            {isRegistering ? 'Crie sua conta profissional' : 'Entre para gerenciar sua agenda'}
          </p>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
          <AnimatePresence mode="wait">
            {isRegistering && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="block text-sm font-medium text-[#6D5D5D] mb-1">Nome do Negócio</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9E8E8E]" size={18} />
                  <input 
                    required
                    type="text" 
                    placeholder="Ex: Studio Beauty"
                    value={businessName}
                    onChange={e => setBusinessName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-2xl border border-[#F8E8E8] focus:outline-none focus:border-[#D48C8C]"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="block text-sm font-medium text-[#6D5D5D] mb-1">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9E8E8E]" size={18} />
              <input 
                required
                type="email" 
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-[#F8E8E8] focus:outline-none focus:border-[#D48C8C]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#6D5D5D] mb-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9E8E8E]" size={18} />
              <input 
                required
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-[#F8E8E8] focus:outline-none focus:border-[#D48C8C]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#D48C8C] text-white rounded-2xl font-bold shadow-lg hover:bg-[#C27B7B] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? 'Processando...' : isRegistering ? 'Criar Conta' : 'Entrar'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#F8E8E8]"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-[#9E8E8E]">Ou continue com</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 border-2 border-[#F8E8E8] rounded-2xl font-medium hover:bg-[#FFF9F9] hover:border-[#D48C8C] transition-all disabled:opacity-50"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/action/google.svg" alt="Google" className="w-6 h-6" referrerPolicy="no-referrer" />
          Google
        </button>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-sm text-[#D48C8C] font-medium hover:underline"
          >
            {isRegistering ? 'Já tem uma conta? Entre aqui' : 'Não tem conta? Cadastre-se grátis'}
          </button>
        </div>

        <p className="mt-8 text-[10px] text-[#9E8E8E] text-center leading-relaxed">
          Ao entrar, você concorda com nossos Termos de Uso e Política de Privacidade.
        </p>
      </motion.div>
    </div>
  );
}
