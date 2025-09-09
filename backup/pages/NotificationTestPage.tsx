import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetProductsQuery } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { CreditCard, DollarSign, Smartphone, Shield, ArrowRight, Activity } from 'lucide-react';

const NotificationTestPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: products = [], isLoading, error } = useGetProductsQuery();

  const getProductIcon = (iconName: string) => {
    switch (iconName) {
      case 'CreditCard':
        return CreditCard;
      case 'DollarSign':
        return DollarSign;
      case 'Smartphone':
        return Smartphone;
      case 'Shield':
        return Shield;
      default:
        return Activity;
    }
  };

  const handleProductClick = (product: any) => {
    navigate(`/tests/execute?product=${encodeURIComponent(product.name)}&productId=${product.id}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">Failed to load products</div>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-700 dark:text-white">
            Notification Testing
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Select a product to run notification tests
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => {
          const IconComponent = getProductIcon(product.icon);
          
          return (
            <Card 
              key={product.id} 
              className="p-6 hover:shadow-xl transition-all duration-300 cursor-pointer bg-white hover:bg-gradient-to-br hover:from-white hover:to-gray-50 border-l-4 border-l-primary-500"
              onClick={() => handleProductClick(product)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                    <IconComponent className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-700 dark:text-white text-lg">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {product.description}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  product.status === 'active' 
                    ? 'bg-accent-100 text-accent-800 dark:bg-accent-900 dark:text-accent-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                }`}>
                  {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Available Alerts:</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {product.alertCount}
                  </span>
                </div>
                
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Click to run tests
                    </span>
                    <ArrowRight className="h-4 w-4 text-primary-400" />
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
            <Activity className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No products available
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Products will appear here when they are configured for testing
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationTestPage;