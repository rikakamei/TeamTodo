// app/session.server.ts
import { createCookieSessionStorage, redirect } from "@remix-run/node";

const sessionSecret = process.env.SESSION_SECRET || "dev-secret";

const sessionStorage = createCookieSessionStorage({
    cookie: {
        name: "__session",         // Cookieの名前
        httpOnly: true,            // JSから直接アクセスできない
        maxAge: 60 * 60 * 24, // 24 hours
        sameSite: "lax",           // CSRF対策
        path: "/",                 // 全ルートで有効
        secure: process.env.NODE_ENV === "production", // httpsのみ
        secrets: [sessionSecret], // 暗号化キー
    }
});

// セッションにユーザートークンを保存してリダイレクト
export async function createUserSession(token: string, redirectTo: string)
{
    const session = await sessionStorage.getSession();
    session.set("token", token);
    return redirect(redirectTo, {
        headers: {
            "Set-Cookie": await sessionStorage.commitSession(session),
        },
    });
}

export async function getUserSession(request: Request)
{
    const session = await sessionStorage.getSession(
        request.headers.get("Cookie")
    );
    return session.get("token");
}

export async function requireUserSession(request: Request, redirectTo: string = "/login")
{
    const token = await getUserSession(request);
    if (!token) {
        throw redirect(redirectTo);
    }
    return token;
}

export async function logout(request: Request)
{
    const session = await sessionStorage.getSession(request.headers.get("Cookie"));
    return redirect("/login", {
        headers: {
            "Set-Cookie": await sessionStorage.destroySession(session),
        },
    });
}