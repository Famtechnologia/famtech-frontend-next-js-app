"use client";
import React, { useState } from 'react';
import { Check } from 'lucide-react';
import PlanAndBillingSkeletonLoader from "@/components/layout/skeleton/settings/Billing";
// Define a type for the pricing plan
interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
  isAnnual?: boolean;
}

// Data for the pricing plans
const plans: Plan[] = [
  {
    id: 'basic',
    name: 'Basic Plan',
    price: 0.00,
    features: [
      'Basic weather forecasts',
      'Limited crop management',
      'Access to Community forum',
      'Ad-supported dashboard',
    ],
  },
  {
    id: 'premium',
    name: 'Premium Plan',
    price: 50.00,
    features: [
      'Advanced weather prediction',
      'Unlimited crop & livestock tracking',
      'Real-time market price alerts',
      'Land mapping',
      'Ad-free experience',
      'Farm financial tracking tool',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise Plan',
    price: 150.00,
    features: [
      'Advanced weather prediction',
      'Unlimited crop & livestock tracking',
      'Real-time market price alerts',
      'Land mapping',
      'Ad-free experience',
      'Farm financial tracking tool',
    ],
  },
];

const App: React.FC = () => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>('enterprise');
  const [isLoading, setIsLoading] = useState(true); 
  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId);
  };

  const isCurrentPlan = (planId: string) => selectedPlanId === planId;
  const isSelected = (planId: string) => selectedPlanId === planId;
  
  if (isLoading) {
    return <PlanAndBillingSkeletonLoader />;
  }

  return (
    <div className="min-h-screen bg-gray-100 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-8xl bg-white rounded-lg shadow-md px-4 py-8 md:p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Plan & Billing</h1>
        <p className="text-gray-600 mb-8">
          Choose the plan that best suits your farming needs. You can change the plan at any time.
        </p>

        <h2 className="text-xl font-semibold text-gray-800 mb-6">Select Plan</h2>

        <div className="flex flex-col space-y-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`flex flex-col px-4 py-6 md:p-6 border rounded-xl cursor-pointer transition-colors duration-200 ${
                isSelected(plan.id)
                  ? 'border-green-600 bg-green-50'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
              onClick={() => handleSelectPlan(plan.id)}
            >
              <div className="flex justify-start md:justify-between space-x-2 items-center mb-4">
                <div className="flex items-start space-x-2">
                  <input
                    type="radio"
                    name="plan"
                    checked={isSelected(plan.id)}
                    readOnly
                    className="form-radio h-5 w-5 text-green-600"
                  />
                  <h3 className={`text-lg font-semibold ${isCurrentPlan(plan.id) ? 'text-green-600' : 'text-gray-800'}`}>
                    {plan.name} {isCurrentPlan(plan.id) && <span className="text-sm font-normal text-green-600">(Current Plan)</span>}
                  </h3>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-xl md:text-3xl font-bold text-gray-800">${plan.price.toFixed(2)}</p>
                  {plan.price > 0 && <p className="text-gray-500 text-sm">/ month</p>}
                </div>
              </div>

              <div className="flex-grow">
                <ul className="mt-2 space-y-4 text-sm text-gray-600">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                {plan.price > 0 && (
                  <p className="mt-2 text-sm text-green-600">
                    (Save up to 15% if billed annually)
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end space-x-4">
          <button className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 font-semibold hover:bg-gray-100">
            Cancel
          </button>
          <button className="px-4 md:px-6 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors duration-200">
            Save Plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
