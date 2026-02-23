import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import {
    FileText,
    Printer,
    MessageSquare,
    Info,
    ArrowRight,
    X,
    CheckCircle2,
} from 'lucide-react';
import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

const XReport = ({ data, onNext, selectedSolutions = [], onSelectSolution }) => {
    const [selectedMetric, setSelectedMetric] = useState(data.radarData[0]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        setSelectedMetric(data.radarData[0]);
    }, [data]);

    const toggleSolution = (solution) => {
        if (selectedSolutions.find(s => s.title === solution.title)) {
            onSelectSolution(selectedSolutions.filter(s => s.title !== solution.title));
        } else {
            onSelectSolution([...selectedSolutions, solution]);
        }
    };

    return (
        <>
            <div className="space-y-8 animate-fade-in">
                <div className="flex justify-between items-end border-b border-gray-100 pb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-gray-900 font-space tracking-tight">X-Report: {data.name}</h1>
                            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold border border-red-200">진단 완료</span>
                        </div>
                        <p className="text-gray-500 text-sm">GPT-5.2 기반 AI 분석 리포트 — 매장 전략 처방전</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 text-sm transition-colors"
                            >
                                <FileText size={16} className="text-red-500" />
                                전문 보기
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl font-bold hover:bg-black text-sm transition-colors"
                            >
                                <Printer size={16} />
                                PDF 저장
                            </button>
                        </div>
                        <div className="w-px h-8 bg-gray-200"></div>
                        <div className="text-right group relative cursor-help">
                            <div className="text-sm text-gray-400 mb-1">종합 등급</div>
                            <div className="text-4xl font-bold font-space text-gray-900">{data.grade}<span className="text-lg text-gray-400 font-normal ml-1">/ S</span></div>
                        </div>
                        <div className="w-px h-12 bg-gray-200"></div>
                        <div className="text-right">
                            <div className="text-sm text-gray-400 mb-1">상위</div>
                            <div className="text-4xl font-bold font-space text-red-600">{data.rankPercent}%</div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">역량 분석 (Deep-Dive)</h3>
                        <p className="text-sm text-gray-400 mb-6">항목을 클릭하여 상세 분석을 확인하세요.</p>
                        <div className="flex-1 min-h-[300px] relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data.radarData}>
                                    <PolarGrid stroke="#f3f4f6" />
                                    <PolarAngleAxis
                                        dataKey="subject"
                                        tick={({ x, y, payload }) => (
                                            <text
                                                x={x} y={y}
                                                dy={4}
                                                textAnchor="middle"
                                                fill={selectedMetric?.subject === payload.value ? '#E42313' : '#6b7280'}
                                                fontWeight={selectedMetric?.subject === payload.value ? 'bold' : 'normal'}
                                                fontSize={13}
                                                className="cursor-pointer hover:fill-red-500 transition-colors"
                                                onClick={() => setSelectedMetric(data.radarData.find(d => d.subject === payload.value))}
                                            >
                                                {payload.value}
                                            </text>
                                        )}
                                    />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar
                                        name={data.name}
                                        dataKey="A"
                                        stroke="#E42313"
                                        strokeWidth={3}
                                        fill="#E42313"
                                        fillOpacity={0.15}
                                    />
                                    <Tooltip />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="lg:col-span-7 space-y-6">
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">FOCUS ON</span>
                                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{selectedMetric?.subject} <span className="text-red-600">{selectedMetric?.A}점</span></h3>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4 mb-4">
                                <div className="bg-white p-4 rounded-xl border border-gray-100">
                                    <div className="flex items-center gap-2 mb-2 text-gray-900 font-bold text-sm">
                                        <MessageSquare size={14} /> 주요 키워드
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {data.keywords.slice(0, 8).map(k => (
                                            <span key={k.text} className={`px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600`}>
                                                #{k.text}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="text-sm text-gray-600 bg-white p-4 rounded-xl border border-gray-100 flex gap-3 items-start">
                                <Info size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                                <p>
                                    <strong>AI 분석:</strong> {selectedMetric?.reason}. {data.description}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 mb-4">
                            <h4 className="font-bold text-gray-900">추천 필살기 (Solutions)</h4>
                            <button onClick={onNext} className="flex items-center gap-2 text-red-600 font-medium hover:underline">
                                전체 시뮬레이션으로 적용 <ArrowRight size={16} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {data.solutions.map((sol, idx) => {
                                const isSelected = selectedSolutions.some(s => s.title === sol.title);
                                return (
                                    <div
                                        key={idx}
                                        onClick={() => toggleSolution(sol)}
                                        className={`relative bg-white p-5 rounded-2xl border hover:shadow-xl cursor-pointer transition-all duration-300 group flex flex-col h-full min-h-[160px]
                    ${isSelected ? 'border-red-500 ring-2 ring-red-100 bg-red-50/10' : 'border-gray-200'}
                  `}
                                    >
                                        <div className="font-bold text-gray-900 mb-3 text-base leading-snug group-hover:text-red-600 transition-colors">{sol.title}</div>
                                        <div className="text-[12px] text-gray-400 font-medium">{sol.category}</div>
                                        <div className="text-xs text-gray-500 pt-3 border-t border-gray-50 mt-auto">{sol.desc}</div>

                                        {/* Hover Overlay: More info (Expanded view) */}
                                        <div className={`absolute top-0 left-0 w-full h-auto min-h-full bg-gray-900/95 p-5 text-white flex flex-col opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-2xl z-20 pointer-events-none group-hover:pointer-events-auto shadow-2xl overflow-hidden`}>
                                            <div className="mb-4">
                                                <div className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">실행 방안</div>
                                                <div className="text-xs leading-relaxed text-gray-200">💡 {sol.execution || '상세 실행 방안 준비 중'}</div>
                                            </div>
                                            {sol.effect && (
                                                <div className="mb-4">
                                                    <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">기대 효과</div>
                                                    <div className="text-xs leading-relaxed text-gray-200">✨ {sol.effect}</div>
                                                </div>
                                            )}
                                            <div className="mt-auto pt-2 flex justify-end">
                                                <div className={`px-3 py-1 rounded-full text-[10px] font-bold ${isSelected ? 'bg-red-600' : 'bg-white/20'}`}>
                                                    {isSelected ? '선택됨' : '클릭하여 선택'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <FileText size={20} className="text-red-600" />
                                X-Report 전문 보기
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900 p-2">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-8 overflow-y-auto prose prose-red max-w-none text-left">
                            <ReactMarkdown>{data.fullReport}</ReactMarkdown>
                        </div>
                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                            <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 bg-gray-900 text-white rounded-xl font-bold">닫기</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default XReport;
