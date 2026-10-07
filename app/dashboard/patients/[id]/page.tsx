'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface Patient {
  _id: string;
  patientId?: string;
  name: string;
  age: number;
  dateOfBirth?: string;
  gender: string;
  email?: string;
  phone?: string;
  diagnosis: string | { primary: string; status: string };
  vitalSigns: Record<string, string | number>;
  medicalHistory: string[];
  medications: { name: string; dosage: string; instructions: string }[];
  allergies: string[];
  address?: string;
  bloodGroup?: string;
  emergencyContact?: { name: string; phone: string; relationship: string };
  existingConditions?: string[];
  symptoms?: string;
}

interface AISuggestion {
  symptoms: string;
  diagnosis: string;
  medications: { name: string; dosage: string; instructions: string }[];
}

interface Prescription {
  _id: string;
  doctorId: {
    fullName: string;
    specializations: string[];
  };
  createdAt: string;
  symptoms: string[];
  diagnosis: string;
  medications: {
    name: string;
    dosage: string;
    instructions: string;
  }[];
}

interface ClinicalRecord {
  _id: string;
  vitals: Record<string, string | number>;
  diagnosis?: string;
  notes?: string;
  treatmentPlan?: string;
  createdAt: string;
  doctor?: { fullName: string };
}

export default function PatientDetailsPage() {
  const params = useParams();
  const { data: session } = useSession();
  const router = useRouter();
  const id = typeof params.id === 'string' ? params.id : params.id?.[0] || '';

  const [patient, setPatient] = useState<Patient | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previousPrescriptions, setPreviousPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [formError, setFormError] = useState('');
  const [medicationsText, setMedicationsText] = useState('');
  const [clinicalRecords, setClinicalRecords] = useState<ClinicalRecord[]>([]);
  const [clinicalSaving, setClinicalSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setLoadError('');
      try {
        const patientRes = await fetch(`/api/patients/${id}`);
        const patientData = await patientRes.json();
        if (!patientRes.ok) {
          if (patientRes.status === 404) {
            setLoadError(patientData.message || 'Patient not found');
            return;
          }
          throw new Error(patientData.message || 'Unable to load patient.');
        }
        setPatient(patientData);

        const prescriptionsRes = await fetch(`/api/prescriptions/${id}`);
        const prescriptionsData = await prescriptionsRes.json();
        if (prescriptionsRes.ok && Array.isArray(prescriptionsData)) {
          setPreviousPrescriptions(prescriptionsData);
        } else if (prescriptionsRes.status !== 404) {
          throw new Error(prescriptionsData.message || 'Unable to load prescriptions.');
        }
        const clinicalRes = await fetch(`/api/clinical-records?patientId=${id}`);
        if (clinicalRes.ok) setClinicalRecords(await clinicalRes.json());
      } catch (error) {
        console.error('Patient details fetch error:', error);
        setLoadError(error instanceof Error ? error.message : 'Unable to load patient details.');
      } finally {
        setLoading(false);
      }
    };
    if (id && session) fetchData();
  }, [id, session]);

  const saveClinicalRecord = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setClinicalSaving(true);
    const form = new FormData(event.currentTarget);
    const toNumber = (name: string) => {
      const value = String(form.get(name) || '').trim();
      return value ? Number(value) : undefined;
    };
    try {
      const response = await fetch('/api/clinical-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: id,
          vitals: {
            bloodPressure: String(form.get('bloodPressure') || '').trim() || undefined,
            heartRate: toNumber('heartRate'),
            temperature: String(form.get('temperature') || '').trim() || undefined,
            spo2: toNumber('spo2'),
            respiratoryRate: toNumber('respiratoryRate'),
            weight: String(form.get('weight') || '').trim() || undefined,
            height: String(form.get('height') || '').trim() || undefined,
            bmi: toNumber('bmi'),
          },
          diagnosis: form.get('diagnosis'),
          notes: form.get('notes'),
          treatmentPlan: form.get('treatmentPlan'),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to save clinical record.');
      setClinicalRecords((current) => [data, ...current]);
      event.currentTarget.reset();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to save clinical record.');
    } finally {
      setClinicalSaving(false);
    }
  };

  const handleGenerateSuggestion = async () => {
    if (!patient) return;
    setLoadingSuggestion(true);

    try {
      const res = await fetch('/api/ai-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientData: patient })
      });

      const data = await res.json();
      if (data.suggestion) {
        const suggestion = typeof data.suggestion === 'string'
          ? JSON.parse(data.suggestion)
          : data.suggestion;
        if (
          typeof suggestion.symptoms !== 'string' ||
          typeof suggestion.diagnosis !== 'string' ||
          !Array.isArray(suggestion.medications)
        ) {
          throw new Error('Invalid suggestion response');
        }
        setAiSuggestion(suggestion);
        setMedicationsText(JSON.stringify(suggestion.medications, null, 2));
      } else {
        throw new Error('No suggestion received');
      }
    } catch (err) {
      console.error("❌ AI Suggestion Error:", err);
      setFormError('Unable to generate a valid suggestion.');
    } finally {
      setLoadingSuggestion(false);
    }
  };

  const handleSubmitPrescription = async () => {
    setFormError('');
    if (!patient || !aiSuggestion || !session?.user?.id) return;
    if (!aiSuggestion.symptoms.trim() || !aiSuggestion.diagnosis.trim() || !aiSuggestion.medications.length) {
      setFormError('Complete the prescription before saving.');
      return;
    }

    let medications: AISuggestion['medications'];
    try {
      const parsedMedications = JSON.parse(medicationsText);
      if (
        !Array.isArray(parsedMedications) ||
        parsedMedications.some(
          (medication) =>
            !medication ||
            typeof medication.name !== 'string' ||
            typeof medication.dosage !== 'string' ||
            typeof medication.instructions !== 'string'
        )
      ) {
        throw new Error('Invalid medications');
      }
      medications = parsedMedications;
    } catch {
      setFormError('Medications must be valid JSON.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: patient._id,
          doctorId: session.user.id,
          symptoms: aiSuggestion.symptoms.split(',').map((s) => s.trim()),
          diagnosis: aiSuggestion.diagnosis,
          medications
        })
      });

      const data = await res.json();
      if (res.ok) {
        alert('✅ Prescription saved!');
        router.push('/dashboard');
      } else {
        setFormError(data.message || 'Unable to save prescription.');
      }
    } catch (error) {
      console.error('Prescription submission error:', error);
      setFormError('Unable to save prescription.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="p-5">Loading patient details...</p>;
  if (loadError) return <p className="p-5 text-red-600">{loadError}</p>;
  if (!patient) return <p className="p-5">Patient not found.</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{patient.name}</h1>
      <section className="mb-6 rounded bg-white p-4 shadow">
        <h2 className="mb-3 text-xl font-semibold">Patient-provided information</h2>
        <div className="grid gap-2 md:grid-cols-2">
          <p><strong>Patient ID:</strong> {patient.patientId || patient._id}</p>
          <p><strong>Date of birth:</strong> {patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'Not provided'}</p>
          <p><strong>Gender:</strong> {patient.gender}</p>
          <p><strong>Email:</strong> {patient.email || 'Not provided'}</p>
          <p><strong>Phone:</strong> {patient.phone || 'Not provided'}</p>
          <p><strong>Address:</strong> {patient.address || 'Not provided'}</p>
          <p><strong>Blood group:</strong> {patient.bloodGroup || 'Not provided'}</p>
          <p><strong>Allergies:</strong> {patient.allergies.join(', ') || 'None reported'}</p>
          <p><strong>Existing conditions:</strong> {patient.existingConditions?.join(', ') || 'None reported'}</p>
          <p className="md:col-span-2"><strong>Reported symptoms / reason for visit:</strong> {patient.symptoms || 'Not provided'}</p>
          <p className="md:col-span-2"><strong>Emergency contact:</strong> {patient.emergencyContact ? `${patient.emergencyContact.name} (${patient.emergencyContact.relationship}), ${patient.emergencyContact.phone}` : 'Not provided'}</p>
        </div>
      </section>
      <section className="mb-6 rounded bg-slate-50 p-4">
        <h2 className="mb-2 text-xl font-semibold">Doctor / clinical information</h2>
        <p><strong>Diagnosis:</strong> {typeof patient.diagnosis === 'string' ? patient.diagnosis : `${patient.diagnosis.primary || 'Not recorded'} (${patient.diagnosis.status || 'unknown'})`}</p>
        <p><strong>Current medications:</strong> {patient.medications.map((medication) => medication.name).join(', ') || 'None reported'}</p>
      </section>
      <section className="mb-6 rounded bg-white p-4 shadow">
        <h2 className="mb-3 text-xl font-semibold">Doctor assessment and vitals</h2>
        <form onSubmit={saveClinicalRecord} className="grid gap-2 md:grid-cols-2">
          {['bloodPressure', 'heartRate', 'temperature', 'spo2', 'respiratoryRate', 'weight', 'height', 'bmi'].map((field) => <input key={field} name={field} placeholder={field} className="rounded border p-2" />)}
          <input name="diagnosis" placeholder="Diagnosis" className="rounded border p-2 md:col-span-2" />
          <textarea name="notes" placeholder="Clinical notes" className="rounded border p-2 md:col-span-2" />
          <textarea name="treatmentPlan" placeholder="Treatment plan / follow-up notes" className="rounded border p-2 md:col-span-2" />
          <button disabled={clinicalSaving} className="rounded bg-blue-600 px-4 py-2 text-white md:col-span-2">{clinicalSaving ? 'Saving...' : 'Save clinical record'}</button>
        </form>
        <h3 className="mt-5 mb-2 font-semibold">Vitals and diagnosis history</h3>
        {clinicalRecords.length === 0 ? <p className="text-slate-500">No clinical records yet.</p> : clinicalRecords.map((record) => <article key={record._id} className="mb-2 rounded border p-3"><p><b>{new Date(record.createdAt).toLocaleString()}</b> · {record.doctor?.fullName || 'Doctor'}</p><p>BP: {record.vitals.bloodPressure || '—'} · HR: {record.vitals.heartRate || '—'} · Temp: {record.vitals.temperature || '—'} · SpO2: {record.vitals.spo2 || '—'}</p><p>Diagnosis: {record.diagnosis || '—'}</p><p>Notes: {record.notes || '—'}</p><p>Treatment plan: {record.treatmentPlan || '—'}</p></article>)}
      </section>

      <button
        onClick={handleGenerateSuggestion}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loadingSuggestion ? 'Generating...' : '💡 Generate AI Suggestion'}
      </button>

      {aiSuggestion && (
        <div className="mt-6 p-4 bg-slate-100 rounded">
          <h2 className="text-xl font-semibold mb-3">AI Suggested Prescription</h2>

          <textarea
            value={aiSuggestion.symptoms}
            onChange={(e) => setAiSuggestion({ ...aiSuggestion, symptoms: e.target.value })}
            className="w-full p-2 border rounded mb-2"
            rows={2}
            placeholder="Symptoms"
          />
          <textarea
            value={aiSuggestion.diagnosis}
            onChange={(e) => setAiSuggestion({ ...aiSuggestion, diagnosis: e.target.value })}
            className="w-full p-2 border rounded mb-2"
            rows={2}
            placeholder="Diagnosis"
          />
          <textarea
            value={medicationsText}
            onChange={(e) => {
              setMedicationsText(e.target.value);
              try {
                const medications = JSON.parse(e.target.value);
                if (Array.isArray(medications)) {
                  setAiSuggestion({ ...aiSuggestion, medications });
                  setFormError('');
                }
              } catch {
                setFormError('Medications must be valid JSON.');
              }
            }}
            className="w-full p-2 border rounded mb-2"
            rows={5}
            placeholder="Medications (JSON)"
          />

          <button
            onClick={handleSubmitPrescription}
            disabled={submitting}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-green-400"
          >
            {submitting ? 'Saving...' : '💾 Save Prescription'}
          </button>
          {formError && <p className="mt-2 text-sm text-red-600">{formError}</p>}
        </div>
      )}

      {previousPrescriptions.length > 0 && (
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4">📜 Previous Prescriptions</h2>
          {previousPrescriptions.map((prescription) => (
            <div
              key={prescription._id}
              className="mb-5 p-3 bg-slate-50 rounded border border-slate-200"
            >
              <p className="text-sm text-slate-600 mb-1">
                <strong>By:</strong> {prescription.doctorId.fullName} ({prescription.doctorId.specializations?.join(', ')})
              </p>
              <p className="text-sm text-slate-600 mb-2">
                <strong>Date:</strong> {new Date(prescription.createdAt).toLocaleString()}
              </p>
              <div className="mb-2">
                <strong>Symptoms:</strong> {prescription.symptoms.join(', ')}
              </div>
              <div className="mb-2">
                <strong>Diagnosis:</strong> {prescription.diagnosis}
              </div>
              <div className="mb-2">
                <strong>Medications:</strong>
                <ul className="list-disc ml-6">
                  {prescription.medications.map((med, index) => (
                    <li key={index}>
                      {med.name} - {med.dosage} ({med.instructions})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
