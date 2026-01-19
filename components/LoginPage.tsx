
import React, { useState } from 'react';
import { UserRole } from '../types';
import { Language, translations } from '../translations';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

interface LoginPageProps {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ language, setLanguage }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [activeRole, setActiveRole] = useState<UserRole>(UserRole.FARMER);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const t = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;
        
        // Save user profile to Firestore
        await setDoc(doc(db, 'users', user.uid), {
          name: formData.name,
          email: formData.email,
          role: activeRole,
          location: 'Not Specified',
          rating: 5.0,
          ratingCount: 0,
          honorScore: activeRole === UserRole.FARMER ? 100 : 0,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`,
          walletBalance: 0,
          createdAt: Date.now()
        });
      } else {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const isFarmer = activeRole === UserRole.FARMER;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px]">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-xl transition-all duration-500 ${isFarmer ? 'bg-emerald-600' : 'bg-slate-900'}`}>
            <span className="text-3xl text-white">{isFarmer ? '🌾' : '🛒'}</span>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">{t.appName}</h1>
          <p className="text-slate-500 text-sm mt-2">{t.slogan}</p>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-2xl border border-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex p-1 bg-slate-100 rounded-xl mb-8">
              <button 
                onClick={() => { setActiveRole(UserRole.FARMER); setError(''); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${isFarmer ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {t.farmerTab}
              </button>
              <button 
                onClick={() => { setActiveRole(UserRole.RETAIL_BUYER); setError(''); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${!isFarmer ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {t.buyerTab}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {isSignUp && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter your name"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 outline-none focus:ring-2 focus:bg-white text-slate-800"
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
              )}
              
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Email</label>
                <input 
                  type="email" 
                  placeholder="name@example.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 outline-none focus:ring-2 focus:bg-white text-slate-800"
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 outline-none focus:ring-2 focus:bg-white text-slate-800"
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-[10px] py-3 px-4 rounded-xl border border-red-100">
                  {error}
                </div>
              )}

              <button 
                disabled={loading}
                className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all active:scale-[0.98] ${loading ? 'opacity-50' : ''} ${isFarmer ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-900 hover:bg-slate-800'}`}
              >
                {loading ? 'Processing...' : (isSignUp ? 'Create Account' : t.loginBuyer)}
              </button>
            </form>

            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="w-full mt-4 text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
