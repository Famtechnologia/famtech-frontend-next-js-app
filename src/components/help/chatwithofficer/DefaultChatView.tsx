// DefaultChatView.tsx
import React from 'react';
import Image from 'next/image';

const DefaultChatView: React.FC = () => {
  return (
    <div className="flex flex-col items-center space-y-4 max-w-xl p-6">
      <h3 className="text-center font-semibold text-xl md:text-2xl text-slate-800 dark:text-[#e6edf3]">Your conversation will be displayed here!</h3>
      <p className="text-center text-gray-700 dark:text-[#8b949e] text-sm md:text-base">Start a conversation with our Agricultural Certified Extension Officer by choosing a person from the left panel to begin.</p>
      <div className="w-80 h-48 rounded-full flex items-center justify-center">
        <Image
          src='/images/help/conversation.png'
          width={200}
          alt='conversation illustration'
          height={200}
          className='text-center'
        />
      </div>
    </div>
  );
};

export default DefaultChatView;