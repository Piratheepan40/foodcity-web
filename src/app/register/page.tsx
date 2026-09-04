'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, UserPlus, Shield, User, Loader2, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState<'ADMIN' | 'CASHIER'>('CASHIER');

  // Touched states for live validation
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const router = useRouter();

  // Helper validation logic
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isPasswordValid = password.length >= 6;
  const doPasswordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!password) return { score: 0, label: '', color: 'bg-slate-200 dark:bg-slate-800' };
    if (password.length < 6) return { score: 1, label: 'Too short', color: 'bg-rose-500' };

    let score = 1;
    if (password.length >= 8) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[A-Z]/.test(password) || /[^A-Za-z0-9]/.test(password)) score++;

    if (score === 2) return { score: 2, label: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score: 3, label: 'Good', color: 'bg-emerald-500' };
    return { score: 4, label: 'Strong', color: 'bg-emerald-400' };
  };

  const strength = getPasswordStrength();

  const emailError = emailTouched
    ? !email.trim()
      ? 'Email address is required.'
      : !isEmailValid
        ? 'Please enter a valid email address.'
        : null
    : null;

  const passwordError = passwordTouched
    ? !password
      ? 'Password is required.'
      : !isPasswordValid
        ? 'Password must be at least 6 characters long.'
        : null
    : null;

  const confirmPasswordError = confirmPasswordTouched
    ? !confirmPassword
      ? 'Please confirm your password.'
      : !doPasswordsMatch
        ? 'Passwords do not match.'
        : null
    : null;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailTouched(true);
    setPasswordTouched(true);
    setConfirmPasswordTouched(true);

    if (!email.trim() || !password || !confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!isEmailValid) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!isPasswordValid) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (!doPasswordsMatch) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const user = await register(email.trim(), password, role);
      toast.success(`Account registered successfully as ${role}!`);
      if (user.role === 'ADMIN') {
        router.push('/admin/products');
      } else {
        router.push('/pos');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* FULL WIDTH - Register Form */}
      <div className="w-full flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Main Card Header */}
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-extrabold tracking-tight">Create Staff Account</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Register a new cashier or administrator user account.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5" noValidate>
            {/* Role Selection Tabs */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Account Role & Permissions
              </label>
              <div className="p-1 rounded-2xl bg-slate-200/80 dark:bg-slate-900 border border-slate-300/60 dark:border-slate-800 grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => setRole('CASHIER')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all duration-200 ${role === 'CASHIER'
                      ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200 dark:border-slate-700'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                >
                  <User className="w-4 h-4" /> CASHIER
                </button>
                <button
                  type="button"
                  onClick={() => setRole('ADMIN')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all duration-200 ${role === 'ADMIN'
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-700'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                >
                  <Shield className="w-4 h-4" /> ADMIN
                </button>
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Email Address
                </label>
                {emailTouched && isEmailValid && (
                  <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Valid Email
                  </span>
                )}
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (!emailTouched) setEmailTouched(true);
                    if (error) setError(null);
                  }}
                  onBlur={() => setEmailTouched(true)}
                  placeholder="e.g. staff@foodcity.lk"
                  className={`w-full pl-10 pr-10 py-3 rounded-xl bg-white dark:bg-slate-900 border text-slate-900 dark:text-slate-100 text-sm focus:outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-sm ${emailError
                      ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/30'
                      : emailTouched && isEmailValid
                        ? 'border-emerald-500 focus:ring-2 focus:ring-emerald-500/30'
                        : 'border-slate-300 dark:border-slate-800 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500'
                    }`}
                />
                {emailTouched && (
                  <div className="absolute right-3.5 top-3.5">
                    {emailError ? (
                      <AlertCircle className="w-4 h-4 text-rose-500" />
                    ) : isEmailValid ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : null}
                  </div>
                )}
              </div>
              {emailError && (
                <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3 shrink-0" /> {emailError}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                {password && (
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Strength: <span className="font-semibold text-slate-900 dark:text-slate-100">{strength.label}</span>
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (!passwordTouched) setPasswordTouched(true);
                    if (error) setError(null);
                  }}
                  onBlur={() => setPasswordTouched(true)}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-12 py-3 rounded-xl bg-white dark:bg-slate-900 border text-slate-900 dark:text-slate-100 text-sm focus:outline-none transition-all shadow-sm ${passwordError
                      ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/30'
                      : passwordTouched && isPasswordValid
                        ? 'border-emerald-500 focus:ring-2 focus:ring-emerald-500/30'
                        : 'border-slate-300 dark:border-slate-800 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength visual meter */}
              {password.length > 0 && (
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`h-1.5 rounded-full transition-all duration-300 ${step <= strength.score ? strength.color : 'bg-slate-200 dark:bg-slate-800'
                        }`}
                    />
                  ))}
                </div>
              )}

              {passwordError ? (
                <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3 shrink-0" /> {passwordError}
                </p>
              ) : (
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  Minimum 6 characters with numbers or uppercase letters recommended.
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Confirm Password
                </label>
                {confirmPasswordTouched && doPasswordsMatch && (
                  <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Passwords Match
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (!confirmPasswordTouched) setConfirmPasswordTouched(true);
                    if (error) setError(null);
                  }}
                  onBlur={() => setConfirmPasswordTouched(true)}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-12 py-3 rounded-xl bg-white dark:bg-slate-900 border text-slate-900 dark:text-slate-100 text-sm focus:outline-none transition-all shadow-sm ${confirmPasswordError
                      ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/30'
                      : confirmPasswordTouched && doPasswordsMatch
                        ? 'border-emerald-500 focus:ring-2 focus:ring-emerald-500/30'
                        : 'border-slate-300 dark:border-slate-800 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPasswordError && (
                <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3 shrink-0" /> {confirmPasswordError}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-white font-semibold text-sm transition-all shadow-md disabled:opacity-50 mt-2 ${role === 'ADMIN'
                  ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20'
                }`}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" /> Register New Account
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
              Sign In Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

