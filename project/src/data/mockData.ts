import { SalesData, Product, DailySales, Department, User } from '../types';

// Mock departments
export const departments: Department[] = [
  { id: '1', name: 'Mercearia' },
  { id: '2', name: 'Hortifruti' },
  { id: '3', name: 'Açougue' },
  { id: '4', name: 'Padaria' },
  { id: '5', name: 'Bebidas' },
  { id: '6', name: 'Limpeza' },
  { id: '7', name: 'Higiene' },
];

// Mock sales data for the last 30 days
export const generateSalesData = (): SalesData[] => {
  const data: SalesData[] = [];
  const now = new Date();
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    departments.forEach(dept => {
      // Random sales amount between 1000 and 10000
      const amount = Math.floor(Math.random() * 9000) + 1000;
      
      data.push({
        date: date.toISOString().split('T')[0],
        amount,
        department: dept.name,
      });
    });
  }
  
  return data;
};

// Mock products for ABC curve
export const generateProductsData = (): Product[] => {
  const products: Product[] = [];
  const productNames = [
    'Arroz', 'Feijão', 'Açúcar', 'Café', 'Óleo', 'Sal', 'Macarrão',
    'Leite', 'Pão', 'Manteiga', 'Queijo', 'Presunto', 'Iogurte',
    'Refrigerante', 'Cerveja', 'Água', 'Suco', 'Vinho',
    'Sabão em pó', 'Detergente', 'Amaciante', 'Papel higiênico',
    'Shampoo', 'Condicionador', 'Sabonete', 'Creme dental',
    'Carne bovina', 'Frango', 'Peixe', 'Frutas', 'Legumes', 'Verduras'
  ];
  
  for (let i = 0; i < productNames.length; i++) {
    const deptIndex = Math.floor(Math.random() * departments.length);
    const sales = Math.floor(Math.random() * 1000) + 100;
    const revenue = sales * (Math.floor(Math.random() * 50) + 10);
    const profit = revenue * (Math.random() * 0.3 + 0.1); // 10-40% profit margin
    
    products.push({
      id: (i + 1).toString(),
      name: productNames[i],
      department: departments[deptIndex].name,
      sales,
      revenue,
      profit,
      contribution: 0, // Will be calculated later
    });
  }
  
  // Sort by revenue (descending)
  products.sort((a, b) => b.revenue - a.revenue);
  
  // Calculate contribution percentage
  const totalRevenue = products.reduce((sum, product) => sum + product.revenue, 0);
  let accumulatedPercentage = 0;
  
  return products.map(product => {
    const contribution = (product.revenue / totalRevenue) * 100;
    accumulatedPercentage += contribution;
    
    return {
      ...product,
      contribution: parseFloat(contribution.toFixed(2)),
    };
  });
};

// Mock daily sales data for the current month
export const generateDailySalesData = (): DailySales[] => {
  const data: DailySales[] = [];
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  let accumulated = 0;
  
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(now.getFullYear(), now.getMonth(), i);
    
    // Only include days up to today
    if (date > now) break;
    
    // Random daily sales between 10000 and 50000
    const total = Math.floor(Math.random() * 40000) + 10000;
    accumulated += total;
    
    data.push({
      date: date.toISOString().split('T')[0],
      total,
      accumulated,
    });
  }
  
  return data;
};

// Mock user data
export const user: User = {
  id: '1',
  name: 'Caio Esteves',
  email: 'caio.gmail.com',
  role: 'Gerente',
};

// Generate all mock data
export const salesData = generateSalesData();
export const productsData = generateProductsData();
export const dailySalesData = generateDailySalesData();

// Calculate average ticket
export const calculateAverageTicket = (): number => {
  const totalSales = salesData.reduce((sum, item) => sum + item.amount, 0);
  // Assume 30-50 customers per day per department
  const totalCustomers = salesData.length * (Math.floor(Math.random() * 20) + 30);
  return parseFloat((totalSales / totalCustomers).toFixed(2));
};

export const averageTicket = calculateAverageTicket();