"use client";
import React, { useState } from 'react';
import AdviceModal from './AdviceModal';
import Card from '../ui/Card'; // Assuming the path to your generic Card component
import { ClipboardList } from 'lucide-react'; // Example icon

interface AdviceCardProps {
  farmType: string;
  produce: string;
  location: {
    state: string;
    country: string;
  };
  advice: string;
  id: string;
}

const AdviceCard: React.FC<AdviceCardProps> = ({ farmType, produce, location, advice, id }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <Card title="Farming Plan" className="hover:border-green-500 transition-all duration-300">
        <div className="flex flex-col items-start p-4">
          <div className="flex items-center mb-4">
            <ClipboardList className="w-8 h-8 text-green-600 mr-4" />
            <div>
              <p className="text-gray-600">Type: <span className="font-semibold">{farmType}</span></p>
              <p className="text-gray-600">Produce: <span className="font-semibold">{produce}</span></p>
              <p className="text-gray-600">Location: <span className="font-semibold">{location.state}, {location.country}</span></p>
            </div>
          </div>
          <button 
            onClick={openModal} 
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-150 mt-4"
          >
            View Advice
          </button>
        </div>
      </Card>
      {isModalOpen && <AdviceModal id={id} advice={advice} onClose={closeModal} />}
    </>
  );
};

export default AdviceCard;