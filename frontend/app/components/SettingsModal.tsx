import React, { useEffect, useState } from 'react';
import {  
  X, 
  Loader2, 
  Users,
  Settings
} from 'lucide-react';

const SettingsModal = ({ isOpen, onClose, user, onSuccess }: any) => {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'security', 'prefs'
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Estados para novas funcionalidades
  const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });
  const [notifications, setNotifications] = useState({ email: true, browser: false });

  useEffect(() => {
    if (user && isOpen) setFullName(user.fullName);
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName }),
        credentials: 'include',
      });
      if (response.ok) {
        setMessage({ text: 'Perfil atualizado!', type: 'success' });
        onSuccess();
      }
    } catch (err) {
      setMessage({ text: 'Erro ao atualizar.', type: 'error' });
    } finally { setIsLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[550px]">
        
        {/* Sidebar do Modal */}
        <div className="w-full md:w-48 bg-gray-50 p-6 border-r border-gray-100 flex md:flex-col gap-2">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex-1 md:flex-none flex items-center gap-2 p-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'profile' ? 'bg-fuchsia-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-200'}`}
          >
            <Users size={18} /> <span className="hidden md:inline">Perfil</span>
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`flex-1 md:flex-none flex items-center gap-2 p-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'security' ? 'bg-fuchsia-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-200'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <span className="hidden md:inline">Segurança</span>
          </button>
          <button 
            onClick={() => setActiveTab('prefs')}
            className={`flex-1 md:flex-none flex items-center gap-2 p-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'prefs' ? 'bg-fuchsia-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-200'}`}
          >
            <Settings size={18} /> <span className="hidden md:inline">Preferências</span>
          </button>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 flex flex-col bg-white min-w-0">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-extrabold text-gray-900 capitalize">{activeTab === 'prefs' ? 'Preferências' : activeTab}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-8">
            {message.text && (
              <div className={`mb-6 p-3 rounded-xl text-sm font-bold ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {message.text}
              </div>
            )}

            {/* ABA: PERFIL */}
            {activeTab === 'profile' && (
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 rounded-full bg-fuchsia-100 text-fuchsia-700 flex items-center justify-center text-3xl font-black shadow-inner">
                    {user.fullName.charAt(0)}
                  </div>
                  <button type="button" className="text-sm font-bold text-fuchsia-700 hover:text-fuchsia-800 bg-fuchsia-50 px-4 py-2 rounded-lg">Alterar Avatar</button>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">E-mail (Permanente)</label>
                  <input type="text" disabled className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-400 font-medium cursor-not-allowed" value={user.email} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Nome Completo</label>
                  <input type="text" className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-fuchsia-600 outline-none font-medium text-gray-900" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <button type="submit" disabled={isLoading} className="w-full bg-fuchsia-700 text-white font-bold py-3 rounded-xl hover:bg-fuchsia-800 transition-all flex justify-center">
                  {isLoading ? <Loader2 className="animate-spin" /> : 'Salvar Nome'}
                </button>
              </form>
            )}

            {/* ABA: SEGURANÇA */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Senha Atual</label>
                  <input type="password" placeholder="••••••••" className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-fuchsia-600" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Nova Senha</label>
                  <input type="password" placeholder="Mínimo 8 caracteres" className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-fuchsia-600" />
                </div>
                <button className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-black transition-all">Atualizar Senha</button>
                
                <div className="pt-6 border-t border-gray-100">
                  <h4 className="text-red-600 font-bold text-sm mb-4">Zona de Perigo</h4>
                  <button className="text-sm font-bold text-red-600 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 transition-all">Apagar Minha Conta</button>
                </div>
              </div>
            )}

            {/* ABA: PREFERÊNCIAS */}
            {activeTab === 'prefs' && (
              <div className="space-y-8">
                <div>
                  <h4 className="font-bold text-gray-900 mb-4">Notificações</h4>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm font-medium text-gray-700">Notificações por E-mail</span>
                      <input type="checkbox" className="w-5 h-5 accent-fuchsia-600" defaultChecked />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm font-medium text-gray-700">Alertas no Navegador</span>
                      <input type="checkbox" className="w-5 h-5 accent-fuchsia-600" />
                    </label>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-4">Aparência e Idioma</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Idioma</label>
                      <select className="w-full p-2 border border-gray-200 rounded-lg text-sm font-bold outline-none">
                        <option>Português (PT)</option>
                        <option>English (US)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Tema</label>
                      <select className="w-full p-2 border border-gray-200 rounded-lg text-sm font-bold outline-none">
                        <option>Claro</option>
                        <option>Escuro (Beta)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;