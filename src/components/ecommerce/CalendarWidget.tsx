import { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

// Sample meeting data keyed by "YYYY-MM-DD"
const meetingData: Record<string, { title: string; time: string; color: string }[]> = {
  "2026-07-07": [
    { title: "DG ၏ ညွှန်ကြားရေးမှူး အစည်းအဝေး", time: "09:00 AM", color: "bg-teal-500" },
    { title: "ဘတ်ဂျက်သုံးသပ်ချက် အစည်း", time: "02:00 PM", color: "bg-amber-400" },
  ],
  "2026-07-10": [
    { title: "နောက်နှစ် စီမံကိန်း ဆွေးနွေး", time: "10:30 AM", color: "bg-indigo-500" },
  ],
  "2026-07-15": [
    { title: "ISO စစ်ဆေးရေး အစည်းအဝေး", time: "11:00 AM", color: "bg-cyan-500" },
    { title: "Staff Training Review", time: "03:00 PM", color: "bg-rose-500" },
  ],
  "2026-07-21": [
    { title: "မော်ကွန်းတိုက် စစ်ဆေးမှု", time: "09:00 AM", color: "bg-purple-500" },
  ],
};

const DAYS_OF_WEEK = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function CalendarWidget() {
  const { t } = useTranslation();
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const selectedKey = selectedDay !== null
    ? `${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`
    : "";
  const selectedMeetings = selectedKey ? (meetingData[selectedKey] ?? []) : [];

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const hasMeeting = (day: number) => {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return !!meetingData[key];
  };

  return (
    <div
      className="flex flex-col rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
      style={{ height: "420px" }}
    >
      {/* ── Header ── */}
      <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-500/10">
            <CalendarDays className="h-4 w-4 text-amber-500" />
          </div>
          <h2 className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-white/80">
            {t("အစည်းအဝေးပြက္ခဒိန်")}
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[100px] text-center text-[11px] font-extrabold text-amber-600 dark:text-amber-400">
            {t(MONTHS[month])} {year}
          </span>
          <button
            onClick={nextMonth}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 flex-col overflow-hidden px-5 pb-4 pt-3">

      {/* Day-of-week labels */}
      <div className="mb-1 grid grid-cols-7 text-center">
        {DAYS_OF_WEEK.map((d) => (
          <span key={d} className="py-1 text-[10px] font-bold text-gray-400 dark:text-gray-500">
            {d}
          </span>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {/* Empty cells before first day */}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {/* Day cells */}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const active = selectedDay === day;
          const todayCell = isToday(day);
          const meeting = hasMeeting(day);

          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`relative flex h-8 w-full items-center justify-center rounded-lg text-xs font-semibold transition-all
                ${active
                  ? "bg-teal-500 text-white shadow-sm"
                  : todayCell
                    ? "border border-teal-400 text-teal-600 dark:text-teal-400"
                    : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
            >
              {day}
              {meeting && (
                <span
                  className={`absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full ${active ? "bg-white" : "bg-amber-400"}`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Event display */}
      <div className="mt-3 flex-1 overflow-y-auto rounded-xl border border-gray-100 bg-gray-50 p-3.5 dark:border-gray-700 dark:bg-gray-800/50">
        <p className="mb-2 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
          <CalendarDays className="h-3.5 w-3.5" />
          {selectedDay
            ? `${String(selectedDay).padStart(2, "0")} ${t(MONTHS[month])}`
            : t("ရက်စွဲ ရွေးချယ်ပါ")}
        </p>
        {selectedMeetings.length > 0 ? (
          <div className="space-y-2">
            {selectedMeetings.map((m, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${m.color}`} />
                <div>
                  <p className="text-[11px] font-semibold text-gray-700 dark:text-gray-200">{m.title}</p>
                  <p className="text-[10px] text-gray-400">{m.time}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            {t("ဤနေ့တွင် သတ်မှတ်ထားသော အစည်းအဝေး မရှိပါ")}
          </p>
        )}
      </div>
      </div>{/* end body */}
    </div>
  );
}
