import * as React from "react"
import { useState, useEffect } from "react";

// import ModelViewerComponent from "./modelViewer";
import { useColorModeContext, useModelContext, useDeviceContext } from "../context/galleryContext";
import type { ItemType } from "../context/galleryContext";
import { useDevice } from "../hooks/useDevice";
import { compactExitButton } from "../style/modelDetailStyles";
import ModelViewerComponent from "./modelComponent";
import DownloadComponent from "../component/downloadComponent";

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
    
    // height is image resolution + height of view dashboard (8rem) + height of item header (6rem)
    // mobile view
    exitButtonStyle = compactExitButton;
    const modelDetailContainer: React.CSSProperties = {
        color: darkMode ? "#dedede":"black",
        backgroundColor: darkMode ? "#1f1f1f":"white",
        outline: darkMode ? "2px solid #474747":"2px solid #c6c6c6",
    };

    const exitButtonContainer: React.CSSProperties = {
        backgroundColor: darkMode? "black":"#c2c2c2",
        border: darkMode? "1px solid #292929":"1px solid #bdbdbd",
    };
    const exitButtonText: React.CSSProperties = {
        color: darkMode? "white":"white",
    };
    const detailToggle: React.CSSProperties = {
        backgroundColor: toggleView ? ("#E5FFFE") : ("#F9FFC7"),
    };
    const detailToggleDark: React.CSSProperties = {
        border: "none",
        backgroundColor: toggleView ? ("#CBE3E2") : ("#E1E7A7"),
    };
    const detailToggleText: React.CSSProperties = {
        color: toggleView ? ("#3B6F88") : ("#7C4E00"),
    };
    return (
        <>
        {compactView && (
        <div style={modelDetailContainer} id="model-detail-compact-outer">
            <div className="exit-button-container" style={exitButtonContainer}>
                <div className="exit-button" style={exitButtonStyle} onClick={() => {handleClose()}}>
                        <p style={exitButtonText}>CLOSE</p>
                </div>
            </div>
            {toggleView && (
                    <div id="model-detail-compact-left">
                        <ModelViewerComponent/>
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
        </div>
        )}
        {!compactView && (
        <div style={modelDetailContainer} id="model-detail-standard-outer">
            <div className="exit-button-container" style={exitButtonContainer}>
                <div className="exit-button" style={exitButtonStyle} onClick={() => {handleClose()}}>
                        <p style={exitButtonText}>CLOSE</p>
                </div>
            </div>
            <div className="model-detail-standard-inner">
                <>
                    <div id="model-detail-standard-left">
                        <ModelViewerComponent/>
                    </div>
                    <div id="model-detail-standard-right">
                        <DetailHeaderComponent/>
                        <DetailDescriptionComponent/>
                    </div>
                </>
            </div>
        </div>
        )}
        </>

    )
}

export function DetailHeaderComponent() {
    const compactView = useDevice();
    const model = useModelContext();
    const HeaderText: React.CSSProperties = {
        fontSize: compactView? "1.0rem":"1.5rem",
    };
    return (
        <div id="description-header">
                <h2 style={HeaderText}>{model.itemname.toUpperCase()}</h2>
                <ul>
                    <li>VERSION {model.version}</li>
                    <li>{model.category.toUpperCase()} / {model.subcategory.toUpperCase()}</li>
                </ul>
        </div>
    )
}

interface ContentType {
    [key: string]: string;
}
export function DetailDescriptionComponent() {
    const model = useModelContext();
    const darkMode = useColorModeContext();
    const [content, setContent] = useState<ContentType>({
        'header': '',
        'description': '',
        'material': '',
        'colors': '',
        'colorString': '',
        'lod': '',
        'tools': 'Modeled and textured in Blender 3.3 and Adobe 3D Substance Painter 2024.',
        'credits': 'Base maps by TCOM.',
        'license': 'This work is licensed under CC BY-NC 4.0',
        'downloadnotice': 'Downloads are fed from US-East S3 bucket. Always scan files that you download from the internet for viruses, malware, or other malicious software. ',
    });
    const compactView = useDevice();

    useEffect(() => {
        const currentItem: ItemType = model;

        let colorString = "Available in ";
        let i = 0;
        for (;i < currentItem.colors.length;) {
            const color = currentItem.colors[i];
            const formattedString = currentItem.colormap[color];
            // if last element, no comma
            if (i == (currentItem.colors.length - 1)) {
                colorString = colorString.concat(formattedString);
            } else {
                colorString = colorString.concat(formattedString+', ');
            }
            i = i+1;
        }
        const currentContent: ContentType = {
            'header': content.header,
            'description': content.description,
            'material': content.material,
            'colors': content.colors,
            'colorString': colorString.toUpperCase(),
            'lod': content.lod,
            'tools': content.tools,
            'credits': content.credits,
            'license': content.license,
            'downloadnotice': content.downloadnotice,
        };
        setContent(currentContent);
    }, [])

    const descriptionContentContainer: React.CSSProperties = {
        gridColumnStart: "1",
        gridColumnEnd: "-1",
        gridRowStart: "2",
        gridRowEnd: "-1",
        overflowY: "scroll",
        overflowX: "hidden",
        scrollbarWidth: "none",
        width: "auto",
        minHeight: "4rem",
        height: compactView ? ("100%"):("100%"),
        maxHeight: compactView ? ("100%"):("100%"),
        margin: "auto",
        marginTop: "0rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "left",
    };
    const descriptionSerif: React.CSSProperties = {
        fontFamily: "Swiss721",
        fontWeight: "200",
        fontSize: "1.0rem",
        margin: "1rem 2rem 1rem",
    };
    const lods = model.lods;
    const outline = {
        outline: darkMode ? "1px solid black":"1px solid black",
    };
    return (
        <>
            <div id="description-content" style={descriptionContentContainer}>
                <div id="description-block-A">
                    <p style={descriptionSerif}>{model.description}</p>
                    <p style={descriptionSerif}>{model.creatornote}</p>
                </div>
                <div id="description-block-B">
                    <p id="description-material-left">{model.material.toUpperCase()}</p>
                    <p id="description-material-right">{content.colorString}</p>
                </div>
                <div id="description-lod-container" style={outline}>
                    <div id="description-lod-header">
                            <p>LEVEL OF DETAIL</p>
                    </div>
                    <div id="description-lods-left">
                        <ul>
                            {lods.map((lod, i) => (
                                <li key={lod}>LOD{i}</li>
                            ))}
                        </ul>
                    </div>
                    <div id="description-lods-right">
                        <ul id="description-lods-right">
                            {lods.map((lod) => (
                                <li key={lod}>{model.polycount[lod]}</li>
                            ))}
                        </ul>
                    </div>
                    <div id="description-lod-footer">
                        <p>TRIANGLES</p>
                    </div>
                </div>
                <div id="description-credits-container">
                    <p>{content.tools.toUpperCase()}</p>
                    <p>{content.credits.toUpperCase()}</p>
                    <p>{content.license.toUpperCase()}</p>
                    <p>{content.downloadnotice.toUpperCase()}</p>
                </div>
            </div>
        </>
    )
}
