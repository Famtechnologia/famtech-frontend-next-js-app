import React from 'react';
import {
  Pencil,
  Bell,
  Shield,
  Briefcase,
  Layers,
  PencilRuler
} from 'lucide-react';
import Link from 'next/link';
const settingsSections = [
  {
    title: 'Farm Information',
    items: [
      {
        icon: <Layers className="h-6 w-6 text-green-600" />,
        label: 'Farm Profile',
        description: 'Edit information about the farm',
        action: 'Edit',
        href: '/settings/farm-profile',   // 👈 add link here
      },
      {
        icon: <PencilRuler className="h-6 w-6 text-blue-600" />,
        label: 'Land Mapping',
        description:
          'Re-map farming area to get accurate data on farm produce and livestock',
        action: 'Re-map',
        href: '/settings/land-mapping',   // 👈 add link here
      },
    ],
  },
  {
    title: 'General Setting',
    items: [
      {
        icon: <Pencil className="h-6 w-6 text-green-600" />,
        label: 'Edit Profile',
        description: 'Change personal information',
        action: 'Edit',
        href: '/settings/edit-profile',
      },
      {
        icon: <Bell className="h-6 w-6 text-blue-600" />,
        label: 'Alarm Notification',
        description: 'Set customized alarm notification',
        action: 'Edit',
        href: '/settings/notifications',
      },
      {
        icon: <Shield className="h-6 w-6 text-blue-600" />,
        label: 'Security',
        description: 'Set two-factor verification to keep your account secure',
        action: 'Edit',
        href: '/settings/security',
      },
    ],
  },
  {
    title: 'Plan & Billing',
    items: [
      {
        icon: <Briefcase className="h-6 w-6 text-blue-600" />,
        label: 'Enterprise Plan - $150 (Current plan)',
        description: 'Customizable and scalable solutions for enterprises',
        action: 'Change Plan',
        href: '/settings/billing', // 👈
      },
    ],
  },
];


const Settings: React.FC = () => {
  return (
    <div className="md:p-8 space-y-8 bg-gray-50 min-h-screen">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Personalize your account</p>
      </div>

      {settingsSections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">{section.title}</h2>
          </div>
          <div className="px-2 py-4 md:p-6 space-y-4">
            {section.items.map((item, itemIndex) => (
              <div
                key={itemIndex}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-start justify-start space-x-4">
                  <div className="p-2 rounded-full text-blue-600">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-base md:text-lg font-medium text-gray-800">{item.label}</p>
                    <p className="text-gray-600 text-sm md:text-base">{item.description}</p>
                  </div>
                </div>
                <Link
                  href={item.href} // use the href from the item
                  className="px-4 py-2 text-sm font-medium text-gray-600 rounded-xl hover:bg-gray-200 focus:outline-none bg-gray-100"
                >
                  {item.action}
                </Link>

              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Settings;
