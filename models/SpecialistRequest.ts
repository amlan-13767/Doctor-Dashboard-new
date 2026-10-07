import { Schema, model, models, Types } from 'mongoose';

export type SpecialistRequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';

export interface ISpecialistRequest {
  _id: string;
  patient: Types.ObjectId;
  requestedSpecialization: string;
  reason: string;
  status: SpecialistRequestStatus;
  assignedDoctor?: Types.ObjectId | null;
  doctorResponse?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const specialistRequestSchema = new Schema<ISpecialistRequest>(
  {
    patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    requestedSpecialization: { type: String, required: true, trim: true },
    reason: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'],
      default: 'PENDING',
      index: true,
    },
    assignedDoctor: { type: Schema.Types.ObjectId, ref: 'Doctor', default: null },
    doctorResponse: { type: String, trim: true },
  },
  { timestamps: true }
);

export const SpecialistRequest =
  models.SpecialistRequest || model<ISpecialistRequest>('SpecialistRequest', specialistRequestSchema);
