import React, { useState, useEffect } from 'react';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Verification from './pages/Verification';
import XReport from './pages/XReport';
import Simulation from './pages/Simulation';
import YReport from './pages/YReport';
import MyPage from './pages/MyPage';
import Pricing from './pages/Pricing';
import { LoginView, SignupView } from './pages/Auth';
import SimulationMap from './components/simulation/SimulationMap';
import realData from './data/real_data.json';
import { storeApi, reportApi } from './api/reports';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authView, setAuthView] = useState('login'); // 'login' | 'signup'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);

  const [stats, setStats] = useState(realData.stats);
  const [stores, setStores] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [selectedStoreData, setSelectedStoreData] = useState(null);
  const [selectedSolutions, setSelectedSolutions] = useState([]);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await storeApi.listStores({ limit: 1000 });
        const { items, total } = response.data;

        setStats(prev => ({
          ...prev,
          storeCount: total
        }));

        const mappedStores = items.map(s => {
          const isCafe = s.sector_name?.includes('카페') || s.sector_name?.includes('커피');
          const defaultRefStore = isCafe ? realData.stores[0] : (realData.stores[1] || realData.stores[0]);

          return {
            ...s,
            name: s.store_name,
            address: s.area_code || '망원동 지역',
            lat: defaultRefStore.lat || 37.556,
            lng: defaultRefStore.lng || 126.906,
            radarData: defaultRefStore.radarData,
            keywords: defaultRefStore.keywords,
            solutions: defaultRefStore.solutions,
            grade: isCafe ? 'A' : 'B',
            rankPercent: isCafe ? 8 : 42,
            description: isCafe
              ? `${s.store_name}은 망원동 카페 상권에서 상위 8%의 경쟁력을 보유하고 있습니다.`
              : `${s.store_name}은 안정적인 고객층을 확보하고 있으나, 공간 경험 개선을 통해 추가 매출 증대가 가능합니다.`,
            fullReport: isCafe
              ? `# ${s.store_name} 분석 보고서\n\n귀점은 탁월한 메뉴 경쟁력을 갖추고 있습니다.`
              : `# ${s.store_name} 분석 보고서\n\n회전율과 객단가 최적화가 필요한 시점입니다.`
          };
        });
        console.log(`Successfully loaded ${items.length} stores from API (Total: ${total})`);
        setStores(mappedStores);
        if (mappedStores.length > 0) {
          setSelectedStoreId(mappedStores[0].id);
          setSelectedStoreData(mappedStores[0]);
        }
      } catch (error) {
        console.error("Critical API Error:", error.response?.status, error.response?.data || error.message);
        console.warn("Falling back to local mock data due to API failure.");
        setStores(realData.stores);
      }
    };
    fetchStores();
  }, []);

  useEffect(() => {
    if (selectedStoreId && stores.length > 0) {
      const store = stores.find(s => s.id === selectedStoreId);
      if (store) setSelectedStoreData(store);
    }
  }, [selectedStoreId, stores]);

  const changeTab = (tab) => {
    setActiveTab(tab);
    const steps = ['dashboard', 'verification', 'x-report', 'simulation', 'simulation_map', 'y-report'];
    const idx = steps.indexOf(tab);
    if (idx !== -1) {
      setCompletedSteps(steps.slice(0, idx));
    }
  };

  const handleAnalyze = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      changeTab('verification');
    }, 1500);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="h-full flex flex-col items-center justify-center animate-pulse py-20">
          <div className="w-20 h-20 border-4 border-gray-100 border-t-red-600 rounded-full animate-spin mb-8"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 font-space">매장을 찾고 있습니다</h2>
          <p className="text-gray-500">잠시만 기다려 주세요..</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            stats={stats}
            stores={stores}
            onAnalyze={handleAnalyze}
            selectedStoreId={selectedStoreId}
            onSelectStore={setSelectedStoreId}
          />
        );
      case 'verification':
        return (
          <Verification
            data={selectedStoreData}
            onVerified={() => changeTab('x-report')}
            onBack={() => changeTab('dashboard')}
          />
        );
      case 'x-report':
        return (
          <XReport
            data={selectedStoreData}
            onNext={() => changeTab('simulation')}
            selectedSolutions={selectedSolutions}
            onSelectSolution={setSelectedSolutions}
          />
        );
      case 'simulation':
        return (
          <Simulation
            data={selectedStoreData}
            onComplete={() => changeTab('simulation_map')}
            selectedSolutions={selectedSolutions}
          />
        );
      case 'simulation_map':
        return (
          <SimulationMap
            storeData={selectedStoreData}
            onComplete={() => changeTab('y-report')}
          />
        );
      case 'mypage':
        return (
          <MyPage
            data={selectedStoreData}
            onBack={() => changeTab('dashboard')}
            onManageMembership={() => setActiveTab('pricing')}
          />
        );
      case 'y-report':
        return <YReport />;
      case 'pricing':
        return <Pricing />;
      default:
        return <Dashboard stats={stats} stores={stores} onAnalyze={handleAnalyze} selectedStoreId={selectedStoreId} onSelectStore={setSelectedStoreId} />;
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 selection:bg-red-500 selection:text-white relative overflow-hidden animate-fade-in">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600 rounded-full mix-blend-multiply filter blur-3xl opacity-5 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-5 translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative w-full flex justify-center z-10">
          {authView === 'login' ? (
            <LoginView onLogin={() => setIsLoggedIn(true)} onSignup={() => setAuthView('signup')} />
          ) : (
            <SignupView
              onSignup={() => { setAuthView('login'); alert('회원가입이 완료되었습니다. 로그인해주세요.'); }}
              onLogin={() => setAuthView('login')}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <MainLayout
      activeTab={activeTab}
      completedSteps={completedSteps}
      onTabChange={changeTab}
      user={{
        name: '김사장님',
        plan: 'Premium Plan',
        credits: 40,
        totalCredits: 100
      }}
    >
      {renderContent()}
    </MainLayout>
  );
};

export default App;
