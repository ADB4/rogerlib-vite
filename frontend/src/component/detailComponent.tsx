import * as React from "react"
import { useState, useEffect } from "react";

// import ModelViewerComponent from "./modelViewer";
import { useColorModeContext, useModelContext, useDeviceContext } from "../context/galleryContext";
import type { ItemType } from "../context/galleryContext";
import { useDevice } from "../hooks/useDevice";
import { compactExitButton } from "../style/modelDetailStyles";
import ModelViewerComponent from "./modelComponent";
// import DownloadComponent from "../component/downloadComponent";

export default function DetailContainerComponent({ outData }) {
    const compactView = useDeviceContext();
    const darkMode = useColorModeContext();
    const [toggleView, setToggleView] = useState(true);

    function handleClose() {
        outData();
    }
    function handleToggleView() {
        setToggleView(!toggleView);
    }
    let exitButtonStyle = {};
    
    // mobile view
    exitButtonStyle = compactExitButton;
    const modelDetailContainer: React.CSSProperties = {
        color: darkMode ? "#dedede":"black",
        backgroundColor: darkMode ? "#1f1f1f":"white",
        outline: darkMode ? "2px solid #474747":"2px solid #c6c6c6",
    };

    return (
        <>
        <div style={modelDetailContainer} id={compactView ? 
                                                "model-detail-compact-outer" : "model-detail-standard-outer"}>
            <ModelViewerComponent outData={handleClose}/>
        </div>
        </>

    )
}

/*
                    <div id="model-detail-standard-right">
                        <DetailHeaderComponent/>
                    </div>
            {toggleView && (
                    <div id="model-detail-compact-left">
                        <ModelViewerComponent outData={handleClose}/>
                    </div>
            )}
            {!toggleView && (
                <>
                    <div id="model-detail-compact-right">
                        <DetailHeaderComponent/>
                        <DetailDescriptionComponent/>
                    </div>
                </>
            )}
            <div className="model-detail-toggle-container" style={detailToggle}>
                <button className="model-detail-toggle-container-inner" onClick={() => handleToggleView()}
                style={detailToggleDark}>
                    <p style={detailToggleText}>{toggleView ? "TOGGLE INFO":"TOGGLE VIEWER"}</p>
                </button>
            </div>
*/
