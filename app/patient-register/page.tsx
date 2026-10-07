'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PatientRegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '', dateOfBirth: '', gender: 'Other', email: '', phone: '', address: '',
    city: '', state: '', zipCode: '', emergencyName: '', emergencyPhone: '',
    emergencyRelationship: '', bloodGroup: '', allergies: '', existingConditions: '',
    currentMedications: '', medicalHistory: '', symptoms: '', password: '', confirmPassword: '',
  });

  const update = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch('/api/auth/patient-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          emergencyContact: { name: form.emergencyName, phone: form.emergencyPhone, relationship: form.emergencyRelationship },
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to register patient.');
      setSuccess(`Patient account created (${data.patientId}). You can now log in.`);
      setTimeout(() => router.push('/patient-login'), 1200);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to register patient.');
    } finally {
      setSubmitting(false);
    }
  };

  const required = ['name', 'dateOfBirth', 'email', 'phone', 'address', 'city', 'state', 'zipCode', 'bloodGroup', 'symptoms', 'password', 'confirmPassword'];
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-500 to-indigo-500 p-6">
      <div className="mx-auto max-w-4xl rounded-xl bg-gradient-to-br from-white via-blue-100 to-blue-200 p-8 shadow-xl">
        <button className="mb-4 text-blue-700 hover:underline" onClick={() => router.push('/')}>← Back to Home</button>
        <h1 className="mb-2 text-3xl font-bold text-slate-900">Patient Registration</h1>
        <p className="mb-6 text-slate-600">Create your secure patient account.</p>
        {error && <p className="mb-4 rounded border border-red-300 bg-red-100 p-3 text-red-700">{error}</p>}
        {success && <p className="mb-4 rounded border border-green-300 bg-green-100 p-3 text-green-700">{success}</p>}
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          {[
            ['name', 'Full name'], ['dateOfBirth', 'Date of birth'], ['email', 'Email'], ['phone', 'Phone'],
            ['address', 'Address'], ['city', 'City'], ['state', 'State'], ['zipCode', 'ZIP / postal code'],
            ['bloodGroup', 'Blood group'], ['symptoms', 'Symptoms / reason for visit'],
            ['password', 'Password'], ['confirmPassword', 'Confirm password'],
          ].map(([key, label]) => (
            <label key={key} className={key === 'symptoms' ? 'md:col-span-2' : ''}>
              <span className="mb-1 block text-sm text-gray-800">{label}</span>
              <input required={required.includes(key)} type={key === 'dateOfBirth' ? 'date' : key.includes('password') ? 'password' : key === 'email' ? 'email' : 'text'} value={form[key as keyof typeof form]} onChange={(event) => update(key, event.target.value)} className="w-full rounded-lg bg-white p-2 text-gray-800 shadow-sm" />
            </label>
          ))}
          <label><span className="mb-1 block text-sm text-gray-800">Gender</span><select value={form.gender} onChange={(event) => update('gender', event.target.value)} className="w-full rounded-lg bg-white p-2 text-gray-800"><option>Female</option><option>Male</option><option>Other</option></select></label>
          {[
            ['emergencyName', 'Emergency contact name'], ['emergencyPhone', 'Emergency contact phone'], ['emergencyRelationship', 'Emergency contact relationship'],
            ['allergies', 'Allergies (comma separated)'], ['existingConditions', 'Existing medical conditions (comma separated)'],
            ['currentMedications', 'Current medications (comma separated)'], ['medicalHistory', 'Relevant medical history'],
          ].map(([key, label]) => <label key={key} className={key === 'medicalHistory' ? 'md:col-span-2' : ''}><span className="mb-1 block text-sm text-gray-800">{label}</span><input value={form[key as keyof typeof form]} onChange={(event) => update(key, event.target.value)} className="w-full rounded-lg bg-white p-2 text-gray-800 shadow-sm" /></label>)}
          <button disabled={submitting} className="md:col-span-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 py-3 font-semibold text-white disabled:opacity-50">{submitting ? 'Creating account...' : 'Create Patient Account'}</button>
        </form>
        <p className="mt-4 text-center text-blue-700"><button onClick={() => router.push('/patient-login')} className="hover:underline">Already have an account? Log in</button></p>
      </div>
    </main>
  );
}
