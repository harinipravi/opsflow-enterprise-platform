import { Router } from 'express';
import {
  addWorkflow,
  editWorkflow,
  getWorkflow,
  listWorkflows,
  removeWorkflow,
} from '../controllers/workflow.controller.js';

const router = Router();

router.get('/', listWorkflows);
router.get('/:id', getWorkflow);
router.post('/', addWorkflow);
router.put('/:id', editWorkflow);
router.delete('/:id', removeWorkflow);

export default router;
