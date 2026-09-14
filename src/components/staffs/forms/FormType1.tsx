import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { calculateFormProgress } from "../../../helpers/progressHelper";
import { SharedFormData } from "../../../types/sharedFormData";

type Props = {
  onProgressChange?: (progress: number, missing: string[]) => void;
  sharedData?: SharedFormData;
  updateSharedField?: (field: string, value: string) => void;
};

export default function FormType1({ onProgressChange, sharedData, updateSharedField }: Props) {
  const s = sharedData || {} as any;
  const [data, setData] = useState({
    name: s.name || "", childhood_name: s.childhood_name || "", other_name: s.other_name || "",
    age_dob: s.age_dob || "", race_religion: s.race_religion || "",
    height: "", hair_color: "", eye_color: "",
    distinguishing_mark: s.distinguishing_mark || "", skin_color: "",
    weight: "", birth_place: s.birth_place || "", nrc: s.nrc || "",
    current_address: s.current_address || "", permanent_address: s.permanent_address || "",
    previous_addresses: "",
    military_service: {
      military_id: "", joined_date: "", officer_course: "", commission_date: "",
      discharge_date: "", discharge_reason: "", served_units: "", criminal_history: "", pension: ""
    },
    education: s.education || "",
    father: s.father_name || "", father_address: "",
    mother: s.mother_name || "", mother_address: "",
    parents_citizen_at_birth: "", current_job: s.current_position || "", job_start_date: "", current_salary: "",
    recruitment_type: "", salary_income: "", department_location: "",
    awards: [] as any[], trainings: [] as any[], references: "",
    previous_jobs: [] as any[], siblings: [] as any[], father_siblings: [] as any[],
    mother_siblings: [] as any[], spouse: [] as any[], children: [] as any[],
    spouse_siblings: [] as any[], spouse_father_siblings: [] as any[], spouse_mother_siblings: [] as any[],
    political_involvement: "",
    schools: "", last_school: "", school_activities: "", hobbies: "",
    past_jobs: "", insurgent_areas: "", job_changes: "", civic_activities: "",
    friends_in_power: "", foreign_travels: [] as any[], foreigner_friends: "",
    supporters: "", criminal_record: ""
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
        <h2 className="text-md font-bold text-gray-900 dark:text-white">ရာထူးတိုး/ပြောင်းရွှေ့ခြင်းစသည့်ကိစ္စရပ်များ၊ ပြည်ထဲရေးဝန်ကြီးဌာနသို့ ပေးပို့ခြင်းနှင့် ဝန်ထမ်းရေးရာကိစ္စရပ်များတွင် အသုံးပြုပါသည်။</h2>
        <p className="text-sm text-gray-500 mt-1">(၅၅ ချက်)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderInput("၁။ အမည်", "name", "text", "name")}
        {renderInput("၂။ ငယ်အမည်", "childhood_name", "text", "childhood_name")}
        {renderInput("၃။ အခြားအမည်", "other_name", "text", "other_name")}
        {renderInput("၄။ အသက် (မွေးသက္ကရာဇ်)", "age_dob", "text", "age_dob")}
        {renderInput("၅။ လူမျိုးနှင့်ကိုးကွယ်သည့်ဘာသာ", "race_religion", "text", "race_religion")}
        {renderInput("၆။ အရပ်အမြင့်", "height")}
        {renderInput("၇။ ဆံပင်အရောင်", "hair_color")}
        {renderInput("၈။ မျက်စိအရောင်", "eye_color")}
        {renderInput("၉။ ထင်ရှားသည့်အမှတ်အသား", "distinguishing_mark", "text", "distinguishing_mark")}
        {renderInput("၁၀။ အသားအရောင်", "skin_color")}
        {renderInput("၁၁။ ကိုယ်အလေးချိန်", "weight")}
        {renderInput("၁၂။ မွေးဖွားရာဇာတိ", "birth_place", "text", "birth_place")}
        {renderInput("၁၃။ နိုင်ငံသားစိစစ်ရေးကတ်ပြားအမှတ်", "nrc", "text", "nrc")}
        {renderInput("၁၄။ ယခုနေရပ်လိပ်စာအပြည့်အစုံ", "current_address", "text", "current_address")}
        {renderInput("၁၅။ အမြဲတမ်းနေရပ်လိပ်စာအပြည့်အစုံ", "permanent_address", "text", "permanent_address")}
        <div className="md:col-span-2">{renderInput("၁၆။ ယခင်နေခဲ့ဖူးသောဒေသနှင့်နေရပ်လိပ်စာများ", "previous_addresses")}</div>
      </div>

      <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 space-y-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">၁၇။ တပ်မတော်သို့ဝင်ခဲ့ဖူးလျှင်/ တပ်မတော်သားဖြစ်လျှင်</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderInput("(က) ကိုယ်ပိုင်အမှတ်", "military_service.military_id")}
          {renderInput("(ခ) တပ်သို့ဝင်သည့်နေ့", "military_service.joined_date")}
          {renderInput("(ဂ) ဗိုလ်လောင်းသင်တန်းအမှတ်စဉ်", "military_service.officer_course")}
          {renderInput("(ဃ) ပြန်တမ်းဝင်ဖြစ်သည့်နေ့", "military_service.commission_date")}
          {renderInput("(င) တပ်ထွက်သည့်နေ့", "military_service.discharge_date")}
          {renderInput("(စ) ထွက်သည့်အကြောင်း", "military_service.discharge_reason")}
          {renderInput("(ဆ) အမှုထမ်းဆောင်ခဲ့သောတပ်များ", "military_service.served_units")}
          {renderInput("(ဇ) တပ်တွင်းရာဇဝင်အကျဉ်း/ပြစ်မှု", "military_service.criminal_history")}
          {renderInput("(ဈ) အငြိမ်းစားလစာ", "military_service.pension")}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        {renderInput("၁၈။ ပညာအရည်အချင်း", "education", "text", "education")}
        {renderInput("၁၉။ အဘအမည်၊ လူမျိုး၊ ကိုးကွယ်သည့်ဘာသာ၊ ဇာတိ နှင့်အလုပ်အကိုင်", "father", "text", "father_name")}
        {renderInput("၂၀။ ၄င်း၏နေရပ်လိပ်စာအပြည့်အစုံ", "father_address")}
        {renderInput("၂၁။ အမိအမည်၊ လူမျိုး၊ ကိုးကွယ်သည့်ဘာသာ၊ ဇာတိ နှင့်အလုပ်အကိုင်", "mother", "text", "mother_name")}
        {renderInput("၂၂။ ၄င်း၏နေရပ်လိပ်စာအပြည့်အစုံ", "mother_address")}
        {renderInput("၂၃။ မိဘနှစ်ပါးသည် နိုင်ငံသားဟုတ်/မဟုတ်", "parents_citizen_at_birth")}
        {renderInput("၂၄။ လက်ရှိအလုပ်အကိုင်နှင့်အဆင့်", "current_job", "text", "current_position")}
        {renderInput("၂၅။ လက်ရှိရာထူးရသည့်နေ့", "job_start_date")}
        {renderInput("၂၆။ လက်ရှိအလုပ်အကိုင်ရလစာပုံ", "current_salary")}
        {renderInput("၂၇။ ပြိုင်အရွေးခံ (သို့) တိုက်ရိုက်ခန့်", "recruitment_type")}
        {renderInput("၂၈။ လစာဝင်ငွေ", "salary_income")}
        {renderInput("၂၉။ ဌာန၊ နေရာ", "department_location")}
      </div>

      {renderTable("၃၀။ ချီးမြှင့်ခံရသည့် ဘွဲ့ထူး၊ ဂုဏ်ထူး၊ တံဆိပ်လက်မှတ်များ", "awards", ["ကာလ", "ဘွဲ့/တံဆိပ်အမျိုးအစား", "အမိန့်စာ/ရက်စွဲ"], {})}
      {renderTable("၃၁။ တက်ရောက်ခဲ့သည့်သင်တန်းများ", "trainings", ["ကာလ(မှ-ထိ)", "သင်တန်းအကြောင်းအရာ", "တည်နေရာ", "အဆင့်"], {})}

      {renderInput("၃၂။ အလုပ်အကိုင်အတွက် ထောက်ခံသူများ", "references")}

      {renderTable("၃၃။ ယခင်လုပ်ကိုင်ဖူးသည့်အလုပ်အကိုင်", "previous_jobs", ["အဆင့်", "တပ်/ဌာန", "နေရာ"], {})}

      <h3 className="font-bold text-gray-900 dark:text-white mt-8 mb-4 border-b pb-2">မိသားစုရာဇဝင်များ</h3>
      {renderTable("၃၄။ ညီအစ်ကိုမောင်နှမများ", "siblings", ["အမည်", "လူမျိုး/ဘာသာ", "ဇာတိ", "အလုပ်အကိုင်", "နေရပ်လိပ်စာ"], {})}
      {renderTable("၃၅။ အဘ၏ညီအစ်ကိုမောင်နှမများ", "father_siblings", ["အမည်", "လူမျိုး/ဘာသာ", "ဇာတိ", "အလုပ်အကိုင်", "နေရပ်လိပ်စာ"], {})}
      {renderTable("၃၆။ အမိ၏ညီအစ်ကိုမောင်နှမများ", "mother_siblings", ["အမည်", "လူမျိုး/ဘာသာ", "ဇာတိ", "အလုပ်အကိုင်", "နေရပ်လိပ်စာ"], {})}
      {renderTable("၃၇။ ခင်ပွန်း/ဇနီးသည်", "spouse", ["အမည်", "လူမျိုး/ဘာသာ", "ဇာတိ", "အလုပ်အကိုင်", "နေရပ်လိပ်စာ"], {})}
      {renderTable("၃၈။ သားသမီးများ", "children", ["အမည်", "လူမျိုး/ဘာသာ", "ဇာတိ", "အလုပ်အကိုင်", "နေရပ်လိပ်စာ"], {})}
      {renderTable("၃၉။ ခင်ပွန်း/ဇနီးသည်၏ညီအစ်ကိုမောင်နှမများ", "spouse_siblings", ["အမည်", "လူမျိုး/ဘာသာ", "ဇာတိ", "အလုပ်အကိုင်", "နေရပ်လိပ်စာ"], {})}
      {renderTable("၄၀။ ခင်ပွန်း/ဇနီးသည် အဘနှင့်ညီအစ်ကိုမောင်နှမများ", "spouse_father_siblings", ["အမည်", "လူမျိုး/ဘာသာ", "ဇာတိ", "အလုပ်အကိုင်", "နေရပ်လိပ်စာ"], {})}
      {renderTable("၄၁။ ခင်ပွန်း/ဇနီးသည် အမိနှင့်ညီအစ်ကိုမောင်နှမများ", "spouse_mother_siblings", ["အမည်", "လူမျိုး/ဘာသာ", "ဇာတိ", "အလုပ်အကိုင်", "နေရပ်လိပ်စာ"], {})}

      {renderInput("၄၂။ မိမိနှင့် ဆွေမျိုးများသည် နိုင်ငံရေးပါတီများတွင် ဝင်ရောက်ဆောင်ရွက်မှု ရှိ မရှိ", "political_involvement")}

      <h3 className="font-bold text-gray-900 dark:text-white mt-8 mb-4 border-b pb-2">ငယ်စဉ်မှယခုအချိန်ထိ ကိုယ်ရေးရာဇဝင်</h3>
      <div className="grid grid-cols-1 gap-y-4">
        {renderInput("၁။ နေခဲ့ဖူးသောကျောင်းများ", "schools")}
        {renderInput("၂။ နောက်ဆုံးအောင်မြင်ခဲ့သည့်ကျောင်း/အတန်း၊ ခုံအမှတ်၊ ဘာသာရပ်", "last_school")}
        {renderInput("၃။ ကျောင်းသားဘဝတွင် နိုင်ငံရေး/မြို့ရေး/ရွာရေး ဆောင်ရွက်မှုများနှင့် အဆင့်အတန်း၊ တာဝန်", "school_activities")}
        {renderInput("၄။ ဝါသနာပါပြီး လေ့လာလိုက်စားခဲ့သော ကျန်းမာရေး၊ ကစားခုန်စား၊ အနုပညာ၊ ပညာရေး၊ စက်မှုလက်မှု", "hobbies")}
        {renderInput("၅။ လုပ်ကိုင်ခဲ့သော အလုပ်အကိုင်များနှင့် ဌာန/မြို့နယ်", "past_jobs")}
        {renderInput("၆။ တောခိုဖူးလျှင်/သောင်းကျန်းသူများနှင့် နယ်မြေတွင်နေခဲ့ဖူးလျှင်", "insurgent_areas")}
        {renderInput("၇။ အလုပ်အကိုင်ပြောင်းရွှေ့ခဲ့သော အကြောင်းအမျိုးမျိုးနှင့်လစာ", "job_changes")}
        {renderInput("၈။ အမှုထမ်းနေစဉ် နိုင်ငံရေး၊ မြို့/ရွာရေးဆောင်ရွက်မှုများ", "civic_activities")}
        {renderInput("၉။ စစ်ဘက်/နယ်ဘက်/ရဲဘက်နှင့် နိုင်ငံရေးဘက်တွင် ခင်မင်ရင်းနှီးသော မိတ်ဆွေများ", "friends_in_power")}
      </div>

      {renderTable("၁၀။ နိုင်ငံခြားသို့ သွားရောက်ခဲ့ဖူးလျှင်", "foreign_travels", ["သွားရောက်ခဲ့သည့်နိုင်ငံ", "အကြောင်း", "တွေ့ဆုံသည့်ပုဂ္ဂိုလ်/ဌာန", "သွား/ပြန်ရက်"], {})}

      <div className="grid grid-cols-1 gap-y-4 mt-4">
        {renderInput("၁၁။ မိမိနှင့်ခင်မင်ရင်းနှီးသော နိုင်ငံခြားသား ရှိ မရှိ", "foreigner_friends")}
        {renderInput("၁၂။ မိမိအားထောက်ခံပေးမည့်ပုဂ္ဂိုလ်", "supporters")}
        {renderInput("၁၃။ ရာဇဝတ်ပြစ်မှုခံရခြင်း ရှိ/မရှိ", "criminal_record")}
      </div>

    </div>
  );
}
