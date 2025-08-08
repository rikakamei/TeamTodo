import { useTaskContext } from "./Context";
export default function AddTask()
{
    const { title, setTitle, handleAdd } = useTaskContext();
    return (
        <form onSubmit={handleAdd}>
            <input value={title} onChange={(e) => setTitle(e.target.value)} />
            <button type="submit">追加</button>
        </form>
    );
}





