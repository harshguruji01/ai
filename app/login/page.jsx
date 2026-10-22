'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import GuruLogo from '@/components/GuruLogo';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawNext = searchParams.get('next') || '/';
  const nextUrl = (rawNext.includes('webguruji.online') && !rawNext.includes('ai.webguruji.online'))
    ? '/'
    : (!rawNext.startsWith('/') && !rawNext.includes('ai.webguruji.online') && !rawNext.includes('localhost') ? '/' : rawNext);
  const initialReset = searchParams.get('reset_password') === 'true';

  const [supabase] = useState(() => createClient());
  const [mode, setMode] = useState(initialReset ? 'update_password' : 'login'); // 'login' | 'register' | 'forgot' | 'update_password'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Check if user is already signed in or arrived via password recovery hash
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user && mode !== 'update_password') {
        window.location.href = nextUrl.startsWith('/') ? nextUrl : '/';
      }
    });

    if (typeof window !== 'undefined') {
      const hash = window.location.hash || '';
      if (hash.includes('type=recovery') || initialReset) {
        setMode('update_password');
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode('update_password');
      } else if (session?.user && mode !== 'update_password') {
        window.location.href = nextUrl.startsWith('/') ? nextUrl : '/';
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, router, nextUrl, initialReset, mode]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const resetFormState = (newMode) => {
    setMode(newMode);
    setErrorMsg('');
    setSuccessMsg('');
    setPassword('');
    setConfirmPassword('');
    setOtpCode('');
    setNewPassword('');
  };

  // Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const target = (typeof window !== 'undefined' && window.location.origin && window.location.origin !== 'null' && window.location.protocol !== 'file:')
        ? (nextUrl.startsWith('/') ? `${window.location.origin}${nextUrl}` : nextUrl)
        : 'https://ai.webguruji.online/';

      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem('hg_auth_redirect', target);
          localStorage.setItem('hg_auth_redirect', target);
          const isWebGuruji = window.location.hostname === 'webguruji.online' || window.location.hostname.endsWith('.webguruji.online');
          const domainStr = isWebGuruji ? '; domain=.webguruji.online' : '';
          const secureStr = window.location.protocol === 'https:' ? '; secure' : '';
          document.cookie = `hg_auth_redirect=${encodeURIComponent(target)}; path=/; max-age=3600${domainStr}; SameSite=Lax${secureStr}`;
        } catch (e) {}
      }

      const redirectUrl = target;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) throw error;
    } catch (err) {
      setErrorMsg(err.message || 'Google Sign-In failed. Please try again.');
      setLoading(false);
    }
  };

  // 1. Sign In Handler
  const handleSignIn = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      let { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error && error.message?.toLowerCase().includes('email not confirmed')) {
        try {
          await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.trim(), password }),
          });
          const retry = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });
          data = retry.data;
          error = retry.error;
        } catch (_) {}
      }

      if (error) throw error;

      if (data?.user) {
        setSuccessMsg('Signed in successfully! Redirecting...');
        setTimeout(() => {
          window.location.href = nextUrl.startsWith('/') ? nextUrl : '/';
        }, 500);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Sign Up Handler
  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const displayName = cleanEmail.split('@')[0];

      // Step 1: Call backend auto-confirmed signup API
      try {
        const resp = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, password, name: displayName }),
        });
        const respJson = await resp.json().catch(() => ({}));
        if (resp.status === 409 || (respJson.error && respJson.error.toLowerCase().includes('already registered'))) {
          setErrorMsg('This email is already registered. Please sign in with your password.');
          setMode('login');
          setLoading(false);
          return;
        }
      } catch (_) {}

      // Step 2: Supabase client signUp
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: displayName,
            name: displayName,
          },
          emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
        },
      });

      if (signUpError) {
        if (
          signUpError.message?.toLowerCase().includes('already registered') ||
          signUpError.message?.toLowerCase().includes('already exists')
        ) {
          setErrorMsg('This email is already registered. Please sign in instead.');
          setMode('login');
          setLoading(false);
          return;
        }
        throw signUpError;
      }

      // Supabase returns error: null but identities: [] if the email already exists in auth.users
      if (signUpData?.user && Array.isArray(signUpData.user.identities) && signUpData.user.identities.length === 0) {
        setErrorMsg('This email is already registered. Please sign in with your password or Google.');
        setMode('login');
        setLoading(false);
        return;
      }

      // Case A: User has an active session immediately
      if (signUpData?.session) {
        setSuccessMsg('Account created and signed in successfully! Redirecting...');
        setTimeout(() => {
          window.location.href = nextUrl.startsWith('/') ? nextUrl : '/';
        }, 600);
        return;
      }

      // Case B: Try signing in immediately with the new password
      try {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (!signInError && signInData?.user) {
          setSuccessMsg('Account created and signed in successfully! Redirecting...');
          setTimeout(() => {
            window.location.href = nextUrl.startsWith('/') ? nextUrl : '/';
          }, 600);
          return;
        }
      } catch (_) {}

      // Case C: Account created, but email confirmation is pending
      setSuccessMsg('Account created successfully! Please check your email to verify your account, then sign in.');
      setMode('login');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Send Code to Mail Handler
  const handleSendResetCode = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const redirectUrl =
        typeof window !== 'undefined'
          ? `${window.location.origin}/auth/callback?next=/login?reset_password=true`
          : undefined;

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl,
      });

      if (error) throw error;

      setCodeSent(true);
      setResendCooldown(60);
      setSuccessMsg(
        'Code and password reset link sent to your mail! Check your inbox and enter the code below.'
      );
    } catch (err) {
      setErrorMsg(err.message || 'Failed to send reset code.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Verify Code & Reset Password
  const handleVerifyOtpAndReset = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!otpCode || otpCode.trim().length < 4) {
      setErrorMsg('Please enter the verification code sent to your email.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { data, error: otpError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otpCode.trim(),
        type: 'recovery',
      });

      if (otpError) throw otpError;

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      setSuccessMsg('Password reset successful! You are now logged in. Redirecting...');
      setTimeout(() => {
        window.location.href = nextUrl.startsWith('/') ? nextUrl : '/';
      }, 800);
    } catch (err) {
      setErrorMsg(err.message || 'Invalid or expired code. Please request a new one.');
    } finally {
      setLoading(false);
    }
  };

  // 5. Direct Password Update (via magic link)
  const handleDirectPasswordUpdate = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setSuccessMsg('Password updated successfully! Redirecting...');
      setTimeout(() => {
        window.location.href = nextUrl.startsWith('/') ? nextUrl : '/';
      }, 800);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-[#07090E] text-slate-100 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Navbar */}
      <header className="h-16 border-b border-slate-800/80 px-6 flex items-center justify-between bg-slate-950/60 backdrop-blur-md z-10">
        <Link href="/" className="flex items-center gap-2.5 group">
          <GuruLogo size={28} className="group-hover:scale-105 transition-transform" />
          <div className="leading-tight">
            <span className="font-bold text-sm tracking-wide text-white font-heading">GuruAI</span>
            <span className="text-[10px] text-slate-400 block">by HarshGuruJi</span>
          </div>
        </Link>

        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-xl transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Chat</span>
        </Link>
      </header>

      {/* Main Login Window Card */}
      <main className="flex-1 flex items-center justify-center p-4 z-10">
        <div className="w-full max-w-md rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl shadow-indigo-950/40 p-6 md:p-8 backdrop-blur-xl relative overflow-hidden">
          
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-950/80 border border-indigo-500/40 text-cyan-400 shadow-lg shadow-indigo-500/20 mb-3">
              {mode === 'forgot' || mode === 'update_password' ? (
                <KeyRound className="w-6 h-6 text-cyan-400" />
              ) : (
                <Sparkles className="w-6 h-6 text-indigo-400" />
              )}
            </div>
            <h1 className="text-2xl font-bold font-heading bg-gradient-to-r from-white via-indigo-100 to-cyan-300 bg-clip-text text-transparent">
              {mode === 'login' && 'Sign In to GuruAI'}
              {mode === 'register' && 'Create Your Account'}
              {mode === 'forgot' && 'Reset Password'}
              {mode === 'update_password' && 'Set New Password'}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {mode === 'login' && 'Unlock 10 requests / 12h, cloud chat history & AI image studio'}
              {mode === 'register' && 'Sign up with your email to access all member features'}
              {mode === 'forgot' && 'Receive a verification code & reset link on your email'}
              {mode === 'update_password' && 'Enter your new secure password'}
            </p>
          </div>

          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 flex items-start gap-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/50 border border-emerald-800/60 flex items-start gap-2.5 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400 mt-0.5" />
              <span className="leading-relaxed">{successMsg}</span>
            </div>
          )}

          {/* FORM 1: LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-300">Password</label>
                  <button
                    type="button"
                    onClick={() => resetFormState('forgot')}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-10 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-slate-900/90 px-3 text-slate-500 uppercase tracking-wider font-medium text-[10px]">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold text-sm flex items-center justify-center gap-2.5 transition shadow-sm disabled:opacity-60 group"
              >
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="pt-2 text-center text-xs text-slate-400">
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => resetFormState('register')}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold transition"
                >
                  Sign Up
                </button>
              </div>
            </form>
          )}

          {/* FORM 2: REGISTER */}
          {mode === 'register' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Password (min. 6 characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-10 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-slate-900/90 px-3 text-slate-500 uppercase tracking-wider font-medium text-[10px]">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold text-sm flex items-center justify-center gap-2.5 transition shadow-sm disabled:opacity-60 group"
              >
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="pt-2 text-center text-xs text-slate-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => resetFormState('login')}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold transition"
                >
                  Sign In
                </button>
              </div>
            </form>
          )}

          {/* FORM 3: FORGOT PASSWORD */}
          {mode === 'forgot' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Account Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              {/* SEND CODE TO MAIL BUTTON */}
              <button
                type="button"
                onClick={handleSendResetCode}
                disabled={loading || resendCooldown > 0}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : resendCooldown > 0 ? (
                  <span className="text-xs">Resend Code in {resendCooldown}s</span>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    <span>Send Code to Mail</span>
                  </>
                )}
              </button>

              {codeSent && (
                <form
                  onSubmit={handleVerifyOtpAndReset}
                  className="pt-3 border-t border-slate-800 space-y-3.5 animate-in fade-in duration-300"
                >
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Enter Verification Code from Email
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                      <input
                        type="text"
                        required
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="e.g. 123456"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-cyan-300 font-mono tracking-widest focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-10 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-white font-semibold text-sm shadow-lg shadow-cyan-600/20 flex items-center justify-center gap-2 transition disabled:opacity-60"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Verify Code & Reset Password</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              <div className="pt-2 text-center text-xs text-slate-400">
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={() => resetFormState('login')}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold transition"
                >
                  Back to Sign In
                </button>
              </div>
            </div>
          )}

          {/* FORM 4: DIRECT PASSWORD UPDATE */}
          {mode === 'update_password' && (
            <form onSubmit={handleDirectPasswordUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  New Password (min. 6 characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-10 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-white font-semibold text-sm shadow-lg flex items-center justify-center gap-2 transition disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Update Password</span>
                  </>
                )}
              </button>
            </form>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-800/80">
        GuruAI by <img src="https://webguruji.online/logo.png" alt="HarshGuruJi Logo" style={{ height: '1.1em', width: '1.1em', borderRadius: '3px', verticalAlign: 'middle', display: 'inline-block', marginRight: '3px' }} />HarshGuruJi &bull; Secure Authentication powered by Supabase &bull;{' '}
        <a href="https://webguruji.online" target="_blank" className="text-cyan-400 hover:underline">
          webguruji.online
        </a>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07090E] flex items-center justify-center text-slate-400 text-sm">
          Loading authentication...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
