import { useEffect, useState } from "react";
export default function TaskList()
{
    const [tasks, setTasks] = useState<{ id: number; title: string }[]>([]);

    useEffect(() =>
    {
        fetch("http://localhost:8000/tasks")
            .then(res => res.json())
            .then(data => setTasks(data));
    }, []);
    return (
        <div>
            <h2>タスク一覧</h2>
            <ul>
                {tasks.map(task => (
                    <li key={task.id}>{task.title}</li>
                ))}
            </ul>
        </div>
    );
}