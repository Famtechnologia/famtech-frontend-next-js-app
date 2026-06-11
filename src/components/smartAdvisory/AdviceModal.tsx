"use client";
import React, { useState } from "react";
import Modal from "../ui/Modal";

interface AdviceModalProps {
  advice: string;
  onClose: () => void;
  id: string;
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
  const [showModal] = useState(true);

  const parseAdvice = (adviceString: string) => {
    try {
      const adviceJson: AdviceFormat = JSON.parse(adviceString);
      return (
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
          {adviceJson.body.map((weeklyData) => (
            <div key={weeklyData.week} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                Week {weeklyData.week}
              </h3>
              
              <ul className="space-y-3">
                {weeklyData.tasks.map((task, index) => (
                  <li
                    key={index}
                    className="p-3.5 bg-slate-50/50 rounded-xl border border-slate-100/50 flex flex-col md:flex-row md:items-start gap-3 hover:bg-slate-50 transition-colors"
                  >
                    <span className="inline-flex px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100/35 rounded-lg uppercase tracking-wider shrink-0 mt-0.5 self-start">
                      {task.day}
                    </span>
                    <span className="text-slate-700 text-xs md:text-sm font-medium leading-relaxed">
                      {task.instruction}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );
    } catch (error) {
      console.error("Failed to parse advice JSON:", error);
      return <p className="text-slate-600 text-sm">{advice}</p>;
    }
  };

  const getTitle = (adviceString: string) => {
    try {
      const adviceJson: AdviceFormat = JSON.parse(adviceString);
      return adviceJson.title;
    } catch (error) {
      console.log(error);
      return "Farming Advice";
    }
  };

  return (
    <Modal show={showModal} onClose={onClose} title={getTitle(advice)}>
      {parseAdvice(advice)}
    </Modal>
  );
};

export default AdviceModal;
