import { Schema, model, models, Types } from 'mongoose';

export interface IClinicalRecord {
  _id: string;
  patient: Types.ObjectId;
  doctor: Types.ObjectId;
  vitals: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: string;
    spo2?: number;
    respiratoryRate?: number;
    weight?: string;
    height?: string;
    bmi?: number;
  };
  diagnosis?: string;
  notes?: string;
  treatmentPlan?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const clinicalRecordSchema = new Schema<IClinicalRecord>(
  {
    patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    doctor: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
    vitals: {
      bloodPressure: String,
      heartRate: Number,
      temperature: String,
      spo2: Number,
      respiratoryRate: Number,
      weight: String,
      height: String,
      bmi: Number,
    },
    diagnosis: String,
    notes: String,
    treatmentPlan: String,
  },
  { timestamps: true }
);

export const ClinicalRecord =
  models.ClinicalRecord || model<IClinicalRecord>('ClinicalRecord', clinicalRecordSchema);
