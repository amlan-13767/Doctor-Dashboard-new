import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import { Prescription } from '@/models/Prescription';
import { Patient } from '@/models/Patient';
import mongoose from 'mongoose';
import { getAuthenticatedDoctorId } from '@/utils/session';
import { getAuthenticatedPatientId } from '@/utils/session';

interface Params {
  params: Promise<{
    patientId: string;
  }>;
}

// GET /api/prescriptions/:patientId
export async function GET(
  req: Request,
  { params }: Params
): Promise<Response> {
  try {
    const doctorId = await getAuthenticatedDoctorId();
    const patientSessionId = await getAuthenticatedPatientId();
    if (!doctorId && patientSessionId !== (await params).patientId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { patientId } = await params;
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return NextResponse.json({ message: 'Invalid patient ID' }, { status: 400 });
    }

    await connectToDatabase();

    const patient = doctorId
      ? await Patient.findOne({
          _id: patientId,
          $or: [{ doctor: doctorId }, { assignedDoctor: doctorId }],
        }).select('_id')
      : await Patient.findOne({ _id: patientId }).select('_id');
    if (!patient) {
      return NextResponse.json({ message: 'Patient not found' }, { status: 404 });
    }

    const prescriptions = await Prescription.find(doctorId ? { patientId, doctorId } : { patientId })
      .populate('doctorId', 'fullName specializations')
      .sort({ createdAt: -1 });

    if (!prescriptions.length) {
      return NextResponse.json(
        { message: 'No prescriptions found for this patient' },
        { status: 404 }
      );
    }

    return NextResponse.json(prescriptions, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Prescription fetch error:', message);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}
