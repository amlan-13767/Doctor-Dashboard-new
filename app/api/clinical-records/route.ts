import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { ClinicalRecord } from '@/models/ClinicalRecord';
import { Patient } from '@/models/Patient';
import { connectToDatabase } from '@/utils/db';
import { getAuthenticatedDoctorId } from '@/utils/session';

export async function GET(request: Request) {
  const doctorId = await getAuthenticatedDoctorId();
  if (!doctorId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const patientId = new URL(request.url).searchParams.get('patientId');
  if (!patientId || !mongoose.Types.ObjectId.isValid(patientId)) return NextResponse.json({ message: 'Invalid patient ID' }, { status: 400 });
  await connectToDatabase();
  const patient = await Patient.findOne({ _id: patientId, $or: [{ doctor: doctorId }, { assignedDoctor: doctorId }] }).select('_id');
  if (!patient) return NextResponse.json({ message: 'Patient not found' }, { status: 404 });
  const records = await ClinicalRecord.find({ patient: patientId }).populate('doctor', 'fullName specializations').sort({ createdAt: -1 });
  return NextResponse.json(records);
}

export async function POST(request: Request) {
  try {
    const doctorId = await getAuthenticatedDoctorId();
    if (!doctorId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const body = await request.json() as { patientId?: string; vitals?: Record<string, unknown>; diagnosis?: string; notes?: string; treatmentPlan?: string };
    if (!body.patientId || !mongoose.Types.ObjectId.isValid(body.patientId)) return NextResponse.json({ message: 'Invalid patient ID' }, { status: 400 });
    await connectToDatabase();
    const patient = await Patient.findOne({ _id: body.patientId, $or: [{ doctor: doctorId }, { assignedDoctor: doctorId }] }).select('_id');
    if (!patient) return NextResponse.json({ message: 'Patient not found' }, { status: 404 });
    const record = await ClinicalRecord.create({ patient: body.patientId, doctor: doctorId, vitals: body.vitals || {}, diagnosis: body.diagnosis?.trim(), notes: body.notes?.trim(), treatmentPlan: body.treatmentPlan?.trim() });
    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error('Clinical record creation error:', error);
    return NextResponse.json({ message: 'Unable to save clinical record.' }, { status: 500 });
  }
}
