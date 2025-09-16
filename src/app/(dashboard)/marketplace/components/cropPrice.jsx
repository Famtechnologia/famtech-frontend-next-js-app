// Market Prices Card
import {  TrendingUp, TrendingDown, } from 'lucide-react';
import Card from '@/components/ui/Card'

const MarketPrices = () => {
  const prices = [
    { crop: "Maize", price: "$35.00", market: "Nairobi", trend: "up" },
    { crop: "Tomatoes", price: "$65.50", market: "Kisumu", trend: "down" },
    { crop: "Potatoes", price: "$45.25", market: "Nakuru", trend: "up" }
  ];

  return (
    <Card title="Market Prices" className="h-fit" headerClassName='bg-blue-50'>
      <div className="space-y-3">
        <div className="grid grid-cols-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
          <div>Crop</div>
          <div>Price/Kg</div>
          <div>Market</div>
        </div>
        
        {prices.map((item, index) => (
          <div key={index} className="grid grid-cols-3 items-center py-2 border-b border-gray-100 last:border-b-0">
            <div className="text-sm font-medium text-gray-800">{item.crop}</div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">{item.price}</span>
              {item.trend === "up" ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
            </div>
            <div className="text-sm text-gray-600">{item.market}</div>
          </div>
        ))}
        
        <button className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center pt-2">
          View all prices →
        </button>
      </div>
    </Card>
  );
};

export default MarketPrices;