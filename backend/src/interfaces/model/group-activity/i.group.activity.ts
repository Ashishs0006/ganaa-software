import mongoose, { ObjectId } from 'mongoose';
import { IPatient } from '../patient/i.patient';
import { IUser } from '../../../models/user.model';

export type IActivityName =
  | 'Yoga'
  | 'JFT'
  | 'AA Group Session'
  | 'Art Therapy'
  | 'Dance/Movement Therapy'
  | 'Music Therapy'
  | 'Story Telling'
  | 'Group Therapy'
  | 'Sound Healing'
  | 'Movie'
  | 'Fun Activity 1'
  | 'Fun Activity 2'
  | 'Drama Therapy'
  | 'Workout with Gym Trainer'
  | 'Hypnotherapy'
  | 'Massage/Acupuncture'
  | 'Newspaper Reading'
  | 'JPMR';

export interface IGroupActivity extends mongoose.Document {
  patientId: ObjectId | IPatient;
  activityDateTime: Date;
  activity: [
    {
      name: IActivityName;
      isSelected: boolean;
      note?: string;
      createdAt: Date;
    },
  ];
  createdBy?: ObjectId | IUser;
  createdAt: Date;
}
