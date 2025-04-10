import React, { useState } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import FilterBar from '../components/FilterBar';
import ExportButton from '../components/ExportButton';
import { dailySalesData } from '../data/mockData';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DailySales: React.FC = () => {
  const [filters, setFilters] = useState({
    department: 'all',
    startDate: (() => {
      const date = new Date();
      date.setDate(1); // First day of current month
      return date.toISOString().split('T')[0];
    })(),
    endDate: new Date().toISOString().split('T')[0]
  });
  
  const [filteredData, setFilteredData] = useState(dailySalesData);
  
  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    
    // Filter data by date range
    const filtered = dailySalesData.filter(item => {
      const itemDate = new Date(item.date);
      const start = new Date(newFilters.startDate);
      const end = new Date(newFilters.endDate);
      
      return itemDate >= start && itemDate <= end;
    });
    
    setFilteredData(filtered);
  };
  
  // Prepare data for daily sales chart
  const prepareDailySalesData = () => {
    return {
      labels: filteredData.map(item => {
        const date = new Date(item.date);
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      }),
      datasets: [
        {
          type: 'bar' as const,
          label: 'Venda Diária',
          data: filteredData.map(item => item.total),
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          order: 2,
        },
        {
          type: 'line' as const,
          label: 'Venda Acumulada',
          data: filteredData.map(item => item.accumulated),
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          yAxisID: 'y1',
          order: 1,
        },
      ],
    };
  };
  
  // Calculate total and average daily sales
  const totalSales = filteredData.length > 0 ? filteredData[filteredData.length - 1].accumulated : 0;
  const averageDailySales = totalSales / filteredData.length;
  
  // Calculate projected monthly sales
  const calculateProjectedSales = () => {
    if (filteredData.length === 0) return 0;
    
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const currentDay = now.getDate();
    
    // If we have data for the full month, return the total
    if (currentDay === daysInMonth) {
      return totalSales;
    }
    
    // Otherwise, project based on daily average
    return averageDailySales * daysInMonth;
  };
  
  const projectedSales = calculateProjectedSales();
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Vendas Diárias Acumuladas</h1>
        <p className="text-gray-600">Acompanhe o desempenho diário e a evolução das vendas no mês</p>
      </div>
      
      <FilterBar onFilterChange={handleFilterChange} />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Venda Total</h2>
          <p className="text-3xl font-bold text-green-600">R$ {totalSales.toLocaleString('pt-BR')}</p>
          <p className="text-gray-600">No período selecionado</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Média Diária</h2>
          <p className="text-3xl font-bold text-blue-600">R$ {averageDailySales.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</p>
          <p className="text-gray-600">Média de vendas por dia</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Projeção Mensal</h2>
          <p className="text-3xl font-bold text-purple-600">R$ {projectedSales.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</p>
          <p className="text-gray-600">Estimativa para o mês completo</p>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Vendas Diárias e Acumuladas</h2>
          <ExportButton 
            data={filteredData.map(item => ({
              data: item.date,
              venda_diaria: item.total,
              venda_acumulada: item.accumulated
            }))} 
            filename="vendas_diarias" 
            type="csv" 
          />
        </div>
        <div className="h-80">
          <Bar 
            data={prepareDailySalesData()} 
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top',
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Venda Diária (R$)',
                  },
                },
                y1: {
                  beginAtZero: true,
                  position: 'right',
                  title: {
                    display: true,
                    text: 'Venda Acumulada (R$)',
                  },
                  grid: {
                    drawOnChartArea: false,
                  },
                },
                x: {
                  title: {
                    display: true,
                    text: 'Data',
                  },
                },
              },
            }}
          />
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Detalhamento de Vendas Diárias</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Venda Diária
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Venda Acumulada
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  % do Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {new Date(item.date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    R$ {item.total.toLocaleString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    R$ {item.accumulated.toLocaleString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {totalSales > 0 ? ((item.accumulated / totalSales) * 100).toFixed(2) : '0.00'}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DailySales;