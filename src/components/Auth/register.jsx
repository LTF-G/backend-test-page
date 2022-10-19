import { useRef } from "react";
import { setCookie } from "../../lib/cookie";

function Register(props) {
    const UserId = useRef();
    const PassWord = useRef();
    const PassWordVerify = useRef();
    const Nickname = useRef();

    const register = async () => {
        const userid = UserId.current.value;
        const password = PassWord.current.value;
        const passwordverify = PassWordVerify.current.value;
        const nickname = Nickname.current.value;

        if (password !== passwordverify) {
            alert("ㄴㄴ");
            return;
        }

        const response = await fetch(process.env.REACT_APP_PROXY_HOST + "/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ userid, password, nickname }),
        }).then((res) => res.json());

        console.log(response);
    };

    return (
        <div>
            userid <input type="text" ref={UserId}></input>
            <br />
            password <input type="password" ref={PassWord}></input>
            <br />
            pw check<input type="password" ref={PassWordVerify}></input>
            <br />
            nickname <input type="text" ref={Nickname}></input>
            <br />
            <button onClick={register}>회원가입</button>
        </div>
    );
}

export default Register;
