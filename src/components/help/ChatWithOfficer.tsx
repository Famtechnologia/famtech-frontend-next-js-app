// ChatWithOfficerPage.tsx
import React, { useState } from 'react';
import OfficerList from './chatwithofficer/OfficerList';
import DefaultChatView from './chatwithofficer/DefaultChatView';
import OfficerProfile from './chatwithofficer/OfficerProfile1';
import ChatWindow from './chatwithofficer/ChatWindow';
import { Officer } from './chatwithofficer/OfficerProfile1';
// Import from the single source

const ChatWithOfficerPage: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<'default' | 'chat' | 'profile'>('default');
  const [selectedOfficer, setSelectedOfficer] = useState<Officer | null>(null);
  
  const officers: Officer[] = [
    {
      id: 1,
      name: 'Grace Adebayo',
      specialty: 'Crop Science & Pest Management Specialist',
      photo: '/images/help/officer 2.png',
      status: '46 m',
      hasUnread: true,
      location: 'Kaduna North, Nigeria',
      bio: 'An Agricultural Extension Officer specializing in Livestock & Veterinary Services plays a crucial role in supporting farmers, livestock-keepers, and rural communities by providing expert advice, veterinary support, and technical training. Their primary focus is improving animal health, productivity, and sustainable livestock practices through education, diagnostics, disease control, and resource management.',
      responsibilities: {
        health: ['Diagnose and treat common animal diseases.', 'Administer vaccines, dewormers, and medications.', 'Monitor herd/flock health and advise on biosecurity practices.'],
        training: ['Educate farmers on best practices in animal husbandry, feeding, breeding, and housing.', 'Conduct workshops, training sessions, and materials for outreach programs.', 'Promote the adoption of modern livestock management techniques.'],
        vet: ['Conduct field visits to assess animal health and farm conditions.', 'Provide on-the-spot veterinary interventions during disease outbreaks.', 'Assist in implementing government animal health campaigns (e.g., foot-and-mouth disease eradication).'],
        breed: ['Advise on selecting improved breeds.', 'Guide artificial insemination programs.', 'Promote genetic improvement strategies for cattle, goats, poultry, sheep, etc.'],
        nutrition: ['Offer recommendations on cost-effective and nutritious feed formulations.', 'Train farmers on forage conservation, silage making, and proper feed storage.'],
        data: ['Maintain farmer animal health interventions, vaccinations, and disease patterns.', 'Help farmers establish farm logs for production monitoring and business decision-making.'],
        compliance: ['Ensure farms comply with animal welfare, food safety, and veterinary public health regulations.', 'Assist with livestock movement permits and vaccination certifications.'],
        community: ['Act as a liaison between farmers and cooperatives focused on livestock development.', 'Serve as a bridge between government agencies and local communities.', 'Contribute to food security, income generation, and rural empowerment.'],
      },
      contact: {
        email: 'graceadebayo@gmail.com',
        phone: '+2348100466728'
      }
    
    },
    {
      id: 2,
      name: 'Ibrahim Musa',
      specialty: 'Livestock & Veterinary Services',
      photo: '/images/help/officer 1.png',
      status: '1 h',
      hasUnread: true,
      location: 'Kaduna North, Nigeria',
      bio: 'An Agricultural Extension Officer specializing in Livestock & Veterinary Services plays a crucial role in supporting farmers, livestock-keepers, and rural communities by providing expert advice, veterinary support, and technical training. Their primary focus is improving animal health, productivity, and sustainable livestock practices through education, diagnostics, disease control, and resource management.',
      responsibilities: {
        health: ['Diagnose and treat common animal diseases.', 'Administer vaccines, dewormers, and medications.', 'Monitor herd/flock health and advise on biosecurity practices.'],
        training: ['Educate farmers on best practices in animal husbandry, feeding, breeding, and housing.', 'Conduct workshops, training sessions, and materials for outreach programs.', 'Promote the adoption of modern livestock management techniques.'],
        vet: ['Conduct field visits to assess animal health and farm conditions.', 'Provide on-the-spot veterinary interventions during disease outbreaks.', 'Assist in implementing government animal health campaigns (e.g., foot-and-mouth disease eradication).'],
        breed: ['Advise on selecting improved breeds.', 'Guide artificial insemination programs.', 'Promote genetic improvement strategies for cattle, goats, poultry, sheep, etc.'],
        nutrition: ['Offer recommendations on cost-effective and nutritious feed formulations.', 'Train farmers on forage conservation, silage making, and proper feed storage.'],
        data: ['Maintain farmer animal health interventions, vaccinations, and disease patterns.', 'Help farmers establish farm logs for production monitoring and business decision-making.'],
        compliance: ['Ensure farms comply with animal welfare, food safety, and veterinary public health regulations.', 'Assist with livestock movement permits and vaccination certifications.'],
        community: ['Act as a liaison between farmers and cooperatives focused on livestock development.', 'Serve as a bridge between government agencies and local communities.', 'Contribute to food security, income generation, and rural empowerment.'],
      },
      contact: {
        email: 'ibrahimmusa@gmail.com',
        phone: '+2348100466728'
      }
    },
    {
      id: 3,
      name: 'Ngozi Chukwuma',
      specialty: 'Soil Health & Organic Farming',
      photo: '/images/help/officer 3.png',
      status: '22 h',
      hasUnread: true,
      location: 'Kaduna North, Nigeria',
      bio: 'An Agricultural Extension Officer specializing in Livestock & Veterinary Services plays a crucial role in supporting farmers, livestock-keepers, and rural communities by providing expert advice, veterinary support, and technical training. Their primary focus is improving animal health, productivity, and sustainable livestock practices through education, diagnostics, disease control, and resource management.',
      responsibilities: {
        health: ['Diagnose and treat common animal diseases.', 'Administer vaccines, dewormers, and medications.', 'Monitor herd/flock health and advise on biosecurity practices.'],
        training: ['Educate farmers on best practices in animal husbandry, feeding, breeding, and housing.', 'Conduct workshops, training sessions, and materials for outreach programs.', 'Promote the adoption of modern livestock management techniques.'],
        vet: ['Conduct field visits to assess animal health and farm conditions.', 'Provide on-the-spot veterinary interventions during disease outbreaks.', 'Assist in implementing government animal health campaigns (e.g., foot-and-mouth disease eradication).'],
        breed: ['Advise on selecting improved breeds.', 'Guide artificial insemination programs.', 'Promote genetic improvement strategies for cattle, goats, poultry, sheep, etc.'],
        nutrition: ['Offer recommendations on cost-effective and nutritious feed formulations.', 'Train farmers on forage conservation, silage making, and proper feed storage.'],
        data: ['Maintain farmer animal health interventions, vaccinations, and disease patterns.', 'Help farmers establish farm logs for production monitoring and business decision-making.'],
        compliance: ['Ensure farms comply with animal welfare, food safety, and veterinary public health regulations.', 'Assist with livestock movement permits and vaccination certifications.'],
        community: ['Act as a liaison between farmers and cooperatives focused on livestock development.', 'Serve as a bridge between government agencies and local communities.', 'Contribute to food security, income generation, and rural empowerment.'],
      },
      contact: {
        email: 'ngozichukwuma@gmail.com',
        phone: '+2348100466728'
      }
    
    },
  ];

  const handleViewProfileClick = (officer: Officer) => {
    setSelectedOfficer(officer);
    setActiveScreen('profile');
  };

  const handleStartChatClick = (officer: Officer) => {
    setSelectedOfficer(officer);
    setActiveScreen('chat');
  };

  const renderContent = () => {
    switch (activeScreen) {
      case 'default':
        return <DefaultChatView />;
      case 'profile':
        if (!selectedOfficer) return null;
        return <OfficerProfile officer={selectedOfficer} onStartChat={handleStartChatClick} />;
      case 'chat':
        if (!selectedOfficer) return null;
        return <ChatWindow officer={selectedOfficer} />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Your farming concerns deserve expert answers 
        </h3>
        <p className="text-gray-600 mb-4">
          Get real-time support from Certified Extension Officers. <br />
          Ask questions about pests or farm plannings on your next season for practical guidance on crops, livestock, fertilizer use or climate-smart farming and field issues. <br />
          Share photos or voice notes for accurate diagnosis and fast solutions — right from your farm.
          <br />One message at a time! 
        </p>
      </div>
      <div className="lg:flex space-x-2  lg:h-full pt-6">
        {/* Left section: Conversation/Default View (3/5 width) */}
        <div className="w-full lg:w-3/5 rounded-lg flex items-center justify-center">
          {renderContent()}
        </div>

        {/* Right section: Officer List (2/5 width) */}
        <OfficerList 
          officers={officers} 
          onViewProfile={handleViewProfileClick} 
          onStartChat={handleStartChatClick} 
          
        />
      </div>
    </>
  );
};

export default ChatWithOfficerPage;