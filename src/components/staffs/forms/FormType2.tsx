import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { calculateFormProgress } from "../../../helpers/progressHelper";
import { SharedFormData } from "../../../types/sharedFormData";

type Props = {
  onProgressChange?: (progress: number, missing: string[]) => void;
  sharedData?: SharedFormData;
  updateSharedField?: (field: string, value: string) => void;
};

export default function FormType2({ onProgressChange, sharedData, updateSharedField }: Props) {
  const s = sharedData || {} as any;
  const [data, setData] = useState({
    name: s.name || "",
    nrc: s.nrc || "",
    race_religion: s.race_religion || "",
    birth_place: s.birth_place || "",
    father_name: s.father_name || "",
    mother_name: s.mother_name || "",
    father_job: s.father_job || "",
    mother_job: s.mother_job || "",
    spouse_name_job: "",
    dob: s.age_dob || "",
    distinguishing_mark: s.distinguishing_mark || "",
    current_position: s.current_position || "",
    current_address: s.current_address || "",
    permanent_address: s.permanent_address || "",
    education: s.education || "",
    other_languages: "",
    other_remarks: "",
    training: [] as any[],
    duties: [] as any[],
    social_orgs: "",
    awards: [] as any[],
    punishments: [] as any[],
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
        <h2 className="text-md font-bold text-gray-900 dark:text-white">ရာထူးတိုးကိစ္စရပ်နှင့်အခြားဝန်ထမ်းရေးရာကိစ္စများ တွင် အသုံးပြုပါသည်။</h2>
        <p className="text-sm text-gray-500 mt-1">(၂၁- ချက်)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderInput("၁။ အမည်", "name", "text", "name")}
        {renderInput("၂။ နိုင်ငံသားစိစစ်ရေးကတ်ပြားအမှတ်", "nrc", "text", "nrc")}
        {renderInput("၃။ လူမျိုး/ဘာသာ", "race_religion", "text", "race_religion")}
        {renderInput("၄။ မွေးဖွားရာအရပ်", "birth_place", "text", "birth_place")}
        {renderInput("၅။ အဘအမည်", "father_name", "text", "father_name")}
        {renderInput("အမိအမည်", "mother_name", "text", "mother_name")}
        {renderInput("၆။ အဘအလုပ်အကိုင်", "father_job", "text", "father_job")}
        {renderInput("အမိအလုပ်အကိုင်", "mother_job", "text", "mother_job")}
        {renderInput("၇။ ဇနီး/ခင်ပွန်းအမည်နှင့် အလုပ်အကိုင်", "spouse_name_job")}
        {renderInput("၈။ မွေးဖွားသည့်ရက်၊ လ၊ ခုနှစ်", "dob", "date", "age_dob")}
        {renderInput("၉။ ကိုယ်တွင်ထင်ရှားသည့်အမှတ်အသား", "distinguishing_mark", "text", "distinguishing_mark")}
        {renderInput("၁၀။ လက်ရှိရာထူး", "current_position", "text", "current_position")}
        <div className="md:col-span-2">{renderInput("၁၁။ လက်ရှိနေရပ်လိပ်စာ", "current_address", "text", "current_address")}</div>
        <div className="md:col-span-2">{renderInput("၁၂။ အမြဲတမ်းနေရပ်လိပ်စာ", "permanent_address", "text", "permanent_address")}</div>
        {renderInput("၁၃။ ပညာအရည်အချင်း", "education", "text", "education")}
        {renderInput("၁၄။ တတ်မြောက်သည့် အခြားဘာသာစကားနှင့် အဆင့်", "other_languages")}
      </div>

      {renderTable("၁၅။ တက်ရောက်ခဲ့သည့် သင်တန်းများ", "training", ["ကာလ(မှ-ထိ)", "သင်တန်းအကြောင်းအရာ", "တည်နေရာ", "အဆင့်"], {})}
      {renderTable("၁၆။ ထမ်းဆောင်ခဲ့သောတာဝန်များ", "duties", ["တာဝန်", "ရုံး/ဌာန/အဖွဲ့အစည်း", "ကာလ(မှ-ထိ)", "မှတ်ချက်"], {})}

      {renderInput("၁၇။ ပါဝင်ဆောင်ရွက်ဆဲနှင့် ဆောင်ရွက်ခဲ့သည့်လူမှုရေးအဖွဲ့အစည်းများ", "social_orgs")}

      {renderTable("၁၈။ ချီးမြှင့်ခံရသည့် ဘွဲ့ထူးဂုဏ်ထူးနှင့် တံဆိပ်များ", "awards", ["ကာလ", "ဘွဲ့/တံဆိပ်အမည်", "ဆုတံဆိပ်အမှတ်/အမိန့်စာအမှတ်"], {})}
      {renderTable("၁၉။ ပြစ်ဒဏ်ရဖူးခြင်း ရှိ/မရှိ (ရှိပါကဖော်ပြရန်)", "punishments", ["ပြစ်ဒဏ်အကြောင်းအရာများ"], {})}

      {renderInput("၂၀။ အခြားတင်ပြလိုသည့်အချက်များ", "other_remarks")}
    </div>
  );
}
