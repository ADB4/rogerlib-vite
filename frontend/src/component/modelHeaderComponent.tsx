import * as React from "react"
import { useState, useEffect } from "react";
import { useModelContext, useDeviceContext, useColorModeContext } from "../context/galleryContext";

export default function ModelHeaderComponent() {
    const compactView = useDeviceContext();
    const model = useModelContext();
    const HeaderText: React.CSSProperties = {
        fontSize: compactView? "1.0rem":"1.5rem",
    };
    return (
        <>
        {compactView && (
        <div className="model-view-header-compact">
            <h2>{model.itemname}</h2>
            <ul>
                <li>VERSION {model.version}</li>
                <li>{model.category.toUpperCase()} / {model.subcategory.toUpperCase()}</li>
            </ul>
        </div>
        )}
        {!compactView && (
        <div className="model-view-header">
                <h2>{model.itemname}</h2>
                <ul>
                    <li>VERSION {model.version}</li>
                    <li>{model.category.toUpperCase()} / {model.subcategory.toUpperCase()}</li>
                </ul>
        </div>
        )}
        </>

    )
}