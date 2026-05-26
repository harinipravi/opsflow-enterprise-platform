import * as XLSX from 'xlsx';

export const requiredFields = ['name', 'status', 'priority'];
export const allowedStatuses = ['draft', 'active', 'paused', 'archived'];
export const allowedPriorities = ['low', 'medium', 'high'];

export const templateColumns = [
  'name',
  'description',
  'status',
  'priority',
  'owner',
  'trigger_type',
];

const fieldAliases = {
  workflow_name: 'name',
  workflow: 'name',
  trigger: 'trigger_type',
  triggertype: 'trigger_type',
  trigger_type: 'trigger_type',
};

const normalizeHeader = (header) =>
  String(header || '')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/-+/g, '_')
    .toLowerCase();

const normalizeValue = (value) => String(value ?? '').trim();

const normalizeRecord = (record) =>
  Object.entries(record).reduce((normalized, [key, value]) => {
    const rawKey = normalizeHeader(key);
    const field = fieldAliases[rawKey] || rawKey;
    normalized[field] = normalizeValue(value);
    return normalized;
  }, {});

const escapeSql = (value) => String(value ?? '').replace(/\\/g, '\\\\').replace(/'/g, "''");

const sqlValue = (value) => {
  const cleaned = normalizeValue(value);
  return cleaned ? `'${escapeSql(cleaned)}'` : 'NULL';
};

export const parseUploadFile = async (file) => {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  if (!worksheet) {
    return [];
  }

  return XLSX.utils
    .sheet_to_json(worksheet, { defval: '' })
    .map((row, index) => ({
      rowNumber: index + 2,
      data: normalizeRecord(row),
    }))
    .filter(({ data }) => Object.values(data).some((value) => normalizeValue(value)));
};

export const validateRows = (rows) => {
  const nameCounts = rows.reduce((counts, row) => {
    const key = normalizeValue(row.data.name).toLowerCase();
    if (key) {
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    return counts;
  }, new Map());

  return rows.map((row) => {
    const errors = [];
    const data = row.data;

    requiredFields.forEach((field) => {
      if (!normalizeValue(data[field])) {
        errors.push(`${field} is required`);
      }
    });

    if (data.status && !allowedStatuses.includes(data.status.toLowerCase())) {
      errors.push('status must be draft, active, paused, or archived');
    }

    if (data.priority && !allowedPriorities.includes(data.priority.toLowerCase())) {
      errors.push('priority must be low, medium, or high');
    }

    const duplicateKey = normalizeValue(data.name).toLowerCase();
    if (duplicateKey && nameCounts.get(duplicateKey) > 1) {
      errors.push('duplicate workflow name in uploaded file');
    }

    return {
      ...row,
      data: {
        name: normalizeValue(data.name),
        description: normalizeValue(data.description),
        status: normalizeValue(data.status).toLowerCase(),
        priority: normalizeValue(data.priority).toLowerCase(),
        owner: normalizeValue(data.owner),
        trigger_type: normalizeValue(data.trigger_type) || 'manual',
      },
      errors,
      isValid: errors.length === 0,
    };
  });
};

export const buildInsertSql = (rows) => {
  const validRows = rows.filter((row) => row.isValid);

  if (validRows.length === 0) {
    return '';
  }

  const values = validRows
    .map(({ data }) =>
      [
        sqlValue(data.name),
        sqlValue(data.description),
        sqlValue(data.status),
        sqlValue(data.priority),
        sqlValue(data.owner),
        sqlValue(data.trigger_type),
      ].join(', '),
    )
    .map((value) => `  (${value})`)
    .join(',\n');

  return `INSERT INTO workflows (name, description, status, priority, owner, trigger_type)\nVALUES\n${values};`;
};

export const buildUpdateSql = (rows) =>
  rows
    .filter((row) => row.isValid)
    .map(
      ({ data }) => `UPDATE workflows
SET
  description = ${sqlValue(data.description)},
  status = ${sqlValue(data.status)},
  priority = ${sqlValue(data.priority)},
  owner = ${sqlValue(data.owner)},
  trigger_type = ${sqlValue(data.trigger_type)}
WHERE name = ${sqlValue(data.name)};`,
    )
    .join('\n\n');

export const toValidationReportCsv = (rows) => {
  const header = [
    'row_number',
    ...templateColumns,
    'is_valid',
    'errors',
  ];

  const lines = rows.map((row) => {
    const values = [
      row.rowNumber,
      ...templateColumns.map((column) => row.data[column] || ''),
      row.isValid ? 'yes' : 'no',
      row.errors.join('; '),
    ];

    return values
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(',');
  });

  return [header.join(','), ...lines].join('\n');
};

export const downloadTextFile = (filename, content, mimeType = 'text/plain') => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
