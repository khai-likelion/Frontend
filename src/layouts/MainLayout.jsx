import React from 'react';
import {
    LayoutDashboard,
    FileText,
    Sliders,
    Globe,
    BarChart2,
    Sparkles,
    User,
    ChevronRight,
} from 'lucide-react';
import SidebarItem from '../components/SidebarItem';
import StepCard from '../components/StepCard';
import AIChatButton from '../components/AIChatButton';

import logo from '../assets/images/logo.png';

const MainLayout = ({
    children,
    activeTab,
    completedSteps,
    onTabChange,
    user = { name: '김사장님', plan: 'Premium Plan', credits: 40, totalCredits: 100 }
}) => {
    return (
        <div className="flex h-screen bg-white text-gray-900 font-sans overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 border-r border-gray-100 flex flex-col bg-white z-10 hidden md:flex">
                <div className="p-8 pb-4">
                    <div className="mb-10 cursor-pointer group" onClick={() => onTabChange('dashboard')}>
                        <div className="flex items-center gap-3">
                            <img
                                src={logo}
                                alt="Lovelop"
                                className="h-14 w-auto transform group-hover:scale-105 transition-all duration-300"
                                style={{ filter: 'invert(21%) sepia(100%) saturate(3501%) hue-rotate(352deg) brightness(97%) contrast(92%)' }}
                            />
                        </div>
                        <p className="text-[11px] text-gray-400 font-medium mt-3 tracking-wide pl-1">AI가 실험해주는 내 가게의 미래</p>
                    </div>

                    <nav className="space-y-1">
                        <SidebarItem
                            icon={LayoutDashboard}
                            label="대시보드"
                            active={activeTab === 'dashboard'}
                            onClick={() => onTabChange('dashboard')}
                        />
                        <SidebarItem
                            icon={FileText}
                            label="X-Report"
                            active={activeTab === 'x-report'}
                            onClick={() => onTabChange('x-report')}
                        />
                        <SidebarItem
                            icon={Sliders}
                            label="시뮬레이션 설정"
                            active={activeTab === 'simulation'}
                            onClick={() => onTabChange('simulation')}
                        />
                        <SidebarItem
                            icon={Globe}
                            label="시뮬레이션"
                            active={activeTab === 'simulation_map'}
                            onClick={() => onTabChange('simulation_map')}
                        />
                        <SidebarItem
                            icon={BarChart2}
                            label="최종 리포트"
                            active={activeTab === 'y-report'}
                            onClick={() => onTabChange('y-report')}
                        />
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-gray-50">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-4">
                        <div className="flex justify-between items-center mb-4">
                            <button
                                onClick={() => onTabChange('mypage')}
                                className="text-xs font-bold text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors"
                            >
                                <User size={14} /> 마이페이지
                            </button>
                        </div>
                        <div className="text-xs font-bold text-gray-400 mb-2">CREDITS</div>
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-900">{user.credits} / {user.totalCredits}</span>
                            <button
                                onClick={() => onTabChange('pricing')}
                                className="text-xs bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-500 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all"
                            >
                                Charge
                            </button>
                        </div>
                        <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2 overflow-hidden">
                            <div className="bg-red-500 h-full" style={{ width: `${(user.credits / user.totalCredits) * 100}%` }}></div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-800 to-black flex items-center justify-center text-white font-bold text-sm shadow-md">
                            CEO
                        </div>
                        <div>
                            <div className="text-sm font-bold text-gray-900">{user.name}</div>
                            <div className="text-xs text-gray-400">{user.plan}</div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-white relative">
                {/* Top Progress Bar */}
                <div className="sticky top-0 bg-white/80 backdrop-blur-md z-40 border-b border-gray-100 px-8 py-3 flex gap-4 overflow-x-auto no-scrollbar">
                    <StepCard number="1" title="매장 입력" completed={completedSteps.includes('dashboard')} active={activeTab === 'dashboard'} onClick={() => onTabChange('dashboard')} />
                    <ChevronRight className="text-gray-300 flex-shrink-0 self-center" size={16} />
                    <StepCard number="2" title="X-Report" completed={completedSteps.includes('x-report')} active={activeTab === 'x-report'} onClick={() => onTabChange('x-report')} />
                    <ChevronRight className="text-gray-300 flex-shrink-0 self-center" size={16} />
                    <StepCard number="3" title="시뮬레이션 설정" completed={completedSteps.includes('simulation')} active={activeTab === 'simulation'} onClick={() => onTabChange('simulation')} />
                    <ChevronRight className="text-gray-300 flex-shrink-0 self-center" size={16} />
                    <StepCard number="4" title="시뮬레이션" completed={completedSteps.includes('simulation_map')} active={activeTab === 'simulation_map'} onClick={() => onTabChange('simulation_map')} />
                    <ChevronRight className="text-gray-300 flex-shrink-0 self-center" size={16} />
                    <StepCard number="5" title="최종 리포트" completed={completedSteps.includes('y-report')} active={activeTab === 'y-report'} onClick={() => onTabChange('y-report')} />
                </div>

                <div className="max-w-7xl mx-auto p-8 lg:p-12 pb-24">
                    {children}
                </div>

                {/* Floating AI Agent */}
                <AIChatButton />
            </main>
        </div>
    );
};

export default MainLayout;
