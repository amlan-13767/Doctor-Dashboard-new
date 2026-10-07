import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Doctor from '@/models/Doctor';
import { Patient } from '@/models/Patient';
import { SpecialistRequest } from '@/models/SpecialistRequest';
import { connectToDatabase } from '@/utils/db';
import { getAuthenticatedDoctorId } from '@/utils/session';

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  try {
    const doctorId = await getAuthenticatedDoctorId();
    if (!doctorId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ message: 'Invalid request ID' }, { status: 400 });
    const body = await request.json() as { status?: 'ACCEPTED' | 'REJECTED'; doctorResponse?: string };
    if (!body.status || !['ACCEPTED', 'REJECTED'].includes(body.status)) {
      return NextResponse.json({ message: 'Invalid request status.' }, { status: 400 });
    }
    await connectToDatabase();
    const doctor = await Doctor.findById(doctorId).select('specializations');
    const specialistRequest = await SpecialistRequest.findById(id);
    if (!doctor || !specialistRequest) return NextResponse.json({ message: 'Request not found' }, { status: 404 });
    if (!doctor.specializations.includes(specialistRequest.requestedSpecialization)) {
      return NextResponse.json({ message: 'You are not eligible for this request.' }, { status: 403 });
    }
    if (specialistRequest.status !== 'PENDING') {
      return NextResponse.json({ message: 'This request has already been resolved.' }, { status: 409 });
    }
    if (body.status === 'ACCEPTED') {
      const patient = await Patient.findOneAndUpdate(
        { _id: specialistRequest.patient, $or: [{ assignedDoctor: null }, { assignedDoctor: { $exists: false } }] },
        { $set: { assignedDoctor: doctorId } },
        { new: true }
      );
      if (!patient) return NextResponse.json({ message: 'Patient already has an assigned doctor.' }, { status: 409 });
      specialistRequest.assignedDoctor = new mongoose.Types.ObjectId(doctorId);
    }
    specialistRequest.status = body.status;
    specialistRequest.doctorResponse = body.doctorResponse?.trim();
    await specialistRequest.save();
    return NextResponse.json(specialistRequest);
  } catch (error) {
    console.error('Specialist request update error:', error);
    return NextResponse.json({ message: 'Unable to update specialist request.' }, { status: 500 });
  }
}
