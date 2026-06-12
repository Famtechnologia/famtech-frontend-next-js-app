'use client';

import React from 'react';
import Image from 'next/image';
import { Mail, Phone, MapPin, CheckCircle, MessageSquare, Clock, ShieldCheck } from 'lucide-react';

export interface Officer {
  id: number;
  name: string;
  specialty: string;
  photo: string;
  status: string;
  hasUnread?: boolean;
  location?: string;
  bio?: string;
  responsibilities?: { [key: string]: string[] };
  contact?: { email: string; phone: string };
}

interface OfficerProfileProps {
  officer: Officer;
  onStartChat: (officer: Officer) => void;
}

export default function OfficerProfile({ officer, onStartChat }: OfficerProfileProps) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left pb-6 border-b border-slate-100">
        <div className="relative w-28 h-28 rounded-2xl overflow-hidden border border-slate-200 shadow-sm flex-shrink-0">
          <Image 
            src={officer.photo} 
            alt={officer.name} 
            layout="fill" 
            objectFit="cover" 
            className="hover:scale-105 transition duration-300"
          />
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
            <h3 className="text-lg font-extrabold text-slate-800">{officer.name}</h3>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100/50 uppercase tracking-wide w-fit mx-auto sm:mx-0">
              <ShieldCheck className="h-3 w-3" /> Certified Expert
            </span>
          </div>
          
          <p className="text-xs font-semibold text-slate-500">{officer.specialty}</p>
          
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-medium text-slate-400">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{officer.location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Replies within 2 hours</span>
            </div>
          </div>
        </div>

        <button 
          onClick={() => onStartChat(officer)}
          className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-emerald-600/10 flex items-center justify-center gap-2"
        >
          <MessageSquare className="h-4 w-4" /> Start Consult
        </button>
      </div>

      {/* Bio / About */}
      {officer.bio && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Professional Bio</h4>
          <p className="text-xs font-medium text-slate-600 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100/30">
            {officer.bio}
          </p>
        </div>
      )}

      {/* Key Responsibilities */}
      {officer.responsibilities && (
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Key Responsibilities</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(officer.responsibilities).map(([key, list]) => (
              <div key={key} className="p-4 border border-slate-100 bg-white rounded-xl space-y-2 shadow-sm">
                <h5 className="text-xs font-extrabold text-emerald-800 capitalize tracking-wide border-b border-emerald-50/50 pb-1.5 mb-2">
                  {key.replace(/([A-Z])/g, ' $1')}
                </h5>
                <ul className="space-y-2">
                  {list.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-[11px] font-semibold text-slate-600 leading-relaxed">
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contact Details */}
      {officer.contact && (
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Direct Contact</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <Mail className="w-4 h-4 text-emerald-600" />
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Email Address</p>
                <p className="text-xs font-bold text-slate-700">{officer.contact.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <Phone className="w-4 h-4 text-emerald-600" />
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Phone Number</p>
                <p className="text-xs font-bold text-slate-700">{officer.contact.phone}</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}