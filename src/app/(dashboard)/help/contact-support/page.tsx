'use client';
import React, { useState } from 'react';
import { Lightbulb, Shield, Briefcase, Mail, Phone, Plus, Minus } from 'lucide-react';
import Image from 'next/image';
const faqs = [
  {
    icon: <Lightbulb className="h-6 w-6 text-gray-600" />,
    title: 'Getting Started',
    description: 'Learn how to set up your account, explore key features and get the most.',
  },
  {
    icon: <Shield className="h-6 w-6 text-gray-600" />,
    title: 'Security & Protection',
    description: 'How to keep your account safe with our advance security measures.',
  },
  {
    icon: <Briefcase className="h-6 w-6 text-gray-600" />,
    title: 'Account & Subscription',
    description: 'How to manage your account, and update your subscription.',
  },
];

const helpTopics = [
  { question: 'How can I upgrade my premium?', answer: 'To upgrade, you will need to go to your settings page, locate the plans and billing section then select a new plan.' },
  { question: 'How can I track my produce?', answer: 'You can track your produce by navigating to the "Harvest" section of your dashboard and logging new harvests. The system will automatically update your inventory.' },
  { question: 'Is it possible to download my financial report?', answer: 'Yes, you can download your financial reports. Go to the "Financials" section and look for the "Export Report" button to download a PDF or CSV file.' },
  { question: 'Can I have multiple users manage my platform?', answer: 'Our Enterprise plan supports multiple users. You can add and manage team members and their roles from the "Team Management" section of your settings.' },
  { question: 'How can I download my overall report?', answer: 'Your overall farm report can be downloaded from the "Reports" section of your dashboard. This report provides a comprehensive overview of your farm\'s performance.' },
];

const HelpAndSupport = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className=" md:p-8  space-y-8 bg-gray-50 min-h-screen">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Help & Support</h1>
        <p className="text-gray-500">Need Help?? Chat with our chatbot.</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
              <div className="flex items-center space-x-2">
                {faq.icon}
                <h3 className="text-lg font-medium text-gray-900">{faq.title}</h3>
              </div>
              <p className="text-sm text-gray-500">{faq.description}</p>
              <a href="#" className="text-sm font-medium text-gray-600 underline hover:text-blue-500">
                Learn more
              </a>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-6 md:p-6 flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-8">
        <div className="flex-1 space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Still Can't Find Answers?</h2>
          <div className="flex items-center space-x-4">
            <Image

              src="/images/help/contact 1.png" // Replace with your image path

              alt="An illustration of two people sitting at a computer with a list of questions and answers."

              width={200}

              height={200}

              className="rounded-lg"

            />
          </div>
          <div className="space-y-2">
            <div className="flex text-sm items-center space-x-2 text-gray-600">
              <Mail className="h-5 w-5" />
              <span>famtechnologia@gmail.com</span>
            </div>
            <div className="flex text-sm items-center space-x-2 text-gray-600">
              <Phone className=" h-4 w-4 md:h-5 md:w-5 " />
              <span>+234 809 697 9032</span>
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-4">
          {helpTopics.map((topic, index) => (
            <div key={index} className="py-2 border-b border-gray-200 flex flex-col">
              <div className="flex justify-between items-center cursor-pointer" onClick={() => handleToggle(index)}>
                <span className="text-sm text-gray-800">{topic.question}</span>
                <button className="text-gray-500 hover:text-gray-900">
                  {openIndex === index ? <Minus className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                </button>
              </div>
              {openIndex === index && (
                <div className="mt-2 text-gray-600 text-xs">
                  {topic.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HelpAndSupport;
