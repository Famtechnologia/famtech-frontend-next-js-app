"use client";
import React, { useState } from "react";
import Modal from "../ui/Modal"; // Assuming the path to your generic Modal component
//import { deleteAdvice } from "@/lib/services/advisory";
//import { toast } from "react-hot-toast";
//import { useRouter } from "next/navigation";

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

const AdviceModal: React.FC<AdviceModalProps> = ({ advice, onClose}) => {
const [showModal] = useState(true);
//const router = useRouter();
  const parseAdvice = (adviceString: string) => {
    try {
      const adviceJson: AdviceFormat = JSON.parse(adviceString);
      return (
        <div>
          {adviceJson.body.map((weeklyData) => (
            <div key={weeklyData.week} className="mb-6">
              <h3 className="text-xl font-semibold text-green-700 mb-3">
                Week {weeklyData.week}
              </h3>
              <ul className="space-y-2">
                {weeklyData.tasks.map((task, index) => (
                  <li
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-[100px,1fr] gap-2 border border-gray-200 rounded-md p-2"
                  >
                    <span className="font-semibold text-gray-700">
                      {task.day}:
                    </span>
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
      console.log(error);
      return "Farming Advice";
    }
  };

  //const handleDelete = async () => {
  //  try {
  //    const isDelete = await deleteAdvice(id);

    //  if (!isDelete) {
  //      toast.success(isDelete?.message);
    //  }

   //   toast.success(isDelete?.message);
   //   setShowModal(false);

   //   router.refresh();
   // } catch (error) {
    //  console.error("Advice failed:", error);
    //  const errorMessage =
    //    error instanceof Error ? error.message : "Advice Generation Failed";
    //  toast.error(errorMessage);
   // }
 // };

  return (
    <Modal show={showModal} onClose={onClose} title={getTitle(advice)}>
      {parseAdvice(advice)}
     {/*<button
        onClick={handleDelete}
        className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-150 float-right mb-4"
      >
        Delete
      </button>*/}
    </Modal>
  );
};

export default AdviceModal;
