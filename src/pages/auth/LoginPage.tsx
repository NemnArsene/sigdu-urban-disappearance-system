import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, registerSchema, type LoginFormValues, type RegisterFormValues } from '../../schemas';
import { useAuthStore } from '../../stores/authStore';
import { RoleRoutes } from '../../lib/rbac';
import { db } from '../../lib/database';
import { Eye, EyeOff, Loader2, ShieldAlert, CheckCircle2, Lock, ShieldCheck, Mail, User } from 'lucide-react';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence, type Variants } from 'framer-motion';

export const LoginPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();

  const { register: registerLogin, handleSubmit: handleSubmitLogin, formState: { errors: errorsLogin }, setValue: setLoginValue } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema)
  });

  const { register: registerSignup, handleSubmit: handleSubmitSignup, formState: { errors: errorsSignup } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema)
  });

  const onLogin = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network
      const users = await db.users.where('email').equals(data.email).toArray();
      const user = users[0];

      if (user) {
        login(user);
        toast.success('Connexion réussie', { description: `Bienvenue, ${user.name}` });
        navigate(RoleRoutes[user.role]);
      } else {
        toast.error('Erreur', { description: 'Identifiants invalides' });
      }
    } catch (error) {
      toast.error('Erreur', { description: 'Une erreur est survenue' });
    } finally {
      setIsLoading(false);
    }
  };

  const onRegister = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const existing = await db.users.where('email').equals(data.email).toArray();
      if (existing.length > 0) {
        toast.error('Erreur', { description: 'Cet email est déjà utilisé.' });
        return;
      }

      const newUser = {
        id: crypto.randomUUID(),
        email: data.email,
        name: data.name,
        role: 'CITOYEN' as const,
        createdAt: new Date().toISOString()
      };

      await db.users.add(newUser);
      login(newUser);
      toast.success('Compte créé', { description: `Bienvenue sur SIGDU, ${newUser.name}` });
      navigate(RoleRoutes[newUser.role]);
    } catch (error) {
      toast.error('Erreur', { description: 'Impossible de créer le compte.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (email: string) => {
    setIsRegister(false);
    setLoginValue('email', email);
    setLoginValue('password', 'password123');
  };

  // Animation variants
  const formVariants: Variants = {
    hidden: { opacity: 0, x: isRegister ? 50 : -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut', staggerChildren: 0.1 } },
    exit: { opacity: 0, x: isRegister ? -50 : 50, transition: { duration: 0.3 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen flex font-sans bg-slate-50 overflow-hidden">
      {/* Left side: Dark Context (50%) - Hidden on mobile, flex on desktop */}
      <div className="hidden lg:flex flex-col w-1/2 bg-[#0A0F1C] text-white relative h-screen">
        {/* Subtle animated glowing orbs */}
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-red-900 blur-[120px] pointer-events-none" 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-900 blur-[100px] pointer-events-none" 
        />

        <div className="relative z-10 flex-1 flex flex-col p-12 overflow-y-auto no-scrollbar">

          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
            className="flex items-center gap-3 mb-auto"
          >
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.3)]">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">SIGDU</span>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
            className="my-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-8 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Réseau 24/7 Actif
            </div>
            <h1 className="text-5xl xl:text-6xl font-black leading-[1.1] tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400">
              Votre vigilance,<br />
              <span className="text-red-500 font-medium">au service de tous.</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-md leading-relaxed font-medium">
              Système participatif de signalement et de coordination entre citoyens et autorités.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-auto space-y-12"
          >
            {/* Stats card */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-slate-900/60 border border-slate-800/60 rounded-3xl p-6 flex items-center justify-between backdrop-blur-xl max-w-lg shadow-2xl cursor-default"
            >
              <div className="text-center">
                <p className="text-3xl font-black text-white">89%</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Résolus</p>
              </div>
              <div className="w-px h-12 bg-slate-800" />
              <div className="text-center">
                <p className="text-3xl font-black text-white">1.2k</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Citoyens</p>
              </div>
              <div className="w-px h-12 bg-slate-800" />
              <div className="text-center">
                <p className="text-3xl font-black text-white flex items-center justify-center gap-1">
                  4.9<span className="text-amber-400 text-xl">★</span>
                </p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Fiabilité</p>
              </div>
              <div className="w-px h-12 bg-slate-800" />
              <div className="text-center">
                <p className="text-3xl font-black text-white">...</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Plus</p>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>

      {/* Right side: Form (50% on desktop, 100% on mobile, Off-white bg) */}
      <div className="w-full lg:w-1/2 flex flex-col h-screen overflow-y-auto relative" style={{ backgroundColor: '#F1F5F9', backgroundImage: 'radial-gradient(circle, #ffffff 2px, transparent 2px)', backgroundSize: '24px 24px' }}>

        {/* Mobile Header (Only visible on small screens) */}
        <motion.div 
          initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}
          className="lg:hidden p-6 flex items-center justify-center gap-3 bg-white border-b border-slate-200 shadow-sm sticky top-0 z-20"
        >
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/20">
            <ShieldAlert className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-black tracking-tight text-slate-900">SIGDU</span>
        </motion.div>

        <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative z-10">
          <div className="w-full max-w-md">
            
            <AnimatePresence mode="wait">
              <motion.div
                key={isRegister ? 'register' : 'login'}
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div className="mb-8 text-center lg:text-left">
                  <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">
                    {isRegister ? 'Rejoindre SIGDU' : 'Bon retour'}
                  </motion.h2>
                  <motion.p variants={itemVariants} className="text-slate-500 text-sm sm:text-base font-medium">
                    {isRegister ? 'Créez votre compte citoyen gratuit et participez à la sécurité de tous.' : 'Connectez-vous pour accéder à votre espace sécurisé.'}
                  </motion.p>
                </div>

                {/* Form Container with sleek shadow */}
                <motion.div 
                  variants={itemVariants}
                  className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100"
                >
                  {isRegister ? (
                    <form onSubmit={handleSubmitSignup(onRegister)} className="space-y-5">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nom complet</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <User className="w-5 h-5 text-slate-400" />
                          </div>
                          <motion.input
                            whileFocus={{ scale: 1.01 }}
                            {...registerSignup('name')}
                            type="text"
                            className={cn(
                              "w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl pl-12 pr-4 py-3.5 outline-none focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 transition-all font-semibold",
                              errorsSignup.name && "border-red-500 focus:border-red-500 focus:ring-red-500/10"
                            )}
                            placeholder="Jean Dupont"
                          />
                        </div>
                        {errorsSignup.name && <p className="text-xs text-red-500 font-bold ml-1">{errorsSignup.name.message}</p>}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail className="w-5 h-5 text-slate-400" />
                          </div>
                          <motion.input
                            whileFocus={{ scale: 1.01 }}
                            {...registerSignup('email')}
                            type="email"
                            className={cn(
                              "w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl pl-12 pr-4 py-3.5 outline-none focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 transition-all font-semibold",
                              errorsSignup.email && "border-red-500 focus:border-red-500 focus:ring-red-500/10"
                            )}
                            placeholder="jean@example.com"
                          />
                        </div>
                        {errorsSignup.email && <p className="text-xs text-red-500 font-bold ml-1">{errorsSignup.email.message}</p>}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Mot de passe</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className="w-5 h-5 text-slate-400" />
                          </div>
                          <motion.input
                            whileFocus={{ scale: 1.01 }}
                            {...registerSignup('password')}
                            type={showPassword ? 'text' : 'password'}
                            className={cn(
                              "w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl pl-12 pr-12 py-3.5 outline-none focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 transition-all font-semibold",
                              errorsSignup.password && "border-red-500 focus:border-red-500 focus:ring-red-500/10"
                            )}
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        {errorsSignup.password && <p className="text-xs text-red-500 font-bold ml-1">{errorsSignup.password.message}</p>}
                      </div>

                      <motion.button
                        whileHover={{ scale: isLoading ? 1 : 1.02 }}
                        whileTap={{ scale: isLoading ? 1 : 0.98 }}
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#0A0F1C] hover:bg-slate-800 text-white font-bold py-4 rounded-2xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 shadow-lg shadow-slate-900/10"
                      >
                        {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Création...</> : 'Créer mon compte'}
                      </motion.button>
                    </form>
                  ) : (
                    <form onSubmit={handleSubmitLogin(onLogin)} className="space-y-5">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail className="w-5 h-5 text-slate-400" />
                          </div>
                          <motion.input
                            whileFocus={{ scale: 1.01 }}
                            {...registerLogin('email')}
                            type="email"
                            className={cn(
                              "w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl pl-12 pr-4 py-3.5 outline-none focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 transition-all font-semibold",
                              errorsLogin.email && "border-red-500 focus:border-red-500 focus:ring-red-500/10"
                            )}
                            placeholder="email@domaine.com"
                          />
                        </div>
                        {errorsLogin.email && <p className="text-xs text-red-500 font-bold ml-1">{errorsLogin.email.message}</p>}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Mot de passe</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className="w-5 h-5 text-slate-400" />
                          </div>
                          <motion.input
                            whileFocus={{ scale: 1.01 }}
                            {...registerLogin('password')}
                            type={showPassword ? 'text' : 'password'}
                            className={cn(
                              "w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl pl-12 pr-12 py-3.5 outline-none focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 transition-all font-semibold",
                              errorsLogin.password && "border-red-500 focus:border-red-500 focus:ring-red-500/10"
                            )}
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        {errorsLogin.password && <p className="text-xs text-red-500 font-bold ml-1">{errorsLogin.password.message}</p>}
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <div className="relative flex items-center justify-center">
                            <input type="checkbox" className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded-md checked:bg-red-600 checked:border-red-600 transition-colors" />
                            <CheckCircle2 className="w-3 h-3 text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100" />
                          </div>
                          <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">Se souvenir de moi</span>
                        </label>
                        <a href="#" className="text-sm font-bold text-red-600 hover:text-red-700 transition-colors">Oublié ?</a>
                      </div>

                      <motion.button
                        whileHover={{ scale: isLoading ? 1 : 1.02 }}
                        whileTap={{ scale: isLoading ? 1 : 0.98 }}
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#0A0F1C] hover:bg-slate-800 text-white font-bold py-4 rounded-2xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4 shadow-lg shadow-slate-900/10"
                      >
                        {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Connexion...</> : 'Se connecter au Dashboard'}
                      </motion.button>
                    </form>
                  )}
                </motion.div>

                <motion.div variants={itemVariants} className="mt-8 flex items-center justify-center gap-2">
                  <span className="text-sm font-medium text-slate-500">
                    {isRegister ? 'Déjà un compte ?' : "Pas encore de compte ?"}
                  </span>
                  <button
                    onClick={() => setIsRegister(!isRegister)}
                    className="text-sm font-bold text-red-600 hover:text-red-700 transition-colors px-4 py-2 rounded-xl hover:bg-red-50"
                  >
                    {isRegister ? 'Se connecter' : 'Créer un compte gratuit'}
                  </button>
                </motion.div>

                {/* Quick Demo */}
                {!isRegister && (
                  <motion.div variants={itemVariants} className="mt-8 pt-6 border-t border-slate-200">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mb-4">Accès rapide (Jury)</p>
                    <div className="flex gap-2 justify-center flex-wrap">
                      <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }} onClick={() => handleDemoLogin('citoyen@sigdu.cm')} className="text-xs font-bold px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:shadow-sm transition-all">Citoyen</motion.button>
                      <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }} onClick={() => handleDemoLogin('agent@sigdu.cm')} className="text-xs font-bold px-4 py-2 rounded-xl bg-white border border-amber-200 text-amber-700 hover:bg-amber-50 hover:shadow-sm transition-all">Agent</motion.button>
                      <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }} onClick={() => handleDemoLogin('superviseur@sigdu.cm')} className="text-xs font-bold px-4 py-2 rounded-xl bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:shadow-sm transition-all">Superviseur</motion.button>
                      <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }} onClick={() => handleDemoLogin('admin@sigdu.cm')} className="text-xs font-bold px-4 py-2 rounded-xl bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:shadow-sm transition-all">Admin</motion.button>
                    </div>
                  </motion.div>
                )}

              </motion.div>
            </AnimatePresence>

            {/* Security Badges */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.5 }}
              className="mt-12 flex flex-wrap items-center justify-center gap-6"
            >
              <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-wider">Chiffrement AES</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-wider">Conforme RGPD</span>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
};
