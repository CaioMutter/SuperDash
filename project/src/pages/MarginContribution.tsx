import React, { useState } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import FilterBar from '../components/FilterBar';
import ExportButton from '../components/ExportButton';
import { productsData } from '../data/mockData';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const MarginContribution: React.FC = () => {
  const [filters, setFilters] = useState({
    department: 'all',
    startDate: (() => {
      const date = new Date();
      date.setDate(date.getDate() - 30);
      return date.toISOString().split('T')[0];
    })(),
    endDate: new Date().toISOString().split('T')[0]
  });
  
  const [filteredProducts, setFilteredProducts] = useState(() => {
    // Sort by profit (descending)
    return [...productsData].sort((a, b) => b.profit - a.profit);
  });
  
  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    
    // Filter products by department
    let filtered = [...productsData];
    
    if (newFilters.department !== 'all') {
      filtered = filtered.filter(product => product.department === newFilters.department);
    }
    
    // Sort by profit (descending)
    filtered.sort((a, b) => b.profit - a.profit);
    
    setFilteredProducts(filtered);
  };
  
  // Calculate profit margin percentage
  const calculateProfitMargin = (product: any) => {
    return (product.profit / product.revenue) * 100;
  };
  
  // Prepare data for margin contribution chart
  const prepareMarginData = () => {
    // Take top 10 products by profit
    const top10 = filteredProducts.slice(0, 10);
    
    return {
      labels: top10.map(product => product.name),
      datasets: [
        {
          label: 'Lucro (R$)',
          data: top10.map(product => product.profit),
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        },
        {
          label: 'Margem de Lucro (%)',
          data: top10.map(product => calculateProfitMargin(product)),
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          yAxisID: 'y1',
        },
      ],
    };
  };
  
  // Calculate total profit and average margin
  const totalProfit = filteredProducts.reduce((sum, product) => sum + product.profit, 0);
  const averageMargin = filteredProducts.reduce((sum, product) => sum + calculateProfitMargin(product), 0) / filteredProducts.length;
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Contribuição Marginal</h1>
        <p className="text-gray-600">Analise a lucratividade dos seus produtos</p>
      </div>
      
      <FilterBar onFilterChange={handleFilterChange} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Lucro Total</h2>
          <p className="text-3xl font-bold text-green-600">R$ {totalProfit.toLocaleString('pt-BR')}</p>
          <p className="text-gray-600">No período selecionado</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Margem Média</h2>
          <p className="text-3xl font-bold text-blue-600">{averageMargin.toFixed(2)}%</p>
          <p className="text-gray-600">Média de todos os produtos</p>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Top 10 Produtos por Lucro</h2>
          <ExportButton 
            data={filteredProducts.map(p => ({
              id: p.id,
              nome: p.name,
              departamento: p.department,
              vendas: p.sales,
              receita: p.revenue,
              lucro: p.profit,
              margem: calculateProfitMargin(p).toFixed(2) + '%'
            }))} 
            filename="contribuicao_marginal" 
            type="csv" 
          />
        </div>
        <div className="h-80">
          <Bar 
            data={prepareMarginData()} 
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
                    text: 'Lucro (R$)',
                  },
                },
                y1: {
                  beginAtZero: true,
                  position: 'right',
                  title: {
                    display: true,
                    text: 'Margem de Lucro (%)',
                  },
                  grid: {
                    drawOnChartArea: false,
                  },
                },
                x: {
                  title: {
                    display: true,
                    text: 'Produtos',
                  },
                },
              },
            }}
          />
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Lista de Produtos por Contribuição Marginal</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Departamento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Receita
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lucro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Margem
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.sales}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    R$ {product.revenue.toLocaleString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    R$ {product.profit.toLocaleString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {calculateProfitMargin(product).toFixed(2)}%
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

export default MarginContribution;