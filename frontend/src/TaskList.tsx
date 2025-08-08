import { useEffect, useState } from "react";
import TaskDelete from "./TaskDelete";
import { useTaskContext } from "./Context";

export type Task = { id: number; title: string; done: boolean }

export default function TaskList()
{
    const {tasks,fetchTasks,handleDelete} = useTaskContext();
    // const [tasks, setTasks] = useState<Task[]>([]);
    // const [loading, setLoading] = useState<boolean>(true);
    // const [error, setError] = useState<string | null>(null);

    // // タスク一覧をフェッチする関数を定義
    // const fetchTasks = async () =>
    // {
    //     setLoading(true);
    //     setError(null);
    //     try
    //     {
    //         const res = await fetch("http://localhost:8000/tasks");
    //         if (!res.ok)
    //         {
    //             throw new Error(`HTTP error! Status: ${res.status}`);
    //         }
    //         const data: Task[] = await res.json();
    //         setTasks(data);
    //     } catch (err)
    //     {
    //         console.error("Failed to fetch tasks:", err);
    //         setError("タスクの取得に失敗しました。");
    //     } finally
    //     {
    //         setLoading(false);
    //     }
    // };

    // const handleDelete = async (id: number) =>
    // {
    //     try
    //     {
    //         // DELETEメソッドを使って、FastAPIの /tasks/{task_id} エンドポイントにリクエストを送信
    //         const res = await fetch(`http://localhost:8000/tasks/${id}`, {
    //             method: "DELETE",
    //         });

    //         if (!res.ok)
    //         {
    //             throw new Error(`HTTP error! Status: ${res.status}`);
    //         }

    //         setTasks(tasks.filter(task=>task.id!==id))
    //         // // 削除が成功したら、タスク一覧を再読み込みしてUIを更新
    //         // fetchTasks();
    //     } catch (err)
    //     {
    //         console.error("Failed to delete task:", err);
    //         setError("タスクの削除に失敗しました。");
    //     }
    // };

    useEffect(() =>
    {
        fetchTasks()
    }, []);

    return (
        <div>
            <h2>タスク一覧</h2>
            {tasks.length === 0 ? (
                <p>タスクがありません。</p>
            ) : (
                <ul>
                    {tasks.map(task => (
                        <li key={task.id}>
                            {task.title}
                            <TaskDelete 
                                task= {task} 
                                handleDelete={handleDelete}
                            />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}