import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { calculateFormProgress } from "../../../helpers/progressHelper";
import { SharedFormData } from "../../../types/sharedFormData";

type Props = {
  onProgressChange?: (progress: number, missing: string[]) => void;
  sharedData?: SharedFormData;
  updateSharedField?: (field: string, value: string) => void;
};

export default function FormType3({ onProgressChange, sharedData, updateSharedField }: Props) {
  const s = sharedData || {} as any;
  const [data, setData] = useState({
    name: s.name || "",
    gender: "ကျား",
    employee_number: "",
    dob: s.age_dob || "",
    race: "",
    religion: "",
    father_name: s.father_name || "",
    mother_name: s.mother_name || "",
    nrc_number: s.nrc || "",
    spouse_name: "",
    children_names: "",
    address: s.current_address || "",
    education: s.education || "",
    current_position: s.current_position || "",
    current_salary: "",
    current_department: "",
    blood_group: "O+",
    military_history: [] as any[],
    local_training: [] as any[],
    foreign_training: [] as any[],
    criminal_record: [] as any[],
    awards: [] as any[],
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
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</label>
        <input type={type} className="w-full rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-[#B88E2F] focus:ring-1 focus:ring-[#B88E2F] transition-colors" value={value || ""} onChange={(e) => updateField(field, e.target.value, sharedKey)} placeholder="..." />
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="text-center pb-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">ပြည်ထောင်စုရာထူးဝန်အဖွဲ့သို့ Civil Service Personal Database Management System ပုံစံတွင် ဖြည့်စွက်ပေးပို့ရပါသည်။</h2>
        <p className="text-sm text-gray-500 mt-1">(၁၈ ချက်)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">အမည် (ကျား/မ)</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="အမည်"
              className="flex-1 min-w-0 px-4 py-2 text-sm rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:border-[#B88E2F] focus:ring-1 focus:ring-[#B88E2F] transition-colors"
              value={data.name}
              onChange={(e) => updateField("name", e.target.value, "name")}
            />
            <select
              className="w-24 px-3 py-2 text-sm rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:border-[#B88E2F] focus:ring-1 focus:ring-[#B88E2F] transition-colors"
              value={data.gender}
              onChange={(e) => updateField("gender", e.target.value)}
            >
              <option value="ကျား">ကျား</option>
              <option value="မ">မ</option>
            </select>
          </div>
        </div>

        {renderInput("ဝန်ထမ်းအမှတ်", "employee_number")}
        {renderInput("မွေးနေ့ (ရက်၊ လ၊ နှစ်)", "dob", "date", "age_dob")}

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">လူမျိုး/ဘာသာ</label>
          <div className="flex gap-2">
            <input type="text" placeholder="လူမျိုး" className="flex-1 min-w-0 px-4 py-2 text-sm rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:border-[#B88E2F] focus:ring-1 focus:ring-[#B88E2F] transition-colors" value={data.race} onChange={(e) => updateField("race", e.target.value)} />
            <input type="text" placeholder="ဘာသာ" className="flex-1 min-w-0 px-4 py-2 text-sm rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:border-[#B88E2F] focus:ring-1 focus:ring-[#B88E2F] transition-colors" value={data.religion} onChange={(e) => updateField("religion", e.target.value)} />
          </div>
        </div>

        {renderInput("အဘအမည်", "father_name", "text", "father_name")}
        {renderInput("အမိအမည်", "mother_name", "text", "mother_name")}
        {renderInput("နိုင်ငံသားစိစစ်ရေးအမှတ်", "nrc_number", "text", "nrc")}
        {renderInput("ဇနီး/ခင်ပွန်းအမည်", "spouse_name")}
        {renderInput("သား/သမီးအမည်", "children_names")}

        <div className="md:col-span-2 lg:col-span-3">
          {renderInput("လိပ်စာ", "address", "text", "current_address")}
        </div>

        {renderInput("ပညာအရည်အချင်း", "education", "text", "education")}

        <div className="flex flex-col gap-1.5 lg:col-span-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">လက်ရှိရာထူး/လစာနှုန်း/ဌာန</label>
          <div className="flex gap-2">
            <input type="text" placeholder="ရာထူး" className="flex-1 min-w-0 px-4 py-2 text-sm rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:border-[#B88E2F] focus:ring-1 focus:ring-[#B88E2F] transition-colors" value={data.current_position} onChange={(e) => updateField("current_position", e.target.value, "current_position")} />
            <input type="text" placeholder="လစာနှုန်း" className="flex-1 min-w-0 px-4 py-2 text-sm rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:border-[#B88E2F] focus:ring-1 focus:ring-[#B88E2F] transition-colors" value={data.current_salary} onChange={(e) => updateField("current_salary", e.target.value)} />
            <input type="text" placeholder="ဌာန" className="flex-1 min-w-0 px-4 py-2 text-sm rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:border-[#B88E2F] focus:ring-1 focus:ring-[#B88E2F] transition-colors" value={data.current_department} onChange={(e) => updateField("current_department", e.target.value)} />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">သွေးအုပ်စု</label>
          <select
            className="w-full px-4 py-2 text-sm rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:border-[#B88E2F] focus:ring-1 focus:ring-[#B88E2F] transition-colors"
            value={data.blood_group}
            onChange={(e) => updateField("blood_group", e.target.value)}
          >
            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
          </select>
        </div>
      </div>

      {/* Tables section */}
      <div className="space-y-6">
        {/* Table 1 */}
        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300">နိုင်ငံ့ဝန်ထမ်းတာဝန်ထမ်းဆောင်မှုမှတ်တမ်း (စစ်ဘက်/နယ်ဘက်)</h3>
            <div className="flex gap-4">
              <button onClick={() => addRow("military_history", { isNone: true })} className="text-gray-500 hover:text-gray-700 text-sm font-bold flex items-center transition-colors">မရှိပါ</button>
              <button onClick={() => addRow("military_history", { department: "", duration_from: "", duration_to: "", location: "" })} className="text-indigo-600 text-sm font-bold flex items-center gap-1"><Plus className="w-4 h-4" /> ထည့်မည်</button>
            </div>
          </div>
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="p-2 font-semibold text-gray-700 dark:text-gray-300">ရာထူး/ဌာန</th>
                  <th className="p-2 font-semibold text-gray-700 dark:text-gray-300 text-center" colSpan={2}>တာဝန်ထမ်းဆောင်သည့်ကာလ (မှ - ထိ)</th>
                  <th className="p-2 font-semibold text-gray-700 dark:text-gray-300">နေရာ/ဒေသ</th>
                  <th className="p-2 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {data.military_history.map((_row: any, idx) => (
                  <tr key={idx} className="border-t border-gray-100 dark:border-gray-800">
                    {_row?.isNone ? (
                      <td colSpan={4} className="p-2 text-center text-gray-500 font-medium">မရှိပါ</td>
                    ) : (
                      <>
                        <td className="p-1"><input type="text" className="w-full bg-transparent outline-none p-1.5 border border-gray-200 dark:border-gray-700 rounded focus:border-[#B88E2F] focus:ring-1 focus:ring-[#B88E2F] transition-colors" placeholder="..." /></td>
                        <td className="p-1"><input type="date" className="w-full bg-transparent outline-none p-1.5 border border-gray-200 dark:border-gray-700 rounded focus:border-[#B88E2F] focus:ring-1 focus:ring-[#B88E2F] transition-colors" /></td>
                        <td className="p-1"><input type="date" className="w-full bg-transparent outline-none p-1.5 border border-gray-200 dark:border-gray-700 rounded focus:border-[#B88E2F] focus:ring-1 focus:ring-[#B88E2F] transition-colors" /></td>
                        <td className="p-1"><input type="text" className="w-full bg-transparent outline-none p-1.5 border border-gray-200 dark:border-gray-700 rounded focus:border-[#B88E2F] focus:ring-1 focus:ring-[#B88E2F] transition-colors" placeholder="..." /></td>
                      </>
                    )}
                    <td className="p-1 text-center"><button onClick={() => removeRow("military_history", idx)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 2 */}
        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300">ပြည်တွင်းသင်တန်းများ တက်ရောက်မှု</h3>
            <div className="flex gap-4">
              <button onClick={() => addRow("local_training", { isNone: true })} className="text-gray-500 hover:text-gray-700 text-sm font-bold flex items-center transition-colors">မရှိပါ</button>
              <button onClick={() => addRow("local_training", { name: "", from: "", to: "", location: "" })} className="text-indigo-600 text-sm font-bold flex items-center gap-1"><Plus className="w-4 h-4" /> ထည့်မည်</button>
            </div>
          </div>
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="p-2 font-semibold text-gray-700 dark:text-gray-300">သင်တန်းအမည်</th>
                  <th className="p-2 font-semibold text-gray-700 dark:text-gray-300 text-center" colSpan={2}>တာဝန်ထမ်းဆောင်သည့်ကာလ (မှ - ထိ)</th>
                  <th className="p-2 font-semibold text-gray-700 dark:text-gray-300">နေရာ/ဒေသ</th>
                  <th className="p-2 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {data.local_training.map((_row: any, idx) => (
                  <tr key={idx} className="border-t border-gray-100 dark:border-gray-800">
                    {_row?.isNone ? (
                      <td colSpan={4} className="p-2 text-center text-gray-500 font-medium">မရှိပါ</td>
                    ) : (
                      <>
                        <td className="p-1"><input type="text" className="w-full bg-transparent outline-none p-1.5 border border-gray-200 dark:border-gray-700 rounded focus:border-[#B88E2F] focus:ring-1 focus:ring-[#B88E2F] transition-colors" placeholder="..." /></td>
                        <td className="p-1"><input type="date" className="w-full bg-transparent outline-none p-1.5 border border-gray-200 dark:border-gray-700 rounded focus:border-[#B88E2F] focus:ring-1 focus:ring-[#B88E2F] transition-colors" /></td>
                        <td className="p-1"><input type="date" className="w-full bg-transparent outline-none p-1.5 border border-gray-200 dark:border-gray-700 rounded focus:border-[#B88E2F] focus:ring-1 focus:ring-[#B88E2F] transition-colors" /></td>
                        <td className="p-1"><input type="text" className="w-full bg-transparent outline-none p-1.5 border border-gray-200 dark:border-gray-700 rounded focus:border-[#B88E2F] focus:ring-1 focus:ring-[#B88E2F] transition-colors" placeholder="..." /></td>
                      </>
                    )}
                    <td className="p-1 text-center"><button onClick={() => removeRow("local_training", idx)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 3 */}
        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300">နိုင်ငံခြားသင်တန်းများ တက်ရောက်မှု</h3>
            <div className="flex gap-4">
              <button onClick={() => addRow("foreign_training", { isNone: true })} className="text-gray-500 hover:text-gray-700 text-sm font-bold flex items-center transition-colors">မရှိပါ</button>
              <button onClick={() => addRow("foreign_training", { name: "", from: "", to: "", location: "" })} className="text-indigo-600 text-sm font-bold flex items-center gap-1"><Plus className="w-4 h-4" /> ထည့်မည်</button>
            </div>
          </div>
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="p-2 font-semibold text-gray-700 dark:text-gray-300">သင်တန်းအမည်</th>
                  <th className="p-2 font-semibold text-gray-700 dark:text-gray-300 text-center" colSpan={2}>တာဝန်ထမ်းဆောင်သည့်ကာလ (မှ - ထိ)</th>
                  <th className="p-2 font-semibold text-gray-700 dark:text-gray-300">နေရာ/နိုင်ငံ</th>
                  <th className="p-2 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {data.foreign_training.map((_row: any, idx) => (
                  <tr key={idx} className="border-t border-gray-100 dark:border-gray-800">
                    {_row?.isNone ? (
                      <td colSpan={4} className="p-2 text-center text-gray-500 font-medium">မရှိပါ</td>
                    ) : (
                      <>
                        <td className="p-1"><input type="text" className="w-full bg-transparent outline-none p-1.5 border border-gray-200 dark:border-gray-700 rounded focus:border-[#B88E2F] focus:ring-1 focus:ring-[#B88E2F] transition-colors" placeholder="..." /></td>
                        <td className="p-1"><input type="date" className="w-full bg-transparent outline-none p-1.5 border border-gray-200 dark:border-gray-700 rounded focus:border-[#B88E2F] focus:ring-1 focus:ring-[#B88E2F] transition-colors" /></td>
                        <td className="p-1"><input type="date" className="w-full bg-transparent outline-none p-1.5 border border-gray-200 dark:border-gray-700 rounded focus:border-[#B88E2F] focus:ring-1 focus:ring-[#B88E2F] transition-colors" /></td>
                        <td className="p-1"><input type="text" className="w-full bg-transparent outline-none p-1.5 border border-gray-200 dark:border-gray-700 rounded focus:border-[#B88E2F] focus:ring-1 focus:ring-[#B88E2F] transition-colors" placeholder="..." /></td>
                      </>
                    )}
                    <td className="p-1 text-center"><button onClick={() => removeRow("foreign_training", idx)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 4 */}
        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300">ပြစ်မှုပြစ်ဒဏ်များ</h3>
            <div className="flex gap-4">
              <button onClick={() => addRow("criminal_record", { isNone: true })} className="text-gray-500 hover:text-gray-700 text-sm font-bold flex items-center transition-colors">မရှိပါ</button>
              <button onClick={() => addRow("criminal_record", { offense: "", reason: "", from: "", to: "" })} className="text-indigo-600 text-sm font-bold flex items-center gap-1"><Plus className="w-4 h-4" /> ထည့်မည်</button>
            </div>
          </div>
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="p-2 font-semibold text-gray-700 dark:text-gray-300">ပြစ်ဒဏ်</th>
                  <th className="p-2 font-semibold text-gray-700 dark:text-gray-300">ပြစ်ဒဏ်ချမှတ်ခံရသည့်အကြောင်းအရာ</th>
                  <th className="p-2 font-semibold text-gray-700 dark:text-gray-300 text-center" colSpan={2}>ပြစ်ဒဏ်ချမှတ်သည့်ကာလ (မှ - ထိ)</th>
                  <th className="p-2 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {data.criminal_record.map((_row: any, idx) => (
                  <tr key={idx} className="border-t border-gray-100 dark:border-gray-800">
                    {_row?.isNone ? (
                      <td colSpan={4} className="p-2 text-center text-gray-500 font-medium">မရှိပါ</td>
                    ) : (
                      <>
                        <td className="p-1"><input type="text" className="w-full bg-transparent outline-none p-1.5 border border-gray-200 dark:border-gray-700 rounded focus:border-[#B88E2F] focus:ring-1 focus:ring-[#B88E2F] transition-colors" placeholder="..." /></td>
                        <td className="p-1"><input type="text" className="w-full bg-transparent outline-none p-1.5 border border-gray-200 dark:border-gray-700 rounded focus:border-[#B88E2F] focus:ring-1 focus:ring-[#B88E2F] transition-colors" placeholder="..." /></td>
                        <td className="p-1"><input type="date" className="w-full bg-transparent outline-none p-1.5 border border-gray-200 dark:border-gray-700 rounded focus:border-[#B88E2F] focus:ring-1 focus:ring-[#B88E2F] transition-colors" /></td>
                        <td className="p-1"><input type="date" className="w-full bg-transparent outline-none p-1.5 border border-gray-200 dark:border-gray-700 rounded focus:border-[#B88E2F] focus:ring-1 focus:ring-[#B88E2F] transition-colors" /></td>
                      </>
                    )}
                    <td className="p-1 text-center"><button onClick={() => removeRow("criminal_record", idx)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 5 */}
        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300">ရရှိခဲ့သည့် ဘွဲ့ထူးဂုဏ်ထူးနှင့် တံဆိပ်များ</h3>
            <div className="flex gap-4">
              <button onClick={() => addRow("awards", { isNone: true })} className="text-gray-500 hover:text-gray-700 text-sm font-bold flex items-center transition-colors">မရှိပါ</button>
              <button onClick={() => addRow("awards", { name: "", order_no: "" })} className="text-indigo-600 text-sm font-bold flex items-center gap-1"><Plus className="w-4 h-4" /> ထည့်မည်</button>
            </div>
          </div>
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="p-2 font-semibold text-gray-700 dark:text-gray-300">ဘွဲ့ထူး၊ဂုဏ်ထူးတံဆိပ်အမည်</th>
                  <th className="p-2 font-semibold text-gray-700 dark:text-gray-300">အမိန့်အမှတ်/ခုနှစ်</th>
                  <th className="p-2 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {data.awards.map((_row: any, idx) => (
                  <tr key={idx} className="border-t border-gray-100 dark:border-gray-800">
                    {_row?.isNone ? (
                      <td colSpan={2} className="p-2 text-center text-gray-500 font-medium">မရှိပါ</td>
                    ) : (
                      <>
                        <td className="p-1"><input type="text" className="w-full bg-transparent outline-none p-1.5 border border-gray-200 dark:border-gray-700 rounded focus:border-[#B88E2F] focus:ring-1 focus:ring-[#B88E2F] transition-colors" placeholder="..." /></td>
                        <td className="p-1"><input type="text" className="w-full bg-transparent outline-none p-1.5 border border-gray-200 dark:border-gray-700 rounded focus:border-[#B88E2F] focus:ring-1 focus:ring-[#B88E2F] transition-colors" placeholder="..." /></td>
                      </>
                    )}
                    <td className="p-1 text-center"><button onClick={() => removeRow("awards", idx)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
