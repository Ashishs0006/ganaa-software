import {
  ISessionType,
  ISubSessionType,
} from '../../interfaces/model/daily-progress/i.therapist.note';

export interface ISessionInfo {
  name: ISessionType;
  subMenu: ISubSessionType[];
}

export default [
  {
    name: 'R - Regular 15 min',
    subMenu: [],
  },
  {
    name: 'T - 45-60 min Therapy',
    subMenu: [],
  },
  {
    name: 'NF - Neurofeedback',
    subMenu: [],
  },
  {
    name: 'HT - History',
    subMenu: [],
  },
  {
    name: 'A - Assessment',
    subMenu: ['HAM A', 'HAM D', 'BDI', 'BAI', 'YMRS', 'BPRS', 'PANSS', 'MMSE', 'MOCA', 'Others'],
  },
  {
    name: 'P - PostCare',
    subMenu: [],
  },
  {
    name: 'D - DayCare',
    subMenu: [],
  },
  {
    name: 'FC - Family Counseling',
    subMenu: [],
  },
  {
    name: 'FUI - Family Update in-person',
    subMenu: [],
  },
  {
    name: 'FUP - Family Update on phone',
    subMenu: [],
  },
  {
    name: 'GFC - Group Family Counselling',
    subMenu: [],
  },
  {
    name: 'RDU - Referring Doctor Update',
    subMenu: [],
  },
  {
    name: 'AA - Alcoholics/Anonymous 1:1',
    subMenu: [],
  },
] as ISessionInfo[];
