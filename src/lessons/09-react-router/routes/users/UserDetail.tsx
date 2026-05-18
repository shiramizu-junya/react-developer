import { useParams } from "react-router-dom";

export const UserDetail = () => {
    const { id } = useParams<{ id: string }>();

    return (
        <div>
            <h2>User Detail</h2>
            <p>ユーザーID：{id}</p>
        </div>
    )
}
