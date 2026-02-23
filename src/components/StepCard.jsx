import React from 'react';
import { CheckCircle } from 'lucide-react';

const StepCard = ({ number, title, desc, active, completed, onClick }) => (
    <div
        onClick={onClick}
        className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all cursor-pointer hover:scale-105 duration-200 min-w-[100px] ${active
            ? 'bg-white border-red-500 shadow-md ring-1 ring-red-100'
            : completed
                ? 'bg-red-50 border-red-100'
                : 'bg-gray-50 border-gray-100 opacity-60'
            }`}>
        <div className="flex items-center gap-1 mb-1">
            {completed && <CheckCircle size={10} className="text-red-600" />}
            <span className={`text-xs font-bold ${active || completed ? 'text-red-600' : 'text-gray-400'}`}>STEP {number}</span>
        </div>
        <h4 className={`text-sm font-medium mb-0.5 ${active || completed ? 'text-gray-900' : 'text-gray-500'}`}>{title}</h4>
        <p className="text-[10px] text-center text-gray-400">{desc}</p>
    </div>
);

export default StepCard;
