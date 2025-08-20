import { Form, useActionData, useNavigation } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { loginUser } from "~/lib/api.server";
import { createUserSession, getUserSession } from "~/lib/auth.server";

//一旦metaとloaderをコメントアウトして実行してみよう。
//mateはこのページがどんなものなのかを教えてくれる
export const meta: MetaFunction = () =>{
    return [
        { title: "ログイン - Team Todo" },
        { name: "description", content: "Team Todoにログイン" },
    ];
};

export async function loader({ request }: LoaderFunctionArgs){
    const token = await getUserSession(request);
    if (token)
    {
        return redirect("/tasks");
    }
    return json({});
}

export async function action({ request }: ActionFunctionArgs){

    const formData = await request.formData();
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    // 入力バリデーション
    if (!username || !password)
    {
        return json(
            { error: "ユーザー名とパスワードを入力してください" }, 
            { status: 400 }
        );
    }

    try
    {
        // APIにログイン
        const token = await loginUser(username.toString(), password.toString());
        // セッションに保存してリダイレクト
        return await createUserSession(token, "/tasks");
    } catch (error){
        return json(
            { error: "ログインに失敗しました。ユーザー名かパスワードを確認してください。" }, 
            { status: 401 }
        );
    }
}

export default function LoginPage()
{
    const actionData = useActionData<{ error?: string }>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    return (
        <div>
            <h1>ログイン</h1>
            <Form method="post">
                <div>
                    <input
                        name="username"
                        placeholder="ユーザー名"
                        required
                    />
                </div>
                <div>
                    <input
                        type="password"
                        name="password"
                        placeholder="パスワード"
                        required
                    />
                </div>
                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "送信中..." : "ログイン"}
                </button>
                {actionData?.error && <p style={{ color: "red" }}>{actionData.error}</p>}
            </Form>
        </div>
    );
  }
