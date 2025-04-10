import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  LineChart, 
  TrendingUp, 
  DollarSign, 
  Users, 
  ShoppingBag 
} from 'lucide-react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement 
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import DashboardCard from '../components/DashboardCard';
import FilterBar from '../components/FilterBar';
import ExportButton from '../components/ExportButton';
import { salesData, averageTicket, departments } from '../data/mockData';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Vibrant color palette for charts
const chartColors = {
  borders: [
    'rgba(255, 99, 132, 1)',    // Rosa
    'rgba(54, 162, 235, 1)',    // Azul
    'rgba(255, 206, 86, 1)',    // Amarelo
    'rgba(75, 192, 192, 1)',    // Verde água
    'rgba(153, 102, 255, 1)',   // Roxo
    'rgba(255, 159, 64, 1)',    // Laranja
    'rgba(255, 0, 255, 1)',     // Magenta
    'rgba(0, 255, 255, 1)',     // Ciano
    'rgba(128, 0, 0, 1)',       // Marrom
    'rgba(0, 128, 0, 1)',       // Verde escuro
  ],
  backgrounds: [
    'rgba(255, 99, 132, 0.2)',
    'rgba(54, 162, 235, 0.2)',
    'rgba(255, 206, 86, 0.2)',
    'rgba(75, 192, 192, 0.2)',
    'rgba(153, 102, 255, 0.2)',
    'rgba(255, 159, 64, 0.2)',
    'rgba(255, 0, 255, 0.2)',
    'rgba(0, 255, 255, 0.2)',
    'rgba(128, 0, 0, 0.2)',
    'rgba(0, 128, 0, 0.2)',
  ]
};

const Dashboard: React.FC = () => {
  const [filters, setFilters] = useState({
    department: 'all',
    startDate: (() => {
      const date = new Date();
      date.setDate(date.getDate() - 30);
      return date.toISOString().split('T')[0];
    })(),
    endDate: new Date().toISOString().split('T')[0]
  });
  
  const [filteredData, setFilteredData] = useState(salesData);
  const [totalSales, setTotalSales] = useState(0);
  const [salesGrowth, setSalesGrowth] = useState(0);
  const [departmentPerformance, setDepartmentPerformance] = useState<{[key: string]: number}>({});
  
  useEffect(() => {
    // Apply filters
    const filtered = salesData.filter(item => {
      const itemDate = new Date(item.date);
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);
      
      return (
        (filters.department === 'all' || item.department === filters.department) &&
        itemDate >= start &&
        itemDate <= end
      );
    });
    
    setFilteredData(filtered);
    
    // Calculate total sales
    const total = filtered.reduce((sum, item) => sum + item.amount, 0);
    setTotalSales(total);
    
    // Calculate sales growth (comparing with previous period)
    const currentPeriodTotal = total;
    const previousPeriodStart = new Date(filters.startDate);
    const previousPeriodEnd = new Date(filters.endDate);
    const periodDuration = previousPeriodEnd.getTime() - previousPeriodStart.getTime();
    
    previousPeriodStart.setTime(previousPeriodStart.getTime() - periodDuration);
    previousPeriodEnd.setTime(previousPeriodEnd.getTime() - periodDuration);
    
    const previousPeriodData = salesData.filter(item => {
      const itemDate = new Date(item.date);
      return (
        (filters.department === 'all' || item.department === filters.department) &&
        itemDate >= previousPeriodStart &&
        itemDate <= previousPeriodEnd
      );
    });
    
    const previousPeriodTotal = previousPeriodData.reduce((sum, item) => sum + item.amount, 0);
    
    if (previousPeriodTotal > 0) {
      const growth = ((currentPeriodTotal - previousPeriodTotal) / previousPeriodTotal) * 100;
      setSalesGrowth(parseFloat(growth.toFixed(2)));
    } else {
      setSalesGrowth(100);
    }
    
    // Calculate department performance
    const deptPerformance: {[key: string]: number} = {};
    
    filtered.forEach(item => {
      if (!deptPerformance[item.department]) {
        deptPerformance[item.department] = 0;
      }
      deptPerformance[item.department] += item.amount;
    });
    
    setDepartmentPerformance(deptPerformance);
  }, [filters]);
  
  // Prepare data for charts
  const prepareTimeSeriesData = () => {
    const dates = [...new Set(filteredData.map(item => item.date))].sort();
    const datasets = [];
    
    if (filters.department === 'all') {
      // Group by department
      departments.forEach((dept, index) => {
        const deptData = dates.map(date => {
          const dayData = filteredData.filter(
            item => item.date === date && item.department === dept.name
          );
          return dayData.reduce((sum, item) => sum + item.amount, 0);
        });
        
        datasets.push({
          label: dept.name,
          data: deptData,
          borderColor: chartColors.borders[index % chartColors.borders.length],
          backgroundColor: chartColors.backgrounds[index % chartColors.backgrounds.length],
          tension: 0.4,
          fill: true,
        });
      });
    } else {
      // Single department, show daily data
      const deptData = dates.map(date => {
        const dayData = filteredData.filter(
          item => item.date === date && item.department === filters.department
        );
        return dayData.reduce((sum, item) => sum + item.amount, 0);
      });
      
      datasets.push({
        label: filters.department,
        data: deptData,
        borderColor: chartColors.borders[0],
        backgroundColor: chartColors.backgrounds[0],
        tension: 0.4,
        fill: true,
      });
    }
    
    return {
      labels: dates.map(date => {
        const d = new Date(date);
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      }),
      datasets,
    };
  };
  
  const prepareDepartmentData = () => {
    const labels = Object.keys(departmentPerformance);
    const data = labels.map(dept => departmentPerformance[dept]);
    
    return {
      labels,
      datasets: [
        {
          label: 'Vendas por Departamento',
          data,
          backgroundColor: labels.map((_, index) => 
            chartColors.backgrounds[index % chartColors.backgrounds.length]
          ),
          borderColor: labels.map((_, index) => 
            chartColors.borders[index % chartColors.borders.length]
          ),
          borderWidth: 1,
        },
      ],
    };
  };
  
  const preparePieData = () => {
    const labels = Object.keys(departmentPerformance);
    const data = labels.map(dept => departmentPerformance[dept]);
    
    return {
      labels,
      datasets: [
        {
          label: 'Participação nas Vendas',
          data,
          backgroundColor: labels.map((_, index) => 
            chartColors.borders[index % chartColors.borders.length]
          ),
          borderColor: 'white',
          borderWidth: 2,
        },
      ],
    };
  };
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard de Vendas</h1>
        <p className="text-gray-600">Visualize o desempenho do seu supermercado em tempo real</p>
      </div>
      
      <FilterBar onFilterChange={setFilters} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <DashboardCard
          title="Vendas Totais"
          value={`R$ ${totalSales.toLocaleString('pt-BR')}`}
          icon={<DollarSign className="h-6 w-6 text-green-500" />}
          color="border-green-500"
        />
        <DashboardCard
          title="Crescimento"
          value={`${salesGrowth}%`}
          icon={<TrendingUp className="h-6 w-6 text-blue-500" />}
          color="border-blue-500"
        />
        <DashboardCard
          title="Ticket Médio"
          value={`R$ ${averageTicket.toLocaleString('pt-BR')}`}
          icon={<ShoppingBag className="h-6 w-6 text-purple-500" />}
          color="border-purple-500"
        />
        <DashboardCard
          title="Departamentos"
          value={Object.keys(departmentPerformance).length}
          icon={<Users className="h-6 w-6 text-orange-500" />}
          color="border-orange-500"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Vendas no Período</h2>
            <ExportButton 
              data={filteredData} 
              filename="vendas_periodo" 
              type="csv" 
            />
          </div>
          <div className="h-80">
            <Line 
              data={prepareTimeSeriesData()} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Valor (R$)',
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Vendas por Departamento</h2>
            <ExportButton 
              data={Object.entries(departmentPerformance).map(([dept, value]) => ({ 
                departamento: dept, 
                vendas: value 
              }))} 
              filename="vendas_departamento" 
              type="csv" 
            />
          </div>
          <div className="h-80">
            <Bar 
              data={prepareDepartmentData()} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                  title: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Valor (R$)',
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Participação nas Vendas</h2>
          <div className="h-80 flex items-center justify-center">
            <div className="w-3/4 h-full">
              <Pie 
                data={preparePieData()} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Resumo de Desempenho</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Departamento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    % do Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(departmentPerformance)
                  .sort(([, a], [, b]) => b - a)
                  .map(([dept, value], index) => (
                    <tr key={dept}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="h-3 w-3 rounded-full mr-2" style={{
                            backgroundColor: chartColors.borders[index % chartColors.borders.length]
                          }}></span>
                          <span className="text-sm font-medium text-gray-900">{dept}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        R$ {value.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {((value / totalSales) * 100).toFixed(2)}%
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;