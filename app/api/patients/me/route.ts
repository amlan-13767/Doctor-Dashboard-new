import { NextResponse } from 'next/server';
import { Patient } from '@/models/Patient';
import { Prescription } from '@/models/Prescription';
import { connectToDatabase } from '@/utils/db';
import { getAuthenticatedPatientId } from '@/utils/session';
import { SpecialistRequest } from '@/models/SpecialistRequest';

export async function GET() {
  const patientId = await getAuthenticatedPatientId();
  if (!patientId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const patient = await Patient.findById(patientId).select('-password').populate('assignedDoctor', 'fullName specializations clinicName phone').lean();
    if (!patient) {
      return NextResponse.json({ message: 'Patient not found' }, { status: 404 });
    }
    const prescriptions = await Prescription.find({ patientId })
      .populate('doctorId', 'fullName specializations')
      .sort({ createdAt: -1 })
      .lean();
    const specialistRequests = await SpecialistRequest.find({ patient: patientId })
      .populate('assignedDoctor', 'fullName specializations clinicName phone')
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({ patient, prescriptions, specialistRequests });
  } catch (error) {
    console.error('Patient dashboard fetch error:', error);
    return NextResponse.json({ message: 'Unable to load patient dashboard' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const patientId = await getAuthenticatedPatientId();
  if (!patientId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const allowed = ['name', 'phone', 'address', 'bloodGroup', 'allergies', 'existingConditions', 'symptoms'];
    const updates = Object.fromEntries(Object.entries(body).filter(([key]) => allowed.includes(key)));
    if (typeof updates.name !== 'string' || !updates.name.trim() ||
        typeof updates.phone !== 'string' || !updates.phone.trim() ||
        typeof updates.address !== 'string' || !updates.address.trim() ||
        typeof updates.symptoms !== 'string') {
      return NextResponse.json({ message: 'Missing or invalid profile fields' }, { status: 400 });
    }
    const patient = await Patient.findOneAndUpdate(
      { _id: patientId },
      {
        ...updates,
        allergies: Array.isArray(updates.allergies) ? updates.allergies : String(updates.allergies || '').split(',').map((item) => item.trim()).filter(Boolean),
        existingConditions: Array.isArray(updates.existingConditions) ? updates.existingConditions : String(updates.existingConditions || '').split(',').map((item) => item.trim()).filter(Boolean),
      },
      { new: true, runValidators: true }
    ).select('-password').lean();
    return NextResponse.json(patient);
  } catch (error) {
    console.error('Patient profile update error:', error);
    return NextResponse.json({ message: 'Unable to update patient profile' }, { status: 500 });
  }
}
