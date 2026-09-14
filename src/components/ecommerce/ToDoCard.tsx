import { useTranslation } from "react-i18next";
import { useState } from "react";

interface Task {
  id: number;
  text: string;
  completed: boolean;
}

export default function ToDoCard() {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, text: "Review uploaded documents", completed: false },
    { id: 2, text: "Approve new system users", completed: true },
  ]);

  const [newTask, setNewTask] = useState("");

  const addTask = () => {
    if (!newTask.trim()) return;

    const task: Task = {
      id: Date.now(),
      text: newTask,
      completed: false,
    };

    setTasks([task, ...tasks]);
    setNewTask("");
  };

  const toggleTask = (id: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          To Do List
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {completedCount}/{tasks.length} Completed
        </span>
      </div>

      {/* Add Task */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Add new task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
        <button
          onClick={addTask}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition"
        >
          {t("Add")}
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-3 max-h-60 overflow-y-auto">
        {tasks.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            No tasks yet.
          </p>
        )}

        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700"
          >
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task.id)}
                className="h-4 w-4 accent-brand-500"
              />
              <span
                className={`text-sm ${
                  task.completed
                    ? "line-through text-gray-400"
                    : "text-gray-700 dark:text-gray-200"
                }`}
              >
                {task.text}
              </span>
            </div>

            <button
              onClick={() => deleteTask(task.id)}
              className="text-xs text-red-500 hover:underline"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}