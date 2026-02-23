import React, { useState, useEffect } from 'react';
import {
    Clock,
    Sliders,
    ArrowRight,
} from 'lucide-react';

const Simulation = ({ data, onComplete, selectedSolutions = [] }) => {
    const [simValues, setSimValues] = useState({});
    const [duration, setDuration] = useState('1week');

    useEffect(() => {
        if (data?.simulationVariables) {
            const initial = {};
            data.simulationVariables.forEach(v => {
                initial[v.id] = v.default;
            });
            setSimValues(initial);
        }
    }, [data]);

    const durationOptions = [
        { id: '1week', label: '1주일', credits: 10 },
        { id: '2weeks', label: '2주일', credits: 20 },
        { id: '1month', label: '1개월', credits: 35 },
        { id: '3months', label: '3개월', credits: 100 },
        { id: '6months', label: '6개월', credits: 180 },
        { id: '1year', label: '1년', credits: 330 },
    ];

    const selectedCredits = durationOptions.find(d => d.id === duration)?.credits || 0;

    return (
        <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
            <div className="flex justify-between items-end border-b border-gray-100 pb-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-gray-900 font-space tracking-tight">Simulation Settings</h1>
                        <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">Step 3</span>
                    </div>
                    <p className="text-gray-500 text-sm">시뮬레이션을 진행할 기간과 변수를 설정하세요.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Col: Duration Settings */}
                <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm h-fit">
                    <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-lg">
                        <Clock size={20} className="text-blue-500" /> 시뮬레이션 기간 설정
                    </h3>

                    <div className="space-y-3">
                        {durationOptions.map((opt) => (
                            <label
                                key={opt.id}
                                className={`flex justify-between items-center p-4 rounded-xl border cursor-pointer transition-all ${duration === opt.id
                                    ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                                onClick={() => setDuration(opt.id)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${duration === opt.id ? 'border-blue-500' : 'border-gray-300'
                                        }`}>
                                        {duration === opt.id && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                                    </div>
                                    <span className={`font-medium ${duration === opt.id ? 'text-gray-900' : 'text-gray-600'}`}>
                                        {opt.label}
                                    </span>
                                </div>
                                <div className="bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded">
                                    {opt.credits} CREDITS
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Right Col: Variable Settings */}
                <div className="flex flex-col h-full space-y-6">
                    <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm flex-1">
                        <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-lg">
                            <Sliders size={20} className="text-green-500" /> 사장님이 선택하신 솔루션 리스트
                        </h3>

                        <div className="space-y-4 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                            {selectedSolutions.length > 0 ? (
                                selectedSolutions.map((sol, idx) => (
                                    <div key={idx} className="p-4 rounded-xl border border-blue-100 bg-blue-50 flex flex-col gap-1 items-start shadow-sm">
                                        <span className="text-[10px] font-bold text-blue-600 bg-white px-2 py-0.5 rounded border border-blue-200 mb-1">{sol.category}</span>
                                        <div className="font-bold text-gray-900 text-sm">{sol.title}</div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-gray-400 py-10 border-2 border-dashed border-gray-100 rounded-xl">
                                    선택된 솔루션이 없습니다.<br />
                                    <span className="text-xs">Step 2에서 솔루션을 선택해주세요.</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-gray-500">지불할 크레딧</span>
                            <span className="text-2xl font-bold text-gray-900">{selectedCredits} CREDITS</span>
                        </div>
                        <button
                            onClick={onComplete}
                            className="w-full bg-gray-900 hover:bg-black text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            시뮬레이션 시작하기 <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Simulation;
