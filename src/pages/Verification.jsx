import React, { useState, useEffect } from 'react';
import { MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';

const Verification = ({ data, onVerified, onBack }) => {
    const [bizNum, setBizNum] = useState('');
    const [error, setError] = useState('');

    // Dynamic Kakao Map loading
    useEffect(() => {
        const apiKey = import.meta.env.VITE_KAKAO_MAP_API_KEY;
        if (!apiKey) {
            console.error("Kakao Map API key is missing");
            return;
        }

        const scriptId = 'kakao-map-sdk';
        let script = document.getElementById(scriptId);

        const initMap = () => {
            if (window.kakao && window.kakao.maps) {
                window.kakao.maps.load(() => {
                    const container = document.getElementById('kakao-map');
                    if (container && data.lat && data.lng) {
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
            }
        };

        if (!script) {
            script = document.createElement('script');
            script.id = scriptId;
            script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services&autoload=false`;
            script.async = true;
            script.onload = () => {
                initMap();
            };
            document.head.appendChild(script);
        } else {
            initMap();
        }

        // Handle case where script already exists but maps not loaded
        if (window.kakao && window.kakao.maps) {
            initMap();
        }

    }, [data]);

    // Format business number (xxx-xx-xxxxx)
    const handleBizNumChange = (e) => {
        let val = e.target.value.replace(/[^0-9]/g, '');
        if (val.length > 10) val = val.slice(0, 10);

        if (val.length > 5) {
            val = `${val.slice(0, 3)}-${val.slice(3, 5)}-${val.slice(5)}`;
        } else if (val.length > 3) {
            val = `${val.slice(0, 3)}-${val.slice(3)}`;
        }

        setBizNum(val);
        setError('');
    };

    const handleVerify = () => {
        if (bizNum.replace(/-/g, '').length !== 10) {
            setError('올바른 사업자등록번호 10자리를 입력해주세요.');
            return;
        }
        // In a real app, verify API would be called here
        onVerified();
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-4xl mx-auto py-8">
            <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold text-gray-900 font-space mb-2">사장님의 매장이 맞습니까?</h1>
                <p className="text-gray-500">정확한 상권 분석을 위해 매장 소유주 확인이 필요합니다.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                {/* Map Section */}
                <div className="h-64 w-full bg-gray-100 relative">
                    <div id="kakao-map" className="w-full h-full"></div>

                    {/* Overlay info - only show if map might not load (e.g. no API key) */}
                    {!window.kakao && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-200/50 pointer-events-none">
                            <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-bold text-gray-700">
                                <MapPin className="text-red-500" size={18} />
                                <span>{data.address || '주소 정보 없음'} (API 키 확인 필요)</span>
                            </div>
                        </div>
                    )}

                    {/* Always visible address badge */}
                    {window.kakao && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none z-10">
                            <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-bold text-gray-700 border border-gray-100">
                                <MapPin className="text-red-500" size={16} />
                                <span>{data.address || '주소 정보 없음'}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Info & Verification Section */}
                <div className="p-8 space-y-8">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="flex-1 space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">매장명</label>
                                <div className="text-2xl font-bold text-gray-900">{data.name}</div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">상세 주소</label>
                                <div className="text-base text-gray-700 flex items-start gap-2">
                                    <MapPin className="text-gray-400 mt-0.5" size={16} />
                                    {data.address || '주소 정보가 없습니다.'}
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 w-full bg-gray-50 p-6 rounded-xl border border-gray-100 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                    사업자등록번호
                                    <span className="text-xs font-normal text-gray-400 bg-white px-2 py-0.5 rounded border border-gray-200">필수</span>
                                </label>
                                <input
                                    type="text"
                                    value={bizNum}
                                    onChange={handleBizNumChange}
                                    placeholder="000-00-00000"
                                    className={`w-full px-4 py-3 rounded-lg border ${error ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-red-200'} focus:outline-none focus:ring-2 transition-all font-mono text-lg bg-white`}
                                    maxLength={12}
                                />
                                {error && (
                                    <p className="text-red-500 text-xs flex items-center gap-1">
                                        <AlertCircle size={12} /> {error}
                                    </p>
                                )}
                                <p className="text-xs text-gray-400">
                                    * 추후 사업자등록정보 진위확인 API를 통해 검증됩니다.
                                </p>
                            </div>

                            <button
                                onClick={handleVerify}
                                className="w-full bg-gray-900 hover:bg-black text-white py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 size={18} />
                                소유주 인증 및 리포트 보기
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <button
                onClick={onBack}
                className="mx-auto block text-gray-400 hover:text-gray-600 text-sm underline transition-colors"
            >
                매장 다시 선택하기
            </button>
        </div>
    );
};

export default Verification;
