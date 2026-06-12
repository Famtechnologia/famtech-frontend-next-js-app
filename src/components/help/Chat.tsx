'use client';

import React from 'react';
import { HelpCircle, Camera, MessageCircle, Mic, Video, BookOpen, ChevronRight, UserCheck } from 'lucide-react';

interface StartChatPageProps {
  onConnect?: () => void;
}

export default function StartChatPage({ onConnect }: StartChatPageProps) {
  const features = [
    {
      title: 'Ask Anything',
      description: 'Have questions about crops, soil nutrients, pests, or animal care? Our officers offer guidance tailored to your region.',
      icon: HelpCircle,
      borderColor: 'border-emerald-100 hover:border-emerald-300',
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50/30'
    },
    {
      title: 'Upload Photos',
      description: 'Experiencing spots or leaf issues? Upload photos of your plants or animals to receive quick diagnostic support.',
      icon: Camera,
      borderColor: 'border-blue-100 hover:border-blue-300',
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50/30'
    },
    {
      title: 'Instant Chat Support',
      description: 'Connect directly to certified officers in your area. Ask questions, clarify answers, and get direct answers.',
      icon: MessageCircle,
      borderColor: 'border-purple-100 hover:border-purple-300',
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50/30'
    },
    {
      title: 'Voice Message Option',
      description: 'Prefer explaining by voice? Record and send a audio note describing complex multi-crop issues.',
      icon: Mic,
      borderColor: 'border-rose-100 hover:border-rose-300',
      iconColor: 'text-rose-600',
      bgColor: 'bg-rose-50/30'
    },
    {
      title: 'Video Consultations',
      description: 'Book a live video call to walk an extension officer through your fields or livestock pens in real-time.',
      icon: Video,
      borderColor: 'border-amber-100 hover:border-amber-300',
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50/30'
    },
    {
      title: 'Smart Diary Integration',
      description: 'Every recommendation and treatment advice shared in chat is saved automatically in your Smart Diary.',
      icon: BookOpen,
      borderColor: 'border-teal-100 hover:border-teal-300',
      iconColor: 'text-teal-600',
      bgColor: 'bg-teal-50/30'
    }
  ];

  return (
    <div className="space-y-8">
      
      {/* Intro Welcome Card */}
      <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-2xl shadow-sm space-y-4">
        <h3 className="text-lg font-extrabold text-slate-800 tracking-tight">
          Welcome to FamTech Live Support
        </h3>
        <p className="text-xs font-semibold text-slate-500 leading-relaxed max-w-3xl">
          Get real-time advice from certified Extension Officers. Ask questions about crops, veterinary health, soil treatments, or seasonal scheduling. Share photos of plant blight or animal symptoms for rapid field diagnosis.
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, idx) => {
          const IconComponent = feature.icon;
          return (
            <div 
              key={idx} 
              className={`p-5 bg-white border ${feature.borderColor} rounded-2xl shadow-sm transition duration-300 hover:-translate-y-0.5 space-y-4 flex flex-col justify-between`}
            >
              <div className="space-y-3">
                <div className={`p-2.5 w-fit rounded-xl ${feature.bgColor} ${feature.iconColor}`}>
                  <IconComponent className="h-5 w-5" />
                </div>
                <h4 className="font-extrabold text-slate-800 text-sm">{feature.title}</h4>
                <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modern Call to Action */}
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 text-center space-y-4 max-w-xl mx-auto shadow-inner">
        <h4 className="font-extrabold text-slate-800 text-base">Ready to get expert answers?</h4>
        <p className="text-slate-400 text-xs font-semibold leading-relaxed max-w-sm mx-auto">
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