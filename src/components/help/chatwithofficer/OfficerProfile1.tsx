// OfficerProfile.tsx
import React from 'react';
import Image from 'next/image';


interface OfficerProfileProps {
  officer: Officer;
  onStartChat: (officer: Officer) => void;
}


export interface Officer {
  id: number;
  name: string;
  specialty: string;
  photo: string;
  status: string;
  hasUnread?: boolean;
  location?: string;
  bio?: string;
  responsibilities?: { [key: string]: string[] };
  contact?: { email: string; phone: string };
  
}
const OfficerProfile: React.FC<OfficerProfileProps> = ({ officer, onStartChat }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 h-full overflow-y-auto">
      <div className="flex flex-col items-center mb-6 text-center">
        <div className="relative w-40 h-40 rounded-base overflow-hidden mb-4 border-2 border-gray-200">
          <Image src={officer.photo} alt={officer.name} layout="fill" objectFit="cover" />
        </div>
        <div className="flex items-center space-x-2">
          <h3 className="text-2xl font-semibold text-gray-800">{officer.name}</h3>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-green-500">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="currentColor" />
          </svg>
        </div>
        <p className="text-gray-500">{officer.specialty}</p>
        <div className="flex items-center space-x-2 text-gray-500 mt-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <span className="text-sm">{officer.location}</span>
        </div>
      </div>
      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={() => onStartChat(officer)}
          className="flex items-center px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
        >
          Message
        </button>
        <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
      </div>
      
      {/* Bio and Responsibilities Sections */}
      {officer.bio && (
        <div className="p-4 border-t border-b border-gray-200 mb-6">
          <h4 className="font-semibold text-gray-800">About {officer.name}</h4>
          <p className="text-sm text-gray-600 mt-2">{officer.bio}</p>
        </div>
      )}
      
      {officer.responsibilities && (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800">Key Responsibilities:</h4>
          {Object.entries(officer.responsibilities).map(([key, value]) => (
            <div key={key}>
              <h5 className="font-medium text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}</h5>
              <ul className="list-disc list-inside text-sm text-gray-600 pl-4">
                {(value as string[]).map((item, index) => <li key={index}>{item}</li>)}
              </ul>
            </div>
          ))}
        </div>
      )}
      
      {/* Contact Section */}
      {officer.contact && (
        <div className="mt-6 border-t border-gray-200 pt-6">
          <div className="flex items-center space-x-3 mb-2">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-gray-600">{officer.contact.email}</p>
          </div>
          <div className="flex items-center space-x-3">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <p className="text-sm text-gray-600">{officer.contact.phone}</p>
          </div>
        </div>
      )}
      
      <div className="mt-6 border-t border-gray-200 pt-6">
        <p className="text-sm text-gray-500">Response Rate: 100%</p>
        <p className="text-sm text-gray-500">Responds Within: 24hrs</p>
      </div>
    </div>
  );
};

export default OfficerProfile;