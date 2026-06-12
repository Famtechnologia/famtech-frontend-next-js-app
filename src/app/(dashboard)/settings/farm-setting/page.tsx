'use client';
import React, { useState, useEffect } from 'react';
import {
    Pencil,
    Bell,
    Shield,
    Briefcase,
    Layers,
    PencilRuler,
    ArrowRight,
    Settings as SettingsIcon
} from 'lucide-react';
import Link from 'next/link';
import SettingsNavigationSkeleton from '@/components/skeleton/settings/FarmSetting'; 

const settingsSections = [
    {
        title: 'Farm Information',
        items: [
            {
                icon: <Layers className="h-5 w-5 text-emerald-600" />,
                label: 'Farm Profile',
                description: 'Edit information, timezone, language, and primary crop layouts',
                action: 'Edit Details',
                href: '/settings/edit-farm-profile',
                bg: 'bg-emerald-50/50 hover:bg-emerald-50'
            },
            {
                icon: <PencilRuler className="h-5 w-5 text-blue-600" />,
                label: 'Land Mapping',
                description: 'Re-map farming area to get accurate data on farm produce and livestock',
                action: 'Re-map Area',
                href: '#',
                bg: 'bg-blue-50/50 hover:bg-blue-50'
            },
        ],
    },
    {
        title: 'Security & Preferences',
        items: [
            {
                icon: <Pencil className="h-5 w-5 text-indigo-600" />,
                label: 'Edit Profile',
                description: 'Change personal information and owner credentials',
                action: 'Edit Profile',
                href: '/settings/edit-farm-profile',
                bg: 'bg-indigo-50/50 hover:bg-indigo-50'
            },
            {
                icon: <Bell className="h-5 w-5 text-amber-600" />,
                label: 'Alarm Notification',
                description: 'Set customized alarm notifications for critical updates',
                action: 'Configure',
                href: '#',
                bg: 'bg-amber-50/50 hover:bg-amber-50'
            },
            {
                icon: <Shield className="h-5 w-5 text-rose-600" />,
                label: 'Security',
                description: 'Set two-factor verification to keep your account secure',
                action: 'Set 2FA',
                href: '#',
                bg: 'bg-rose-50/50 hover:bg-rose-50'
            },
        ],
    },
    {
        title: 'Plan & Billing',
        items: [
            {
                icon: <Briefcase className="h-5 w-5 text-violet-600" />,
                label: 'Enterprise Plan - $150',
                description: 'Customizable and scalable solutions for enterprise farms (Current plan)',
                action: 'Change Plan',
                href: '/settings/billing',
                bg: 'bg-violet-50/50 hover:bg-violet-50'
            },
        ],
    },
];

const Settings: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true); 

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false); 
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return <SettingsNavigationSkeleton />;
    }
    
    return (
        <div className="md:p-8 space-y-8 bg-slate-50/50 min-h-screen">
            <div className="space-y-1">
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                    <SettingsIcon className="h-6 w-6 text-emerald-600 animate-spin-slow" /> Settings Panel
                </h1>
                <p className="text-sm font-medium text-slate-400">Configure operational parameters and account details</p>
            </div>

            {settingsSections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="space-y-4">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider pl-1">{section.title}</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {section.items.map((item, itemIndex) => (
                            <div
                                key={itemIndex}
                                className={`group p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-100/50 transition-all duration-300 flex flex-col justify-between`}
                            >
                                <div className="space-y-4">
                                    <div className={`p-2.5 rounded-xl w-fit ${item.bg.split(' ')[0]}`}>
                                        {item.icon}
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-base font-bold text-slate-700 group-hover:text-emerald-800 transition-colors">
                                            {item.label}
                                        </h3>
                                        <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="pt-5 flex justify-end">
                                    <Link href={item.href} className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-600 rounded-xl bg-slate-50 border border-slate-150 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all duration-300">
                                        {item.action}
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Settings;