import React, { useState } from 'react';
import {
    Zap,
    Mail,
    Lock,
    LogIn,
    UserPlus,
    User,
} from 'lucide-react';

import logo from '../assets/images/lovelop_logo_v2.png';

export const LoginView = ({ onLogin, onSignup }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return (
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 animate-fade-in">
            <div className="p-8 pb-0 text-center">
                <div className="inline-flex items-center justify-center mb-6">
                    <img
                        src={logo}
                        alt="Lovelop"
                        className="h-64 w-auto"
                        style={{ filter: 'invert(21%) sepia(100%) saturate(3501%) hue-rotate(352deg) brightness(97%) contrast(92%)' }}
                    />
                </div>
                <p className="text-gray-500">AI가 실험해주는 내 가게의 미래</p>
            </div>

            <div className="p-8 space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">이메일 주소</label>
                    <div className="relative">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pl-11 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                            placeholder="example@email.com"
                        />
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">비밀번호</label>
                    <div className="relative">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pl-11 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                            placeholder="••••••••"
                        />
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    </div>
                </div>

                <button
                    onClick={onLogin}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-600/20 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                    <LogIn size={20} />
                    로그인하기
                </button>

                <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-100"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">계정이 없으신가요?</span>
                    </div>
                </div>

                <button
                    onClick={onSignup}
                    className="w-full bg-white border border-gray-200 text-gray-700 font-bold py-3.5 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                >
                    <UserPlus size={20} />
                    회원가입
                </button>
            </div>
        </div>
    );
};

export const SignupView = ({ onSignup, onLogin }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');

    return (
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 animate-fade-in">
            <div className="p-8 pb-0 text-center">
                <div className="inline-flex items-center justify-center mb-6">
                    <img
                        src={logo}
                        alt="Lovelop"
                        className="h-56 w-auto"
                        style={{ filter: 'invert(21%) sepia(100%) saturate(3501%) hue-rotate(352deg) brightness(97%) contrast(92%)' }}
                    />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 font-space mb-2">회원가입</h2>
                <p className="text-gray-500">AI가 실험해주는 내 가게의 미래</p>
            </div>

            <div className="p-8 space-y-5">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">이름 (사업자명)</label>
                    <div className="relative">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pl-11 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                            placeholder="홍길동"
                        />
                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">이메일 주소</label>
                    <div className="relative">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pl-11 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                            placeholder="example@email.com"
                        />
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">비밀번호</label>
                    <div className="relative">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pl-11 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                            placeholder="8자 이상 입력"
                        />
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    </div>
                </div>

                <button
                    className="w-full bg-[#FEE500] hover:bg-[#FDD800] text-black font-bold py-4 rounded-xl shadow-lg shadow-yellow-400/20 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 mt-4"
                >
                    <svg width="20" height="20" viewBox="0 0 256 256" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M128 36C70.562 36 24 72.713 24 118c0 29.279 19.466 54.97 48.748 69.477l-10.202 37.319a4 4 0 0 0 6.029 4.413l43.689-29.126C118.687 201.372 123.281 202 128 202c57.438 0 104-36.713 104-84S185.438 36 128 36z" />
                    </svg>
                    카카오 로그인
                </button>

                <button
                    onClick={onSignup}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-600/20 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 mt-2"
                >
                    <UserPlus size={20} />
                    가입 완료
                </button>

                <div className="text-center mt-4">
                    <button
                        onClick={onLogin}
                        className="text-sm text-gray-500 hover:text-red-600 font-medium transition-colors"
                    >
                        이미 계정이 있으신가요? 로그인하기
                    </button>
                </div>
            </div>
        </div>
    );
};
