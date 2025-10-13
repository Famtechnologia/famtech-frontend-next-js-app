"use client";
import React from 'react';
import Modal from '../ui/Modal'; // Assuming the path to your generic Modal component

interface AdviceModalProps {
  advice: string;
  onClose: () => void;
}

interface AdviceFormat {
  title: string;
  body: {
    week: number;
    tasks: {
      day: string;
      instruction: string;
    }[];
  }[];
}

const AdviceModal: React.FC<AdviceModalProps> = ({ advice, onClose }) => {
  const parseAdvice = (adviceString: string) => {
    try {
      const adviceJson: AdviceFormat = JSON.parse(adviceString);
      return (
        <div>
          {adviceJson.body.map((weeklyData) => (
            <div key={weeklyData.week} className="mb-6">
              <h3 className="text-xl font-semibold text-green-700 mb-3">Week {weeklyData.week}</h3>
              <ul className="space-y-2">
                {weeklyData.tasks.map((task, index) => (
                  <li key={index} className="grid grid-cols-1 md:grid-cols-[100px,1fr] gap-2 border border-gray-200 rounded-md p-2">
                    <span className="font-semibold text-gray-700">{task.day}:</span>
                    <span className="text-gray-600">{task.instruction}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );
    } catch (error) {
      console.error("Failed to parse advice JSON:", error);
      // Fallback for non-JSON advice
      return <p className="text-gray-600">{advice}</p>;
    }
  };

  const getTitle = (adviceString: string) => {
    try {
      const adviceJson: AdviceFormat = JSON.parse(adviceString);
      return adviceJson.title;
    } catch (error) {
      return "Farming Advice";
    }
  };

  return (
    <Modal show={true} onClose={onClose} title={getTitle(advice)}>
      {parseAdvice(advice)}
    </Modal>
  );
};

export default AdviceModal;
