import './App.css'
import TaskList from './TaskList'
import AddTask from './TaskAdd'
import Login from './Login'
import { useState, useEffect } from 'react';
import { TaskProvider } from './Context';
export default function App()
{
    const [loggedIn, setLoggedIn] = useState(false);
    useEffect(() =>
    {
        const token = localStorage.getItem('token');
        if (token) setLoggedIn(true);
    }, []);
    return (
        <TaskProvider>
            {
                loggedIn ? (
                    <div>
                        <p>ログイン中です</p>
                        <div>
                            <h2>新しいタスクを追加</h2>
                            <AddTask />
                            <TaskList />
                        </div>
                        <button onClick={() =>
                        {
                            localStorage.removeItem('token');
                            setLoggedIn(false);
                        }}>ログアウト</button>
                    </div>
                ) : (
                    <Login onLogin={() => setLoggedIn(true)} />
                )
            }
        </TaskProvider>
    )
}






