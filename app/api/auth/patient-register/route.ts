import { NextResponse } from 'next/server';
import { Patient } from '@/models/Patient';
import { connectToDatabase } from '@/utils/db';
import Doctor from '@/models/Doctor';

interface PatientRequestBody {
  name: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  emergencyContact: { name: string; phone: string; relationship: string };
  bloodGroup: string;
  allergies: string;
  existingConditions: string;
  currentMedications: string;
  medicalHistory: string;
  symptoms: string;
  password: string;
}

export const POST = async (req: Request): Promise<Response> => {
  try {
    await connectToDatabase();
    const body: PatientRequestBody = await req.json();
    const requiredFields: (keyof PatientRequestBody)[] = [
      'name', 'dateOfBirth', 'gender', 'email', 'phone', 'address', 'city',
      'state', 'zipCode', 'bloodGroup', 'symptoms', 'password',
    ];
    if (requiredFields.some((field) => !String(body[field] || '').trim())) {
      return NextResponse.json({ message: 'Please complete all required fields.' }, { status: 400 });
    }
    if (body.password.length < 6) {
      return NextResponse.json({ message: 'Password must be at least 6 characters long.' }, { status: 400 });
    }
    if (body.password !== (body as PatientRequestBody & { confirmPassword?: string }).confirmPassword) {
      return NextResponse.json({ message: 'Passwords do not match.' }, { status: 400 });
    }
    if (Number.isNaN(new Date(body.dateOfBirth).getTime())) {
      return NextResponse.json({ message: 'Enter a valid date of birth.' }, { status: 400 });
    }

    const [existingPatient, existingDoctor] = await Promise.all([
      Patient.findOne({ email: body.email.trim().toLowerCase() }).select('_id'),
      Doctor.findOne({ email: body.email.trim().toLowerCase() }).select('_id'),
    ]);
    if (existingPatient || existingDoctor) {
      return NextResponse.json({ message: 'An account with this email already exists.' }, { status: 400 });
    }
    const dateOfBirth = new Date(body.dateOfBirth);
    const age = Math.max(0, new Date().getFullYear() - dateOfBirth.getFullYear());
    const list = (value: string) => value.split(',').map((item) => item.trim()).filter(Boolean);
    const newPatient = await Patient.create({
      name: body.name.trim(),
      dateOfBirth,
      age,
      gender: body.gender,
      email: body.email.trim().toLowerCase(),
      phone: body.phone.trim(),
      address: `${body.address.trim()}, ${body.city.trim()}, ${body.state.trim()} ${body.zipCode.trim()}`,
      bloodGroup: body.bloodGroup.trim(),
      lastVisit: new Date(),
      diagnosis: { primary: 'Not yet diagnosed', status: 'New patient' },
      allergies: list(body.allergies || ''),
      existingConditions: list(body.existingConditions || ''),
      medications: list(body.currentMedications || '').map((name) => ({ name, dosage: 'Patient reported', instructions: 'Patient reported' })),
      medicalHistory: body.medicalHistory.trim()
        ? [{ year: new Date().getFullYear(), notes: body.medicalHistory.trim() }]
        : [],
      vitalSigns: { bloodPressure: 'Not recorded', temperature: 'Not recorded', pulse: 0, weight: 'Not recorded' },
      emergencyContact: body.emergencyContact,
      symptoms: body.symptoms.trim(),
      password: body.password,
      doctor: undefined,
      assignedDoctor: null,
    });

    return NextResponse.json({ message: 'Patient registered successfully', patientId: newPatient.patientId }, { status: 201 });
  } catch (error) {
    console.error('Error registering patient:', error);
    return NextResponse.json({ message: 'Failed to register patient' }, { status: 500 });
  }
};

export const GET = async (): Promise<Response> => {
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
};
