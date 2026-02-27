'use client';

import { useState, useRef, useEffect } from 'react';
import { id } from '@instantdb/react';
import { db } from '../db';

interface AuthModalProps {
  user: { id: string; email?: string | null } | null;
}

type Step = 'email' | 'code' | 'name';

export default function AuthModal({ user }: AuthModalProps) {
  const [step, setStep] = useState<Step>(user ? 'name' : 'email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user && step !== 'name') setStep('name');
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (step === 'email') emailRef.current?.focus();
    if (step === 'code') codeRef.current?.focus();
    if (step === 'name') nameRef.current?.focus();
  }, [step]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      await db.auth.sendMagicCode({ email: email.trim() });
      setStep('code');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send code. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      await db.auth.signInWithMagicCode({ email: email.trim(), code: code.trim() });
      // db.useAuth() in parent will update and trigger step transition to 'name'
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid code. Check your email and try again.');
      setCode('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !displayName.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      await db.transact(
        db.tx.profiles[id()].update({ displayName: displayName.trim() }).link({ $user: user.id })
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save name. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 animate-slide-up">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">💡</div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Welcome to Idea Board
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
            {step === 'email' && 'Enter your email to get started'}
            {step === 'code' && `We sent a code to ${email}`}
            {step === 'name' && 'What should we call you?'}
          </p>
        </div>

        {step === 'email' && (
          <form onSubmit={handleSendCode} className="space-y-4">
            <input
              ref={emailRef}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-400 transition-colors text-base"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={!email.trim() || isLoading}
              className="w-full py-3 px-6 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white font-semibold rounded-xl transition-all duration-150 disabled:cursor-not-allowed active:scale-95"
            >
              {isLoading ? 'Sending…' : 'Send magic code →'}
            </button>
          </form>
        )}

        {step === 'code' && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <input
              ref={codeRef}
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="6-digit code"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-400 transition-colors text-base tracking-widest text-center"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={code.length < 6 || isLoading}
              className="w-full py-3 px-6 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white font-semibold rounded-xl transition-all duration-150 disabled:cursor-not-allowed active:scale-95"
            >
              {isLoading ? 'Verifying…' : 'Verify code →'}
            </button>
            <button
              type="button"
              onClick={() => { setStep('email'); setError(null); setCode(''); }}
              className="w-full text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              ← Use a different email
            </button>
          </form>
        )}

        {step === 'name' && (
          <form onSubmit={handleSaveName} className="space-y-4">
            <input
              ref={nameRef}
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Your display name"
              maxLength={40}
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-400 transition-colors text-base"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={!displayName.trim() || isLoading}
              className="w-full py-3 px-6 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white font-semibold rounded-xl transition-all duration-150 disabled:cursor-not-allowed active:scale-95"
            >
              {isLoading ? 'Saving…' : "Let's go →"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
