import { useState, useRef } from "react";
import "./player.css";

/**
 * Role selector for clients - Master or Viewer
 * @returns {JSX.Element} Selector page
 */
function Selector() {
    useRef();

    return (
        <div className="controllerPlane">
            <button
                className="device"
                type="button"
                onClick={() => {
                    window.location.href = "/device";
                }}
            >
                device
            </button>
            <button
                className="mobile"
                type="button"
                onClick={() => {
                    window.location.href = "/mobile";
                }}
            >
                mobile
            </button>
        </div>
    );
}

export default Selector;
