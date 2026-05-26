const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const parseResponse = async (response) => {
  if (response.status === 204) {
    return null;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Workflow request failed');
  }

  return data;
};

export const fetchWorkflows = async () => {
  const response = await fetch(`${API_BASE_URL}/workflows`);
  const data = await parseResponse(response);
  return data.workflows;
};

export const createWorkflow = async (workflow) => {
  const response = await fetch(`${API_BASE_URL}/workflows`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(workflow),
  });

  const data = await parseResponse(response);
  return data.workflow;
};

export const updateWorkflow = async (id, workflow) => {
  const response = await fetch(`${API_BASE_URL}/workflows/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(workflow),
  });

  const data = await parseResponse(response);
  return data.workflow;
};

export const deleteWorkflow = async (id) => {
  const response = await fetch(`${API_BASE_URL}/workflows/${id}`, {
    method: 'DELETE',
  });

  await parseResponse(response);
};
