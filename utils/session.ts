import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';

export async function getAuthenticatedDoctorId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.role === 'doctor' ? session.user.id : null;
}

export async function getAuthenticatedPatientId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.role === 'patient' ? session.user.id : null;
}
