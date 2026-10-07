import { NextResponse } from "next/server";
import Doctor from "@/models/Doctor";
import { connectToDatabase } from "@/utils/db";

interface DoctorFormData {
  email: string;
  phone: string;
  password: string;
  licenseNumber: string;
  firstName?: string;
  lastName?: string;
  [key: string]: string | undefined;
}

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);

    const email = searchParams.get("email");
    const phone = searchParams.get("phone");

    if (!email && !phone) {
      return NextResponse.json(
        { error: "Email or phone is required" },
        { status: 400 }
      );
    }

    const exists = await Doctor.exists(
      email ? { email } : { phone }
    );

    return NextResponse.json(
      { exists: Boolean(exists) },
      { status: 200 }
    );
  } catch (error) {
    console.error("Registration availability error:", error);

    return NextResponse.json(
      { error: "Unable to check availability" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const formData: DoctorFormData = await request.json();

    // Validate required fields
    const requiredFields = [
      "email",
      "phone",
      "password",
      "licenseNumber",
      "firstName",
      "lastName",
    ];

    for (const field of requiredFields) {
      if (!formData[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Check if email, phone, or license already exists
    const [
      existingEmail,
      existingPhone,
      existingLicense,
    ] = await Promise.all([
      Doctor.findOne({ email: formData.email }),
      Doctor.findOne({ phone: formData.phone }),
      Doctor.findOne({
        licenseNumber: formData.licenseNumber,
      }),
    ]);

    if (existingEmail) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    if (existingPhone) {
      return NextResponse.json(
        { error: "Phone number already exists" },
        { status: 400 }
      );
    }

    if (existingLicense) {
      return NextResponse.json(
        { error: "License number already exists" },
        { status: 400 }
      );
    }

    const newDoctor = new Doctor({
      ...formData,

      fullName:
        formData.firstName && formData.lastName
          ? `Dr.${formData.firstName} ${formData.lastName}`
          : formData.firstName ||
            formData.lastName ||
            "Doctor",
    });

    const savedDoctor = await newDoctor.save();

    return NextResponse.json(
      {
        message: "Doctor registered successfully",
        doctorId: savedDoctor.doctorId,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown error";

    console.error("Registration error:", message);

    return NextResponse.json(
      {
        error: "Server error",
      },
      { status: 500 }
    );
  }
}