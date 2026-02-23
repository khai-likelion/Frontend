import React, { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';

const AIChatButton = () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-4">
            {isOpen && (
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-80 h-96 flex flex-col animate-fade-in-up">
                    <div className="bg-gray-900 text-white p-4 rounded-t-2xl flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="font-bold text-sm">AI Analyst</span>
                        </div>
                        <button onClick={() => setIsOpen(false)}><X size={16} /></button>
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
                        <div className="flex gap-2">
                            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-xs">AI</div>
                            <div className="bg-white p-3 rounded-2xl rounded-tl-none text-sm text-gray-600 shadow-sm border border-gray-100">
                                사장님, X-Report 분석 결과 <strong>'가성비'</strong> 항목 보완이 시급합니다. 관련 리뷰를 보여드릴까요?
                            </div>
                        </div>
                    </div>
                    <div className="p-3 border-t border-gray-100 bg-white rounded-b-2xl">
                        <input type="text" placeholder="질문을 입력하세요..." className="w-full bg-gray-50 border-none rounded-lg text-sm px-3 py-2 focus:ring-1 focus:ring-red-500" />
                    </div>
                </div>
            )}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-gray-900 hover:bg-black text-white p-4 rounded-full shadow-xl transition-transform hover:scale-110 flex items-center justify-center"
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
            </button>
        </div>
    );
};

export default AIChatButton;
