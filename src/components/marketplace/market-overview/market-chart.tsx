"use client"
import React, { useState, useEffect, useCallback } from "react";
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
import apiClient from "@/lib/api/apiClient"; // Assuming apiClient is configured here

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const MarketChart = () => {
  const [loading, setLoading] = useState(true);
  const [series, setSeries] = useState<{ name: string; data: number[] }[]>([]);
  const [options, setOptions] = useState<ApexOptions>({});
  const [error, setError] = useState<string | null>(null);

  const fetchMarketData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get("/api/market/overview");
      const marketData = response.data;

      if (!marketData || marketData.length === 0) {
        setError("No market data available.");
        return;
      }

      setOptions({
        chart: {
          type: 'area',
          height: '100%',
          width: '100%',
          zoom: {
            enabled: false
          },
          toolbar: {
            show: false
          }
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          curve: 'smooth',
          colors: ['#8884d8']
        },
        fill: {
          type: 'solid',
          opacity: 0.4,
          colors: ['#8884d8']
        },
        xaxis: {
          categories: marketData.map((item: { name: string }) => item.name),
          labels: {
            style: {
              colors: '#6B7280',
            },
          },
        },
        yaxis: {
          labels: {
            style: {
              colors: '#6B7280',
            },
            formatter: function (val) {
              return `${val.toFixed(2)}`;
            }
          }
        },
        grid: {
          borderColor: '#E5E7EB',
          strokeDashArray: 3
        },
        tooltip: {
          enabled: true,
          theme: 'dark',
          x: {
            show: true,
          },
          y: {
            title: {
              formatter: () => 'Price',
            },
          },
        },
      });

      setSeries([{
        name: 'Price',
        data: marketData.map((item: { price: number }) => item.price)
      }]);

    } catch (err) {
      console.error(err);
      setError("Failed to fetch market data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarketData();
  }, [fetchMarketData]);

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="w-full max-w-[700px] min-h-[300px] aspect-[1.618]">
        {loading && <div className="flex items-center justify-center h-full">Loading...</div>}
        {error && <div className="flex items-center justify-center h-full text-red-500">{error}</div>}
        {!loading && !error && typeof window !== 'undefined' && (
          <Chart options={options} series={series} type="area" height="100%" width="100%" />
        )}
      </div>
    </div>
  );
};

export default MarketChart;
