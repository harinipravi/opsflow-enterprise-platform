import { useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import {
  buildInsertSql,
  buildUpdateSql,
  downloadTextFile,
  parseUploadFile,
  templateColumns,
  toValidationReportCsv,
  validateRows,
} from '../utils/bulkUpload.js';

function BulkUpload() {
  const [fileName, setFileName] = useState('');
  const [rows, setRows] = useState([]);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState('');
  const [sqlMode, setSqlMode] = useState('insert');

  const summary = useMemo(
    () => ({
      total: rows.length,
      valid: rows.filter((row) => row.isValid).length,
      invalid: rows.filter((row) => !row.isValid).length,
      duplicates: rows.filter((row) =>
        row.errors.some((message) => message.includes('duplicate workflow name')),
      ).length,
    }),
    [rows],
  );

  const sqlPreview = useMemo(
    () => (sqlMode === 'insert' ? buildInsertSql(rows) : buildUpdateSql(rows)),
    [rows, sqlMode],
  );

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsParsing(true);
    setError('');
    setFileName(file.name);

    try {
      const parsedRows = await parseUploadFile(file);
      const validatedRows = validateRows(parsedRows);
      setRows(validatedRows);

      if (validatedRows.length === 0) {
        setError('No data rows were found in the uploaded file.');
      }
    } catch (parseError) {
      setRows([]);
      setError('Unable to parse the uploaded file. Use a valid XLSX or CSV file.');
    } finally {
      setIsParsing(false);
      event.target.value = '';
    }
  };

  const exportReport = () => {
    downloadTextFile(
      'opsflow-validation-report.csv',
      toValidationReportCsv(rows),
      'text/csv;charset=utf-8',
    );
  };

  const exportSql = () => {
    downloadTextFile(`opsflow-${sqlMode}-queries.sql`, sqlPreview || '-- No valid rows to export.');
  };

  const downloadTemplate = () => {
    const template = `${templateColumns.join(',')}\nDaily inventory sync,Sync stock levels,active,high,Operations,scheduled`;
    downloadTextFile('opsflow-workflow-upload-template.csv', template, 'text/csv;charset=utf-8');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950 md:flex">
      <Sidebar />

      <main className="flex-1 px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-blue-700">Enterprise Bulk Upload</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">Workflow Import Center</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">
              Upload XLSX or CSV files, validate workflow data, detect duplicate names, and export SQL or validation reports.
            </p>
          </div>

          <button
            type="button"
            onClick={downloadTemplate}
            className="w-fit rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Download Template
          </button>
        </header>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ['Total Rows', summary.total],
            ['Valid Rows', summary.valid],
            ['Invalid Rows', summary.invalid],
            ['Duplicates', summary.duplicates],
          ].map(([label, value]) => (
            <article key={label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <p className="mt-3 text-3xl font-semibold text-slate-950">{value}</p>
            </article>
          ))}
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[380px_1fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Upload File</h2>
            <p className="mt-1 text-sm text-slate-500">Accepted formats: `.xlsx`, `.xls`, and `.csv`.</p>

            <label className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center hover:border-blue-500 hover:bg-blue-50">
              <span className="text-sm font-semibold text-slate-900">
                {isParsing ? 'Parsing file...' : 'Choose upload file'}
              </span>
              <span className="mt-2 text-xs text-slate-500">{fileName || 'Workflow upload spreadsheet'}</span>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>

            {error && (
              <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
                {error}
              </div>
            )}

            <div className="mt-6 rounded-md border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Required fields</p>
              <p className="mt-2 text-sm text-slate-600">`name`, `status`, and `priority` must be present.</p>
              <p className="mt-2 text-sm text-slate-600">Statuses: draft, active, paused, archived.</p>
              <p className="mt-2 text-sm text-slate-600">Priorities: low, medium, high.</p>
            </div>

            <div className="mt-6 grid gap-3">
              <button
                type="button"
                onClick={exportReport}
                disabled={rows.length === 0}
                className="rounded-md bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Export Validation Report
              </button>
              <button
                type="button"
                onClick={exportSql}
                disabled={rows.length === 0}
                className="rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
              >
                Export SQL Queries
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Validation Results</h2>
                  <p className="mt-1 text-sm text-slate-500">Invalid rows include field-level messages.</p>
                </div>
                <div className="flex rounded-md border border-slate-300 bg-white p-1">
                  {['insert', 'update'].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setSqlMode(mode)}
                      className={[
                        'rounded px-3 py-1.5 text-sm font-semibold capitalize',
                        sqlMode === mode ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100',
                      ].join(' ')}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      {['Row', 'Name', 'Status', 'Priority', 'Owner', 'Result', 'Errors'].map((heading) => (
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
                    {rows.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-5 py-8 text-center text-sm text-slate-500">
                          Upload a spreadsheet to preview validation results.
                        </td>
                      </tr>
                    ) : (
                      rows.map((row) => (
                        <tr key={row.rowNumber}>
                          <td className="px-5 py-4 text-sm text-slate-600">{row.rowNumber}</td>
                          <td className="px-5 py-4 text-sm font-semibold text-slate-950">{row.data.name || '-'}</td>
                          <td className="px-5 py-4 text-sm capitalize text-slate-700">{row.data.status || '-'}</td>
                          <td className="px-5 py-4 text-sm capitalize text-slate-700">{row.data.priority || '-'}</td>
                          <td className="px-5 py-4 text-sm text-slate-700">{row.data.owner || 'Unassigned'}</td>
                          <td className="px-5 py-4">
                            <span
                              className={[
                                'rounded-full px-2.5 py-1 text-xs font-semibold ring-1',
                                row.isValid
                                  ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                                  : 'bg-rose-50 text-rose-700 ring-rose-200',
                              ].join(' ')}
                            >
                              {row.isValid ? 'Valid' : 'Invalid'}
                            </span>
                          </td>
                          <td className="max-w-sm px-5 py-4 text-sm text-slate-600">
                            {row.errors.length > 0 ? row.errors.join('; ') : 'None'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">SQL Preview</h2>
                  <p className="mt-1 text-sm text-slate-500">Only valid rows are included.</p>
                </div>
              </div>
              <pre className="mt-4 max-h-80 overflow-auto rounded-md bg-slate-950 p-4 text-xs leading-6 text-slate-100">
                {sqlPreview || '-- Upload valid rows to generate SQL.'}
              </pre>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default BulkUpload;
