import { Popup } from 'react-leaflet';
import type { MapIncident } from '../types';
import { Shield, MapPin, Calendar, Clock, AlertTriangle, Users, ExternalLink, Activity } from 'lucide-react';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';

interface IncidentPopupProps {
  incident: MapIncident;
}

export function IncidentPopup({ incident }: IncidentPopupProps) {
  const navigate = useNavigate();

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'High': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'Medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-green-500 bg-green-500/10 border-green-500/20';
    }
  };

  return (
    <Popup className="incident-popup min-w-[320px]">
      <div className="flex flex-col gap-4 text-slate-200">
        <div className="flex items-start justify-between border-b border-slate-700/50 pb-3">
          <div>
            <h3 className="font-mono text-sm text-cyan-400 font-semibold mb-1">
              {incident.firNumber}
            </h3>
            <p className="text-lg font-medium text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-police" />
              {incident.category}
            </p>
          </div>
          <span className={clsx("px-2 py-1 rounded text-xs border font-medium", getRiskColor(incident.riskLevel))}>
            {incident.riskLevel} Risk
          </span>
        </div>

        <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
          <div className="flex items-center gap-2 text-slate-300">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>{incident.date}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Clock className="w-4 h-4 text-slate-500" />
            <span>{incident.time}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300 col-span-2">
            <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="truncate">{incident.policeStation}, {incident.district}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Users className="w-4 h-4 text-slate-500" />
            <span>Vic: {incident.victimCount}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <AlertTriangle className="w-4 h-4 text-slate-500" />
            <span>Acc: {incident.accusedCount}</span>
          </div>
        </div>

        {incident.description && (
          <p className="text-xs text-slate-400 border-t border-slate-700/50 pt-3 line-clamp-2">
            {incident.description}
          </p>
        )}

        <div className="flex gap-2 pt-2 border-t border-slate-700/50 mt-1">
          <button 
            onClick={(e) => { e.stopPropagation(); navigate('/network'); }}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs rounded transition-colors"
          >
            <Activity className="w-3.5 h-3.5" />
            Network
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); navigate('/cases'); }}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-police hover:bg-blue-600 text-white text-xs rounded transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open Case
          </button>
        </div>
      </div>
    </Popup>
  );
}
