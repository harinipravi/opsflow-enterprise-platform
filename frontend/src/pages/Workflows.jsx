import { useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import {
  createWorkflow,
  deleteWorkflow,
  fetchWorkflows,
  updateWorkflow,
} from '../services/workflowApi.js';

const emptyForm = {
  name: '',
  description: '',
  status: 'draft',
  priority: 'medium',
  owner: '',
  triggerType: 'manual',
};

const fallbackWorkflows = [
  {
    id: 'sample-1',
    name: 'Daily inventory sync',
    description: 'Sync stock levels between warehouse and storefront systems.',
    status: 'active',
    priority: 'high',
    owner: 'Operations',
    trigger_type: 'scheduled',
    updated_at: '2026-05-26T09:30:00.000Z',
  },
  {
    id: 'sample-2',
    name: 'Purchase approval routing',
    description: 'Route procurement requests to the right approval queue.',
    status: 'paused',
    priority: 'medium',
    owner: 'Finance',
    trigger_type: 'event',
    updated_at: '2026-05-25T14:15:00.000Z',
  },
];

const statusClasses = {
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  draft: 'bg-slate-100 text-slate-700 ring-slate-200',
  paused: 'bg-amber-50 text-amber-700 ring-amber-200',
  archived: 'bg-rose-50 text-rose-700 ring-rose-200',
};

function Workflows() {
  const [workflows, setWorkflows] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [apiAvailable, setApiAvailable] = useState(true);

  const summary = useMemo(
    () => ({
      total: workflows.length,
      active: workflows.filter((workflow) => workflow.status === 'active').length,
      paused: workflows.filter((workflow) => workflow.status === 'paused').length,
      draft: workflows.filter((workflow) => workflow.status === 'draft').length,
    }),
    [workflows],
  );

  useEffect(() => {
    const loadWorkflows = async () => {
      try {
        const data = await fetchWorkflows();
        setWorkflows(data);
        setApiAvailable(true);
      } catch (error) {
        setWorkflows(fallbackWorkflows);
        setApiAvailable(false);
        setMessage('Showing sample workflows until the backend API is running.');
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkflows();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    if (!form.name.trim()) {
      setMessage('Workflow name is required.');
      return;
    }

    try {
      if (editingId) {
        const updated = await updateWorkflow(editingId, form);
        setWorkflows((current) =>
          current.map((workflow) => (workflow.id === editingId ? updated : workflow)),
        );
        setMessage('Workflow updated.');
      } else {
        const created = await createWorkflow(form);
        setWorkflows((current) => [created, ...current]);
        setMessage('Workflow created.');
      }

      setApiAvailable(true);
      resetForm();
    } catch (error) {
      setMessage(apiAvailable ? error.message : 'Start the backend API to save workflow changes.');
    }
  };

  const handleEdit = (workflow) => {
    setEditingId(workflow.id);
    setForm({
      name: workflow.name || '',
      description: workflow.description || '',
      status: workflow.status || 'draft',
      priority: workflow.priority || 'medium',
      owner: workflow.owner || '',
      triggerType: workflow.trigger_type || workflow.triggerType || 'manual',
    });
  };

  const handleDelete = async (id) => {
    setMessage('');

    try {
      await deleteWorkflow(id);
      setWorkflows((current) => current.filter((workflow) => workflow.id !== id));
      setMessage('Workflow deleted.');
    } catch (error) {
      setMessage(apiAvailable ? error.message : 'Start the backend API to delete workflows.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950 md:flex">
      <Sidebar />

      <main className="flex-1 px-5 py-6 sm:px-8 lg:px-10">
        <header className="border-b border-slate-200 pb-6">
          <p className="text-sm font-semibold uppercase text-blue-700">Workflow Management</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">Workflows</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Create, update, and monitor operational workflows before connecting detailed step builders.
          </p>
        </header>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ['Total', summary.total],
            ['Active', summary.active],
            ['Paused', summary.paused],
            ['Draft', summary.draft],
          ].map(([label, value]) => (
            <article key={label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <p className="mt-3 text-3xl font-semibold text-slate-950">{value}</p>
            </article>
          ))}
        </section>

        {message && (
          <div className="mt-6 rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-800">
            {message}
          </div>
        )}

        <section className="mt-6 grid gap-6 xl:grid-cols-[380px_1fr]">
          <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">{editingId ? 'Edit Workflow' : 'Create Workflow'}</h2>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
              )}
            </div>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Name</span>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  placeholder="Customer onboarding"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Description</span>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="4"
                  className="mt-1 w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  placeholder="Describe what this workflow controls"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Status</span>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="archived">Archived</option>
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Priority</span>
                  <select
                    name="priority"
                    value={form.priority}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Owner</span>
                  <input
                    name="owner"
                    value={form.owner}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    placeholder="Operations"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Trigger</span>
                  <select
                    name="triggerType"
                    value={form.triggerType}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="manual">Manual</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="event">Event</option>
                    <option value="webhook">Webhook</option>
                  </select>
                </label>
              </div>

              <button
                type="submit"
                className="w-full rounded-md bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
              >
                {editingId ? 'Update Workflow' : 'Create Workflow'}
              </button>
            </div>
          </form>

          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-lg font-semibold">Workflow Directory</h2>
              <p className="mt-1 text-sm text-slate-500">Track status, ownership, and trigger type.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    {['Workflow', 'Status', 'Priority', 'Owner', 'Trigger', 'Actions'].map((heading) => (
                      <th
                        key={heading}
                        scope="col"
                        className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {isLoading ? (
                    <tr>
                      <td colSpan="6" className="px-5 py-8 text-center text-sm text-slate-500">
                        Loading workflows...
                      </td>
                    </tr>
                  ) : (
                    workflows.map((workflow) => (
                      <tr key={workflow.id}>
                        <td className="max-w-sm px-5 py-4">
                          <p className="text-sm font-semibold text-slate-950">{workflow.name}</p>
                          <p className="mt-1 line-clamp-2 text-sm text-slate-500">{workflow.description}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ${
                              statusClasses[workflow.status]
                            }`}
                          >
                            {workflow.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm capitalize text-slate-700">{workflow.priority}</td>
                        <td className="px-5 py-4 text-sm text-slate-700">{workflow.owner || 'Unassigned'}</td>
                        <td className="px-5 py-4 text-sm capitalize text-slate-700">
                          {workflow.trigger_type || workflow.triggerType}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleEdit(workflow)}
                              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(workflow.id)}
                              className="rounded-md border border-rose-200 px-3 py-1.5 text-sm font-semibold text-rose-700 hover:bg-rose-50"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Workflows;
