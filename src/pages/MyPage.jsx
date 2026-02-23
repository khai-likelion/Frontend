import React, { useEffect } from 'react';
import {
    ArrowRight,
    MapPin,
    Zap,
    FileText,
    Target,
    Lock,
    BarChart2,
    Sparkles,
} from 'lucide-react';

const MyPage = ({ data, onBack, onManageMembership }) => {
    // Initialize Kakao Map with retry logic
    useEffect(() => {
        const loadMap = () => {
            if (window.kakao && window.kakao.maps) {
                window.kakao.maps.load(() => {
                    const container = document.getElementById('mypage-map');
                    if (container) {
                        const options = {
                            center: new window.kakao.maps.LatLng(data.lat, data.lng),
                            level: 3
                        };
                        const map = new window.kakao.maps.Map(container, options);

                        // Marker
                        const markerPosition = new window.kakao.maps.LatLng(data.lat, data.lng);
                        const marker = new window.kakao.maps.Marker({
                            position: markerPosition
                        });
                        marker.setMap(map);
                    }
                });
                return true;
            }
            return false;
        };

        if (!loadMap()) {
            let attempts = 0;
            const intervalId = setInterval(() => {
                attempts++;
                if (loadMap() || attempts >= 10) {
                    clearInterval(intervalId);
                }
            }, 500);
            return () => clearInterval(intervalId);
        }
    }, [data]);

    return (
        <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-12">
            <div className="flex items-center gap-3 mb-6">
                <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowRight className="rotate-180" size={24} />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 font-space">마이페이지</h1>
                    <p className="text-gray-500 text-sm">내 가게 정보와 지난 리포트 보관함</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                <MapPin size={20} className="text-red-500" /> 매장 정보
                            </h3>
                        </div>
                        <div className="h-48 bg-gray-100 relative">
                            <div id="mypage-map" className="w-full h-full"></div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">매장명</label>
                                <div className="font-bold text-xl text-gray-900">{data.name}</div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">상세 주소</label>
                                <div className="text-sm text-gray-700 leading-relaxed">{data.address}</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <div className="text-xs font-bold text-gray-400 mb-1">MY MEMBERSHIP</div>
                                <div className="text-xl font-bold font-space">PRO PLAN</div>
                            </div>
                            <Zap size={20} className="text-yellow-400" fill="currentColor" />
                        </div>
                        <button
                            onClick={onManageMembership}
                            className="w-full bg-white text-gray-900 py-2 rounded-lg font-bold text-sm hover:bg-gray-100 transition-colors"
                        >
                            멤버십 관리
                        </button>
                    </div>
                </div>

                <div className="lg:col-span-8 space-y-8">
                    <section>
                        <div className="flex justify-between items-end mb-4">
                            <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                                <FileText size={24} className="text-blue-500" /> X-Report 보관함
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                                <h4 className="font-bold text-gray-900 text-lg mb-1">{data.name} 2월 진단 리포트</h4>
                                <div className="flex items-center justify-between mt-auto pt-4">
                                    <Target size={12} className="text-gray-400" /> <span className="text-xs text-gray-500">종합등급 S</span>
                                    <ArrowRight size={16} className="text-gray-300 group-hover:text-blue-500 transform group-hover:translate-x-1" />
                                </div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <div className="flex justify-between items-end mb-4">
                            <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                                <BarChart2 size={24} className="text-purple-500" /> Y-Report 보관함
                            </h3>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
                            <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Sparkles size={32} className="text-purple-400" />
                            </div>
                            <h4 className="font-bold text-gray-900 mb-2">아직 완료된 시뮬레이션 결과가 없습니다</h4>
                            <button className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm">
                                새 시뮬레이션 시작하기
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default MyPage;
