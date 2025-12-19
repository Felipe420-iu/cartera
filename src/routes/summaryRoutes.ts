import { Router } from 'express';
import { SummaryController } from '../controllers/SummaryController';

const router = Router();
const summaryController = new SummaryController();

router.get('/', summaryController.getSummary);
router.get('/calendar', summaryController.getCalendarData);

export default router;