import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { validateEmail, validatePassword, validatePasswordMatch } from '../utils/validation';
import { Mail, Lock, User as UserIcon, Eye, EyeOff, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const SignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const { signup, isLoading, error, clearError, isAuthenticated } = useAuth();
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
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = 'Full name is required.';
    }

    const emailVal = validateEmail(email);
    if (!emailVal.isValid) {
      newErrors.email = emailVal.error;
    }

    const passVal = validatePassword(password);
    if (!passVal.isValid) {
      newErrors.password = passVal.error;
    }

    const matchVal = validatePasswordMatch(password, confirmPassword);
    if (!matchVal.isValid) {
      newErrors.confirmPassword = matchVal.error;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      await signup({
        name: name.trim(),
        email: email.trim(),
        password,
        confirmPassword,
      });
      navigate('/app', { replace: true });
    } catch {
      // Handled in context
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-4xl bg-white rounded-3xl border border-[#E5E1D7] shadow-card overflow-hidden grid grid-cols-1 md:grid-cols-12">
        {/* Left Brand Panel */}
        <div className="md:col-span-5 bg-[#1B4332] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <rect x="20" y="20" width="160" height="160" stroke="#FFF" strokeWidth="1" fill="none" />
              <path d="M20 100 L180 100" stroke="#FFF" strokeWidth="1" />
              <path d="M100 20 L100 180" stroke="#FFF" strokeWidth="1" />
            </svg>
          </div>

          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/10 text-xs font-medium tracking-wide">
              <ShieldCheck className="w-3.5 h-3.5 text-[#A3C4B0]" />
              <span>The Architecture Standard</span>
            </div>

            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white leading-snug">
                Build your career dossier on verified impact.
              </h2>
              <p className="text-xs text-[#D5E3DA] mt-3 leading-relaxed">
                Join candidates who refuse to rely on shallow keyword spam. Analyze your resume,
                measure compatibility, and discover real skill gaps.
              </p>
            </div>
          </div>

          <div className="relative z-10 pt-8 border-t border-white/15 space-y-2 text-xs text-[#D5E3DA]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#A3C4B0] shrink-0" />
              <span>Free access to all core scoring tools</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#A3C4B0] shrink-0" />
              <span>Deterministic 6-pillar score calculation</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#A3C4B0] shrink-0" />
              <span>Ready for Python FastAPI & Gemini AI</span>
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="md:col-span-7 p-8 sm:p-12 flex flex-col justify-between bg-white">
          <div>
            <div className="space-y-1 mb-8">
              <h1 className="text-2xl font-bold tracking-tight text-[#1C201D]">
                Create Your Account
              </h1>
              <p className="text-xs text-[#57605A]">
                Register to start analyzing resumes against targeted job descriptions.
              </p>
            </div>

            {/* FastAPI + SQLite Backend Notice */}
            <div className="mb-6 p-3 bg-[#FAF8F5] rounded-xl border border-[#E5E1D7] flex items-center gap-2.5 text-xs text-[#57605A]">
              <ShieldCheck className="w-4 h-4 text-[#1B4332] shrink-0" />
              <span>
                <strong>Secure Authentication:</strong> Accounts and career dossiers are encrypted and stored in your persistent SQLite database.
              </span>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 rounded-lg border border-red-200 text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                placeholder="e.g. Sarah Lindqvist"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={errors.name}
                leftIcon={<UserIcon className="w-4 h-4" />}
                required
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />

              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
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

              <Input
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={errors.confirmPassword}
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-[#848E88] hover:text-[#1C201D] transition-colors p-1 cursor-pointer"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                required
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Create Account
                </Button>
              </div>
            </form>
          </div>

          <div className="mt-8 pt-6 border-t border-[#F0ECE1] text-center text-xs text-[#57605A]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#1B4332] font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};
