import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginUser } from '@/api/api';
import { useNavigate } from 'react-router-dom';
import Logo from "../assests/logoA.png";

const Login = () => {
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loginUser(mobile, dispatch);
      navigate('/admin'); // redirect after login
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border/50 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-sm">
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-2xl bg-background border border-border/50 shadow-xl flex items-center justify-center p-2">
                  <img src={Logo} alt="Kawai Logo" className="w-full h-full object-contain" />
                </div>
              </div>
              <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                Admin Login
              </h2>
              <p className="text-muted-foreground mt-2">
                Enter your credentials to access the dashboard
              </p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="mobile" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Mobile Number
                </label>
                <input
                  id="mobile"
                  type="tel"
                  placeholder="e.g. 9876543210"
                  className="flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </button>
            </form>
          </div>
        </div>
        <p className="text-center text-sm text-muted-foreground mt-8">
          &copy; {new Date().getFullYear()} Kawai World Admin Panel
        </p>
      </div>
    </div>
  );
};

export default Login;
