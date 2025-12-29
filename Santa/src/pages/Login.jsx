import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { LogIn, Lock, Mail } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Intentamos la autenticación
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // 2. Si entra, lo mandamos al Dashboard
        navigate('/dashboard');
      }
    } catch (error) {
      alert("Error de acceso: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-transparent">
      <form 
        onSubmit={handleLogin} 
        className="bg-white/90 backdrop-blur-xl p-10 rounded-[3rem] shadow-2xl border border-white/50 w-full max-w-md animate-fade-in"
      >
        <div className="text-center mb-10">
          <div className="bg-blue-600 w-16 h-16 rounded-3xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-blue-100">
            <Lock size={32} />
          </div>
          <h1 className="text-3xl font-black text-blue-900 uppercase tracking-tighter">S.A.G.A.</h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Instituto Santa Catalina</p>
        </div>

        <div className="space-y-6">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              required type="email" placeholder="Correo electrónico" 
              className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl outline-none font-bold text-sm focus:ring-4 focus:ring-blue-100 transition-all"
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              required type="password" placeholder="Contraseña" 
              className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl outline-none font-bold text-sm focus:ring-4 focus:ring-blue-100 transition-all"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest shadow-xl hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            {loading ? "VERIFICANDO..." : "INGRESAR AL PANEL"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;