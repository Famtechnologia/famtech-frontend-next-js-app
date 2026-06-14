'use client';

import React from 'react';
import { HelpCircle, Camera, MessageCircle, Mic, Video, BookOpen, ChevronRight } from 'lucide-react';

interface StartChatPageProps {
  onConnect?: () => void;
}

export default function StartChatPage({ onConnect }: StartChatPageProps) {
  const features = [
    {
      title: 'Ask Anything',
      description: 'Have questions about crops, soil nutrients, pests, or animal care? Our officers offer guidance tailored to your region.',
      icon: HelpCircle,
      border: 'border-emerald-100 dark:border-emerald-900/40 hover:border-emerald-300 dark:hover:border-emerald-700',
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50/60 dark:bg-[#0d2a1a]',
    },
    {
      title: 'Upload Photos',
      description: 'Experiencing spots or leaf issues? Upload photos of your plants or animals to receive quick diagnostic support.',
      icon: Camera,
      border: 'border-blue-100 dark:border-blue-900/40 hover:border-blue-300 dark:hover:border-blue-700',
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50/60 dark:bg-blue-900/20',
    },
    {
      title: 'Instant Chat Support',
      description: 'Connect directly to certified officers in your area. Ask questions, clarify answers, and get direct answers.',
      icon: MessageCircle,
      border: 'border-purple-100 dark:border-purple-900/40 hover:border-purple-300 dark:hover:border-purple-700',
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-50/60 dark:bg-purple-900/20',
    },
    {
      title: 'Voice Message Option',
      description: 'Prefer explaining by voice? Record and send an audio note describing complex multi-crop issues.',
      icon: Mic,
      border: 'border-rose-100 dark:border-rose-900/40 hover:border-rose-300 dark:hover:border-rose-700',
      iconColor: 'text-rose-600',
      iconBg: 'bg-rose-50/60 dark:bg-rose-900/20',
    },
    {
      title: 'Video Consultations',
      description: 'Book a live video call to walk an extension officer through your fields or livestock pens in real-time.',
      icon: Video,
      border: 'border-amber-100 dark:border-amber-900/40 hover:border-amber-300 dark:hover:border-amber-700',
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50/60 dark:bg-amber-900/20',
    },
    {
      title: 'Smart Diary Integration',
      description: 'Every recommendation and treatment advice shared in chat is saved automatically in your Smart Diary.',
      icon: BookOpen,
      border: 'border-teal-100 dark:border-teal-900/40 hover:border-teal-300 dark:hover:border-teal-700',
      iconColor: 'text-teal-600',
      iconBg: 'bg-teal-50/60 dark:bg-teal-900/20',
    },
  ];

  return (
    <div className="space-y-8">

      {/* Welcome Banner */}
      <div className="bg-white dark:bg-[#161b22] border border-slate-100 dark:border-[#30363d] p-6 md:p-8 rounded-2xl shadow-sm space-y-3">
        <h3 className="text-lg font-extrabold text-slate-800 dark:text-[#e6edf3] tracking-tight">
          Welcome to FamTech Live Support
        </h3>
        <p className="text-xs font-semibold text-slate-500 dark:text-[#8b949e] leading-relaxed max-w-3xl">
          Get real-time advice from certified Extension Officers. Ask questions about crops, veterinary health, soil treatments, or seasonal scheduling. Share photos of plant blight or animal symptoms for rapid field diagnosis.
        </p>
      </div>

      {/* Feature Grid — each card clicks through to the officer chat */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <button
              key={idx}
              onClick={onConnect}
              className={`text-left p-5 bg-white dark:bg-[#161b22] border ${feature.border} rounded-2xl shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md space-y-4 flex flex-col justify-between cursor-pointer`}
            >
              <div className="space-y-3">
                <div className={`p-2.5 w-fit rounded-xl ${feature.iconBg} ${feature.iconColor}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h4 className="font-extrabold text-slate-800 dark:text-[#e6edf3] text-sm">{feature.title}</h4>
                <p className="text-slate-400 dark:text-[#8b949e] text-xs font-semibold leading-relaxed">
                  {feature.description}
                </p>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 mt-2">
                Get started <ChevronRight className="h-3 w-3" />
              </span>
            </button>
          );
        })}
      </div>

      {/* CTA */}
      <div className="bg-slate-50 dark:bg-[#161b22] border border-slate-100 dark:border-[#30363d] rounded-2xl p-8 text-center space-y-4 max-w-xl mx-auto shadow-inner">
        <h4 className="font-extrabold text-slate-800 dark:text-[#e6edf3] text-base">Ready to get expert answers?</h4>
        <p className="text-slate-400 dark:text-[#8b949e] text-xs font-semibold leading-relaxed max-w-sm mx-auto">
          Start a real-time consult with our certified agricultural specialists today.
        </p>
        <button
          onClick={onConnect}
          className="mx-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-emerald-600/10 flex items-center gap-1.5"
        >
          <span>Connect with Officer</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
