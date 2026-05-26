import { executeQuery } from '../config/db.js';

const defaultWorkflow = {
  description: '',
  status: 'draft',
  priority: 'medium',
  owner: '',
  trigger_type: 'manual',
  last_run_at: null,
};

let cachedSchema;

const parseEnumValues = (columnType = '') => {
  const match = columnType.match(/^enum\((.*)\)$/i);

  if (!match) {
    return [];
  }

  return match[1]
    .split(',')
    .map((value) => value.trim().replace(/^'|'$/g, ''));
};

const getWorkflowSchema = async () => {
  if (cachedSchema) {
    return cachedSchema;
  }

  const columns = await executeQuery('workflows.schema', 'SHOW COLUMNS FROM workflows');
  const columnMap = new Map(columns.map((column) => [column.Field, column]));

  cachedSchema = {
    columns: columnMap,
    statusValues: parseEnumValues(columnMap.get('status')?.Type),
  };

  return cachedSchema;
};

const hasColumn = (schema, columnName) => schema.columns.has(columnName);

const selectWorkflowFields = (schema) => {
  const field = (columnName, fallbackSql) =>
    hasColumn(schema, columnName) ? columnName : `${fallbackSql} AS ${columnName}`;

  return [
    'id',
    'name',
    field('description', "''"),
    field('status', "'draft'"),
    field('priority', "'medium'"),
    field('owner', "''"),
    field('trigger_type', "'manual'"),
    field('last_run_at', 'NULL'),
    field('created_at', 'CURRENT_TIMESTAMP'),
    field('updated_at', hasColumn(schema, 'created_at') ? 'created_at' : 'CURRENT_TIMESTAMP'),
  ].join(',\n  ');
};

const normalizeWorkflow = (workflow = {}) => ({
  ...workflow,
  description: workflow.description ?? defaultWorkflow.description,
  status: workflow.status ?? defaultWorkflow.status,
  priority: workflow.priority ?? defaultWorkflow.priority,
  owner: workflow.owner ?? defaultWorkflow.owner,
  trigger_type: workflow.trigger_type ?? defaultWorkflow.trigger_type,
  last_run_at: workflow.last_run_at ?? defaultWorkflow.last_run_at,
  updated_at: workflow.updated_at ?? workflow.created_at ?? null,
});

const normalizeStatus = (status, schema) => {
  const fallbackStatus = defaultWorkflow.status;

  if (!status) {
    return fallbackStatus;
  }

  if (schema.statusValues.length > 0 && !schema.statusValues.includes(status)) {
    return schema.statusValues.includes(fallbackStatus) ? fallbackStatus : schema.statusValues[0];
  }

  return status;
};

const buildWritableWorkflow = (
  schema,
  {
    name,
    description = defaultWorkflow.description,
    status = defaultWorkflow.status,
    priority = defaultWorkflow.priority,
    owner = defaultWorkflow.owner,
    triggerType = defaultWorkflow.trigger_type,
    trigger_type,
  },
) => {
  const trigger = trigger_type || triggerType;
  const writable = {
    name: name.trim(),
    description,
    status: normalizeStatus(status, schema),
    priority,
    owner,
    trigger_type: trigger,
  };

  return Object.entries(writable).filter(([columnName]) => hasColumn(schema, columnName));
};

export const getWorkflows = async () => {
  const schema = await getWorkflowSchema();
  const orderColumn = hasColumn(schema, 'updated_at') ? 'updated_at' : 'created_at';
  const rows = await executeQuery(
    'workflows.list',
    `SELECT ${selectWorkflowFields(schema)} FROM workflows ORDER BY ${orderColumn} DESC`,
  );

  return rows.map(normalizeWorkflow);
};

export const findWorkflowById = async (id) => {
  const schema = await getWorkflowSchema();
  const rows = await executeQuery(
    'workflows.findById',
    `SELECT ${selectWorkflowFields(schema)} FROM workflows WHERE id = ? LIMIT 1`,
    [id],
  );

  return rows[0] ? normalizeWorkflow(rows[0]) : null;
};

export const createWorkflow = async (workflow) => {
  const schema = await getWorkflowSchema();
  const writableFields = buildWritableWorkflow(schema, workflow);
  const columnNames = writableFields.map(([columnName]) => columnName);
  const values = writableFields.map(([, value]) => value);
  const placeholders = columnNames.map(() => '?').join(', ');

  const result = await executeQuery(
    'workflows.create',
    `INSERT INTO workflows (${columnNames.join(', ')}) VALUES (${placeholders})`,
    values,
  );

  return findWorkflowById(result.insertId);
};

export const updateWorkflowById = async (id, workflow) => {
  const schema = await getWorkflowSchema();
  const writableFields = buildWritableWorkflow(schema, workflow);
  const assignmentParts = writableFields.map(([columnName]) => `${columnName} = ?`);
  const values = writableFields.map(([, value]) => value);

  if (hasColumn(schema, 'updated_at')) {
    assignmentParts.push('updated_at = CURRENT_TIMESTAMP');
  }

  const result = await executeQuery(
    'workflows.update',
    `UPDATE workflows SET ${assignmentParts.join(', ')} WHERE id = ?`,
    [...values, id],
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return findWorkflowById(id);
};

export const deleteWorkflowById = async (id) => {
  const result = await executeQuery('workflows.delete', 'DELETE FROM workflows WHERE id = ?', [id]);
  return result.affectedRows > 0;
};
