import { useState, useEffect, useRef, useCallback } from "react";
import { FileText, Save, CheckCircle, AlertTriangle, Calendar, Navigation, Briefcase, ArrowRight } from "lucide-react";
import FormType1 from "./forms/FormType1";
import FormType2 from "./forms/FormType2";
import FormType3 from "./forms/FormType3";
import FormType4 from "./forms/FormType4";
import FormType5 from "./forms/FormType5";
import { SharedFormData, emptySharedData } from "../../types/sharedFormData";

const TABS = [
  { id: "form1", label: "ပုံစံ (၁)", description: "နည်းဥပဒေ ၂၄ (ခ)", icon: Calendar, percent: 15 },
  { id: "form2", label: "ပုံစံ (၂)", description: "နည်းဥပဒေ ၃၅/၄၇", icon: CheckCircle, percent: 0 },
  { id: "form3", label: "CSDMS ပုံစံ", description: "ရာထူးဝန်အဖွဲ့", icon: AlertTriangle, percent: 50 },
  { id: "form4", label: "ခရီးသွား (၁)", description: "အမည်စာရင်းတင်ပြခြင်း", icon: Navigation, percent: 80 },
  { id: "form5", label: "ခရီးသွား (၂)", description: "Secondee ကိစ္စရပ်", icon: Briefcase, percent: 100 },
];

export default function RegisterStaff() {
  const [activeTab, setActiveTab] = useState("form1");
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [missingMap, setMissingMap] = useState<Record<string, string[]>>({});
  const [sharedData, setSharedData] = useState<SharedFormData>(emptySharedData);
  const [isProgressVisible, setIsProgressVisible] = useState(true);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsProgressVisible(entry.isIntersecting);
      },
      { threshold: 0 }
    );

    if (progressRef.current) {
      observer.observe(progressRef.current);
    }

    return () => observer.disconnect();
  }, []);

  function saveForm() {
    alert("Form saved locally.");
  }

  const currentTabIndex = TABS.findIndex(t => t.id === activeTab);
  const currentTab = TABS[currentTabIndex] || TABS[0];
  const progress = progressMap[activeTab] || 0;

  const updateSharedField = useCallback((field: string, value: string) => {
    setSharedData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleForm1Progress = useCallback((p: number, m: string[]) => {
    setProgressMap(prev => prev.form1 === p ? prev : { ...prev, form1: p });
    setMissingMap(prev => JSON.stringify(prev.form1) === JSON.stringify(m) ? prev : { ...prev, form1: m });
  }, []);

  const handleForm2Progress = useCallback((p: number, m: string[]) => {
    setProgressMap(prev => prev.form2 === p ? prev : { ...prev, form2: p });
    setMissingMap(prev => JSON.stringify(prev.form2) === JSON.stringify(m) ? prev : { ...prev, form2: m });
  }, []);

  const handleForm3Progress = useCallback((p: number, m: string[]) => {
    setProgressMap(prev => prev.form3 === p ? prev : { ...prev, form3: p });
    setMissingMap(prev => JSON.stringify(prev.form3) === JSON.stringify(m) ? prev : { ...prev, form3: m });
  }, []);

  const handleForm4Progress = useCallback((p: number, m: string[]) => {
    setProgressMap(prev => prev.form4 === p ? prev : { ...prev, form4: p });
    setMissingMap(prev => JSON.stringify(prev.form4) === JSON.stringify(m) ? prev : { ...prev, form4: m });
  }, []);

  const handleForm5Progress = useCallback((p: number, m: string[]) => {
    setProgressMap(prev => prev.form5 === p ? prev : { ...prev, form5: p });
    setMissingMap(prev => JSON.stringify(prev.form5) === JSON.stringify(m) ? prev : { ...prev, form5: m });
  }, []);

  const goToNextForm = () => {
    if (currentTabIndex < TABS.length - 1) {
      setActiveTab(TABS[currentTabIndex + 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto px-4 sm:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-md font-bold text-[#0f172a] tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-[#FEF3C7] rounded-xl text-[#B88E2F]">
              <FileText size={24} />
            </div>
            Register Staffs
          </h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">Please fill out all the necessary forms to register the staff.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={saveForm}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#B88E2F] hover:bg-[#997524] text-white text-sm font-semibold shadow-sm transition-colors"
          >
            <Save size={16} />
            Save changes
          </button>
        </div>
      </div>

      {/* Tabs as Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`cursor-pointer rounded-[1.25rem] p-6 transition-all duration-200 border border-gray-100 ${isActive
                ? "border-l-[4px] border-l-[#d97706]  shadow-md scale-[1.02]"
                : "bg-white shadow-sm hover:border-gray-200 hover:shadow"
                }`}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-4 ${isActive ? "bg-[#d97706] text-white" : "bg-[#FEF3C7] text-[#B88E2F]"
                }`}>
                <Icon size={18} />
              </div>
              <h3 className={`text-md font-bold mb-1 truncate ${isActive ? "text-[#d97706]" : "text-gray-900"}`}>
                {tab.label}
              </h3>
              <p className={`text-[12px] font-semibold truncate ${isActive ? "text-[#d97706]/80" : "text-gray-500"}`}>
                {tab.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div ref={progressRef} className="bg-white rounded-[1.25rem] border border-gray-100 p-6 shadow-sm flex flex-col justify-center">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[13px] font-bold text-[#d97706]">Form Progress: {currentTab.label}</span>
          <span className="text-[14px] font-extrabold text-[#d97706]">{progress}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-[#d97706] h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Form Content Area */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm min-h-[500px]">
        <div className="p-8">
          <div className="mb-6 pb-6 border-b border-gray-100">
            <h2 className="text-md font-bold text-gray-900">{currentTab.label}</h2>
            <p className="text-sm text-gray-500 mt-1">{currentTab.description}</p>
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {activeTab === "form1" && <FormType1 onProgressChange={handleForm1Progress} sharedData={sharedData} updateSharedField={updateSharedField} />}
            {activeTab === "form2" && <FormType2 onProgressChange={handleForm2Progress} sharedData={sharedData} updateSharedField={updateSharedField} />}
            {activeTab === "form3" && <FormType3 onProgressChange={handleForm3Progress} sharedData={sharedData} updateSharedField={updateSharedField} />}
            {activeTab === "form4" && <FormType4 onProgressChange={handleForm4Progress} sharedData={sharedData} updateSharedField={updateSharedField} />}
            {activeTab === "form5" && <FormType5 onProgressChange={handleForm5Progress} sharedData={sharedData} updateSharedField={updateSharedField} />}
          </div>
        </div>
      </div>

      {/* Floating Progress Bar */}
      <div
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 pl-6 transition-all duration-300 z-50 flex items-center ${
          !isProgressVisible ? "translate-y-0 opacity-100 visible" : "translate-y-10 opacity-0 invisible"
        }`}
      >
        <div className="flex items-center gap-4 pr-6">
          <span className="text-sm font-bold text-gray-700 whitespace-nowrap">
            {currentTab.label} Progress
          </span>
          <div className="flex items-center gap-2">
            <div className="w-32 bg-gray-100 rounded-full h-2 overflow-hidden hidden sm:block">
              <div
                className="bg-[#d97706] h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm font-extrabold text-[#d97706]">{progress}%</span>
          </div>
          
          {/* Missing fields tooltip indicator */}
          {progress < 100 && missingMap[activeTab]?.length > 0 && (
             <div className="group relative ml-2 flex items-center justify-center">
               <AlertTriangle className="w-5 h-5 text-[#d97706] cursor-help" />
               <div className="absolute bottom-full mb-3 hidden group-hover:block w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl right-0 md:left-1/2 md:-translate-x-1/2">
                 <p className="font-semibold mb-1 text-orange-300">Missing Fields:</p>
                 <ul className="list-disc pl-4 space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
                   {missingMap[activeTab].map((m, i) => (
                     <li key={i}>{m}</li>
                   ))}
                 </ul>
                 <div className="absolute -bottom-2 right-4 md:left-1/2 md:-translate-x-1/2 w-4 h-4 bg-gray-900 rotate-45"></div>
               </div>
             </div>
          )}
        </div>

        {progress === 100 && currentTabIndex < TABS.length - 1 && (
          <>
            <div className="w-px h-8 bg-gray-200" />
            <div className="pl-4 pr-2">
              <button
                onClick={goToNextForm}
                className="flex items-center gap-2 bg-[#B88E2F] hover:bg-[#997524] text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap"
              >
                Next Form <ArrowRight size={16} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
