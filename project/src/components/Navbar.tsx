import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ShoppingCart, LogOut } from 'lucide-react';
import { user } from '../data/mockData';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-blue-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <ShoppingCart className="h-8 w-8 mr-2" />
              <span className="font-bold text-xl">SuperDash</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="px-3 py-2 rounded-md hover:bg-blue-600">Dashboard</Link>
            <Link to="/abc" className="px-3 py-2 rounded-md hover:bg-blue-600">Curva ABC</Link>
            <Link to="/margin" className="px-3 py-2 rounded-md hover:bg-blue-600">Contribuição Marginal</Link>
            <Link to="/daily" className="px-3 py-2 rounded-md hover:bg-blue-600">Vendas Diárias</Link>
            
            <div className="ml-4 flex items-center">
              <span className="mr-2">{user.name}</span>
              <button className="p-1 rounded-full hover:bg-blue-600">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md hover:bg-blue-600 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link 
              to="/" 
              className="block px-3 py-2 rounded-md hover:bg-blue-600"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
            <Link 
              to="/abc" 
              className="block px-3 py-2 rounded-md hover:bg-blue-600"
              onClick={() => setIsOpen(false)}
            >
              Curva ABC
            </Link>
            <Link 
              to="/margin" 
              className="block px-3 py-2 rounded-md hover:bg-blue-600"
              onClick={() => setIsOpen(false)}
            >
              Contribuição Marginal
            </Link>
            <Link 
              to="/daily" 
              className="block px-3 py-2 rounded-md hover:bg-blue-600"
              onClick={() => setIsOpen(false)}
            >
              Vendas Diárias
            </Link>
            
            <div className="pt-4 pb-3 border-t border-blue-600">
              <div className="flex items-center px-3">
                <div className="ml-3">
                  <div className="text-base font-medium">{user.name}</div>
                  <div className="text-sm font-medium text-blue-200">{user.email}</div>
                </div>
              </div>
              <div className="mt-3 px-2">
                <button className="flex items-center px-3 py-2 rounded-md text-base font-medium hover:bg-blue-600 w-full">
                  <LogOut className="h-5 w-5 mr-2" />
                  Sair
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;