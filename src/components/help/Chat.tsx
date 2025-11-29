// StartChatPage.tsx
import React from 'react';
import Link from 'next/link'
const StartChatPage: React.FC = () => {
  return (
    <>
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        Welcome to FamTech Live — Your Trusted Support for Crops, Livestock & Farm Health
      </h3>
      <p className="text-gray-600 mb-4">
        Get expert help from certified Extension Officers. Ask questions about crop production, livestock care, pest and disease management, and more. Upload photos of your plants or animals for rapid diagnosis, start a real-time chat, or send a voice message for complex issues.
      </p>
      <p className="text-gray-600">
        Whether you&#39;re dealing with wilting leaves, unusual livestock symptoms, or seasonal planning — we&#39;re here to guide you.
      </p>
    </div>
     <div className="bg-white rounded-lg shadow-md mt-4 p-4 md:p-6">
      {/* List of features */}
      <div className="space-y-6">
        {/* Ask Anything */}
        <div className="flex items-start">
          <svg className="w-40 h-10 mr-2 md:w-6 md:h-6 md:mr-4 mt-1 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <div>
            <h4 className="font-semibold text-gray-800">Ask Anything</h4>
            <p className="text-gray-600 text-sm">Have questions about crops, livestock, pest management, or farming techniques? Our certified Extension Officers are here to provide accurate, practical advice tailored to your region.</p>
          </div>
        </div>

        {/* Upload Plant or Animal Photos */}
        <div className="flex items-start">
          <svg className="w-40 h-10 mr-2 md:w-6 md:h-6 md:mr-4 mt-1 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <div>
            <h4 className="font-semibold text-gray-800">Upload Plant or Animal Photos</h4>
            <p className="text-gray-600 text-sm">Experiencing issues with your crops or livestock? Upload clear photos for expert diagnosis of plant diseases, nutrient deficiencies, pest infestations, or livestock symptoms.</p>
          </div>
        </div>

        {/* Instant Chat Support */}
        <div className="flex items-start">
          <svg className="w-40 h-10 mr-2 md:w-6 md:h-6 md:mr-4 mt-1 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16h6m-3-11v.01M12 18h.01" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="font-semibold text-gray-800">Instant Chat Support</h4>
            <p className="text-gray-600 text-sm">Get immediate responses through real-time messaging with our knowledgeable officers. Whether it&#39;s about your seedlings or soil, we&#39;re ready to chat.</p>
          </div>
        </div>

        {/* Voice Message Option */}
        <div className="flex items-start">
          <svg className="w-40 h-10 mr-2 md:w-6 md:h-6 md:mr-4 mt-1 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          <div>
            <h4 className="font-semibold text-gray-800">Voice Message Option</h4>
            <p className="text-gray-600 text-sm">Prefer speaking? Record and send a voice message for complex or detailed questions — perfect for on-the-go farmers or those with limited typing ability.</p>
          </div>
        </div>

        {/* Schedule a Video Consultation */}
        <div className="flex items-start">
          <svg className="w-40 h-10 mr-2 md:w-6 md:h-6 md:mr-4 mt-1 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <div>
            <h4 className="font-semibold text-gray-800">Schedule a Video Consultation</h4>
            <p className="text-gray-600 text-sm">When text and images aren&#39;t enough, book a live video call with an Extension Officer to walk them through your farm in real time.</p>
          </div>
        </div>

        {/* Save All Advice to Your Smart Diary */}
        <div className="flex items-start">
          <svg className="w-40 h-10 mr-2 md:w-6 md:h-6 md:mr-4 mt-1 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h.01M16 14h.01M12 21V11a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V11a2 2 0 00-2-2h-5" />
          </svg>
          <div>
            <h4 className="font-semibold text-gray-800">Save All Advice to Your Smart Diary</h4>
            <p className="text-gray-600 text-sm">Every chat, photo, and solution you receive is automatically saved in your Smart Diary for future reference — organized by topic, date, and crop.</p>
          </div>
        </div>
      </div>

    

      {/* Main Call to Action Section */}
      <div className="mt-8 mb-4 pt-8 border-t border-gray-200 text-center">
        <h3 className="text-2xl font-semibold text-gray-800 mb-2">How can I assist you today?</h3>
        <p className="text-gray-600 mb-6">Start a conversation, upload a photo, or leave a voice message, your farm deserves the best support.</p>
        <Link href="/help/chat" className="px-8 py-3  bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors duration-200">
          Connect with Officer
        </Link>
      </div>
    </div>
  
</>
  );
};

export default StartChatPage;