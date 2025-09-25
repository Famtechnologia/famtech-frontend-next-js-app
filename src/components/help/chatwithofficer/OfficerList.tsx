// OfficerList.tsx
import React from 'react';
import Image from 'next/image';

interface Officer {
  id: number;
  name: string;
  specialty: string;
  photo: string;
  status: string;
  hasUnread?: boolean;
}

interface OfficerListProps {
  officers: Officer[];
  onViewProfile: (officer: Officer) => void;
  onStartChat: (officer: Officer) => void;
}

const OfficerList: React.FC<OfficerListProps> = ({ officers, onViewProfile, onStartChat }) => {
  return (
    <div className="w-full lg:w-2/5 bg-white rounded-lg shadow-md p-2 md:p-6 overflow-y-auto">
      {/* Search Bar */}
      <div className="mb-6 relative">
        <input
          type="text"
          placeholder="Search Officer..."
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Officers List */}
      <div className="space-y-4">
        {officers.map(officer => (
          <div key={officer.id} className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center mb-4">
              <Image src={officer.photo} alt={officer.name} width={64} height={64} className="w-16 h-16 rounded-base object-cover mr-4" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{officer.name}</h3>
                <p className="text-sm text-gray-500">{officer.specialty}</p>
              </div>
              <div className="relative">
                <span className="text-gray-400 text-sm">{officer.status}</span>
                {officer.hasUnread && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => onViewProfile(officer)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
              >
                View Profile
              </button>
              <button 
                onClick={() => onStartChat(officer)}
                className="flex-1 px-4 py-2 border bg-green-500 rounded-lg text-white font-medium hover:bg-green-500 transition-colors"
              >
                Start Chat
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OfficerList;