import React from 'react';

const App = () => {
  const SmartDiaryPage = () => {
    return (
      <div className="p-0 lg:p-4 bg-gray-100 min-h-screen font-sans">
        {/* Purpose Section */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Purpose of a Smart Diary
          </h3>
          <p className="text-gray-600">
            This is a transformational module that enhances agricultural service delivery by digitizing
            record-keeping and improving communication between officers, farmers, and government bodies.
            It boosts accountability, improves planning with recommendations, and allows
            faster decision-making for both routine care and emergency interventions in agriculture.
          </p>
        </div>
        
        {/* Main Content Sections */}
        <div className="flex flex-col md:flex-row md:space-x-3 lg:space-x-6 mt-4">
          {/* Left section: Smart Diary - Saved Advice */}
          <div className="w-full md:w-3/5 mb-4 md:mb-0">
            <div className="bg-white rounded-lg shadow-md p-6 h-full flex flex-col">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Smart Diary - Saved Advice</h2>
                <div className="flex space-x-2 mt-2 sm:mt-0">
                  <button className="flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors">
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Share
                  </button>
                  <button className="flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors">
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0L8 12m4 4V4" />
                    </svg>
                    Export
                  </button>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-6">Your personalized collection of agricultural advice and recommendations.</p>

              <div className="space-y-6">
                {/* Cattle Advice */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">🐄</span>
                      <div>
                        <h3 className="font-semibold text-gray-800">Cattle</h3>
                        <p className="text-sm text-gray-500">June 18, 2025 - 08:00 AM</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">Nutrition Plan</span>
                  </div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Advice:</p>
                  <p className="text-sm text-gray-600">Increase protein content to 16% during lactation period. Add mineral supplements containing zinc and copper</p>
                  <p className="text-sm font-medium text-gray-700 mt-2 mb-1">Reminder:</p>
                  <p className="text-sm text-gray-600">Observe or inspect your animal to see development</p>
                </div>

                {/* Wheat Advice */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">🌿</span>
                      <div>
                        <h3 className="font-semibold text-gray-800">Wheat</h3>
                        <p className="text-sm text-gray-500">June 19, 2025 - 08:00 AM</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">Harvest Timing</span>
                  </div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Advice:</p>
                  <p className="text-sm text-gray-600">Monitor moisture content - harvest when grain moisture is between 12-14% for optimal storage</p>
                  <p className="text-sm font-medium text-gray-700 mt-2 mb-1">Reminder:</p>
                  <p className="text-sm text-gray-600">Check fields daily starting June 28th</p>
                </div>

                {/* Tomato Advice */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">🍅</span>
                      <div>
                        <h3 className="font-semibold text-gray-800">Tomato</h3>
                        <p className="text-sm text-gray-500">June 20, 2025 - 08:00 AM</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full">Blight Prevention</span>
                  </div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Advice:</p>
                  <p className="text-sm text-gray-600">Apply copper-based fungicide every 7-10 days during humid conditions. Ensure proper spacing between plants for air circulation.</p>
                  <p className="text-sm font-medium text-gray-700 mt-2 mb-1">Follow-up:</p>
                  <p className="text-sm text-gray-600">Video call scheduled for June 25th</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right section: Smart Farming Tips */}
          <div className="w-full md:w-2/5">
            <div className="bg-white rounded-lg shadow-md p-3 pt-6 pb-6 md:p-6 h-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Smart Farming Tips</h3>
                <span className="px-3 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">recommendations</span>
              </div>
              <p className="text-gray-600 text-sm mb-6">Never miss a task - get notified about farm events, treatments, and field visits.</p>

              <div className="space-y-6">
                {/* Tip 1 */}
                <div className="flex items-start">
                  <svg className="w-10 md:w-5 h-5 mr-3 mt-1 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="font-medium text-gray-800">Monitor Weather with Digital Tools</h4>
                    <ul className="list-disc list-inside text-gray-600 text-sm pl-4 mt-2">
                      <li>Plan planting, irrigation, and harvesting around the forecast</li>
                      <li>Avoid rain during fertilizer or chemical application</li>
                    </ul>
                    <p className="text-sm text-gray-500 italic mt-2">&#34;Let weather guide your farm calendar.&#34;</p>
                  </div>
                </div>
                
                {/* Tip 2 */}
                <div className="flex items-start">
                  <svg className="w-10 md:w-5 mr-3 mt-1 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="font-medium text-gray-800">Adopt Precision Farming Techniques</h4>
                    <ul className="list-disc list-inside text-gray-600 text-sm pl-4 mt-2">
                      <li>Apply fertilizers or seeds only where needed.</li>
                      <li>Reduce waste and increase yield.</li>
                      <li>Install soil moisture sensors to water crops only when required.</li>
                    </ul>
                    <p className="text-sm text-gray-500 italic mt-2">&#34;Farm smarter, not harder.&#34;</p>
                  </div>
                </div>

                {/* Tip 3 */}
                <div className="flex items-start">
                  <svg className="w-10 md:w-5 mr-3 mt-1 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="font-medium text-gray-800">Automate Irrigation</h4>
                    <ul className="list-disc list-inside text-gray-600 text-sm pl-4 mt-2">
                      <li>Use timers or moisture sensors to: Irriate crops automatically.</li>
                      <li>Prevent overwatering and reduce water bills.</li>
                    </ul>
                    <p className="text-sm text-gray-500 italic mt-2">&#34;Smart water = smart yields.&#34;</p>
                  </div>
                </div>

                {/* Tip 4 (The last tip in the image) */}
                <div className="flex items-start">
                  <svg className="w-10 md:w-5 mr-3 mt-1 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="font-medium text-gray-800">Use Certified Inputs</h4>
                    <ul className="list-disc list-inside text-gray-600 text-sm pl-4 mt-2">
                      <li>Buy from certified seed sellers and digital agro-dealers.</li>
                      <li>Use barcode or QR code apps to verify authenticity.</li>
                    </ul>
                    <p className="text-sm text-gray-500 italic mt-2">&#34;Good seeds = good harvest.&#34;</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return <SmartDiaryPage />;
};

export default App;
