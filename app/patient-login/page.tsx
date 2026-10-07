'use client';

import { FormEvent, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function PatientLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    const result = await signIn('credentials', { email, password, redirect: false, callbackUrl: '/patient-dashboard' });
    if (result?.ok) router.push('/patient-dashboard');
    else setError('Invalid credentials');
    setSubmitting(false);
  };
  return <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-500 p-6"><form onSubmit={submit} className="w-full max-w-md rounded-xl bg-gradient-to-br from-white via-blue-100 to-blue-200 p-8 shadow-xl"><button type="button" className="mb-6 text-blue-700 hover:underline" onClick={() => router.push('/')}>← Back to Home</button><h1 className="mb-2 text-2xl font-bold text-slate-900">Patient Login</h1><p className="mb-6 text-slate-600">Access your patient dashboard.</p>{error && <p className="mb-4 rounded bg-red-100 p-2 text-center text-red-700">{error}</p>}<input required type="email" placeholder="Email Address" value={email} onChange={(event) => setEmail(event.target.value)} className="mb-4 w-full rounded-lg bg-white p-3 text-gray-800" /><input required type="password" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} className="mb-4 w-full rounded-lg bg-white p-3 text-gray-800" /><button disabled={submitting} className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 py-3 font-semibold text-white">{submitting ? 'Signing in...' : 'Sign In'}</button><button type="button" onClick={() => router.push('/patient-register')} className="mt-4 w-full text-blue-700 hover:underline">Create Patient Account</button></form></main>;
}
