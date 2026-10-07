'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

const DoctorLoginForm: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: '/dashboard',
      });

      if (result?.ok) {
        router.push('/dashboard');
      } else {
        setError('Invalid credentials');
      }
    } catch (loginError) {
      console.error('Login error:', loginError);
      setError('Unable to sign in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-500">
      {/* Back Button */}
      <div className="absolute top-4 left-4">
        <button
          className="text-white bg-white/30 backdrop-blur-sm bg-opacity-20 rounded-full px-4 py-2 text-sm hover:bg-opacity-30 transition hover:bg-violet-600 hover:scale-105 focus:outline-2 focus:outline-offset-2 focus:outline-violet-500 active:bg-violet-700"
          onClick={() => router.push('/')}
        >
          ← Back to Home
        </button>
      </div>

      {/* Login Form Box */}
      <div className="bg-gradient-to-br from-white via-blue-100 to-blue-200 rounded-xl p-8 shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="text-5xl">🧑‍⚕️</div>
          <h2 className="text-slate-900 text-2xl font-bold mt-4">Doctor Login</h2>
          <p className="text-slate-600 mt-1 text-sm">Access your healthcare dashboard</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 text-red-700 border border-red-300 p-2 rounded text-sm mb-4 text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email Field */}
          <div>
            <label className="text-gray-800 text-sm mb-1 block">Email Address</label>
            <div className="flex items-center bg-white rounded-lg p-2 shadow-sm">
              <span className="mr-2 text-xl">📧</span>
              <input
                type="email"
                placeholder="doctor@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-transparent outline-none w-full text-gray-800 text-base placeholder-gray-400"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="text-gray-800 text-sm mb-1 block">Password</label>
            <div className="flex items-center bg-white rounded-lg p-2 shadow-sm">
              <span className="mr-2 text-xl">🔒</span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-transparent outline-none w-full text-gray-800 text-base placeholder-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="ml-2 focus:outline-none text-xl"
              >
                👁️
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex justify-between items-center text-gray-700 text-sm">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2 scale-125" />
              Remember me
            </label>
            <button type="button" className="text-blue-700 hover:underline">
              Forgot Password?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold hover:from-blue-600 hover:to-blue-800 shadow-md transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Signing in...' : '🚀 Sign In to Dashboard'}
          </button>

          {/* Create Account Link */}
          <div className="text-center mt-4">
            <button
              type="button"
              className="text-blue-700 hover:underline"
              onClick={() => router.push('/register')}
            >
              Click here to Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorLoginForm;
