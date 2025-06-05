import * as React from "react"
import { useState, useEffect } from "react";
import { useColorModeContext } from "../context/galleryContext";
import type { ItemType } from "../context/galleryContext";
import { useDevice } from "../hooks/useDevice";

interface ContentType {
    [key: string]: string;
}
export default function DetailDescriptionComponent({ inData }) {
    const { darkMode, setDarkMode } = useColorModeContext();
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
        let ignoreStaleRequest = false;
        let currentItem: ItemType = inData.item;
        const itemCategory = currentItem.category;
        const itemSubcategory = currentItem.subcategory;

        let colorString = "Available in ";
        let i = 0;
        for (;i < currentItem.colors.length;) {
            let color = currentItem.colors[i];
            let formattedString = currentItem.colormap[color];
            // if last element, no comma
            if (i == (currentItem.colors.length - 1)) {
                colorString = colorString.concat(formattedString);
            } else {
                colorString = colorString.concat(formattedString+', ');
            }
            i = i+1;
        }
        let currentContent: ContentType = {
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
        return () => {
            ignoreStaleRequest = true;
        };
    }, [inData])

    let descriptionContainerHeight = compactView? (inData.containerheight - 160) : (inData.containerheight - 192);

    let descriptionContentContainer: React.CSSProperties = {
        gridColumnStart: "1",
        gridColumnEnd: "-1",
        gridRowStart: "2",
        gridRowEnd: "-1",
        overflowY: "scroll",
        overflowX: "hidden",
        width: "auto",
        minHeight: "4rem",
        height: compactView ? ("85vw"):("100%"),
        maxHeight: compactView ? ("28.5rem"):("100%"),
        margin: "auto",
        marginTop: "0rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "left",
    };
    let descriptionSerif: React.CSSProperties = {
        fontFamily: "Swiss721",
        fontWeight: "200",
        fontSize: "1.125rem",
        margin: "1rem 2rem 1rem",
    };
    let lods = inData.item.lods;
    const outline = {
        outline: darkMode ? "1px solid black":"1px solid black",
    };
    return (
        <>
            <div id="description-content" style={descriptionContentContainer}>
                <div id="description-block-A">
                    <p style={descriptionSerif}>{inData.item.description}</p>
                    <p style={descriptionSerif}>{inData.item.creatornote}</p>
                </div>
                <div id="description-block-B">
                    <p id="description-material-left">{inData.item.material.toUpperCase()}</p>
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
                            {lods.map((lod, j) => (
                                <li key={lod}>{inData.item.polycount[lod]}</li>
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