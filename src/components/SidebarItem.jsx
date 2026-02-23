import React from 'react';

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${active
            ? 'bg-red-50 text-red-600 font-medium'
            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
    >
        <Icon size={18} className={active ? 'text-red-600' : 'text-gray-400'} />
        <span className="text-sm font-space">{label}</span>
        {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-red-600" />}
    </button>
);

export default SidebarItem;
