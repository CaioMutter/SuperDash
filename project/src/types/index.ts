export interface SalesData {
  date: string;
  amount: number;
  department: string;
}

export interface Product {
  id: string;
  name: string;
  department: string;
  sales: number;
  revenue: number;
  profit: number;
  contribution: number;
}

export interface DailySales {
  date: string;
  total: number;
  accumulated: number;
}

export interface Department {
  id: string;
  name: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}