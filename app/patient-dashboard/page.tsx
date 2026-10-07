'use client';

import { useEffect, useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type Patient = {
  patientId?: string; name: string; dateOfBirth?: string; gender: string; email: string; phone: string;
  address: string; bloodGroup: string; allergies: string[]; existingConditions?: string[];
  medications: { name: string; dosage: string; instructions: string }[]; medicalHistory: { year: number; notes: string }[];
  emergencyContact?: { name: string; phone: string; relationship: string }; symptoms?: string;
  assignedDoctor?: { fullName: string; specializations: string[]; clinicName?: string; phone?: string } | null;
};
type Prescription = { _id: string; diagnosis: string; symptoms: string[]; medications: { name: string; dosage: string; instructions: string }[]; createdAt: string; doctorId?: { fullName: string } };
type SpecialistRequest = { _id: string; requestedSpecialization: string; reason: string; status: string; createdAt: string; assignedDoctor?: { fullName: string } | null };

export default function PatientDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [specialistRequests, setSpecialistRequests] = useState<SpecialistRequest[]>([]);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [specialization, setSpecialization] = useState('Neurology');
  const [requestReason, setRequestReason] = useState('');

  const load = async () => {
    const response = await fetch('/api/patients/me');
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Unable to load patient dashboard.');
    setPatient(data.patient);
    setPrescriptions(data.prescriptions || []);
    setSpecialistRequests(data.specialistRequests || []);
  };
  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/patient-login');
    if (status === 'authenticated' && session.user.role !== 'patient') router.replace('/dashboard');
    if (status === 'authenticated' && session.user.role === 'patient') load().catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'Unable to load dashboard.'));
  }, [router, session, status]);

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!patient) return;
    setSaving(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch('/api/patients/me', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.get('name'), phone: form.get('phone'), address: form.get('address'),
        bloodGroup: form.get('bloodGroup'), allergies: form.get('allergies'),
        existingConditions: form.get('existingConditions'), symptoms: form.get('symptoms'),
      }),
    });
    const data = await response.json();
    if (response.ok) { setPatient(data); setEditing(false); } else setError(data.message || 'Unable to update profile.');
    setSaving(false);
  };

  const submitSpecialistRequest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRequesting(true);
    setError('');
    try {
      const response = await fetch('/api/specialist-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestedSpecialization: specialization, reason: requestReason }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to submit request.');
      setSpecialistRequests((current) => [data, ...current]);
      setRequestReason('');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to submit request.');
    } finally {
      setRequesting(false);
    }
  };

  if (status === 'loading' || !patient) return <main className="p-6">{error || 'Loading patient dashboard...'}</main>;
  return (
    <main className="min-h-screen bg-slate-50 p-5">
      <header className="mb-6 flex items-center justify-between rounded-2xl bg-white p-5 shadow">
        <div><h1 className="text-2xl font-bold text-blue-900">Patient Dashboard</h1><p className="text-slate-500">{patient.patientId || 'Patient profile'}</p></div>
        <button onClick={() => signOut({ callbackUrl: '/patient-login' })} className="rounded bg-blue-600 px-4 py-2 text-white">Logout</button>
      </header>
      {error && <p className="mb-4 rounded bg-red-100 p-3 text-red-700">{error}</p>}
      {editing ? <form onSubmit={save} className="mb-6 grid gap-4 rounded-2xl bg-white p-6 shadow md:grid-cols-2">
        {[
          ['name', 'Full name', patient.name], ['phone', 'Phone', patient.phone], ['address', 'Address', patient.address],
          ['bloodGroup', 'Blood group', patient.bloodGroup], ['allergies', 'Allergies', patient.allergies.join(', ')],
          ['existingConditions', 'Existing conditions', (patient.existingConditions || []).join(', ')], ['symptoms', 'Symptoms / reason for visit', patient.symptoms || ''],
        ].map(([name, label, value]) => <label key={name} className={name === 'symptoms' ? 'md:col-span-2' : ''}><span className="mb-1 block text-sm">{label}</span><input name={name} defaultValue={value} className="w-full rounded border p-2" /></label>)}
        <button disabled={saving} className="rounded bg-blue-600 px-4 py-2 text-white">{saving ? 'Saving...' : 'Save changes'}</button><button type="button" onClick={() => setEditing(false)} className="rounded border px-4 py-2">Cancel</button>
      </form> : <section className="mb-6 rounded-2xl bg-white p-6 shadow"><div className="mb-4 flex justify-between"><h2 className="text-xl font-semibold">Patient-provided information</h2><button onClick={() => setEditing(true)} className="text-blue-700 hover:underline">Edit profile</button></div><div className="grid gap-3 md:grid-cols-2"><p><b>Name:</b> {patient.name}</p><p><b>Date of birth:</b> {patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'Not provided'}</p><p><b>Gender:</b> {patient.gender}</p><p><b>Email:</b> {patient.email}</p><p><b>Phone:</b> {patient.phone}</p><p><b>Address:</b> {patient.address}</p><p><b>Blood group:</b> {patient.bloodGroup}</p><p><b>Allergies:</b> {patient.allergies.join(', ') || 'None reported'}</p><p><b>Conditions:</b> {(patient.existingConditions || []).join(', ') || 'None reported'}</p><p className="md:col-span-2"><b>Symptoms / reason for visit:</b> {patient.symptoms || 'Not provided'}</p><p className="md:col-span-2"><b>Emergency contact:</b> {patient.emergencyContact ? `${patient.emergencyContact.name} (${patient.emergencyContact.relationship}), ${patient.emergencyContact.phone}` : 'Not provided'}</p></div></section>}
      <section className="mb-6 rounded-2xl bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold">My doctor</h2>
        {patient.assignedDoctor ? <p>Dr. {patient.assignedDoctor.fullName} · {patient.assignedDoctor.specializations.join(', ')}</p> : <p className="text-slate-500">No doctor assigned yet.</p>}
      </section>
      <section className="mb-6 rounded-2xl bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold">Request a specialist</h2>
        <form onSubmit={submitSpecialistRequest} className="grid gap-3 md:grid-cols-2">
          <select value={specialization} onChange={(event) => setSpecialization(event.target.value)} className="rounded border p-2">
            {['Cardiology', 'Dermatology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Psychiatry', 'General Surgery', 'Internal Medicine'].map((option) => <option key={option}>{option}</option>)}
          </select>
          <input required value={requestReason} onChange={(event) => setRequestReason(event.target.value)} placeholder="Reason for consultation" className="rounded border p-2" />
          <button disabled={requesting} className="rounded bg-blue-600 px-4 py-2 text-white md:col-span-2">{requesting ? 'Submitting...' : 'Submit specialist request'}</button>
        </form>
        <h3 className="mt-6 mb-2 font-semibold">My specialist requests</h3>
        {specialistRequests.length === 0 ? <p className="text-slate-500">No specialist requests yet.</p> : specialistRequests.map((request) => <article key={request._id} className="mb-2 rounded border p-3"><p><b>{request.requestedSpecialization}</b> · {request.status}</p><p>{request.reason}</p>{request.assignedDoctor && <p>Doctor: {request.assignedDoctor.fullName}</p>}</article>)}
      </section>
      <section className="rounded-2xl bg-white p-6 shadow"><h2 className="mb-4 text-xl font-semibold">Prescription history</h2>{prescriptions.length === 0 ? <p className="text-slate-500">No prescriptions yet.</p> : prescriptions.map((prescription) => <article key={prescription._id} className="mb-4 rounded border p-4"><p><b>Date:</b> {new Date(prescription.createdAt).toLocaleString()} · <b>Doctor:</b> {prescription.doctorId?.fullName || 'Doctor'}</p><p><b>Symptoms:</b> {prescription.symptoms.join(', ')}</p><p><b>Diagnosis:</b> {prescription.diagnosis}</p><ul className="list-disc pl-5">{prescription.medications.map((medication) => <li key={`${prescription._id}-${medication.name}`}>{medication.name} — {medication.dosage} — {medication.instructions}</li>)}</ul></article>)}</section>
    </main>
  );
}
