import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { calculateFormProgress } from "../../../helpers/progressHelper";
import { SharedFormData } from "../../../types/sharedFormData";

type Props = {
  onProgressChange?: (progress: number, missing: string[]) => void;
  sharedData?: SharedFormData;
  updateSharedField?: (field: string, value: string) => void;
};

export default function FormType4({ onProgressChange, sharedData, updateSharedField }: Props) {
  const s = sharedData || {} as any;
  const [data, setData] = useState({
    name: s.name || "",
    childhood_name: s.childhood_name || "",
    other_name: s.other_name || "",
    age_dob: s.age_dob || "",
    birth_place: s.birth_place || "",
    religion: "",
    race: "",
    nrc: s.nrc || "",
    job_dept: "",
    service_years: "",
    current_address: s.current_address || "",
    permanent_address: s.permanent_address || "",
    education: s.education || "",
    education_history: [] as any[],
    employment_history: [] as any[],
    abroad_history: [] as any[],
    parents: [] as any[],
    siblings: [] as any[],
    spouse_siblings: [] as any[],
    spouse_parents: [] as any[],
    children: [] as any[],
    abroad_relatives: [] as any[],
    punishments: [] as any[],
    court_cases: [] as any[],
    awards: [] as any[],
    travel_purpose: [] as any[],
    performance: "",
    last_exam_score: "",
    pre_exam_score: "",
  });

  useEffect(() => {
    if (onProgressChange) {
      const { progress, missing } = calculateFormProgress(data);
      onProgressChange(progress, missing);
    }
  }, [data, onProgressChange]);

  const updateField = (field: string, value: any, sharedKey?: string) => {
    setData((prev: any) => {
      if (field.includes(".")) {
        const [parent, child] = field.split(".");
        return { ...prev, [parent]: { ...prev[parent], [child]: value } };
      }
      return { ...prev, [field]: value };
    });
    if (sharedKey && updateSharedField) updateSharedField(sharedKey, value);
  };
  const addRow = (field: string, newRow: any) => setData((prev: any) => ({ ...prev, [field]: [...prev[field], newRow] }));
  const removeRow = (field: string, index: number) => setData((prev: any) => { const arr = [...prev[field]]; arr.splice(index, 1); return { ...prev, [field]: arr }; });

  const renderInput = (label: string, field: string, type = "text", sharedKey?: string) => {
    const value = field.includes(".") ? (data as any)[field.split(".")[0]][field.split(".")[1]] : (data as any)[field];
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <input type={type} className="w-full rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-[#B88E2F] focus:ring-1 focus:ring-[#B88E2F] transition-colors" value={value || ""} onChange={(e) => updateField(field, e.target.value, sharedKey)} placeholder="..." />
      </div>
    );
  };

  const renderTable = (label: string, field: string, columns: string[], template: any) => (
    <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-800 rounded-xl">
      <div className="flex justify-between items-center">
        <span className="font-semibold text-gray-700 dark:text-gray-300">{label}</span>
        <div className="flex gap-4">
          <button onClick={() => addRow(field, { isNone: true })} className="text-gray-500 hover:text-gray-700 text-sm font-bold flex items-center transition-colors">မရှိပါ</button>
          <button onClick={() => addRow(field, template)} className="text-indigo-600 hover:text-indigo-700 text-sm font-bold flex items-center gap-1 transition-colors"><Plus className="w-4 h-4" /> ထည့်မည်</button>
        </div>
      </div>
      <div className="overflow-x-auto mt-2">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {columns.map((c, i) => <th key={i} className="p-2 font-semibold text-gray-700 dark:text-gray-300">{c}</th>)}
              <th className="p-2 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {(data as any)[field].map((_row: any, idx: number) => (
              <tr key={idx} className="border-t border-gray-100 dark:border-gray-800">
                {_row?.isNone ? (
                  <td colSpan={columns.length} className="p-2 text-center text-gray-500 font-medium">မရှိပါ</td>
                ) : (
                  columns.map((_c, i) => (
                    <td key={i} className="p-1">
                      <input type="text" className="w-full bg-transparent outline-none p-1.5 border border-gray-200 dark:border-gray-700 rounded focus:border-[#B88E2F] focus:ring-1 focus:ring-[#B88E2F] transition-colors" />
                    </td>
                  ))
                )}
                <td className="p-1 text-center"><button onClick={() => removeRow(field, idx)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="text-center pb-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg pb-3 font-bold text-gray-900 dark:text-white">နိုင်ငံခြားခရီးသွားကိစ္စရပ်များအတွက် ဝန်ကြီးဌာနသို့ အမည်စာရင်းနှင့်အတူ ကနဦး တင်ပြရာတွင် အသုံးပြုပါသည်။</h2>
        <p className="text-sm text-gray-500 mt-1">(အချက်-၃၀)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderInput("၁။ အမည်", "name", "text", "name")}
        {renderInput("၂။ ငယ်နာမည်", "childhood_name", "text", "childhood_name")}
        {renderInput("၃။ အခြားအမည် (ရှိလျှင်)", "other_name", "text", "other_name")}
        {renderInput("၄။ အသက်(မွေးသက္ကရာဇ်)", "age_dob", "text", "age_dob")}
        {renderInput("၅။ မွေးဖွားရာဇာတိ", "birth_place", "text", "birth_place")}
        {renderInput("၆။ ကိုးကွယ်သည့်ဘာသာ", "religion")}
        {renderInput("၇။ လူမျိုး(ကပြားဖြစ်လျှင်မည်သည့်...)", "race")}
        {renderInput("၈။ အမျိုးသားမှတ်ပုံတင်အမှတ်/နိုင်ငံသားမှတ်ပုံတင်အမှတ်", "nrc", "text", "nrc")}
        {renderInput("၉။ အလုပ်အကိုင် / ဌာန", "job_dept")}
        {renderInput("၁၀။ အမှုထမ်းသက်", "service_years")}
        {renderInput("၁၁။ လက်ရှိနေရပ်", "current_address", "text", "current_address")}
        {renderInput("၁၂။ အမြဲတမ်းနေရပ်", "permanent_address", "text", "permanent_address")}
        {renderInput("၁၃။ ပညာအရည်အချင်း", "education", "text", "education")}
      </div>

      {renderTable("၁၄။ ပညာဆည်းပူးခဲ့သောသင်တန်း/တက်ခဲ့သောကျောင်း...", "education_history", ["ကာလ(မှ-ထိ)", "ကျောင်း/တက္ကသိုလ်/သင်တန်း", "တည်နေရာအရပ်", "အဆင့်အတန်း"], {})}
      {renderTable("၁၅။ ယခင်လုပ်ကိုင်ခဲ့သော အလုပ်ဌာနများ။", "employment_history", ["ကာလ(မှ-ထိ)", "အလုပ်ဌာန", "အလုပ်အကိုင်", "မှတ်ချက်"], {})}
      {renderTable("၁၆။ နိုင်ငံခြားရောက်ဖူးခြင်းရှိ/မရှိ။", "abroad_history", ["ကာလ(မှ-ထိ)", "သွားရောက်သည့်နိုင်ငံများ", "ကိစ္စ", "နိုင်ငံခြားငွေမည်မျှထုတ်ယူခဲ့သည်"], {})}
      {renderTable("၁၇။ နိုင်ငံခြားသို့သွားရောက်မည့် ပုဂ္ဂိုလ်၏ မိဘနှင့် မိဘ၏မောင်နှမအရင်းအချာများ။", "parents", ["အမည်", "တော်စပ်ပုံ", "ကျား/မ", "နိုင်ငံသား", "အလုပ်အကိုင်", "နေရပ်", "မှတ်ချက်"], {})}
      {renderTable("၁၈။ သွားရောက်မည့်ပုဂ္ဂိုလ်၏ မောင်နှမအရင်းအချာများ။", "siblings", ["အမည်", "တော်စပ်ပုံ", "ကျား/မ", "နိုင်ငံသား", "အလုပ်အကိုင်", "နေရပ်", "မှတ်ချက်"], {})}
      {renderTable("၁၉။ ဇနီး / ခင်ပွန်းနှင့် မောင်နှမအရင်းအချာများ။", "spouse_siblings", ["အမည်", "တော်စပ်ပုံ", "ကျား/မ", "နိုင်ငံသား", "အလုပ်အကိုင်", "နေရပ်", "မှတ်ချက်"], {})}
      {renderTable("၂၀။ ဇနီး/ ခင်ပွန်း၏ မိဘနှင့် မိဘ၏မောင်နှမအရင်းအချာများ။", "spouse_parents", ["အမည်", "တော်စပ်ပုံ", "ကျား/မ", "နိုင်ငံသား", "အလုပ်အကိုင်", "နေရပ်", "မှတ်ချက်"], {})}
      {renderTable("၂၁။ သား / သမီးများနှင့်၎င်းတို့၏ ဇနီး / ခင်ပွန်း ။", "children", ["အမည်", "တော်စပ်ပုံ", "ကျား/မ", "နိုင်ငံသား", "အလုပ်အကိုင်", "နေရပ်", "မှတ်ချက်"], {})}
      {renderTable("၂၂။ နိုင်ငံခြားတွင်ရောက်ရှိနေကြသည့်ဆွေမျိုးများ။", "abroad_relatives", ["အမည်", "တော်စပ်ပုံ", "အလုပ်အကိုင်", "ရောက်ရှိနေသည့်နိုင်ငံ", "သွားရောက်သည့်ကိစ္စ", "ပြန်လည်ရောက်ရှိမည့်ကာလ", "မှတ်ချက်"], {})}
      {renderTable("၂၃။ ဌာနဆိုင်ရာအရေးယူခံရခြင်းရှိ - မရှိ။", "punishments", ["အရေးယူခံရသည့်ကာလ", "အကြောင်းကိစ္စ", "ပြစ်ဒဏ်", "မှတ်ချက်"], {})}
      {renderTable("၂၄။ တရားရုံးတွင် တရားစွဲဆိုခံရဖူးခြင်း ရှိ - မရှိ။", "court_cases", ["တရားစွဲဆိုခံရသည့်ကာလ", "အကြောင်းကိစ္စ", "ပြစ်ဒဏ်", "မှတ်ချက်"], {})}
      {renderTable("၂၅။ ဘွဲ့ / တံဆိပ်ချီးမြှင့်ခံရခြင်းရှိ - မရှိ။", "awards", ["ချီးမြှင့်ခံရသည့်ကာလ", "ဘွဲ့/တံဆိပ်အမျိုးအစား", "မှတ်ချက်"], {})}
      {renderTable("၂၆။ နိုင်ငံခြားသို့သွားရောက်မည့်ကိစ္စ။", "travel_purpose", ["သင်ကြားမည့်ဘာသာရပ်", "စေလွှတ်သည့်တိုင်းပြည်", "အချိန်ကာလ", "သွားရောက်မည့်နေ့", "အစီအစဉ်", "ပြန်လည်ရောက်ရှိလျှင်အမှုထမ်းမည့်ဌာန"], {})}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        {renderInput("၂၈။ လုပ်ရည်ကိုင်ရည်နှင့်အကျင့်စာရိတ္တ", "performance")}
        {renderInput("၂၉။ ကျောင်းထွက်သည်မှာ(၅)နှစ်မပြည့်သေးလျှင် ရမှတ်/အဆင့်", "last_exam_score")}
        {renderInput("၃၀။ ပဏာမရွေးဖြေစာမေးပွဲတွင် ရရှိသည့်အမှတ်နှင့်အဆင့်။", "pre_exam_score")}
      </div>
    </div>
  );
}
