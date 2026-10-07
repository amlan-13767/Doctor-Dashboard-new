import { NextResponse } from 'next/server';
import Doctor from '@/models/Doctor';
import { connectToDatabase } from '@/utils/db';
import bcrypt from 'bcryptjs';

interface LoginRequestBody {
  email: string;
  password: string;
}

export async function POST(req: Request): Promise<Response> {
  try {
    await connectToDatabase();

    const { email, password }: LoginRequestBody = await req.json();

    const doctor = await Doctor.findOne({ email });

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 401 });
    }

    const passwordMatches = await bcrypt.compare(password, doctor.password);
    if (!passwordMatches) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const safeDoctor = doctor.toObject();
    delete safeDoctor.password;

    return NextResponse.json(
      { message: "Login successful", doctor: safeDoctor },
      { status: 200 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Login error:", message);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
