"use client";
import React from 'react';
import AdviceCard from './AdviceCard';

interface AdviceData {
  id: number;
  farmType: string;
  produce: string;
  location: {
    state: string;
    country: string;
  };
  advice: string;
}

const dummyAdviceData: AdviceData[] = [
  {
    id: 1,
    farmType: 'crop farming',
    produce: 'corn',
    location: {
      state: 'Ogun',
      country: 'Nigeria',
    },
    advice: JSON.stringify({
      title: "A Guide to Growing Corn",
      body: [
        {
          week: 1,
          tasks: [
            { day: "Monday", instruction: "Land Preparation: Clear the land of all weeds and debris. Till the soil to a depth of 8-10 inches to ensure it is loose and well-aerated." },
            { day: "Tuesday", instruction: "Soil Testing: Conduct a soil test to determine the pH and nutrient levels. Corn prefers a pH between 6.0 and 6.8. Amend the soil with lime if the pH is too low or sulfur if it is too high." },
            { day: "Wednesday", instruction: "Seed Selection: Choose a corn variety that is well-suited to your climate and soil type. Consider factors like maturity date, disease resistance, and yield potential." },
            { day: "Thursday", instruction: "Planting: Plant the corn seeds 1.5 to 2 inches deep and 8-12 inches apart in rows that are 30-36 inches apart. Water the seeds thoroughly after planting." },
            { day: "Friday", instruction: "Watering: Water the corn regularly, providing about 1 inch of water per week. Increase watering during dry periods and when the tassels and silks appear." },
          ]
        },
        {
          week: 2,
          tasks: [
            { day: "Monday", instruction: "Fertilizing: Apply a balanced fertilizer (e.g., 10-10-10) about 4 weeks after planting. Side-dress the corn with a nitrogen-rich fertilizer when the plants are about knee-high." },
            { day: "Tuesday", instruction: "Weed Control: Control weeds by cultivating the soil or using herbicides. Weeds compete with the corn for water and nutrients." },
            { day: "Wednesday", instruction: "Pest Control: Monitor for common corn pests like corn earworms and armyworms. Use appropriate insecticides or biological control methods to manage pests." },
            { day: "Thursday", instruction: "Disease Control: Watch for signs of common corn diseases like rust and smut. Apply fungicides as needed and practice crop rotation to prevent disease buildup." },
            { day: "Friday", instruction: "Harvesting: Harvest the corn when the silks have turned brown and the kernels are plump and milky. Check for ripeness by puncturing a kernel with your thumbnail." },
          ]
        },
      ]
    })
  },
  {
    id: 2,
    farmType: 'livestock farming',
    produce: 'hen',
    location: {
      state: 'Kaduna',
      country: 'Nigeria',
    },
    advice: JSON.stringify({
      title: "A Guide to Rearing Hens",
      body: [
        {
          week: 1,
          tasks: [
            { day: "Monday", instruction: "Housing: Provide a clean, dry, and well-ventilated coop for the hens. The coop should have at least 4 square feet of space per hen and should be predator-proof." },
            { day: "Tuesday", instruction: "Bedding: Use a thick layer of absorbent bedding material like pine shavings or straw on the coop floor. Clean and replace the bedding regularly to maintain a healthy environment." },
            { day: "Wednesday", instruction: "Nesting Boxes: Provide one nesting box for every 4-5 hens. The nesting boxes should be clean, dark, and private to encourage egg-laying." },
            { day: "Thursday", instruction: "Roosting Perches: Install roosting perches for the hens to sleep on at night. The perches should be about 2 inches wide and have rounded edges." },
            { day: "Friday", instruction: "Feeders and Waterers: Use feeders and waterers that are designed to keep the feed and water clean and prevent spillage. Clean the feeders and waterers daily." },
          ]
        },
        {
          week: 2,
          tasks: [
            { day: "Monday", instruction: "Feeding: Provide a high-quality layer feed that is specifically formulated for laying hens. The feed should contain about 16-18% protein and be supplemented with calcium." },
            { day: "Tuesday", instruction: "Watering: Provide fresh, clean water at all times. Hens drink about a pint of water a day, and more in hot weather." },
            { day: "Wednesday", instruction: "Supplements: Offer oyster shell or crushed eggshells as a free-choice supplement to provide extra calcium for strong eggshells. Also, provide grit to help the hens grind their food." },
            { day: "Thursday", instruction: "Health Checks: Perform daily health checks on the hens. Look for signs of illness like lethargy, ruffled feathers, and changes in droppings." },
            { day: "Friday", instruction: "Egg Collection: Collect eggs daily to ensure they are clean and fresh. Store the eggs in a cool place." },
          ]
        },
      ]
    })
  }
];

const Advice: React.FC<{ setShowFarmingType: (show: boolean) => void; }> = ({ setShowFarmingType }) => {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Farming Advice</h2>
        <button 
          onClick={() => setShowFarmingType(true)} 
          className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-150"
        >
          New Advice
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dummyAdviceData.map((data) => (
          <AdviceCard
            key={data.id}
            farmType={data.farmType}
            produce={data.produce}
            location={data.location}
            advice={data.advice}
          />
        ))}
      </div>
    </div>
  );
};

export default Advice;