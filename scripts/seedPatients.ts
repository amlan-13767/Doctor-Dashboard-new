import { config } from 'dotenv';
import mongoose from 'mongoose';
import Doctor from '../models/Doctor';
import { Patient } from '../models/Patient';
import { connectToDatabase } from '../utils/db';

config({ path: '.env.local' });
config();

const demoPatients = [
  {
    name: 'Demo Patient Alpha',
    age: 35,
    gender: 'Female' as const,
    phone: '9000000001',
    email: 'demo.patient.alpha@example.test',
    address: '100 Demo Avenue',
    bloodGroup: 'O+',
    lastVisit: new Date('2026-09-15'),
    diagnosis: {
      primary: 'Seasonal allergic rhinitis',
      status: 'Stable',
    },
    allergies: ['Dust'],
    vitalSigns: {
      bloodPressure: '118/76',
      temperature: '98.4°F',
      pulse: 72,
      weight: '62 kg',
    },
    medicalHistory: [
      { year: 2024, notes: 'Seasonal allergies reported.' },
      { year: 2025, notes: 'Routine wellness examination.' },
    ],
    medications: [
      {
        name: 'Cetirizine',
        dosage: '10mg',
        instructions: 'Once daily as needed',
      },
    ],
  },
  {
    name: 'Demo Patient Beta',
    age: 52,
    gender: 'Male' as const,
    phone: '9000000002',
    email: 'demo.patient.beta@example.test',
    address: '200 Demo Boulevard',
    bloodGroup: 'A+',
    lastVisit: new Date('2026-09-22'),
    diagnosis: {
      primary: 'Essential hypertension',
      status: 'Under observation',
    },
    allergies: ['Penicillin'],
    vitalSigns: {
      bloodPressure: '142/88',
      temperature: '98.7°F',
      pulse: 81,
      weight: '78 kg',
    },
    medicalHistory: [
      { year: 2023, notes: 'Elevated blood pressure identified.' },
      { year: 2025, notes: 'Lifestyle counseling completed.' },
    ],
    medications: [
      {
        name: 'Amlodipine',
        dosage: '5mg',
        instructions: 'Once daily after breakfast',
      },
    ],
  },
];

async function seedPatients() {
  await connectToDatabase();

  const doctor = await Doctor.findOne({ doctorId: 'DOC-0001' }).select('_id');
  if (!doctor) {
    throw new Error('Cannot seed demo patients: doctor DOC-0001 does not exist.');
  }

  let created = 0;
  let skipped = 0;

  for (const patientData of demoPatients) {
    const existingPatient = await Patient.findOne({
      doctor: doctor._id,
      email: patientData.email,
    }).select('_id');

    if (existingPatient) {
      skipped += 1;
      continue;
    }

    await Patient.create({
      ...patientData,
      doctor: doctor._id,
    });
    created += 1;
  }

  console.log(`Demo patient seed complete: ${created} created, ${skipped} already existed.`);
}

seedPatients()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
