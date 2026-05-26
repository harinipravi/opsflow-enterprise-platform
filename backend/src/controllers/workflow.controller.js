import {
  createWorkflow,
  deleteWorkflowById,
  findWorkflowById,
  getWorkflows,
  updateWorkflowById,
} from '../models/workflow.model.js';

const allowedStatuses = ['draft', 'active', 'paused', 'archived'];
const allowedPriorities = ['low', 'medium', 'high'];

const validateWorkflow = ({ name, status, priority } = {}) => {
  if (!name?.trim()) {
    return 'Workflow name is required';
  }

  if (status && !allowedStatuses.includes(status)) {
    return 'Invalid workflow status';
  }

  if (priority && !allowedPriorities.includes(priority)) {
    return 'Invalid workflow priority';
  }

  return null;
};

export const listWorkflows = async (req, res, next) => {
  try {
    const workflows = await getWorkflows();
    res.json({ workflows });
  } catch (error) {
    next(error);
  }
};

export const getWorkflow = async (req, res, next) => {
  try {
    const workflow = await findWorkflowById(req.params.id);

    if (!workflow) {
      return res.status(404).json({ message: 'Workflow not found' });
    }

    return res.json({ workflow });
  } catch (error) {
    return next(error);
  }
};

export const addWorkflow = async (req, res, next) => {
  try {
    const error = validateWorkflow(req.body);

    if (error) {
      return res.status(400).json({ message: error });
    }

    const workflow = await createWorkflow(req.body || {});
    return res.status(201).json({ workflow });
  } catch (error) {
    return next(error);
  }
};

export const editWorkflow = async (req, res, next) => {
  try {
    const error = validateWorkflow(req.body);

    if (error) {
      return res.status(400).json({ message: error });
    }

    const workflow = await updateWorkflowById(req.params.id, req.body || {});

    if (!workflow) {
      return res.status(404).json({ message: 'Workflow not found' });
    }

    return res.json({ workflow });
  } catch (error) {
    return next(error);
  }
};

export const removeWorkflow = async (req, res, next) => {
  try {
    const deleted = await deleteWorkflowById(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: 'Workflow not found' });
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};
