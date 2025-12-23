export const DOCTOR_REFERRAL_ROLE = {
  name: 'DoctorReferral',
  isSystem: true, // 🔒 optional but recommended
  permissions: [
    { resource: 'Create Lead', actions: ['read'] },
    { resource: 'Qualified lead', actions: ['read'] },
    { resource: 'Search Existing Patient', actions: ['read'] },
    { resource: 'In Patient', actions: ['read'] },
    { resource: 'All Patient', actions: ['read'] },
    { resource: 'Daily progress', actions: ['read'] },
    { resource: 'LOA', actions: ['read'] },
    { resource: 'Doctor Notes', actions: ['read'] },
    { resource: 'Doctor Prescription', actions: ['read'] },
    { resource: 'Therapist Notes', actions: ['read'] },
    { resource: 'Nurse Notes', actions: ['read'] },
    { resource: 'Group Activity', actions: ['read'] },
    { resource: 'Case History', actions: ['read'] },
    { resource: 'Discharge', actions: ['read'] },
    { resource: 'Feedback', actions: ['read'] },
    { resource: 'Doctor Portal', actions: ['read'] },
    { resource: 'Reports', actions: ['read'] },
    { resource: 'Daily Report', actions: ['read'] },
  ],
};
