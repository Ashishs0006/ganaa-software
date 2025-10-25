import express from 'express';
import * as AuthController from '../controllers/auth.controller';
import * as AllergyController from '../controllers/dropdown/allergy.controller';
import * as MedicineController from '../controllers/dropdown/medicine.controller';
import * as RelationshipController from '../controllers/dropdown/relationship.controller';
import * as ReferredTypeController from '../controllers/dropdown/referred.type.controller';

const router = express.Router();

// Protected Routes
router.use(AuthController.protect);

/*
 * Relationship Routes
 */
router
  .route('/relationship')
  .get(RelationshipController.getAllRelationship)
  .post(RelationshipController.createNewRelationship);

router
  .route('/relationship/:id')
  .get(RelationshipController.getSingleRelationship)
  .patch(RelationshipController.updateSingleRelationship)
  .delete(RelationshipController.deleteSingleRelationship);

/*
 * Referred Type Routes
 */
router
  .route('/referred-type')
  .get(ReferredTypeController.getAllReferredType)
  .post(ReferredTypeController.createNewReferredType);

router
  .route('/referred-type/:id')
  .get(ReferredTypeController.getSingleReferredType)
  .patch(ReferredTypeController.updateSingleReferredType)
  .delete(ReferredTypeController.deleteSingleReferredType);

/*
 * Medicine Routes
 */
router
  .route('/medicine')
  .get(MedicineController.getAllMedicine)
  .post(MedicineController.createNewMedicine);

router
  .route('/medicine/bulk')
  .post(MedicineController.createBulkMedicine)
  .patch(MedicineController.updateBulkMedicine)
  .delete(MedicineController.deleteBulkMedicine);

router
  .route('/medicine/:id')
  .get(MedicineController.getSingleMedicine)
  .patch(MedicineController.updateSingleMedicine)
  .delete(MedicineController.deleteSingleMedicine);

/*
 * Allergy Routes
 */
router
  .route('/allergy')
  .get(AllergyController.getAllAllergy)
  .post(AllergyController.createNewAllergy);

router
  .route('/allergy/bulk')
  .post(AllergyController.createBulkAllergy)
  .delete(AllergyController.deleteBulkAllergy);

router
  .route('/allergy/:id')
  .get(AllergyController.getSingleAllergy)
  .patch(AllergyController.updateSingleAllergy)
  .delete(AllergyController.deleteSingleAllergy);

export default router;
