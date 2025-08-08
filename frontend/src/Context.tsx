import { createContext, useEffect, useState, useContext } from 'react';
export type Task = {
    id: number;
    title: string;
    done: boolean;
}
export interface TaskContextType
{
    tasks: Task[];
    loading: boolean;
    error: string | null;
    title: string;
    setTitle: (title: string) => void;
    fetchTasks: () => Promise<void>;
    handleAdd: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
    handleDelete: (id: number) => Promise<void>;
}
export const TaskContext = createContext<TaskContextType | null>(null);
export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) =>
{
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [title, setTitle] = useState("");
    const fetchTasks = async () =>
    {
        setLoading(true);
        setError(null);
        try
        {
            const res = await fetch("http://localhost:8000/tasks");
            if (!res.ok)
            {
                throw new Error(`HTTP error! Status: ${res.status}`);
            }
            const data: Task[] = await res.json();
            console.log("Fetched tasks:", data); // デバッグ用
            setTasks(data);
        } catch (err)
        {
            console.error("Failed to fetch tasks:", err);
            setError("タスクの取得に失敗しました。");
        } finally
        {
            setLoading(false);
        }
    };
    const handleAdd = async (e: React.FormEvent<HTMLFormElement>) =>
    {
        e.preventDefault();
        if (!title.trim())
        {
            console.log("Title is empty!");
            return;
        }
        console.log('Adding task with title:', title); // デバッグ用
        try
        {
            const res = await fetch("http://localhost:8000/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: title, done: false }) // idを削除（FastAPIが自動生成）
            });
            if (!res.ok)
            {
                throw new Error(`HTTP error! Status: ${res.status}`);
            }
            const newTask = await res.json();
            console.log("Response from server:", newTask); // デバッグ用
            // サーバーからの応答を確認して、正しい形式でタスクを追加
            if (newTask && newTask.id)
            {
                setTasks(prevTasks => [...prevTasks, newTask]);
            } else
            {
                // もしサーバーが期待と違う形式を返す場合の処理
                await fetchTasks(); // タスク一覧を再取得
            }
            setTitle("");
        } catch (err)
        {
            console.error("Failed to add task:", err);
            setError("タスクの追加に失敗しました。");
        }
    };
    const handleDelete = async (id: number) =>
    {
        try
        {
            const res = await fetch(`http://localhost:8000/tasks/${id}`, {
                method: "DELETE",
            });
            if (!res.ok)
            {
                throw new Error(`HTTP error! Status: ${res.status}`);
            }
            setTasks(tasks.filter(task => task.id !== id))
        } catch (err)
        {
            console.error("Failed to delete task:", err);
            setError("タスクの削除に失敗しました。");
        }
    };
    const value: TaskContextType = {
        tasks,
        loading,
        error,
        title,
        setTitle,
        fetchTasks,
        handleAdd,
        handleDelete
    };
    return (
        <TaskContext.Provider value={value}>
            {children}
        </TaskContext.Provider>
    );
}
export const useTaskContext = () =>
{
    const context = useContext(TaskContext);
    if (!context)
    {
        throw new Error("useTaskContext must be used within a TaskProvider");
    }
    return context;
};