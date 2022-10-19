import { useRef } from "react";
import { setCookie } from "../../lib/cookie";

function Login(props) {
    const UserId = useRef();
    const PassWord = useRef();

    const login = async () => {
        const userid = UserId.current.value;
        const password = PassWord.current.value;

        const response = await fetch(process.env.REACT_APP_PROXY_HOST + "/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ userid, password }),
        }).then((res) => res.json());

        console.log(response);

        if (response.data) {
            setCookie("access", response.data.accessToken);
            setCookie("refresh", response.data.refreshToken);
        } else {
            alert("로그인 실패");
        }
    };

    return (
        <div>
            <input type="text" ref={UserId}></input>
            <br />
            <input type="password" ref={PassWord}></input>
            <br />
            <button onClick={login}>로그인</button>
        </div>
    );
}

export default Login;
