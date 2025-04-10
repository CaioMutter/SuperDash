import React, { useState } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import FilterBar from '../components/FilterBar';
import ExportButton from '../components/ExportButton';
import { productsData } from '../data/mockData';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ABCCurve: React.FC = () => {
  const [filters, setFilters] = useState({
    department: 'all',
    startDate: (() => {
      const date = new Date();
      date.setDate(date.getDate() - 30);
      return date.toISOString().split('T')[0];
    })(),
    endDate: new Date().toISOString().split('T')[0]
  });
  
  const [filteredProducts, setFilteredProducts] = useState(productsData);
  
  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    
    // Filter products by department
    let filtered = [...productsData];
    
    if (newFilters.department !== 'all') {
      filtered = filtered.filter(product => product.department === newFilters.department);
    }
    
    // Sort by revenue (descending)
    filtered.sort((a, b) => b.revenue - a.revenue);
    
    // Recalculate contribution percentage
    const totalRevenue = filtered.reduce((sum, product) => sum + product.revenue, 0);
    let accumulatedPercentage = 0;
    
    filtered = filtered.map(product => {
      const contribution = (product.revenue / totalRevenue) * 100;
      accumulatedPercentage += contribution;
      
      return {
        ...product,
        contribution: parseFloat(contribution.toFixed(2)),
        accumulatedContribution: parseFloat(accumulatedPercentage.toFixed(2))
      };
    });
    
    setFilteredProducts(filtered);
  };
  
  // Prepare data for ABC curve chart
  const prepareABCData = () => {
    // Calculate accumulated contribution
    let accumulated = 0;
    const accumulatedData = filteredProducts.map(product => {
      accumulated += product.contribution;
      return parseFloat(accumulated.toFixed(2));
    });
    
    return {
      labels: filteredProducts.map((_, index) => (index + 1).toString()),
      datasets: [
        {
          label: 'Curva ABC',
          data: accumulatedData,
          borderColor: 'rgba(53, 162, 235, 1)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        },
        {
          label: 'Limite A (80%)',
          data: Array(filteredProducts.length).fill(80),
          borderColor: 'rgba(255, 99, 132, 1)',
          borderDash: [5, 5],
          borderWidth: 2,
          pointRadius: 0,
        },
        {
          label: 'Limite B (95%)',
          data: Array(filteredProducts.length).fill(95),
          borderColor: 'rgba(255, 159, 64, 1)',
          borderDash: [5, 5],
          borderWidth: 2,
          pointRadius: 0,
        },
      ],
    };
  };
  
  // Classify products into A, B, C categories
  const classifyProducts = (products: any[]) => {
    return products.map(product => {
      let classification = 'C';
      if (product.accumulatedContribution <= 80) {
        classification = 'A';
      } else if (product.accumulatedContribution <= 95) {
        classification = 'B';
      }
      return { ...product, classification };
    });
  };
  
  const classifiedProducts = classifyProducts(filteredProducts);
  
  // Count products in each category
  const countByCategory = {
    A: classifiedProducts.filter(p => p.classification === 'A').length,
    B: classifiedProducts.filter(p => p.classification === 'B').length,
    C: classifiedProducts.filter(p => p.classification === 'C').length,
  };
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Análise de Curva ABC</h1>
        <p className="text-gray-600">Identifique os produtos mais importantes para o seu negócio</p>
      </div>
      
      <FilterBar onFilterChange={handleFilterChange} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Categoria A</h2>
          <p className="text-3xl font-bold text-green-600">{countByCategory.A}</p>
          <p className="text-gray-600">Produtos que representam 80% das vendas</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Categoria B</h2>
          <p className="text-3xl font-bold text-yellow-600">{countByCategory.B}</p>
          <p className="text-gray-600">Produtos que representam 15% das vendas</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Categoria C</h2>
          <p className="text-3xl font-bold text-red-600">{countByCategory.C}</p>
          <p className="text-gray-600">Produtos que representam 5% das vendas</p>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Curva ABC</h2>
          <ExportButton 
            data={classifiedProducts.map(p => ({
              id: p.id,
              nome: p.name,
              departamento: p.department,
              vendas: p.sales,
              receita: p.revenue,
              lucro: p.profit,
              contribuicao: p.contribution,
              contribuicao_acumulada: p.accumulatedContribution,
              classificacao: p.classification
            }))} 
            filename="curva_abc" 
            type="csv" 
          />
        </div>
        <div className="h-80">
          <Line 
            data={prepareABCData()} 
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top',
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      return `Contribuição acumulada: ${context.parsed.y}%`;
                    },
                    title: function(context) {
                      const index = parseInt(context[0].label) - 1;
                      if (index >= 0 && index < filteredProducts.length) {
                        return filteredProducts[index].name;
                      }
                      return '';
                    }
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100,
                  title: {
                    display: true,
                    text: 'Contribuição Acumulada (%)',
                  },
                },
                x: {
                  title: {
                    display: true,
                    text: 'Produtos (ordenados por receita)',
                  },
                },
              },
            }}
          />
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Lista de Produtos</h2>
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
                  Contribuição
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acumulado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Classe
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {classifiedProducts.map((product) => (
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
                    {(product.contribution || 0).toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(product.accumulatedContribution || 0).toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${product.classification === 'A' ? 'bg-green-100 text-green-800' : 
                        product.classification === 'B' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {product.classification}
                    </span>
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

export default ABCCurve;