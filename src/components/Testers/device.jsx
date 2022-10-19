import { getCookie } from "../../lib/cookie";
const { useRef } = require("react");

function Device() {
    const dataToSend = useRef();

    const checkChannel = async () => {
        const authorization = "Bearer " + getCookie("access");
        const refresh = "Bearer " + getCookie("refresh");

        const response = await fetch(process.env.REACT_APP_PROXY_HOST + "/channel/device", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                authorization,
                refresh,
            },
            body: null,
        }).then((res) => res.json());
        console.log(response);
    };

    const sendData = async () => {};

    return (
        <div className="controllerPlane">
            <button type="button" onClick={checkChannel}>
                check channel
            </button>
            <br></br>
            <input ref={dataToSend}></input>
            <button
                type="button"
                onClick={() => {
                    window.location.href = "/mobile";
                }}
            >
                sendData
            </button>
        </div>
    );
}

export default Device;
