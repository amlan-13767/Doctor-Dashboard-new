import { NextResponse } from 'next/server';
import Doctor from '@/models/Doctor';
import { connectToDatabase } from '@/utils/db';
import { getAuthenticatedDoctorId } from '@/utils/session';

export async function GET() {
  const doctorId = await getAuthenticatedDoctorId();
  if (!doctorId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const doctor = await Doctor.findById(doctorId).select('-password').lean();
    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    return NextResponse.json(doctor, { status: 200 });
  } catch (error) {
    console.error('Doctor profile fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch doctor profile' }, { status: 500 });
  }
}
