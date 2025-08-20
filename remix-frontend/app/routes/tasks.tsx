import { json, LoaderFunction, LoaderFunctionArgs, MetaFunction, ActionFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData, useNavigation, useFetcher } from "@remix-run/react";
import { Form } from "@remix-run/react";
import { logout, requireUserSession } from "~/lib/auth.server";
import { createTask, deleteTask, getTasks } from "~/lib/api.server";

//どんなページなのか
export const meta:MetaFunction=()=>{
    return[
        { title:"タスク管理 - Team Todo"},
        { name: "description", content: "チームのタスク管理" },
    ]
}

export async function loader({request}: LoaderFunctionArgs ){
    const token = await requireUserSession(request);
    try{
        const tasks = await getTasks(token);
        return json({ tasks });
    } catch (error)
    {
        console.error("Failed to load tasks:", error);
        return json({ tasks: [] });
    }
};

export async function action({ request }: ActionFunctionArgs){
    const token = await requireUserSession(request);
    const formData = await request.formData();
    const intent = formData.get("intent");
    
    switch(intent){
        case "create": {
            const title = formData.get("title");
            if (typeof title !== "string" || !title.trim()) //title.trim()をつけて空白の場合も弾く
                return json({error:"タイトルを入力してください"});
            try {
                await createTask(title, token);
                return redirect("/tasks");
            } catch (error) {
                return json({ error: "タスクの追加に失敗しました" }, { status: 500 });
            }
        }

        case "delete": {
            const taskId = formData.get("taskId");
            // taskId が string でなければエラー
            if (typeof taskId !== "string"){
                return json({ error: "タスクIDが必要です" }, { status: 400 });
            }

            try {
              await deleteTask(parseInt(taskId), token); // 数値に変換して削除API呼び出し
              return redirect("/tasks");
            } catch (error){
              return json({ error: "タスクの削除に失敗しました" }, { status: 500 });
            }
        }

        case "logout":{
            return logout(request);
        }
        default:
            return json({ error: "無効なアクション" }, { status: 400 });
    }
}


export default function TasksIndex()
{
    const { tasks } = useLoaderData<typeof loader>();
    const navigation = useNavigation();
    const deleteFetcher = useFetcher();

    const isSubmitting = navigation.state === "submitting";

    return (
        // <>（フラグメント）の代わりに、デザインの基盤となるdivを配置
        <div className="container">

            {/* ヘッダーはコンテナの右上に配置するので、このままでOK */}
            <div className="header-right">
                <p>ログイン中です</p>
                <Form method="post">
                    <input type="hidden" name="intent" value="logout" />
                    {/* ログアウトボタンにもクラスを追加 */}
                    <button type="submit" className="logout-btn">ログアウト</button>
                </Form>
            </div>

            {/* メインコンテンツ */}
            <h1>Todoリスト</h1>

            {/* "新しいタスクを追加" という見出しは h1 に統合 */}
            {/* formにclassNameを追加してスタイルを当てやすくする */}
            <Form method="post" className="todo-form">
                <input type="hidden" name="intent" value="create" />
                {/* inputにもclassNameを追加 */}
                <input name="title" className="todo-input" placeholder="新しいタスクを入力" required />
                <button type="submit" disabled={isSubmitting}>追加</button>
            </Form>

            <div>
                {/* "タスク一覧" という見出しは不要であれば削除 */}
                {tasks.length === 0 ? (
                    <p>タスクがありません。</p>
                ) : (
                    // ulにclassNameを追加
                    <ul className="todo-list">
                        {tasks.map((task) => (
                            // task.completed のような完了状態を持つ想定でclassNameを動的に変更
                            <li
                                className="task-item"
                                key={task.id}
                            >
                                <span>{task.title}</span>
                                <deleteFetcher.Form method="post" style={{ display: 'inline' }}>
                                    <input type="hidden" name="intent" value="delete" />
                                    <input type="hidden" name="taskId" value={task.id} />
                                    <button
                                        type="submit"
                                        // 削除ボタン専用のclassNameを追加
                                        className="delete-btn"
                                        disabled={
                                            deleteFetcher.state === "submitting" &&
                                            deleteFetcher.formData?.get("taskId") === task.id.toString()
                                        }
                                    >
                                        削除
                                    </button>
                                </deleteFetcher.Form>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
