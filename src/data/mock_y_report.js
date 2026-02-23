export const yReportMockData = {
    // 지표 1: 기본 방문 지표
    overview: {
        sim1: { totalVisits: 142, marketShare: 8.2 },
        sim2: { totalVisits: 189, marketShare: 10.45 },
    },
    // 워드클라우드 키워드
    keywords: {
        sim1: [
            { text: '가성비', weight: 18 }, { text: '맛있다', weight: 15 },
            { text: '점심특선', weight: 12 }, { text: '직장인', weight: 11 },
            { text: '혼밥', weight: 10 }, { text: '가까워서', weight: 9 },
            { text: '빠른식사', weight: 8 }, { text: '편의성', weight: 7 },
            { text: '웨이팅길다', weight: 14 }, { text: '메뉴다양', weight: 6 },
        ],
        sim2: [
            { text: '분위기맛집', weight: 22 }, { text: '원격줄서기', weight: 19 },
            { text: '2인세트', weight: 17 }, { text: '데이트코스', weight: 15 },
            { text: '맛커스텀', weight: 13 }, { text: '깔끔한매장', weight: 11 },
            { text: '가성비', weight: 10 }, { text: '직장인', weight: 9 },
            { text: '인스타감성', weight: 8 }, { text: '재방문의사', weight: 7 },
        ],
    },
    // 지표 2: 평점 분포
    ratingDistribution: {
        taste: {
            sim1: [
                { score: 1, density: 0.05 }, { score: 1.5, density: 0.08 }, { score: 2, density: 0.15 },
                { score: 2.5, density: 0.22 }, { score: 3, density: 0.35 }, { score: 3.5, density: 0.42 },
                { score: 4, density: 0.30 }, { score: 4.5, density: 0.15 }, { score: 5, density: 0.06 },
            ],
            sim2: [
                { score: 1, density: 0.02 }, { score: 1.5, density: 0.04 }, { score: 2, density: 0.08 },
                { score: 2.5, density: 0.14 }, { score: 3, density: 0.25 }, { score: 3.5, density: 0.38 },
                { score: 4, density: 0.48 }, { score: 4.5, density: 0.32 }, { score: 5, density: 0.12 },
            ],
        },
        value: {
            sim1: [
                { score: 1, density: 0.08 }, { score: 1.5, density: 0.12 }, { score: 2, density: 0.22 },
                { score: 2.5, density: 0.30 }, { score: 3, density: 0.38 }, { score: 3.5, density: 0.28 },
                { score: 4, density: 0.18 }, { score: 4.5, density: 0.10 }, { score: 5, density: 0.04 },
            ],
            sim2: [
                { score: 1, density: 0.03 }, { score: 1.5, density: 0.05 }, { score: 2, density: 0.10 },
                { score: 2.5, density: 0.16 }, { score: 3, density: 0.28 }, { score: 3.5, density: 0.40 },
                { score: 4, density: 0.45 }, { score: 4.5, density: 0.28 }, { score: 5, density: 0.10 },
            ],
        },
        atmosphere: {
            sim1: [
                { score: 1, density: 0.06 }, { score: 1.5, density: 0.10 }, { score: 2, density: 0.18 },
                { score: 2.5, density: 0.28 }, { score: 3, density: 0.36 }, { score: 3.5, density: 0.32 },
                { score: 4, density: 0.22 }, { score: 4.5, density: 0.12 }, { score: 5, density: 0.05 },
            ],
            sim2: [
                { score: 1, density: 0.04 }, { score: 1.5, density: 0.06 }, { score: 2, density: 0.12 },
                { score: 2.5, density: 0.18 }, { score: 3, density: 0.30 }, { score: 3.5, density: 0.38 },
                { score: 4, density: 0.42 }, { score: 4.5, density: 0.25 }, { score: 5, density: 0.10 },
            ],
        },
    },
    ratingSummary: {
        sim1: { avg: 3.42, satisfaction: 31.0 },
        sim2: { avg: 3.81, satisfaction: 54.5 },
    },
    // 지표 3: 시간대별 트래픽
    hourlyTraffic: [
        { slot: '아침(07)', sim1: 8, sim2: 12 },
        { slot: '점심(12)', sim1: 52, sim2: 68 },
        { slot: '저녁(18)', sim1: 48, sim2: 72 },
        { slot: '야식(22)', sim1: 34, sim2: 37 },
    ],
    peakSlot: { sim1: '점심(12)', sim2: '저녁(18)' },
    // 지표 4: 세대별 증감
    generation: [
        { gen: 'Z1', sim1: 12.5, sim2: 18.2 },
        { gen: 'Z2', sim1: 28.3, sim2: 31.5 },
        { gen: 'Y', sim1: 35.2, sim2: 30.1 },
        { gen: 'X', sim1: 18.0, sim2: 14.8 },
        { gen: 'S', sim1: 6.0, sim2: 5.4 },
    ],
    // 지표 5: 방문 목적
    purpose: [
        { type: '생활베이스형', sim1Pct: 42.3, sim2Pct: 35.8, sim1Sat: 3.2, sim2Sat: 3.9 },
        { type: '사적모임형', sim1Pct: 25.1, sim2Pct: 32.4, sim1Sat: 3.5, sim2Sat: 4.1 },
        { type: '공적모임형', sim1Pct: 18.7, sim2Pct: 19.0, sim1Sat: 3.4, sim2Sat: 3.7 },
        { type: '가족모임형', sim1Pct: 13.9, sim2Pct: 12.8, sim1Sat: 3.6, sim2Sat: 3.8 },
    ],
    // 지표 6: 재방문율
    retention: {
        sim1Agents: 68, sim2Agents: 89,
        retained: 42, newUsers: 47, churned: 26,
        retentionRate: 61.8, newRatio: 52.8,
    },
    // 지표 9: 에이전트 유형
    agentType: [
        { type: '유동', sim1: 58.2, sim2: 52.3 },
        { type: '상주', sim1: 41.8, sim2: 47.7 },
    ],
    // 지표 10: 성별 구성
    gender: [
        { label: '남', sim1: 45.2, sim2: 42.8 },
        { label: '여', sim1: 38.5, sim2: 41.6 },
        { label: '혼성', sim1: 16.3, sim2: 15.6 },
    ],
    // 지표 7: 경쟁 매장 비교
    radar: [
        { metric: '방문수', unit: '명', target_before: 142, target_after: 189, comp1: 210, comp2: 165, comp3: 130 },
        { metric: '평점', unit: '점', target_before: 3.42, target_after: 3.81, comp1: 3.65, comp2: 3.90, comp3: 3.30 },
        { metric: '재방문율', unit: '%', target_before: 31, target_after: 44, comp1: 38, comp2: 42, comp3: 28 },
        { metric: '만족도', unit: '%', target_before: 31, target_after: 55, comp1: 45, comp2: 52, comp3: 35 },
        { metric: 'Z세대비율', unit: '%', target_before: 41, target_after: 50, comp1: 55, comp2: 48, comp3: 32 },
    ],
    radarStores: { comp1: '오시 망원본점', comp2: '마마무식당', comp3: '홍익돈까스' },
    // 지표 11: 크로스탭
    crosstab: {
        generations: ['Z1', 'Z2', 'Y', 'X', 'S'],
        purposes: ['생활베이스형', '사적모임형', '공적모임형', '가족모임형'],
        sim2: [
            [30, 40, 20, 10],
            [25, 35, 25, 15],
            [40, 20, 25, 15],
            [45, 15, 20, 20],
            [50, 10, 15, 25],
        ],
    },
    // 지표 8: LLM 요약
    sideEffects: [
        { type: 'warning', metric: 'Y세대 방문 비중', change: -5.1, unit: '%p', detail: '2인 세트 메뉴 도입이 1인 직장인(Y세대) 방문을 감소시킬 수 있음' },
        { type: 'warning', metric: '점심 시간대 트래픽', change: -12, unit: '%', detail: '피크타임이 저녁으로 전환되며 점심 매출 공백 발생 위험' },
        { type: 'watch', metric: '가성비 인식', change: -0.3, unit: '점', detail: '인테리어 개선 후 "비싸 보인다"는 인식이 소폭 증가' },
    ],
    tradeoffs: [
        { gain: 'Z세대(Z1+Z2) 유입', gainVal: '+8.9%p', loss: 'Y세대 이탈', lossVal: '-5.1%p' },
        { gain: '사적모임형 방문', gainVal: '+7.3%p', loss: '생활베이스형 감소', lossVal: '-6.5%p' },
        { gain: '저녁 트래픽 급증', gainVal: '+50%', loss: '점심 트래픽 하락', lossVal: '-12%' },
        { gain: '분위기 만족도', gainVal: '+0.5점', loss: '가성비 인식', lossVal: '-0.3점' },
    ],
    riskScore: {
        score: 23,
        level: '낮은 위험',
        positive: 8,
        watch: 1,
        negative: 2,
        totalMetrics: 11,
    },
    llmSummary: `**전략의 효과 분석**\n\n전략 적용 후 '류진'의 방문 수는 +33.1%로 유의미한 증가를 보였습니다. 평균 평점은 3.42점에서 3.81점으로 0.39점 상승하였으며, 만족도(4점 이상)는 31.0%에서 54.5%로 23.5%p 급증하였습니다.\n\n**바뀐 주 고객층의 특성**\n\nZ세대(Z1+Z2) 비율이 40.8%에서 49.7%로 확대되며 젊은 고객층 유입이 두드러졌습니다. 사적모임형 방문이 25.1%→32.4%로 증가하며, 데이트·모임 수요를 성공적으로 흡수했습니다.\n\n**재방문율 및 고객 충성도**\n\n기존 고객 유지율 61.8%로 양호하며, 신규 유입 47명이 이탈 26명을 크게 상회합니다. 장기 충성도 강화를 위해 포인트/쿠폰 제도 도입을 권장합니다.\n\n**향후 권장 사항**\n\n1. 저녁 시간대 집중 프로모션으로 신규 피크타임 매출을 극대화하세요.\n2. Z세대 타겟 SNS 마케팅(인스타감성, 분위기맛집)을 지속 강화하세요.\n3. 점심 시간대 방문 유지를 위해 직장인 대상 신속 서비스 유지가 필요합니다.`,
};
