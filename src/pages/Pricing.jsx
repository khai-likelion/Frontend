import React from 'react';
import {
    CheckCircle,
    Zap,
    ArrowRight
} from 'lucide-react';

const Pricing = () => {
    const creditPacks = [
        { credits: 10, price: '4,900원', color: 'bg-blue-50', text: 'text-blue-600' },
        { credits: 30, price: '12,900원', color: 'bg-purple-50', text: 'text-purple-600', popular: true },
        { credits: 50, price: '21,900원', color: 'bg-red-50', text: 'text-red-600' },
        { credits: 100, price: '39,900원', color: 'bg-gray-900', text: 'text-white' },
    ];

    const subscriptionPlans = [
        {
            name: 'Basic Plan',
            price: '29,000원',
            period: '/월',
            features: ['월 50 크레딧 제공', '기본 X-Report 분석', '시뮬레이션 기본형'],
            color: 'border-gray-100',
            buttonVariant: 'secondary'
        },
        {
            name: 'Premium Plan',
            price: '59,000원',
            period: '/월',
            features: ['월 150 크레딧 제공', '심층 X-Report 분석', '시뮬레이션 우선순위', '데이터 히스토리 보존'],
            color: 'border-red-100 bg-red-50/30',
            popular: true,
            buttonVariant: 'primary'
        },
        {
            name: 'Pro Plan',
            price: '99,000원',
            period: '/월',
            features: ['월 300 크레딧 제공', '모든 X/Y-Report 기능', '상권 변동 실시간 알림', '데이터 엑스포트 (CSV)'],
            color: 'border-gray-200',
            buttonVariant: 'primary'
        },
        {
            name: 'Master Plan',
            price: '199,000원',
            period: '/월',
            features: ['无제한 크레딧 활용', '1:1 상권 전략 컨설팅', '본사급 대시보드 제공', '모든 기능 우선 업데이트'],
            color: 'border-gray-900 bg-gray-900 text-white',
            buttonVariant: 'white'
        }
    ];

    return (
        <div className="space-y-20 animate-fade-in max-w-6xl mx-auto pb-20">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold text-gray-900 font-space tracking-tight">요금제 선택</h1>
                <p className="text-gray-500">로벨롭의 AI 분석으로 매장의 미래를 가장 먼저 확인하세요.</p>
            </div>

            {/* 구독 플랜 섹션 */}
            <section className="space-y-10">
                <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-gray-100"></div>
                    <h2 className="text-xl font-bold text-gray-400 font-space uppercase tracking-widest">Subscription Plans</h2>
                    <div className="h-px flex-1 bg-gray-100"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {subscriptionPlans.map((plan, idx) => (
                        <div key={idx} className={`relative p-8 rounded-3xl border transition-all duration-300 hover:-translate-y-2 flex flex-col ${plan.color} ${plan.name === 'Master Plan' ? 'shadow-2xl shadow-gray-900/20' : 'bg-white shadow-xl shadow-gray-100 hover:border-red-500'}`}>
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                                    Most Popular
                                </div>
                            )}
                            <h3 className={`text-sm font-bold uppercase tracking-widest mb-2 ${plan.name === 'Master Plan' ? 'text-red-400' : 'text-red-600'}`}>{plan.name}</h3>
                            <div className="flex items-baseline gap-1 mb-8">
                                <span className="text-3xl font-black font-space">{plan.price}</span>
                                <span className={`text-sm ${plan.name === 'Master Plan' ? 'text-gray-400' : 'text-gray-500'}`}>{plan.period}</span>
                            </div>

                            <ul className={`space-y-3 mb-10 flex-1 ${plan.name === 'Master Plan' ? 'text-gray-300' : 'text-gray-500'} text-xs`}>
                                {plan.features.map((feature, fIdx) => (
                                    <li key={fIdx} className="flex items-center gap-2">
                                        <CheckCircle size={14} className={plan.name === 'Master Plan' ? 'text-red-400' : 'text-green-500'} /> {feature}
                                    </li>
                                ))}
                            </ul>

                            <button className={`w-full py-4 rounded-xl font-bold transition-all ${plan.buttonVariant === 'white' ? 'bg-white text-gray-900 hover:bg-gray-100' :
                                plan.buttonVariant === 'primary' ? 'bg-gray-900 text-white hover:bg-black' :
                                    'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                }`}>
                                구독 시작하기
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* 크레딧 추가 섹션 */}
            <section className="space-y-10">
                <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-gray-100"></div>
                    <h2 className="text-xl font-bold text-gray-400 font-space uppercase tracking-widest">크레딧 추가</h2>
                    <div className="h-px flex-1 bg-gray-100"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {creditPacks.map((plan, idx) => (
                        <div key={idx} className={`relative p-8 rounded-3xl border transition-all duration-300 hover:-translate-y-2 flex flex-col ${plan.color === 'bg-gray-900' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100 shadow-lg shadow-gray-100 hover:border-red-500'}`}>
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                                    Recommended
                                </div>
                            )}
                            <div className={`w-12 h-12 rounded-2xl ${plan.color} ${plan.text} flex items-center justify-center mb-6`}>
                                <Zap size={24} fill={plan.color === 'bg-gray-900' ? 'white' : 'currentColor'} />
                            </div>
                            <h3 className={`text-2xl font-bold mb-2 ${plan.color === 'bg-gray-900' ? 'text-white' : 'text-gray-900'}`}>{plan.credits} Credits</h3>
                            <div className={`text-3xl font-black font-space mb-8 ${plan.color === 'bg-gray-900' ? 'text-white' : 'text-gray-900'}`}>{plan.price}</div>

                            <ul className={`space-y-3 mb-10 flex-1 ${plan.color === 'bg-gray-900' ? 'text-gray-400' : 'text-gray-500'} text-xs`}>
                                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /> AI X-Report 생성</li>
                                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /> 시뮬레이션 테스트</li>
                            </ul>

                            <button className={`w-full py-4 rounded-xl font-bold transition-all ${plan.color === 'bg-gray-900' ? 'bg-white text-gray-900 hover:bg-gray-100' : 'bg-gray-900 text-white hover:bg-black shadow-lg shadow-gray-200'}`}>
                                충전하기
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            <div className="bg-gradient-to-r from-gray-900 to-black p-10 rounded-[2.5rem] border border-gray-800 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-center md:text-left">
                    <h4 className="text-2xl font-bold text-white mb-2">기업용 커스텀 플랜</h4>
                    <p className="text-gray-400 text-sm">프랜차이즈 본사 및 다점포 사장님을 위한 맞춤형 데이터 솔루션</p>
                </div>
                <button className="px-10 py-4 bg-white text-gray-900 rounded-2xl font-bold hover:bg-gray-100 transition-all flex items-center gap-2 whitespace-nowrap">
                    영업팀에 문의하기 <ArrowRight size={20} />
                </button>
            </div>
        </div>
    );
};

export default Pricing;
