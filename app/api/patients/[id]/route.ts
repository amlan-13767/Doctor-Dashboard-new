import { Patient } from '@/models/Patient';
import { connectToDatabase } from '@/utils/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const patientId = context.params.id;
    const patient = await Patient.findById(patientId);

    if (!patient) {
      return NextResponse.json({ message: 'Patient not found' }, { status: 404 });
    }

    return NextResponse.json(patient, { status: 200 });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Fetch patient error:', message);

    return NextResponse.json(
      { message: 'Failed to fetch patient', details: message },
      { status: 500 }
    );
  }
}
