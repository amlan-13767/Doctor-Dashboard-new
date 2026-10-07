import { Patient } from '@/models/Patient';
import { connectToDatabase } from '@/utils/db';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { getAuthenticatedDoctorId } from '@/utils/session';

export const GET = async (): Promise<Response> => {
  try {
    const authenticatedDoctorId = await getAuthenticatedDoctorId();
    if (!authenticatedDoctorId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    if (!mongoose.Types.ObjectId.isValid(authenticatedDoctorId)) {
      return NextResponse.json({ error: 'Invalid doctor session' }, { status: 401 });
    }

    const patients = await Patient.find({
      $or: [{ doctor: authenticatedDoctorId }, { assignedDoctor: authenticatedDoctorId }],
    });

    return NextResponse.json(patients, { status: 200 });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error fetching patients:', message);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
};
