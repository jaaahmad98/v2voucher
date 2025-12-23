import React, { useState, useEffect, useRef } from 'react';
import { User, Ticket, CheckCircle, LogIn, UserPlus, LogOut, Download, Upload } from 'lucide-react';
import { authAPI, voucherAPI } from './api';
import JsBarcode from 'jsbarcode';
import html2canvas from 'html2canvas';

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login'); // login, register, dashboard
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);

 // Form States
const [authData, setAuthData] = useState({ 
  username: '', 
  password: '', 
  email: '',
  phone_number: '',
  state: ''
});

const voucherCardRef = useRef(null);
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

  // Generate barcode when voucher code changes
  useEffect(() => {
    if (voucher?.code && barcodeRef.current) {
      try {
        JsBarcode(barcodeRef.current, voucher.code, {
          format: "CODE128",
          width: 2,
          height: 80,
          displayValue: true,
          fontSize: 14,
          margin: 10
        });
      } catch (err) {
        console.error('Error generating barcode:', err);
      }
    }
  }, [voucher?.code]);

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
      setError(err.message || 'Gagal menggunakan voucher');
    } finally {
      setLoading(false);
    }
  };

  const downloadVoucher = async () => {
    if (!voucherCardRef.current || !voucher?.code) return;
    
    try {
      setLoading(true);
      const canvas = await html2canvas(voucherCardRef.current, {
        backgroundColor: null,
        scale: 2, // Higher quality
      });
      
      // Convert canvas to image
      const imageUrl = canvas.toDataURL('image/png');
      
      // Create download link
      const link = document.createElement('a');
      link.download = `voucher-${voucher.code}.png`;
      link.href = imageUrl;
      link.click();
    } catch (err) {
      console.error('Error downloading voucher:', err);
      setError('Gagal memuat turun voucher');
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
      setUploadFile(null);
      setUploadSuccess(null);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        setError('Fail mesti dalam format Excel (.xlsx atau .xls)');
        setUploadFile(null);
        return;
      }
      setUploadFile(file);
      setError(null);
      setUploadSuccess(null);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) {
      setError('Sila pilih fail Excel');
      return;
    }

    setLoading(true);
    setError(null);
    setUploadSuccess(null);

    try {
      const response = await voucherAPI.uploadVoucherBatch(uploadFile);
      setUploadSuccess(response.message || 'Fail Excel berjaya dimuat naik!');
      setUploadFile(null);
      // Reset file input
      const fileInput = document.getElementById('excel-file-input');
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat naik fail Excel');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#efeddd' }}>
        <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: '#ed1e24', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (view === 'dashboard') {
    return (
      <div className="min-h-screen flex flex-col items-center p-6" style={{ backgroundColor: '#87CEEB' }}>
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Halo, {user?.username}!</h1>
              <p className="text-sm text-gray-500">Selamat datang ke portal ganjaran anda</p>
            </div>
            <button onClick={logout} className="p-2 text-gray-400 transition-colors" style={{ color: '#666', '--hover-color': '#ed1e24' }} onMouseEnter={(e) => e.currentTarget.style.color = '#ed1e24'} onMouseLeave={(e) => e.currentTarget.style.color = '#666'}>
              <LogOut size={20} />
            </button>
          </div>

          {/* Sky Background with Clouds */}
          <div 
            ref={voucherCardRef}
            className="relative overflow-hidden rounded-3xl"
            style={{ 
              backgroundColor: '#87CEEB',
              backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(255,255,255,0.3) 0%, transparent 50%)',
              padding: '20px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
            }}
          >
            {/* Cloud decorations */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              <div className="absolute top-2 left-4 w-16 h-8 rounded-full opacity-30" style={{ backgroundColor: 'white', boxShadow: '20px 0 0 0 white, 10px -10px 0 0 white, 30px -10px 0 0 white' }}></div>
              <div className="absolute top-4 right-8 w-20 h-10 rounded-full opacity-30" style={{ backgroundColor: 'white', boxShadow: '25px 0 0 0 white, 12px -12px 0 0 white, 38px -12px 0 0 white' }}></div>
              <div className="absolute bottom-2 left-12 w-14 h-7 rounded-full opacity-30" style={{ backgroundColor: 'white', boxShadow: '18px 0 0 0 white, 9px -9px 0 0 white, 27px -9px 0 0 white' }}></div>
            </div>

            {/* Main Green Panel */}
            <div 
              className={`relative rounded-2xl transition-all duration-500 ${voucher?.isUsed ? 'bg-gray-100 border-gray-300' : ''}`}
              style={voucher?.isUsed ? {} : { 
                backgroundColor: '#4CAF50', 
                border: '6px solid #FFD700',
                borderRadius: '20px'
              }}
            >
              {/* Red and White Striped Awning */}
              <div 
                className="h-8 rounded-t-2xl relative overflow-hidden"
                style={{
                  background: 'repeating-linear-gradient(90deg, #ed1e24 0%, #ed1e24 50%, white 50%, white 100%)',
                  backgroundSize: '20px 100%'
                }}
              ></div>

              <div className="p-6 relative z-10">
                {/* TAWARAN ISTIMEWA Header */}
                <div className="text-center mb-4">
                  <h2 className={`text-2xl font-black uppercase tracking-wider ${voucher?.isUsed ? 'text-gray-400' : 'text-white'}`}>
                    TAWARAN ISTIMEWA
                  </h2>
                </div>

                {/* Brand Logos Area */}
                <div className="flex justify-center items-center gap-4 mb-4">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${voucher?.isUsed ? 'text-gray-400' : 'text-white'}`} style={voucher?.isUsed ? {} : { color: '#ed1e24', textDecoration: 'underline', textDecorationColor: '#1b3292', textUnderlineOffset: '4px' }}>
                      Canggih
                    </div>
                  </div>
                </div>

                {/* DAPATKAN E-BAUCAR */}
                <div className="text-center mb-6">
                  <h3 className={`text-xl font-black uppercase ${voucher?.isUsed ? 'text-gray-400' : ''}`} style={voucher?.isUsed ? {} : { color: '#FFD700' }}>
                    DAPATKAN E-BAUCAR
                  </h3>
                </div>

                {/* Main Content Area */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  {/* Left Side - Button and Info */}
                  <div className="flex-1 flex flex-col items-center gap-4">
                    <button 
                      onClick={useVoucher}
                      disabled={voucher?.isUsed || loading}
                      className={`px-6 py-3 rounded-lg font-bold text-sm transition-all ${
                        voucher?.isUsed 
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                        : 'bg-orange-500 active:scale-95'
                      }`}
                      style={voucher?.isUsed ? {} : { 
                        backgroundColor: '#FF9800', 
                        color: 'white',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                      }}
                      onMouseEnter={(e) => !voucher?.isUsed && !loading && (e.currentTarget.style.backgroundColor = '#F57C00')}
                      onMouseLeave={(e) => !voucher?.isUsed && !loading && (e.currentTarget.style.backgroundColor = '#FF9800')}
                    >
                      {loading ? 'Memproses...' : voucher?.isUsed ? 'Dituntut' : 'IMBAS BARCODE'}
                    </button>
                    
                    <div className="text-center">
                      <p className={`text-xs mb-1 ${voucher?.isUsed ? 'text-gray-400' : 'text-white'}`}>KOD PROMOSI</p>
                      <p className={`font-mono font-bold text-lg ${voucher?.isUsed ? 'text-gray-400 line-through' : 'text-white'}`}>
                        {voucher?.code || 'Memuatkan...'}
                      </p>
                    </div>
                  </div>

                  {/* Right Side - Barcode and Discount Badges */}
                  <div className="flex flex-col items-center gap-4">
                    {/* Discount Badges */}
                    <div className="flex flex-col gap-2">
                      <div 
                        className={`w-20 h-20 rounded-full flex items-center justify-center text-center ${voucher?.isUsed ? 'bg-gray-200 border-gray-300' : ''}`}
                        style={voucher?.isUsed ? {} : { 
                          backgroundColor: '#ed1e24', 
                          border: '3px solid white',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}
                      >
                        <div className={`text-xs font-black ${voucher?.isUsed ? 'text-gray-400' : 'text-white'}`}>
                          {voucher ? `${voucher.discount}%` : '0%'}<br/>OFF
                        </div>
                      </div>
                    </div>

                    {/* Barcode Display */}
                    {voucher?.code && (
                      <div className={`bg-white rounded-lg p-3 ${voucher?.isUsed ? 'opacity-50' : ''}`} style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        <svg ref={barcodeRef}></svg>
                      </div>
                    )}
                  </div>
                </div>

                {/* Used Indicator */}
                {voucher?.isUsed && (
                  <div className="absolute top-4 right-4">
                    <CheckCircle className="text-green-500" size={32} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: '#fee', border: '1px solid #ed1e24', color: '#ed1e24' }}>
              {error}
            </div>
          )}

          {/* Download Button */}
          {voucher?.code && (
            <div className="mt-4 flex justify-center">
              <button 
                onClick={downloadVoucher}
                disabled={loading}
                className="px-6 py-3 text-white rounded-xl font-semibold text-sm flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#1b3292' }}
                onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#152275')}
                onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = '#1b3292')}
              >
                <Download size={18} />
                {loading ? 'Memproses...' : 'Muat Turun Voucher'}
              </button>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Terma & Syarat</h3>
            <ol className="text-xs text-gray-600 space-y-2 list-decimal list-inside text-justify">
            <li>Baucar diskaun 15%  ini sah digunakan dari <b>23 Dis. 2025 – 31 Jan. 2026.</b></li>
            <li>Baucar perlu ditunjukkan semasa <b>pembayaran</b> dan boleh digunakan <b>hanya sekali di dalam satu resit.</b></li>
            <li>Baucar ini adalah voucher diskaun dan <b>tidak boleh ditukar dengan wang ringgit.</b></li>
            <li>Baucar <b>tidak boleh digabungkan dengan baucar yang lain</b> dan pembelian menggunakan baucar ini <b>tidak sah untuk penebusan zakat, barang promosi, tawaran istimewa atau berdiskaun.</b></li>
            <li><b>Tidak semua barangan boleh didapati di semua cawangan</b>. Selagi stok masih ada di cawangan berkenaan.</li>
            <li>Canggih berhak untuk <b>menukar mana-mana-terma & syarat </b>pada <b>bila-bila masa tanpa notis.</b></li>
            </ol>
          </div>

          {/* Admin Panel - Only visible to super admins */}
          {user?.role === 'super_admin' && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Panel Pentadbir</h3>
              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Muat Naik Fail Excel Voucher Batch
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    Fail Excel mesti mengandungi lajur 'barcode'. Fail yang dimuat naik akan disimpan sebagai voucher_barcode_with_serial.xlsx.
                  </p>
                  <div className="flex flex-col gap-3">
                    <input
                      id="excel-file-input"
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                    />
                    {uploadFile && (
                      <div className="text-sm text-gray-600">
                        Fail dipilih: <span className="font-medium">{uploadFile.name}</span>
                      </div>
                    )}
                    <button
                      onClick={handleUpload}
                      disabled={!uploadFile || loading}
                      className="px-6 py-3 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: '#1b3292' }}
                      onMouseEnter={(e) => !loading && uploadFile && (e.currentTarget.style.backgroundColor = '#152275')}
                      onMouseLeave={(e) => !loading && uploadFile && (e.currentTarget.style.backgroundColor = '#1b3292')}
                    >
                      <Upload size={18} />
                      {loading ? 'Memuat naik...' : 'Muat Naik Fail'}
                    </button>
                  </div>
                </div>
                {uploadSuccess && (
                  <div className="px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: '#d4edda', border: '1px solid #28a745', color: '#155724' }}>
                    {uploadSuccess}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#efeddd' }}>
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="p-8 text-center" style={{ backgroundColor: '#ed1e24' }}>
          <div className="inline-flex p-3 rounded-2xl mb-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
            <Ticket className="text-white" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white">Aplikasi Voucher</h2>
          <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Daftar untuk dapatkan diskaun 15%</p>
        </div>

        <div className="p-8">
          <div className="space-y-4">
            {error && (
              <div className="px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: '#fee', border: '1px solid #ed1e24', color: '#ed1e24' }}>
                {error}
              </div>
            )}
            
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">Nama Pengguna</label>
                <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
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
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">E-mel</label>
                <div className="relative mt-1">
                  <input 
                    type="email" 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-4 pr-4 focus:border-transparent outline-none transition-all"
                    placeholder="Masukkan e-mel"
                    onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 0 2px #1b3292'}
                    onBlur={(e) => e.currentTarget.style.boxShadow = ''}
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
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                  onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 0 2px #1b3292'}
                  onBlur={(e) => e.currentTarget.style.boxShadow = ''}
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
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-4 pr-4 focus:border-transparent outline-none transition-all"
                      placeholder="Masukkan nombor telefon"
                      onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 0 2px #1b3292'}
                      onBlur={(e) => e.currentTarget.style.boxShadow = ''}
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
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-4 pr-4 focus:border-transparent outline-none transition-all"
                      placeholder="Masukkan negeri"
                      onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 0 2px #1b3292'}
                      onBlur={(e) => e.currentTarget.style.boxShadow = ''}
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
              className="w-full text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ backgroundColor: '#ed1e24', boxShadow: '0 10px 15px -3px rgba(237, 30, 36, 0.1)' }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#d11a20')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = '#ed1e24')}
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
              className="w-full text-center text-sm text-gray-500 font-medium"
              onMouseEnter={(e) => e.currentTarget.style.color = '#1b3292'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
            >
              {view === 'login' ? "Tiada akaun? Daftar" : "Sudah ada akaun? Log Masuk"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
