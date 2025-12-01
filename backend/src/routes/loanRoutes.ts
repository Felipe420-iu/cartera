import { Router } from 'express';
import { LoanController } from '../controllers/LoanController';

const router = Router();
const loanController = new LoanController();

router.get('/', loanController.getAll);
router.get('/:id', loanController.getById);
router.get('/client/:clientId', loanController.getByClient);
router.post('/', loanController.create);
router.post('/calculate', loanController.calculate);
router.put('/installment/:installmentId/pay', loanController.payInstallment);

export default router;