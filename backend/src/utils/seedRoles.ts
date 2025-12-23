import Role from '../models/role.model';
import { DOCTOR_REFERRAL_ROLE } from '../constant/roles/role';

export const seedRoles = async () => {
  const existingRole = await Role.findOne({
    name: DOCTOR_REFERRAL_ROLE.name,
    isDeleted: false,
  });

  if (!existingRole) {
    await Role.create(DOCTOR_REFERRAL_ROLE);
    console.log('✅ DoctorReferral role created automatically');
  } else {
    console.log('ℹ️ DoctorReferral role already exists');
  }
};
