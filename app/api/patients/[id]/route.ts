import { Patient } from '@/models/Patient';
import { connectToDatabase } from '@/utils/db';
import { NextRequest, NextResponse } from 'next/server';
import { NextApiRequest } from 'next';
import type { NextRequest as MiddlewareRequest } from 'next/server';

type Params = {
  params: {
    id: string;
  };
};

export async function GET(request: NextRequest, { params }: Params) {
  try {
    await connectToDatabase();

    const patientId = params.id;
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
