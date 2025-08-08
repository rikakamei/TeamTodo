import { useEffect, useState } from "react";
import type { Task } from "./TaskList";

export default function TaskDelete(props: { 
    task: Task; 
    handleDelete:(id: number) =>Promise< void>; 
})
{
    return (
        <span>
            {/* ✅ 削除ボタンを追加 */}
            <button onClick={() => props.handleDelete(props.task.id)} style={{ marginLeft: '10px' }}>
                削除
            </button>
        </span>
    );
}