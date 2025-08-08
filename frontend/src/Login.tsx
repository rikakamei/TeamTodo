import { useState } from 'react';

export default function Login(props:{ onLogin :()=>void})
{
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string|null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) =>
    {
        e.preventDefault();
        const res = await fetch('http://localhost:8000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (res.ok)
        {
            const data = await res.json();
            localStorage.setItem('token', data.access_token);
            props.onLogin();
        } else
        {
            setError('ログインに失敗しました');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="ユーザー名" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="パスワード" />
            <button type="submit">ログイン</button>
            {error && <p>{error}</p>}
        </form>
    );
}
