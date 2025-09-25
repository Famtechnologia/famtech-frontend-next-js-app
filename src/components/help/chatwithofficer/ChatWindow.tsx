// ChatWindow.tsx
import React from 'react';
import Image from 'next/image';

interface Officer {
  name: string;
  photo: string;
}

interface ChatWindowProps {
  officer: Officer;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ officer }) => {
  return (
    <div className="flex flex-col h-full bg-white rounded-lg w-full shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="relative">
            <Image src={officer.photo} alt={officer.name} width={40} height={40} className="w-10 h-10 rounded-full object-cover" />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-yellow-400 rounded-full ring-2 ring-white"></span>
          </div>
          <div className="ml-3">
            <h4 className="font-semibold text-gray-800">{officer.name}</h4>
            <p className="text-sm text-gray-500">Offline</p>
          </div>
        </div>
        <div className="flex space-x-4">
          <button><svg className="w-6 h-6 text-gray-500 hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></button>
          <button> </button>
        </div>
      </div>
      {/* Messages Body (Simplified for this example) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* User Message */}
        <div className="flex items-start space-x-3">
          <Image src="/images/help/officer 1.png" alt="John Farmer" width={32} height={32} className="w-8 h-8 rounded-full object-cover" />
          <div className="flex flex-col">
            <div className="bg-blue-500 text-white p-3 rounded-lg max-w-sm">
              <p>Good morning sir. Everything is okay but I&#39;m worried about my soil. My crops aren&#39;t growing well.</p>
            </div>
            <p className="text-xs text-gray-500 mt-1">09:22</p>
          </div>
        </div>
        
        {/* Officer Reply */}
        <div className="flex items-start justify-end space-x-3">
          <div className="flex flex-col items-end">
            <div className="bg-gray-200 text-gray-800 p-3 rounded-lg max-w-sm">
              <p>I see, let&#39;s look into that. When last did you test your soil?</p>
            </div>
            <p className="text-xs text-gray-500 mt-1">09:22</p>
          </div>
          <Image src={officer.photo} alt={officer.name} width={32} height={32} className="w-8 h-8 rounded-full object-cover" />
        </div>
        
        {/* User with Image */}
        <div className="flex items-start space-x-3">
          <Image src="/images/help/officer 2.png" alt="John Farmer" width={32} height={32} className="w-8 h-8 rounded-full object-cover" />
          <div className="flex flex-col">
            <div className="bg-blue-500 text-white p-3 rounded-lg max-w-sm">
              <p>I can relate, I guess it was last 3months.</p>
              <p className="mt-2">This is what my soil texture looks like, please can you read it?</p>
              <Image src="/images/help/farm.png" alt="Soil Texture" width={400} height={300} className="mt-2 rounded-lg" />
            </div>
            <p className="text-xs text-gray-500 mt-1">09:40</p>
          </div>
        </div>
        
        {/* User with Audio */}
        <div className="flex items-start space-x-3">
          <Image src="/images/help/officer 3.png" alt="John Farmer" width={32} height={32} className="w-8 h-8 rounded-full object-cover" />
          <div className="flex flex-col">
            <div className="bg-blue-500 text-white p-3 rounded-lg max-w-sm flex items-center">
              <button className="mr-2"><svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg></button>
              <div className="w-48 h-2 bg-blue-300 rounded-full"></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">09:55</p>
          </div>
        </div>
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <button><svg className="w-6 h-6 text-gray-500 hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></button>
          <button><svg className="w-6 h-6 text-gray-500 hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg></button>
          <input type="text" placeholder="Type message" className="flex-1 py-2 px-4 rounded-full bg-gray-100 focus:outline-none" />
          <button><svg className="w-6 h-6 text-gray-500 hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg></button>
          <button className="p-2 bg-green-500 text-white rounded-full"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg></button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;