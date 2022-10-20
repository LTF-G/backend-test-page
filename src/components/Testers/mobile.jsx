import { getCookie } from "../../lib/cookie";
import startMaster from "../../lib/kinesis/master";
const { useRef } = require("react");

function Mobile(props) {
    const dataToSend = useRef();
    const sendData = useRef();

    const createChannel = async () => {
        const authorization = "Bearer " + getCookie("access");
        const refresh = "Bearer " + getCookie("refresh");

        await fetch(process.env.REACT_APP_PROXY_HOST + "/channel/mobile", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                authorization,
                refresh,
            },
            body: null,
        })
            .then((res) => res.json())
            .then(async (data) => {
                console.log(data);
                if (data.createdChannelData)
                    sendData.current = (await startMaster(data.createdChannelData, () => {})).send;
            });
    };

    const checkChannel = async () => {
        const authorization = "Bearer " + getCookie("access");
        const refresh = "Bearer " + getCookie("refresh");

        const response = await fetch(process.env.REACT_APP_PROXY_HOST + "/channel/mobile", {
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

    const deleteChannel = async () => {
        const authorization = "Bearer " + getCookie("access");
        const refresh = "Bearer " + getCookie("refresh");

        const response = await fetch(process.env.REACT_APP_PROXY_HOST + "/channel/mobile", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                authorization,
                refresh,
            },
            body: null,
        }).then((res) => res.json());
        console.log(response);
    };

    return (
        <div className="controllerPlane">
            <button type="button" onClick={createChannel}>
                create channel
            </button>
            <button type="button" onClick={checkChannel}>
                check channel
            </button>
            <button type="button" onClick={deleteChannel}>
                delete channel
            </button>
            <br></br>
            <input ref={dataToSend}></input>
            <button
                type="button"
                onClick={() => {
                    sendData.current(dataToSend.current.value);
                }}
            >
                sendData
            </button>
        </div>
    );
}

export default Mobile;
