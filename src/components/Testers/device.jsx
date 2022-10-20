// import { getCookie } from "../../lib/cookie";
import startViewer from "../../lib/kinesis/viewer";
const { useRef } = require("react");

function Device() {
    const dataToSend = useRef();
    const sendData = useRef();

    const checkChannel = async () => {
        const response = await fetch(process.env.REACT_APP_PROXY_HOST + "/channel/device", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            body: null,
        })
            .then((res) => res.json())
            .then(async (data) => {
                console.log(data.channelData);
                if (data.channelData) sendData.current = (await startViewer(data.channelData, () => {})).send;
            });
        console.log(response);
    };

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
                    sendData.current(dataToSend.current.value);
                }}
            >
                sendData
            </button>
        </div>
    );
}

export default Device;
