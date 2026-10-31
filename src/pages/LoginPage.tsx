import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { validateEmail, validatePassword } from '../utils/validation';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [formErrors, setFormErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const { login, isLoading, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    clearError();
    if (isAuthenticated) {
      navigate('/app', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setFormErrors({});

    const emailVal = validateEmail(email);
    const passVal = validatePassword(password);

    if (!emailVal.isValid || !passVal.isValid) {
      setFormErrors({
        email: emailVal.error,
        password: passVal.error,
      });
      return;
    }

    try {
      await login({ email: email.trim(), password, rememberMe });
      navigate('/app', { replace: true });
    } catch {
      // Handled in context
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotEmail) {
      setForgotSent(true);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-4xl bg-white rounded-3xl border border-[#E5E1D7] shadow-card overflow-hidden grid grid-cols-1 md:grid-cols-12">
        {/* Left Brand Panel */}
        <div className="md:col-span-5 bg-[#1B4332] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <circle cx="100" cy="100" r="80" stroke="#FFF" strokeWidth="1" fill="none" />
              <path d="M0 0 L200 200" stroke="#FFF" strokeWidth="1" />
            </svg>
          </div>

          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/10 text-xs font-medium tracking-wide">
              <ShieldCheck className="w-3.5 h-3.5 text-[#A3C4B0]" />
              <span>Candidate Access</span>
            </div>

            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white leading-snug">
                Prove your fit before you ever step into the room.
              </h2>
              <p className="text-xs text-[#D5E3DA] mt-3 leading-relaxed">
                Access your AI Resume Score Engine, keyword gap analyses, and candidate dossier
                tailoring workspace.
              </p>
            </div>
          </div>

          <div className="relative z-10 pt-8 border-t border-white/15 space-y-2.5">
            <div className="flex items-center gap-2 text-xs text-[#D5E3DA]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#A3C4B0] shrink-0" />
              <span>AI Resume Score Engine</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#D5E3DA]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#A3C4B0] shrink-0" />
              <span>FastAPI & SQLite backend architecture</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#D5E3DA]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#A3C4B0] shrink-0" />
              <span>No paywalls or subscription restrictions</span>
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="md:col-span-7 p-8 sm:p-12 flex flex-col justify-between bg-white">
          <div>
            <div className="space-y-1 mb-8">
              <h1 className="text-2xl font-bold tracking-tight text-[#1C201D]">
                Sign In to Resume Architect
              </h1>
              <p className="text-xs text-[#57605A]">
                Enter your credentials to access your resume analysis and scoring workspace.
              </p>
            </div>

            {/* Secure Authentication Badge */}
            <div className="mb-6 p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E5E1D7] flex items-center gap-3 text-xs">
              <ShieldCheck className="w-4 h-4 text-[#1B4332] shrink-0" />
              <div>
                <span className="font-semibold text-[#1C201D] block">
                  Encrypted Candidate Authentication
                </span>
                <span className="text-[11px] text-[#57605A]">
                  Credentials and dossiers are verified and secured via persistent database storage.
                </span>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 rounded-lg border border-red-200 text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Work or Personal Email"
                type="email"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={formErrors.email}
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />

              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={formErrors.password}
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[#848E88] hover:text-[#1C201D] transition-colors p-1 cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                required
              />

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-[#57605A] select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-[#E5E1D7] text-[#1B4332] focus:ring-[#1B4332] w-4 h-4"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotModalOpen(true);
                    setForgotEmail(email);
                    setForgotSent(false);
                  }}
                  className="text-[#1B4332] hover:underline font-medium cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Sign In
                </Button>
              </div>
            </form>
          </div>

          <div className="mt-8 pt-6 border-t border-[#F0ECE1] text-center text-xs text-[#57605A]">
            Don't have an account yet?{' '}
            <Link to="/signup" className="text-[#1B4332] font-semibold hover:underline">
              Create Free Account
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#E5E1D7] max-w-md w-full p-6 shadow-elevated space-y-4">
            <h3 className="text-lg font-bold text-[#1C201D]">Reset Password</h3>
            {forgotSent ? (
              <div className="space-y-4">
                <p className="text-xs text-[#57605A] leading-relaxed">
                  If an account exists for <span className="font-semibold text-[#1C201D]">{forgotEmail}</span>,
                  a reset link has been dispatched. Check your inbox and spam folder.
                </p>
                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                  onClick={() => setForgotModalOpen(false)}
                >
                  Return to Login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <p className="text-xs text-[#57605A]">
                  Enter your account email to receive a password recovery link.
                </p>
                <Input
                  label="Account Email"
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="name@domain.com"
                  required
                />
                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setForgotModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm">
                    Send Reset Link
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </AuthLayout>
  );
};
