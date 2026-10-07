import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import { Prescription } from '@/models/Prescription';
import { Patient } from '@/models/Patient';
import mongoose from 'mongoose';
import { getAuthenticatedDoctorId } from '@/utils/session';

interface PrescriptionRequestBody {
  patientId: string;
  doctorId?: string;
  symptoms: string[];
  diagnosis: string;
  medications: {
    name: string;
    dosage: string;
    instructions: string;
  }[];
}

export async function POST(req: Request): Promise<Response> {
  try {
    const doctorId = await getAuthenticatedDoctorId();
    if (!doctorId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const body: PrescriptionRequestBody = await req.json();

    const { patientId, symptoms, diagnosis, medications } = body;

    if (
      !patientId ||
      !symptoms ||
      !Array.isArray(symptoms) ||
      symptoms.some((symptom) => typeof symptom !== 'string' || !symptom.trim()) ||
      !diagnosis ||
      typeof diagnosis !== 'string' ||
      !diagnosis.trim() ||
      !Array.isArray(medications) ||
      medications.length === 0 ||
      medications.some((medication) =>
        !medication ||
        typeof medication.name !== 'string' ||
        !medication.name.trim() ||
        typeof medication.dosage !== 'string' ||
        !medication.dosage.trim() ||
        typeof medication.instructions !== 'string' ||
        !medication.instructions.trim()
      )
    ) {
      return NextResponse.json(
        { message: 'Missing or invalid fields' },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return NextResponse.json({ message: 'Invalid patient ID' }, { status: 400 });
    }

    const patient = await Patient.findOne({
      _id: patientId,
      $or: [{ doctor: doctorId }, { assignedDoctor: doctorId }],
    }).select('_id');
    if (!patient) {
      return NextResponse.json({ message: 'Patient not found' }, { status: 404 });
    }

    const newPrescription = await Prescription.create({
      doctorId,
      patientId,
      symptoms,
      diagnosis,
      medications,
    });

    return NextResponse.json(
      { message: 'Prescription saved successfully', prescription: newPrescription },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Prescription creation error:', message);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}
