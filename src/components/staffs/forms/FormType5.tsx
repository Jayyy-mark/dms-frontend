import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { calculateFormProgress } from "../../../helpers/progressHelper";
import { SharedFormData } from "../../../types/sharedFormData";

type Props = {
  onProgressChange?: (progress: number, missing: string[]) => void;
  sharedData?: SharedFormData;
  updateSharedField?: (field: string, value: string) => void;
};

export default function FormType5({ onProgressChange, sharedData, updateSharedField }: Props) {
  const s = sharedData || {} as any;
  const [data, setData] = useState({
    name: s.name || "",
    age_dob: s.age_dob || "",
    race_religion: s.race_religion || "",
    nrc: s.nrc || "",
    position_dept: s.current_position || "",
    service_years_join_date: "",
    current_address: s.current_address || "",
    education: s.education || "",
    father_name: s.father_name || "",
    father_job: s.father_job || "",
    mother_name: s.mother_name || "",
    mother_job: s.mother_job || "",
    first_time_abroad: false,
    abroad_times: 0,
    abroad_history: [] as any[],
    spouse_history: [] as any[],
    travel_purpose: [] as any[]
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

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="text-center pb-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Secondee/ နိုင်ငံခြားခရီးသွားကိစ္စရပ်များတွင် အသုံးပြုပါသည်။</h2>
        <p className="text-sm text-gray-500 mt-1">(၁၇- ချက်)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderInput("အမည်", "name", "text", "name")}
        {renderInput("အသက်/မွေးသက္ကရာဇ်", "age_dob", "text", "age_dob")}
        {renderInput("လူမျိုး/ကိုးကွယ်သည့်ဘာသာ", "race_religion", "text", "race_religion")}
        {renderInput("နိုင်ငံသားစိစစ်ရေးကတ်အမှတ်", "nrc", "text", "nrc")}
        {renderInput("ရာထူး/ဌာန", "position_dept", "text", "current_position")}
        {renderInput("အမှုထမ်းသက်၊ ဝင်ရောက်သည့်ရက်စွဲ", "service_years_join_date")}
        <div className="md:col-span-2">{renderInput("လက်ရှိနေရပ်လိပ်စာ", "current_address", "text", "current_address")}</div>
        <div className="md:col-span-2">{renderInput("ပညာအရည်အချင်း", "education", "text", "education")}</div>

        <div className="flex flex-col gap-1.5 border p-4 rounded-xl border-gray-200 dark:border-gray-800">
          <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">အဖအချက်အလက်</h4>
          {renderInput("အမည်", "father_name", "text", "father_name")}
          <div className="mt-2">{renderInput("အလုပ်အကိုင်", "father_job", "text", "father_job")}</div>
        </div>

        <div className="flex flex-col gap-1.5 border p-4 rounded-xl border-gray-200 dark:border-gray-800">
          <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">အမိအချက်အလက်</h4>
          {renderInput("အမည်", "mother_name", "text", "mother_name")}
          <div className="mt-2">{renderInput("အလုပ်အကိုင်", "mother_job", "text", "mother_job")}</div>
        </div>
      </div>

      {/* Abroad Section */}
      <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-800 rounded-xl">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-gray-700 dark:text-gray-300">နိုင်ငံခြားသို့သွားရောက်ခဲ့ဖူးခြင်း</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={data.first_time_abroad} onChange={e => updateField("first_time_abroad", e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500" />
              <span className="text-sm">ပထမဆုံးအကြိမ်သွားရောက်ခြင်းဖြစ်ပါသည်။</span>
            </label>
          </div>
          {!data.first_time_abroad && (
            <div className="flex items-center gap-2">
              <span className="text-sm">အကြိမ်အရေအတွက်</span>
              <input type="number" className="w-20 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 outline-none" value={data.abroad_times} onChange={e => updateField("abroad_times", parseInt(e.target.value) || 0)} />
            </div>
          )}
        </div>

        {!data.first_time_abroad && (
          <div className="overflow-x-auto mt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-semibold">နိုင်ငံခြားသို့သွားရောက်ခဲ့သည့်မှတ်တမ်း</span>
                <div className="flex gap-4">
                  <button onClick={() => addRow("abroad_history", { isNone: true })} className="text-gray-500 hover:text-gray-700 text-sm font-bold flex items-center transition-colors">မရှိပါ</button>
                  <button onClick={() => addRow("abroad_history", { duration: "", to: "", purpose: "", training: "", sponsor: "" })} className="text-indigo-600 text-sm font-bold flex items-center gap-1"><Plus className="w-4 h-4" /> ထည့်မည်</button>
                </div>
              </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="p-2">ကာလ(မှ-ထိ)</th><th className="p-2">သွားရောက်သည့်နိုင်ငံ</th><th className="p-2">ကိစ္စ</th><th className="p-2">သင်တန်းအောင်/ရှုံး</th><th className="p-2">အထောက်အပံ့</th><th className="p-2 w-10"></th>
                </tr>
              </thead>
                <tbody>
                  {data.abroad_history.map((_row: any, idx) => (
                    <tr key={idx} className="border-t border-gray-100 dark:border-gray-800">
                      {_row?.isNone ? (
                        <td colSpan={5} className="p-2 text-center text-gray-500 font-medium">မရှိပါ</td>
                      ) : (
                        <>
                          <td className="p-1"><input type="text" className="w-full bg-transparent outline-none p-1 border rounded" /></td>
                          <td className="p-1"><input type="text" className="w-full bg-transparent outline-none p-1 border rounded" /></td>
                          <td className="p-1"><input type="text" className="w-full bg-transparent outline-none p-1 border rounded" /></td>
                          <td className="p-1"><input type="text" className="w-full bg-transparent outline-none p-1 border rounded" /></td>
                          <td className="p-1"><input type="text" className="w-full bg-transparent outline-none p-1 border rounded" /></td>
                        </>
                      )}
                      <td className="p-1"><button onClick={() => removeRow("abroad_history", idx)} className="text-red-500"><Trash2 className="w-4 h-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="p-4 border rounded-xl space-y-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-gray-700 dark:text-gray-300">ဇနီး/ခင်ပွန်း အမည်</span>
            <div className="flex gap-4">
              <button onClick={() => addRow("spouse_history", { isNone: true })} className="text-gray-500 hover:text-gray-700 text-sm font-bold flex items-center transition-colors">မရှိပါ</button>
              <button onClick={() => addRow("spouse_history", { name: "", nrc: "", job: "", address: "" })} className="text-indigo-600 text-sm font-bold flex items-center gap-1"><Plus className="w-4 h-4" /> ထည့်မည်</button>
            </div>
          </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800"><tr><th className="p-2">အမည်(လူမျိုး/နိုင်ငံသား)</th><th className="p-2">အလုပ်အကိုင်</th><th className="p-2">နေရပ်လိပ်စာ</th><th className="p-2 w-10"></th></tr></thead>
            <tbody>
              {data.spouse_history.map((_row: any, idx) => (
                <tr key={idx} className="border-t border-gray-100 dark:border-gray-800">
                  {_row?.isNone ? (
                    <td colSpan={3} className="p-2 text-center text-gray-500 font-medium">မရှိပါ</td>
                  ) : (
                    <>
                      <td className="p-1"><input type="text" className="w-full bg-transparent outline-none p-1 border rounded" /></td>
                      <td className="p-1"><input type="text" className="w-full bg-transparent outline-none p-1 border rounded" /></td>
                      <td className="p-1"><input type="text" className="w-full bg-transparent outline-none p-1 border rounded" /></td>
                    </>
                  )}
                  <td className="p-1"><button onClick={() => removeRow("spouse_history", idx)} className="text-red-500"><Trash2 className="w-4 h-4" /></button></td>
                </tr>
              ))}
            </tbody>
        </table>
      </div>

      <div className="p-4 border rounded-xl space-y-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-gray-700 dark:text-gray-300">နိုင်ငံခြားသို့ ခေတ္တ/အမြဲတမ်းသွားရောက်မည့်အကြောင်း</span>
            <div className="flex gap-4">
              <button onClick={() => addRow("travel_purpose", { isNone: true })} className="text-gray-500 hover:text-gray-700 text-sm font-bold flex items-center transition-colors">မရှိပါ</button>
              <button onClick={() => addRow("travel_purpose", {})} className="text-indigo-600 text-sm font-bold flex items-center gap-1"><Plus className="w-4 h-4" /> ထည့်မည်</button>
            </div>
          </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800"><tr><th className="p-2">ကိစ္စ</th><th className="p-2">စေလွှတ်သည့်နိုင်ငံ</th><th className="p-2">အချိန်ကာလ</th><th className="p-2">သွားရောက်မည့်နေ့</th><th className="p-2">အထောက်အပံ့</th><th className="p-2">ပြန်ရောက်လျှင်ဌာန</th><th className="p-2 w-10"></th></tr></thead>
            <tbody>
              {data.travel_purpose.map((_row: any, idx) => (
                <tr key={idx} className="border-t border-gray-100 dark:border-gray-800">
                  {_row?.isNone ? (
                    <td colSpan={6} className="p-2 text-center text-gray-500 font-medium">မရှိပါ</td>
                  ) : (
                    <>
                      <td className="p-1"><input type="text" className="w-full bg-transparent outline-none p-1 border rounded" /></td>
                      <td className="p-1"><input type="text" className="w-full bg-transparent outline-none p-1 border rounded" /></td>
                      <td className="p-1"><input type="text" className="w-full bg-transparent outline-none p-1 border rounded" /></td>
                      <td className="p-1"><input type="text" className="w-full bg-transparent outline-none p-1 border rounded" /></td>
                      <td className="p-1"><input type="text" className="w-full bg-transparent outline-none p-1 border rounded" /></td>
                      <td className="p-1"><input type="text" className="w-full bg-transparent outline-none p-1 border rounded" /></td>
                    </>
                  )}
                  <td className="p-1"><button onClick={() => removeRow("travel_purpose", idx)} className="text-red-500"><Trash2 className="w-4 h-4" /></button></td>
                </tr>))}
            </tbody>
        </table>
      </div>

    </div>
  );
}
