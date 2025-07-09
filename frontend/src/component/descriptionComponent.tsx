import * as React from "react"
import { useState, useEffect } from "react";
import { useModelContext, useDeviceContext, useColorModeContext } from "../context/galleryContext";

export default function DescriptionComponent() {
    const model = useModelContext();
    const darkMode = useColorModeContext();
    const compactView = useDeviceContext();
    const [content, setContent] = useState({
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
    const modelDescription = {
        backgroundColor: darkMode ? "#1f1f1f":"white",
    };
    const descriptionSerif = {
        fontFamily: "Swiss721",
        fontWeight: "200",
        fontSize: "1.0rem",
        margin: "1rem 2rem 1rem",
    };
    const lods = model.lods;
    const outline = {
        outline: darkMode ? "1px solid black":"1px solid black",
    };
    useEffect(() => {
        const currentItem = model;

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
        const currentContent = {
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
    return (
        <>
        {compactView && (
        <>
            <div className="model-view-description-compact" style={modelDescription}>
            <div className="description-content-compact">
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
            </div>
        </>
        )}
        {!compactView && (
        <div className="description-content">
            <div className="description-left">
                <p>{model.description}</p>
                <p>{model.creatornote}</p>
            </div>
            <div className="description-right">
                <p>{content.tools.toUpperCase()}</p>
                <p>{content.license.toUpperCase()}</p>
                <p>{content.downloadnotice.toUpperCase()}</p>
            </div>
        </div>
        )}
        </>
    );

}