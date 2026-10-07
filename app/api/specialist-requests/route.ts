import { NextResponse } from 'next/server';
import Doctor from '@/models/Doctor';
import { Patient } from '@/models/Patient';
import { SpecialistRequest } from '@/models/SpecialistRequest';
import { connectToDatabase } from '@/utils/db';
import { getAuthenticatedDoctorId, getAuthenticatedPatientId } from '@/utils/session';

export async function GET() {
  try {
    await connectToDatabase();
    const patientId = await getAuthenticatedPatientId();
    if (patientId) {
      const requests = await SpecialistRequest.find({ patient: patientId })
        .populate('assignedDoctor', 'fullName specializations clinicName phone')
        .sort({ createdAt: -1 });
      return NextResponse.json(requests);
    }

    const doctorId = await getAuthenticatedDoctorId();
    if (!doctorId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const doctor = await Doctor.findById(doctorId).select('specializations');
    if (!doctor) return NextResponse.json({ message: 'Doctor not found' }, { status: 404 });
    const requests = await SpecialistRequest.find({
      status: 'PENDING',
      requestedSpecialization: { $in: doctor.specializations },
    }).populate('patient', 'patientId name email phone symptoms').sort({ createdAt: -1 });
    return NextResponse.json(requests);
  } catch (error) {
    console.error('Specialist request fetch error:', error);
    return NextResponse.json({ message: 'Unable to load specialist requests.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const patientId = await getAuthenticatedPatientId();
    if (!patientId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const body = await request.json() as { requestedSpecialization?: string; reason?: string };
    const requestedSpecialization = body.requestedSpecialization?.trim();
    const reason = body.reason?.trim();
    if (!requestedSpecialization || !reason) {
      return NextResponse.json({ message: 'Specialization and reason are required.' }, { status: 400 });
    }
    await connectToDatabase();
    const patient = await Patient.findById(patientId).select('_id');
    if (!patient) return NextResponse.json({ message: 'Patient not found' }, { status: 404 });
    const requestRecord = await SpecialistRequest.create({ patient: patientId, requestedSpecialization, reason });
    return NextResponse.json(requestRecord, { status: 201 });
  } catch (error) {
    console.error('Specialist request creation error:', error);
    return NextResponse.json({ message: 'Unable to create specialist request.' }, { status: 500 });
  }
}
