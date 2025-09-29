import React, { type ReactNode } from 'react';

interface Column {
  key: string;
  label: string;
  render?: (value: unknown, row: unknown) => ReactNode;
}

interface TableProps {
  columns: Column[];
  data: Record<string, unknown>[];
  loading?: boolean;
  emptyMessage?: string;
}

const Table: React.FC<TableProps> = ({ 
  columns, 
  data, 
  loading = false, 
  emptyMessage = 'Aucune donnée disponible' 
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-4 shadow-sm overflow-hidden">
        <div className="p-5 text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="text-muted mb-0">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-4 shadow-sm overflow-hidden animate__animated animate__fadeIn">
      <div className="table-responsive">
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="fw-semibold text-dark border-0 py-3 px-4"
                  style={{ fontSize: '0.875rem', letterSpacing: '0.5px' }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-5">
                  <div className="text-muted">
                    <i className="bi bi-inbox display-1 d-block mb-3 opacity-25"></i>
                    <p className="mb-0">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row: Record<string, unknown>, index: number) => (
                <tr 
                  key={index} 
                  className="animate__animated animate__fadeInUp border-0"
                  style={{ 
                    animationDelay: `${index * 50}ms`,
                    borderBottom: '1px solid #f1f3f4'
                  }}
                >
                  {columns.map((column) => (
                    <td 
                      key={column.key} 
                      className="py-3 px-4 align-middle"
                      style={{ fontSize: '0.875rem' }}
                    >
                      {column.render ? column.render(row[column.key], row) : (row[column.key] as ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;