import React, { useState, useEffect, useRef } from 'react';
import { User, Ticket, CheckCircle, LogIn, UserPlus, LogOut, Download } from 'lucide-react';
import { authAPI, voucherAPI } from './api';
import QRCode from 'react-qr-code';
import html2canvas from 'html2canvas';

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

const voucherCardRef = useRef(null);

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

  const handleAuth = async (type) => {
    if (type === 'register') {
      if (!authData.username || !authData.password || !authData.email || !authData.phone_number || !authData.state) {
        setError('Please fill in all fields');
        return;
      }
    } else {
      if (!authData.username || !authData.password) {
        setError('Please fill in all fields');
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
      setError(err.message || 'Authentication failed');
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
      setError(err.message || 'Failed to use voucher');
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
      setError('Failed to download voucher');
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
      <div className="min-h-screen bg-indigo-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (view === 'dashboard') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Hello, {user?.username}!</h1>
              <p className="text-sm text-gray-500">Welcome to your rewards portal</p>
            </div>
            <button onClick={logout} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
              <LogOut size={20} />
            </button>
          </div>

          <div 
            ref={voucherCardRef}
            className={`relative overflow-hidden rounded-xl border-2 transition-all duration-500 ${voucher?.isUsed ? 'bg-gray-50 border-gray-200' : 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-100'}`}
          >
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Ticket size={80} color="white" />
            </div>

            <div className="p-6 relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${voucher?.isUsed ? 'bg-gray-200 text-gray-500' : 'bg-indigo-500 text-indigo-100'}`}>
                    New User Reward
                  </span>
                  <h2 className={`text-4xl font-black mt-2 ${voucher?.isUsed ? 'text-gray-400' : 'text-white'}`}>
                    {voucher ? `${voucher.discount}% OFF` : 'Loading...'}
                  </h2>
                </div>
                {voucher?.isUsed && <CheckCircle className="text-green-500" size={32} />}
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className={`text-xs ${voucher?.isUsed ? 'text-gray-400' : 'text-indigo-200'}`}>PROMO CODE</p>
                    <p className={`font-mono font-bold text-lg ${voucher?.isUsed ? 'text-gray-400 line-through' : 'text-white'}`}>
                      {voucher?.code || 'Loading...'}
                    </p>
                  </div>
                  
                  <button 
                    onClick={useVoucher}
                    disabled={voucher?.isUsed || loading}
                    className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${
                      voucher?.isUsed 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'bg-white text-indigo-600 hover:bg-indigo-50 active:scale-95'
                    }`}
                  >
                    {loading ? 'Processing...' : voucher?.isUsed ? 'Claimed' : 'Use Now'}
                  </button>
                </div>

                {/* QR Code Display */}
                {voucher?.code && (
                  <div className={`flex justify-center ${voucher?.isUsed ? 'opacity-50' : ''}`}>
                    <div className="bg-white rounded p-4">
                      <QRCode
                        value={voucher.code}
                        size={200}
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        viewBox={`0 0 200 200`}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Download Button */}
          {voucher?.code && (
            <div className="mt-4 flex justify-center">
              <button 
                onClick={downloadVoucher}
                disabled={loading}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={18} />
                {loading ? 'Processing...' : 'Download Voucher'}
              </button>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Terms & Conditions</h3>
            <ul className="text-xs text-gray-500 space-y-2">
              <li>• Valid for new registered users only.</li>
              <li>• Can be used only once per account.</li>
              <li>• Not valid with other ongoing promotions.</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="bg-indigo-600 p-8 text-center">
          <div className="inline-flex p-3 bg-white/10 rounded-2xl mb-4">
            <Ticket className="text-white" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white">Voucher App</h2>
          <p className="text-indigo-100 text-sm">Register to get 15% off</p>
        </div>

        <div className="p-8">
          <div className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">Username</label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter username"
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
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Email</label>
                <div className="relative mt-1">
                  <input 
                    type="email" 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-4 pr-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    placeholder="Enter email"
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
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">Password</label>
              <div className="relative mt-1">
                <LogIn className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="password" 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
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
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Phone Number</label>
                  <div className="relative mt-1">
                    <input 
                      type="tel" 
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-4 pr-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                      placeholder="Enter phone number"
                      value={authData.phone_number}
                      onChange={(e) => {
                        setAuthData({...authData, phone_number: e.target.value});
                        setError(null);
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">State</label>
                  <div className="relative mt-1">
                    <input 
                      type="text" 
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-4 pr-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                      placeholder="Enter state"
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
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {view === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />}
                  {view === 'login' ? 'Sign In' : 'Create Account'}
                </>
              )}
            </button>

            <button 
              onClick={() => {
                setView(view === 'login' ? 'register' : 'login');
                setError(null);
              }}
              className="w-full text-center text-sm text-gray-500 hover:text-indigo-600 font-medium"
            >
              {view === 'login' ? "Don't have an account? Register" : "Already have an account? Login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
