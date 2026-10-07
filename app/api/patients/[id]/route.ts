import { Patient } from '@/models/Patient';
import { connectToDatabase } from '@/utils/db';
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { getAuthenticatedDoctorId } from '@/utils/session';

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const doctorId = await getAuthenticatedDoctorId();
    if (!doctorId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id: patientId } = await params;
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return NextResponse.json({ message: 'Invalid patient ID' }, { status: 400 });
    }

    await connectToDatabase();

    const patient = await Patient.findOne({
      _id: patientId,
      $or: [{ doctor: doctorId }, { assignedDoctor: doctorId }],
    });

    if (!patient) {
      return NextResponse.json({ message: 'Patient not found' }, { status: 404 });
    }

    return NextResponse.json(patient, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Fetch patient error:', message);
    return NextResponse.json({ message: 'Failed to fetch patient' }, { status: 500 });
  }
}
