const SignalingClient = require("amazon-kinesis-video-streams-webrtc").SignalingClient;

class CustomSigner {
    constructor(_url) {
        this.url = _url;
    }

    getSignedURL() {
        return this.url;
    }
}

/**
 * Start WebRTC Connection for Viewer side.
 * @param {object} kinesisInfo - Information about KInesis
 * @param {HTMLVideoElement} localView - HTML Video Player that displays Webcam view of master
 * @param {function(string)} onStatsReport - callback function to inform current stat of webrtc connection
 * @return {function():void} close function that sends connection termination signal to another peer
 */
async function startViewer(kinesisInfo, pollConnection) {
    const role = "VIEWER";
    this.clientId = "client";

    const configuration = kinesisInfo.configuration;

    this.signalingClient = new SignalingClient({
        requestSigner: new CustomSigner(kinesisInfo.url),
        role,
        clientId: this.clientId,
        region: "default",
        channelARN: "default",
        channelEndpoint: "default",
    });

    this.peerConnection = new RTCPeerConnection(configuration);
    this.peerConnectionStatsInterval = setInterval(() => this.peerConnection.getStats().then(pollConnection), 1000);

    this.dataChannel = this.peerConnection.createDataChannel("kvsDataChannel");
    this.peerConnection.ondatachannel = (e) => {
        e.channel.onmessage = (msg) => {
            console.log(msg);
        };
    };

    this.signalingClient.on("open", async () => {
        console.log("[VIEWER] Connected to signaling service");

        // Create an SDP offer to send to the master
        console.log("[VIEWER] Creating SDP offer");
        await this.peerConnection.setLocalDescription(
            await this.peerConnection.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true,
            })
        );

        // When trickle ICE is enabled, send the offer now and then send ICE candidates as they are generated. Otherwise wait on the ICE candidates.
        console.log("[VIEWER] Sending SDP offer");
        this.signalingClient.sendSdpOffer(this.peerConnection.localDescription);
        console.log("[VIEWER] Generating ICE candidates");
    });

    this.signalingClient.on("sdpAnswer", async (answer) => {
        // Add the SDP answer to the peer connection
        console.log("[VIEWER] Received SDP answer");
        await this.peerConnection.setRemoteDescription(answer);
    });

    this.signalingClient.on("iceCandidate", (candidate) => {
        // Add the ICE candidate received from the MASTER to the peer connection
        console.log("[VIEWER] Received ICE candidate");
        this.peerConnection.addIceCandidate(candidate);
    });

    this.signalingClient.on("close", () => {
        console.log("[VIEWER] Disconnected from signaling channel");
    });

    this.signalingClient.on("error", (error) => {
        console.error("[VIEWER] Signaling client error: ", error);
    });

    // Send any ICE candidates to the other peer
    this.peerConnection.addEventListener("icecandidate", ({ candidate }) => {
        if (candidate) {
            console.log("[VIEWER] Generated ICE candidate");

            // When trickle ICE is enabled, send the ICE candidates as they are generated.
            console.log("[VIEWER] Sending ICE candidate");
            this.signalingClient.sendIceCandidate(candidate);
        } else {
            console.log("[VIEWER] All ICE candidates have been generated");

            // When trickle ICE is disabled, send the offer now that all the ICE candidates have ben generated.
            // console.log("[VIEWER] Sending SDP offer");
            // this.signalingClient.sendSdpOffer(this.peerConnection.localDescription);
        }
    });

    console.log("[VIEWER] Starting viewer connection");
    this.signalingClient.open();

    // close function that sends connection termination signal to another peer
    return {
        close: () => {},
        send: (message) => {
            console.log(this.dataChannel);
            this.dataChannel.send(message);
        },
    };
}

module.exports = startViewer;
