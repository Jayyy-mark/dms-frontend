import { useState } from "react";
import { CheckCircle2, Circle, Trash2, ClipboardList } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Task {
  id: number;
  text: string;
  completed: boolean;
}

/* Pre-seeded tasks (temp — no DB yet) */
const SEED_TASKS: Task[] = [
  { id: 1, text: "Upload လုပ်ထားသော Documents စစ်ဆေးရန်", completed: false },
  { id: 2, text: "System Users အသစ် အတည်ပြုရန်", completed: true },
  { id: 3, text: "Archive Report ပြင်ဆင်ရန်", completed: false },
];

export default function OverviewToDoCard() {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<Task[]>(SEED_TASKS);
  const [newTask, setNewTask] = useState("");

  const remaining = tasks.filter((t) => !t.completed).length;

  /* ── handlers ── */
  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTask.trim();
    if (!trimmed) return;
    setTasks((prev) => [
      { id: Date.now(), text: trimmed, completed: false },
      ...prev,
    ]);
    setNewTask("");
  };

  const toggleTask = (id: number) =>
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );

  const deleteTask = (id: number) =>
    setTasks((prev) => prev.filter((t) => t.id !== id));

  return (
    <div
      className="flex flex-col rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
      style={{ height: "420px" }}
    >
      {/* ── Header ── */}
      <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-500/10">
            <ClipboardList className="h-4 w-4 text-teal-500" />
          </div>
          <h2 className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-white/80">
            {t("DG နေ့စဉ်မှတ်စု")}
          </h2>
        </div>
        <span className="rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-[10px] font-bold text-teal-700 dark:border-teal-700 dark:bg-teal-500/10 dark:text-teal-400">
          {remaining} {t("Remaining")}
        </span>
      </div>

      {/* ── Add task ── */}
      <form
        onSubmit={addTask}
        className="flex shrink-0 gap-2 border-b border-gray-100 px-4 py-3 dark:border-gray-800"
      >
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder={t("လုပ်ငန်းမှတ်စု အသစ်ထည့်ရန်...")}
          className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700 placeholder-gray-400 transition focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:placeholder-gray-500"
        />
        <button
          type="submit"
          className="rounded-lg bg-teal-500 px-4 py-2 text-sm font-black text-white shadow-sm transition hover:bg-teal-600 active:scale-95"
        >
          +
        </button>
      </form>

      {/* ── Task list ── */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {tasks.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {t("မှတ်စုများ မရှိသေးပါ")}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`group flex items-center gap-2.5 rounded-xl border px-3 py-2.5 transition-all
                  ${
                    task.completed
                      ? "border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/40"
                      : "border-gray-200 bg-white shadow-xs dark:border-gray-700 dark:bg-gray-800"
                  }`}
              >
                {/* Check toggle */}
                <button
                  onClick={() => toggleTask(task.id)}
                  className="shrink-0 text-gray-300 transition hover:text-teal-500 dark:text-gray-600"
                >
                  {task.completed ? (
                    <CheckCircle2 className="h-4 w-4 text-teal-500" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                </button>

                {/* Task text */}
                <span
                  className={`flex-1 text-xs font-medium leading-snug ${
                    task.completed
                      ? "text-gray-400 line-through dark:text-gray-500"
                      : "text-gray-700 dark:text-gray-200"
                  }`}
                >
                  {task.text}
                </span>

                {/* Delete button — visible on hover */}
                <button
                  onClick={() => deleteTask(task.id)}
                  className="shrink-0 text-gray-300 opacity-0 transition hover:text-rose-500 group-hover:opacity-100 dark:text-gray-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Footer count ── */}
      <div className="shrink-0 border-t border-gray-100 px-5 py-2.5 dark:border-gray-800">
        <p className="text-[11px] text-gray-400 dark:text-gray-500">
          {tasks.filter((t) => t.completed).length} / {tasks.length} {t("completed")}
        </p>
      </div>
    </div>
  );
}
