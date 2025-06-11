import * as React from "react"
import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { ViewerStateContext, useViewerStateContext, useSelectorContext, SelectorContext, ViewerOptionsContext, useViewerOptionsContext, useColorModeContext } from "../context/galleryContext";
import ModelComponent from "../component/modelComponent";
import { useDevice } from "../hooks/useDevice";

import { Canvas, useLoader, useFrame } from "@react-three/fiber";
import {
    Environment,
    OrbitControls,
    Html,
    useProgress
    } from "@react-three/drei";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from 'three';
import { Suspense } from "react";

/* 
ModelViewerComponent
Takes input: {item}
*/
export default function ModelViewerV2Component({ inData, outData }) {
    const { darkMode, setDarkMode } = useColorModeContext();
    const [activeModels, setActiveModels] = useState([]);
    const [activeTextureSet, setActiveTextureSet] = useState([]);
    const [activeItem, setActiveItem] = useState();
    const [viewState, setViewState] = useState({
        lod: "NULL",
        shading: "NULL",
        material: "NULL",
        color: "NULL",
        wireframe: true,
    });
    const [viewGlossary, setViewGlossary] = useState({
        lod: [],
        shading: ['flat','studio','sunset','rural road'],
        material: ['solid','albedo'],
        color: [],
        wireframe: ['true', 'false'],
    });
    const compactView = useDevice();

    // 3D MANIPULATION
    const modelRef = useRef();
    function handleConfigUpdate(data) {
        // construct new active image url
        const item = inData.item;
        
        // if LOD has changed, load new model set/textures if necessary
        if (data.lod != viewState.lod) {
            let index = parseInt(data.lod[3]);
            let modelArr = item.models[index].slice();
            // check if LOD uses different texture set
            if (item.texturemap[viewState.lod] != item.texturemap[data.lod]) {
                let texIndex = parseInt(item.texturemap[data.lod]);
                let textureArr = item.texturesets[texIndex].slice();
                setActiveTextureSet(textureArr);
            }
            setActiveModels(modelArr);
        }
        let lodString = "lod" + (item.lods.length - 1).toString();
        setViewState(data);
    }
/*
        let defaultImage = `https://d2fhlomc9go8mv.cloudfront.net/static/models/gltf/trw0/tirew0_${lodString}.gltf`;
*/
    useEffect(() => {
        const item = inData.item;
        let lodString = "lod" + (item.lods.length - 1).toString();
        let lodArr = item.lods.slice();
        let colors = item.colors.slice();
        let texIndex = item.texturesets.length - 1;
        // determine which model(s) need to be loaded
        let modelArr = item.models[item.lods.length - 1].slice();
        let textureArr = item.texturesets[texIndex].slice();
        setActiveModels(modelArr);
        setActiveTextureSet(textureArr);
        setActiveItem(item.itemcode);
        // set default view
        const initialstate = {
            lod: lodString,
            shading: 'studio',
            material: 'solid',
            color: 'NULL',
            wireframe: true,
        };
        const glossary = {
            lod: lodArr,
            shading: ['flat','studio','sunset','rural road'],
            material: ['solid','albedo'],
            color: colors,
            wireframe: ['true', 'false'],
        };
        
        setViewGlossary(glossary);
        setViewState(initialstate);
    }, []);
    return (
        <>  
            <ViewerStateContext.Provider value={viewState}>
                <ModelComponent zoom={inData.item.zoom} models={activeModels} textures={activeTextureSet} itemcode={activeItem} item={inData.item} updateconfig={handleConfigUpdate} />
            </ViewerStateContext.Provider>
        </>
    )
}
/*
            <div className="model-detail-actions">
                <ViewerStateContext.Provider value={viewState}>
                    <ViewerDashboardComponent inData={inData.item} outData={handleConfigUpdate}/>
                </ViewerStateContext.Provider>
                {compactView && (
                <div className="model-detail-toggle-container" style={detailToggle}>
                    <button className="model-detail-toggle-container-inner" style={detailToggleDark} onClick={() => {outData()}}>
                    <p style={detailToggleText}>
                        TOGGLE DESCRIPTION
                    </p>
                    </button>
                </div>
                )}
            </div> 
                <ViewContext.Provider value={viewState}>
                    <ViewerDashboardComponent inData={inData.item} outData={handleConfigUpdate}/>
                </ViewContext.Provider>
*/