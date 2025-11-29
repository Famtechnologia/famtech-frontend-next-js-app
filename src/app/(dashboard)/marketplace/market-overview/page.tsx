import React from 'react';
import Overview from '@/components/marketplace/market-overview/overview';
import MarketChart from '@/components/marketplace/market-overview/market-chart';


const MarketOverviewPage = () => {
  return (
    <div className="p-0 md:p-6 bg-white">
      <h1 className="text-3xl font-semibold text-green-700 mb-6">
        Market Overview
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-3">
        <Overview />
        <MarketChart />
      </div>
    </div>
  );
};

export default MarketOverviewPage;