import { useState } from "react";

export default function AddTask()
{
    const [title, setTitle] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) =>
    {
        e.preventDefault();
        await fetch("http://localhost:8000/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: Date.now(), title, done: false })
        });
        setTitle("");
    };

    return (
        <form onSubmit={handleSubmit}>
            <input value={title} onChange={(e) => setTitle(e.target.value)} />
            <button type="submit">追加</button>
        </form>
    );
}
