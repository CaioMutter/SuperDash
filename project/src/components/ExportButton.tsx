import React from 'react';
import { Download } from 'lucide-react';

interface ExportButtonProps {
  data: any[];
  filename: string;
  type: 'csv' | 'pdf';
}

const ExportButton: React.FC<ExportButtonProps> = ({ data, filename, type }) => {
  const handleExport = () => {
    if (type === 'csv') {
      exportCSV(data, filename);
    } else {
      alert('Exportação para PDF será implementada em uma versão futura.');
    }
  };

  const exportCSV = (data: any[], filename: string) => {
    if (!data.length) return;
    
    // Get headers from first object
    const headers = Object.keys(data[0]);
    
    // Create CSV content
    const csvContent = [
      headers.join(','), // Header row
      ...data.map(row => 
        headers.map(header => {
          // Handle values that might contain commas
          const value = row[header]?.toString() || '';
          return value.includes(',') ? `"${value}"` : value;
        }).join(',')
      )
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
    >
      <Download className="h-4 w-4 mr-2" />
      Exportar {type.toUpperCase()}
    </button>
  );
};

export default ExportButton;