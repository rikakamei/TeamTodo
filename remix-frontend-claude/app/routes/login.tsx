import { json, redirect } from "@remix-run/node";
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { loginUser } from "~/lib/api.server";
import { createUserSession, getUserSession } from "~/lib/auth.server";

export const meta: MetaFunction = () => {
  return [
    { title: "ログイン - Team Todo" },
    { name: "description", content: "Team Todoにログイン" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const token = await getUserSession(request);
  if (token) {
    return redirect("/tasks");
  }
  return json({});
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const username = formData.get("username");
  const password = formData.get("password");

  if (!username || !password) {
    return json(
      { error: "ユーザー名とパスワードを入力してください" },
      { status: 400 }
    );
  }

  try {
    const token = await loginUser(username.toString(), password.toString());
    return createUserSession(token, "/tasks");
  } catch (error) {
    return json(
      { error: "ログインに失敗しました" },
      { status: 401 }
    );
  }
}

export default function Login() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <Form method="post">
      <input 
        name="username"
        placeholder="ユーザー名"
        required
      />
      <input 
        type="password"
        name="password" 
        placeholder="パスワード"
        required
      />
      <button type="submit" disabled={isSubmitting}>ログイン</button>
      {actionData?.error && <p>{actionData.error}</p>}
    </Form>
  );
}