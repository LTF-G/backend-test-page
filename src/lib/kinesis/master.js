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
 * Start WebRTC Connection for Master side.
 * @param {object} kinesisInfo - Information about KInesis
 * @param {HTMLVideoElement} localView - HTML Video Player that displays Webcam view of master
 * @param {function(string)} onStatsReport - callback function to inform current stat of webrtc connection
 * @return {function():void} close function that sends connection termination signal to another peer
 */
async function startMaster(kinesisInfo, onStatsReport) {
    // this.localView = localView;

    const role = "MASTER";
    this.clientId = null;
    this.role = role;

    const configuration = kinesisInfo.configuration;

    this.signalingClient = new SignalingClient({
        requestSigner: new CustomSigner(kinesisInfo.url),
        role,
        region: "default",
        channelARN: "default",
        channelEndpoint: "default",
    });

    this.signalingClient.on("open", async () => {
        console.log("[MASTER] Connected to signaling service");
    });

    this.signalingClient.on("sdpOffer", async (offer, remoteClientId) => {
        console.log("[MASTER] Received SDP offer from client: " + remoteClientId);

        this.peerConnection = new RTCPeerConnection(configuration);

        this.dataChannel = this.peerConnection.createDataChannel("kvsDataChannel");
        this.peerConnection.ondatachannel = (e) => {
            e.channel.onmessage = (msg) => {
                console.log(msg);
            };
        };

        // Poll for connection stats
        if (!this.peerConnectionStatsInterval) {
            this.peerConnectionStatsInterval = setInterval(
                () => this.peerConnection.getStats().then(onStatsReport),
                1000
            );
        }

        // Send any ICE candidates to the other peer
        this.peerConnection.addEventListener("icecandidate", ({ candidate }) => {
            if (candidate) {
                console.log("[MASTER] Generated ICE candidate for client: " + remoteClientId);

                // When trickle ICE is enabled, send the ICE candidates as they are generated.
                console.log("[MASTER] Sending ICE candidate to client: " + remoteClientId);
                this.signalingClient.sendIceCandidate(candidate, remoteClientId);
            } else {
                console.log("[MASTER] All ICE candidates have been generated for client: " + remoteClientId);
                // console.log("[MASTER] Sending SDP answer to client: " + remoteClientId);
                // this.signalingClient.sendSdpAnswer(this.peerConnection.localDescription, remoteClientId);
            }
        });

        // As remote tracks are received, add them to the remote view
        this.peerConnection.addEventListener("track", (event) => {
            console.log("[MASTER] Received remote track from client: " + remoteClientId);
        });

        // If there's no video/audio, this.localStream will be null. So, we should skip adding the tracks from it.
        // if (this.localStream) {
        //     this.localStream.getTracks().forEach((track) => peerConnection.addTrack(track, this.localStream));
        // }
        await this.peerConnection.setRemoteDescription(offer);

        // Create an SDP answer to send back to the client
        console.log("[MASTER] Creating SDP answer for client: " + remoteClientId);
        await this.peerConnection.setLocalDescription(
            await this.peerConnection.createAnswer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true,
            })
        );

        // When trickle ICE is enabled, send the answer now and then send ICE candidates as they are generated. Otherwise wait on the ICE candidates.
        console.log("[MASTER] Sending SDP answer to client: " + remoteClientId);
        this.signalingClient.sendSdpAnswer(this.peerConnection.localDescription, remoteClientId);
        console.log("[MASTER] Generating ICE candidates for client: " + remoteClientId);
    });

    this.signalingClient.on("iceCandidate", async (candidate, remoteClientId) => {
        console.log("[MASTER] Received ICE candidate from client: " + remoteClientId);

        // Add the ICE candidate received from the client to the peer connection
        this.peerConnection.addIceCandidate(candidate);
    });

    this.signalingClient.on("close", () => {
        console.log("[MASTER] Disconnected from signaling channel");
    });

    this.signalingClient.on("error", (e) => {
        console.error("[MASTER] Signaling client error");
        console.error(e);
    });

    console.log("[MASTER] Starting master connection");
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

module.exports = startMaster;
