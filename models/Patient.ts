import mongoose, { Schema, model, models, Model, Types, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

// --- Interfaces ---
export interface IVitalSigns {
  bloodPressure: string;
  temperature: string;
  pulse: number;
  weight: string;
}

export interface IMedicalHistoryEntry {
  year: number;
  notes: string;
}

export interface IMedication {
  name: string;
  dosage: string;
  instructions: string;
}

export interface IPatient {
  _id: string;
  patientId?: string;
  name: string;
  age: number;
  dateOfBirth?: Date;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email: string;
  address: string;
  bloodGroup: string;
  lastVisit: Date;
  diagnosis: {
    primary: string;
    status: string;
  };
  allergies: string[];
  vitalSigns: IVitalSigns;
  medicalHistory: IMedicalHistoryEntry[];
  medications: IMedication[];
  doctor?: Types.ObjectId;
  assignedDoctor?: Types.ObjectId;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  existingConditions?: string[];
  symptoms?: string;
  password?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// --- Mongoose Schema ---
const vitalSignsSchema = new Schema<IVitalSigns>({
  bloodPressure: { type: String, required: true },
  temperature: { type: String, required: true },
  pulse: { type: Number, required: true },
  weight: { type: String, required: true },
});

const medicalHistoryEntrySchema = new Schema<IMedicalHistoryEntry>({
  year: { type: Number, required: true },
  notes: { type: String, required: true },
});

const medicationSchema = new Schema<IMedication>({
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  instructions: { type: String, required: true },
});

const patientSchema = new Schema<IPatient>(
  {
    patientId: { type: String, unique: true, sparse: true },
    name: { type: String, required: true },
    age: { type: Number, required: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    bloodGroup: { type: String, required: true },
    lastVisit: { type: Date, required: true },
    diagnosis: {
      primary: { type: String, required: true },
      status: { type: String, required: true },
    },
    allergies: { type: [String], default: [] },
    vitalSigns: { type: vitalSignsSchema, required: true },
    medicalHistory: { type: [medicalHistoryEntrySchema], required: true },
    medications: { type: [medicationSchema], required: true },
    doctor: { type: Schema.Types.ObjectId, ref: 'Doctor' },
    assignedDoctor: { type: Schema.Types.ObjectId, ref: 'Doctor', default: null },
    emergencyContact: {
      name: { type: String },
      phone: { type: String },
      relationship: { type: String },
    },
    existingConditions: { type: [String], default: [] },
    symptoms: { type: String, default: '' },
    password: { type: String, select: false },
  },
  { timestamps: true }
);

patientSchema.pre('save', async function () {
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  if (this.isNew && !this.patientId) {
    const lastPatient = await mongoose.model<IPatient>('Patient')
      .findOne({ patientId: /^PAT-/ })
      .sort({ patientId: -1 })
      .select('patientId')
      .lean();
    const nextNumber = lastPatient?.patientId
      ? Number(lastPatient.patientId.replace('PAT-', '')) + 1
      : 1;
    this.patientId = `PAT-${nextNumber.toString().padStart(4, '0')}`;
  }
});

// --- Model ---
export const Patient = models.Patient || model<IPatient>('Patient', patientSchema);
