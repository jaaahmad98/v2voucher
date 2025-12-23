import React, { useState, useEffect, useRef } from 'react';
import { User, Ticket, CheckCircle, LogIn, UserPlus, LogOut } from 'lucide-react';
import { authAPI, voucherAPI } from './api';
import JsBarcode from 'jsbarcode';

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login'); // login, register, dashboard
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

 // Form States
const [authData, setAuthData] = useState({ 
  username: '', 
  password: '', 
  email: '',
  phone_number: '',
  state: ''
});

const barcodeRef = useRef(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await authAPI.getCurrentUser();
        setUser(userData);
        setView('dashboard');
        // Fetch voucher
        await loadVoucher();
      } catch (err) {
        // User is not authenticated
        setView('login');
      } finally {
        setCheckingAuth(false);
      }
    };
    checkAuth();
  }, []);

  // Load voucher when user is set
  useEffect(() => {
    if (user && view === 'dashboard') {
      loadVoucher();
    }
  }, [user, view]);

  const loadVoucher = async () => {
    try {
      const voucherData = await voucherAPI.getVoucher();
      setVoucher({
        code: voucherData.code,
        discount: voucherData.discount,
        isUsed: voucherData.is_used
      });
    } catch (err) {
      console.error('Error loading voucher:', err);
    }
  };

  // Generate barcode when voucher code changes
  useEffect(() => {
    if (voucher?.code && barcodeRef.current) {
      try {
        JsBarcode(barcodeRef.current, voucher.code, {
          format: "CODE128",
          width: 2,
          height: 60,
          displayValue: true,
          fontSize: 14,
          textPosition: "top",
          background: "transparent",
          lineColor: "#000000"
        });
      } catch (err) {
        console.error('Barcode generation error:', err);
      }
    }
  }, [voucher?.code, voucher?.isUsed]);

  const handleAuth = async (type) => {
    if (type === 'register') {
      if (!authData.username || !authData.password || !authData.email || !authData.phone_number || !authData.state) {
        setError('Sila isi semua medan');
        return;
      }
    } else {
      if (!authData.username || !authData.password) {
        setError('Sila isi semua medan');
        return;
      }
    }
  
    setLoading(true);
    setError(null);
  
    try {
      let userData;
      if (type === 'register') {
        userData = await authAPI.register(
          authData.username, 
          authData.password, 
          authData.email,
          authData.phone_number,
          authData.state
        );
      } else {
        userData = await authAPI.login(authData.username, authData.password);
      }
  
      setUser(userData.user);
      setView('dashboard');
      setAuthData({ username: '', password: '', email: '', phone_number: '', state: '' });
    } catch (err) {
      setError(err.message || 'Pengesahan gagal');
    } finally {
      setLoading(false);
    }
  };

  const useVoucher = async () => {
    if (voucher?.isUsed) return;
    
    setLoading(true);
    setError(null);

    try {
      await voucherAPI.useVoucher();
      setVoucher(prev => ({ ...prev, isUsed: true }));
    } catch (err) {
      setError(err.message || 'Gagal menggunakan baucar');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setVoucher(null);
      setView('login');
      setAuthData({ username: '', password: '', email: '', phone_number: '', state: '' });
      setError(null);
    }
  };

  // Show loading state while checking authentication
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#efeddd] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#ed1e24] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (view === 'dashboard') {
    return (
      <div className="min-h-screen bg-[#efeddd] flex flex-col items-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-[#efeddd] p-8 relative overflow-hidden">
          {/* Canggih Logo Background - Rotated and Faded */}
          <div 
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{
              backgroundImage: 'url(/canggih-logo.png)',
              backgroundSize: '80%',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              transform: 'rotate(45deg)',
              transformOrigin: 'center'
            }}
          />
          <div className="relative z-10">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Hello, {user?.username}!</h1>
              <p className="text-sm text-gray-500">Selamat datang ke portal ganjaran anda</p>
            </div>
            <button onClick={logout} className="p-2 text-gray-400 hover:text-[#ed1e24] transition-colors">
              <LogOut size={20} />
            </button>
          </div>

          <div className={`relative overflow-hidden rounded-xl border-2 transition-all duration-500 ${voucher?.isUsed ? 'bg-[#efeddd] border-gray-200' : 'bg-[#ed1e24] border-[#ed1e24] shadow-lg shadow-[#ed1e24]/20'}`}>
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Ticket size={80} color="white" />
            </div>

            <div className="p-6 relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${voucher?.isUsed ? 'bg-gray-200 text-gray-500' : 'bg-[#ed1e24] text-white'}`}>
                    Hadiah Pengguna Baru
                  </span>
                  <h2 className={`text-4xl font-black mt-2 ${voucher?.isUsed ? 'text-gray-400' : 'text-white'}`}>
                    {voucher ? `${voucher.discount}% DISKAUN` : 'Memuatkan...'}
                  </h2>
                </div>
                {voucher?.isUsed && <CheckCircle className="text-green-500" size={32} />}
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className={`text-xs ${voucher?.isUsed ? 'text-gray-400' : 'text-white/80'}`}>KOD PROMOSI</p>
                    <p className={`font-mono font-bold text-lg ${voucher?.isUsed ? 'text-gray-400 line-through' : 'text-white'}`}>
                      {voucher?.code || 'Memuatkan...'}
                    </p>
                  </div>
                  
                  <button 
                    onClick={useVoucher}
                    disabled={voucher?.isUsed || loading}
                    className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${
                      voucher?.isUsed 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'bg-white text-[#ed1e24] hover:bg-[#efeddd] active:scale-95'
                    }`}
                  >
                    {loading ? 'Memproses...' : voucher?.isUsed ? 'Dituntut' : 'Guna Sekarang'}
                  </button>
                </div>

                {/* Barcode Display */}
                {voucher?.code && (
                  <div className={`flex justify-center ${voucher?.isUsed ? 'opacity-50' : ''}`}>
                    <canvas 
                      ref={barcodeRef}
                      className="bg-white rounded p-2"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-[#ed1e24]/10 border border-[#ed1e24]/30 text-[#ed1e24] px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-[#efeddd]">
            <h3 className="text-sm font-semibold text-[#1b3292] mb-4">Terma & Syarat</h3>
            <ol className="text-xs text-gray-600 space-y-2 list-decimal list-inside text-justify">
            <li>Baucar diskaun 15%  ini sah digunakan dari <b>23 Dis. 2025 – 31 Jan. 2026.</b></li>
            <li>Baucar perlu ditunjukkan semasa <b>pembayaran</b> dan boleh digunakan <b>hanya sekali di dalam satu resit.</b></li>
            <li>Baucar ini adalah voucher diskaun dan <b>tidak boleh ditukar dengan wang ringgit.</b></li>
            <li>Baucar <b>tidak boleh digabungkan dengan baucar yang lain</b> dan pembelian menggunakan baucar ini <b>tidak sah untuk penebusan zakat, barang promosi, tawaran istimewa atau berdiskaun.</b></li>
            <li><b>Tidak semua barangan boleh didapati di semua cawangan</b>. Selagi stok masih ada di cawangan berkenaan.</li>
            <li>Canggih berhak untuk <b>menukar mana-mana-terma & syarat </b>pada <b>bila-bila masa tanpa notis.</b></li>
            </ol>
          </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#efeddd] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl border border-gray-300 overflow-hidden">
        <div className="bg-[#efeddd] p-8 text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/Canggih-logo-1000px.png" 
              alt="Canggih Logo" 
              className="h-16 w-auto object-contain"
            />
          </div>
          <h2 className="text-2xl font-bold text-[#1b3292]">Aplikasi Baucar</h2>
          <p className="text-gray-700 text-sm">Daftar untuk dapatkan 15% diskaun</p>
        </div>

        <div className="p-8">
          <div className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">Nama Pengguna</label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  className="w-full bg-[#efeddd] border border-gray-200 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-[#1b3292] focus:border-[#1b3292] outline-none transition-all"
                  placeholder="Masukkan nama pengguna"
                  value={authData.username}
                  onChange={(e) => {
                    setAuthData({...authData, username: e.target.value});
                    setError(null);
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && authData.username && authData.password) {
                      handleAuth(view);
                    }
                  }}
                />
              </div>
            </div>

            {view === 'register' && (
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Emel</label>
                <div className="relative mt-1">
                  <input 
                    type="email" 
                    className="w-full bg-[#efeddd] border border-gray-200 rounded-xl py-3 pl-4 pr-4 focus:ring-2 focus:ring-[#1b3292] focus:border-[#1b3292] outline-none transition-all"
                    placeholder="Masukkan emel"
                    value={authData.email}
                    onChange={(e) => {
                      setAuthData({...authData, email: e.target.value});
                      setError(null);
                    }}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">Kata Laluan</label>
              <div className="relative mt-1">
                <LogIn className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="password" 
                  className="w-full bg-[#efeddd] border border-gray-200 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-[#1b3292] focus:border-[#1b3292] outline-none transition-all"
                  placeholder="••••••••"
                  value={authData.password}
                  onChange={(e) => {
                    setAuthData({...authData, password: e.target.value});
                    setError(null);
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && authData.username && authData.password) {
                      handleAuth(view);
                    }
                  }}
                />
              </div>
            </div>

            {view === 'register' && (
              <>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Nombor Telefon</label>
                  <div className="relative mt-1">
                    <input 
                      type="tel" 
                      className="w-full bg-[#efeddd] border border-gray-200 rounded-xl py-3 pl-4 pr-4 focus:ring-2 focus:ring-[#1b3292] focus:border-[#1b3292] outline-none transition-all"
                      placeholder="Masukkan nombor telefon"
                      value={authData.phone_number}
                      onChange={(e) => {
                        setAuthData({...authData, phone_number: e.target.value});
                        setError(null);
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Negeri</label>
                  <div className="relative mt-1">
                    <input 
                      type="text" 
                      className="w-full bg-[#efeddd] border border-gray-200 rounded-xl py-3 pl-4 pr-4 focus:ring-2 focus:ring-[#1b3292] focus:border-[#1b3292] outline-none transition-all"
                      placeholder="Masukkan negeri"
                      value={authData.state}
                      onChange={(e) => {
                        setAuthData({...authData, state: e.target.value});
                        setError(null);
                      }}
                    />
                  </div>
                </div>
              </>
            )}

            <button 
              onClick={() => handleAuth(view)}
              disabled={
                (view === 'register' 
                  ? (!authData.username || !authData.password || !authData.email || !authData.phone_number || !authData.state)
                  : (!authData.username || !authData.password)
                ) || loading
              }
              className="w-full bg-[#ed1e24] hover:bg-[#c91a1f] text-white font-bold py-4 rounded-xl shadow-lg shadow-[#ed1e24]/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {view === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />}
                  {view === 'login' ? 'Log Masuk' : 'Buat Akaun'}
                </>
              )}
            </button>

            <button 
              onClick={() => {
                setView(view === 'login' ? 'register' : 'login');
                setError(null);
              }}
              className="w-full text-center text-sm text-gray-500 hover:text-[#1b3292] font-medium"
            >
              {view === 'login' ? "Tiada akaun? Daftar" : "Sudah ada akaun? Log Masuk"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
