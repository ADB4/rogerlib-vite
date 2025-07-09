import * as React from "react"
import DownloadComponent from "./downloadComponent";
import ModelDescriptionComponent from "./modelDescriptionComponent";
import ModelDashboardComponent from "./modelDashboardComponent";
import ModelHeaderComponent from "./modelHeaderComponent";

import { useState, useEffect, useRef, useReducer } from "react";
import { ViewerStateContext, useViewerStateContext, useSelectorContext, SelectorContext, ViewerOptionsContext, useViewerOptionsContext, useColorModeContext, CameraContext, useModelContext, useDeviceContext } from "../context/galleryContext";
import { Canvas, useLoader, useFrame, useThree } from "@react-three/fiber";
import {
    Environment,
    OrthographicCamera,
    Html,
    useProgress,
    useGLTF,
    CameraControls,
    } from "@react-three/drei";

import * as THREE from 'three';
import { Suspense } from "react";

/*
ModelViewerComponent
Takes input: {item}
*/

function Loader() {
    const { progress } = useProgress();
    return <Html center>
        <div className="model-view-loading">
            <p>{progress.toFixed(2)}% LOADED</p>
        </div>
    </Html>;
}

function reducer(state, action) {
    switch (action.type) {
        case 'update':
            return {...action.data}
        default:
            return state
    }
}

export default function ModelViewerComponent({ outData }) {
    const model = useModelContext();
    const darkMode = useColorModeContext();
    const compactView = useDeviceContext();

    const [activeModels, setActiveModels] = useState([]);
    const [activeTextureSet, setActiveTextureSet] = useState([]);
    const [viewState, dispatch] = useReducer(reducer, {
        lod: "NULL",
        shading: "NULL",
        material: "NULL",
        color: "NULL",
        wireframe: true,
    });

    const [toggleView, setToggleView] = useState(true);

    const cameraControlRef = useRef();
    const DEG45 = Math.PI / 4;
    const viewContainerStyle = {
        backgroundColor: darkMode ? "transparent":"white",
    };

    const exitButtonContainer = {
        backgroundColor: darkMode ? "black":"#c2c2c2",
        border: darkMode? "1px solid #292929":"1px solid #bdbdbd",
    };
    const exitButtonText = {
        color: darkMode? "white":"white",
    };
    const detailToggle = {
        backgroundColor: toggleView ? ("#E5FFFE") : ("#F9FFC7"),
    };
    const detailToggleDark = {
        border: "none",
        backgroundColor: toggleView ? ("#CBE3E2") : ("#E1E7A7"),
    };
    const detailToggleText = {
        color: toggleView ? ("#3B6F88") : ("#7C4E00"),
    };
    function handleConfigUpdate(data) {
        // construct new active image url
        
        // if LOD has changed, load new model set/textures if necessary
        if (data.lod != viewState.lod) {
            let index = parseInt(data.lod[3]);
            let modelArr = model.models[index].slice();
            // check if LOD uses different texture set
            if (model.texturemap[viewState.lod] != model.texturemap[data.lod]) {
                let texIndex = parseInt(model.texturemap[data.lod]);
                let textureArr = model.texturesets[texIndex].slice();
                setActiveTextureSet(textureArr);
            }
            setActiveModels(modelArr);
        }
        dispatch({type: 'update', data: data});
    }

    function handleToggleView() {
        setToggleView(!toggleView);
    }

    useEffect(() => {
        if (model !== null) {
            let lodString = "lod" + (model.lods.length - 1).toString();
            let texIndex = model.texturesets.length - 1;
            // determine which model(s) need to be loaded
            let modelArr = model.models[model.lods.length - 1].slice();
            let textureArr = model.texturesets[texIndex].slice();
            setActiveModels(modelArr);
            setActiveTextureSet(textureArr);
            // set default view
            const initialstate = {
                lod: lodString,
                shading: 'studio',
                material: 'solid',
                color: 'NULL',
                wireframe: true,
            };
            dispatch({type: 'update', data: initialstate});
        }
    }, [outData]);

    return (
        <>
        <ViewerStateContext.Provider value={viewState}>
        {compactView && (
        <>
        <ModelHeaderComponent />
        <div className="model-view-exit-compact">
            <div className="exit-button-container" style={exitButtonContainer}>
                <div className="exit-button" 
                        onClick={() => {outData()}}>
                        <p style={exitButtonText}>CLOSE</p>
                </div>
            </div>
        </div>
        {toggleView && (
        <div id="model-detail-compact-left">
            <ModelDashboardComponent outData={handleConfigUpdate} />
            <div className="model-view-module-compact">
            <>
                <Canvas>
                <Suspense fallback={<Loader />}>
                        <GLTFComponent models={activeModels} textures={activeTextureSet} itemcode={model.itemcode}/>
                        <LightingComponent />
                        <RotatingCameraComponent distance={100} speed={0.01} zoom={compactView? model.zoom / 2.0 : model.zoom} camControls={cameraControlRef}/>
                </Suspense>
                </Canvas>
            </>
            </div>
        </div>
        )}
        {!toggleView && (
        <div id="model-detail-compact-right">
            <ModelDescriptionComponent/>
        </div>
        )}
        <div className="model-detail-toggle-container" style={detailToggle}>
            <button className="model-detail-toggle-container-inner" onClick={() => handleToggleView()}
            style={detailToggleDark}>
                <p style={detailToggleText}>{toggleView ? "TOGGLE INFO":"TOGGLE VIEWER"}</p>
            </button>
        </div>
        </>
        )}
        {!compactView && (
        <>
        <div id="model-view-standard">
            <ModelDashboardComponent outData={handleConfigUpdate} />
            <div className="model-view-controller">
                <>

                </>
            </div>
            <div className="model-view-exit">
                <div className="exit-button-container" style={exitButtonContainer}>
                    <div className="exit-button" 
                         onClick={() => {outData()}}>
                            <p style={exitButtonText}>CLOSE</p>
                    </div>
                </div>
            </div>
            <div className="model-view-module-standard">
            <>
                <Canvas>
                <Suspense fallback={<Loader />}>
                        <GLTFComponent models={activeModels} textures={activeTextureSet} itemcode={model.itemcode}/>
                        <LightingComponent />
                        <StandardCameraComponent distance={200} zoom={model.zoom} camControls={cameraControlRef}/>
                </Suspense>
                </Canvas>
            </>
            </div>
            <div className="model-view-information">
                <ModelHeaderComponent />
                <button className="model-view-rotate-button"
                        onClick={() => {cameraControlRef.current?.rotate(DEG45, 0, true)}}>
                            <p>ROTATE THETA 45DEG</p>
                </button>
                <button className="model-view-reset-button"
                        onClick={() => {
                            cameraControlRef.current?.setPosition(200,90,200, true);
                            cameraControlRef.current?.zoomTo(compactView? model.zoom / 2 : model.zoom);
                            }}>
                            <p>RESET VIEW</p>
                </button>
                <div className="model-view-statistics">
                    <p>{model.polycount[viewState.lod]} TRIANGLES</p>
                    {viewState.color != "NULL" && viewState.material != "solid" && (
                        <p>{model.colormap[viewState.color].toUpperCase()}</p>
                    )}

                </div>
            </div>
            <div className="model-view-description">
                <ModelDescriptionComponent/>
                <DownloadComponent item={model}/>
            </div>
        </div>
        </>
        )}
        </ViewerStateContext.Provider>
        </> 
    )
}

/*
                            {compactView && (
                            <RotatingCameraComponent distance={100} speed={0.01} zoom={compactView? model.zoom / 2.0 : model.zoom} camControls={cameraControlRef}/>
                            )}

            <div className="model-view-exit">
                <div className="exit-button-container" style={exitButtonContainer}>
                    <div className="exit-button" 
                         onClick={() => {outData()}}>
                            <p style={exitButtonText}>CLOSE</p>
                    </div>
                </div>
            </div>
            <div className="model-view-information">
                <div className="model-view-header">
                        <h2>{model.itemname.toUpperCase()}</h2>
                        <ul>
                            <li>VERSION {model.version}</li>
                            <li>{model.category.toUpperCase()} / {model.subcategory.toUpperCase()}</li>
                        </ul>
                </div>
                <div className="model-view-statistics">
                    <p>{model.polycount[viewState.lod]} TRIANGLES</p>
                    {viewState.color != "NULL" && viewState.material != "solid" && (
                        <p>{model.colormap[viewState.color].toUpperCase()}</p>
                    )}

                </div>
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
export function StandardCameraComponent(props) {
    const { camera } = useThree();
    const cameraRef = useRef();

    return (
        <>
        <CameraControls 
            enabled={true}
            ref={props.camControls}
            camera={camera} />
        <OrthographicCamera
            ref={cameraRef}
            makeDefault
            position={[200,90,200]}
            zoom={props.zoom}
        />
        </>
    )
}
export function RotatingCameraComponent(props) {
    const {camera} = useThree();
    const [rotation, setRotation] = useState(0);

    const cameraRef = useRef();

    useFrame((_, delta) => {
        setRotation((prevRotation) => prevRotation + (delta / 2));
        camera.position.x = Math.sin(rotation) * props.distance;
        camera.position.z = Math.cos(rotation) * props.distance;
        camera.position.y = 30;
        camera.lookAt(0,0,0);
        camera.updateProjectionMatrix();
    });
    return (
        <>
        <CameraControls 
            makeDefault
            enabled={true}
            ref={props.camControls}
            camera={camera} />
        <OrthographicCamera
            ref={cameraRef}
            makeDefault
            position={[200,90,200]}
            zoom={props.zoom}
        />
        </>
    )
}

/*
props
itemcode: string
models: string[]
*/
export function GLTFComponent(props) {
    const item = useModelContext();

    return (
        <>
            {props.models.map((model, i) => (
                <GLTFLoaderComponent key={model} itemcode={item.itemcode} textures={props.textures[i]} filename={model}/>
            ))}
        </>
    )
}

/*
props
itemcode: string
filename: string
*/
export function GLTFLoaderComponent(props) {
    const { gl, camera } = useThree();
    const item = useModelContext();
    const view = useViewerStateContext();
    const { nodes } = useGLTF(`https://d2fhlomc9go8mv.cloudfront.net/static/models/${item.itemcode}/gltf/${props.filename}`);
    const meshRef = useRef();
    const wfRef = useRef();

    // materials
    const materialWF = useRef(new THREE.MeshBasicMaterial({color: 'red', wireframe: true }));
    const materialSolid = useRef(new THREE.MeshStandardMaterial({ color: '#757575', polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1}));

    // the second key in nodes is our object name
    const keys = Object.keys(nodes);
    const k = keys[1];
    const geo = nodes[k].geometry;

    return (
        <>
        {view.wireframe == true && (
            <mesh ref={wfRef} geometry={geo} material={materialWF.current}/>
        )}
        {view.material == "solid" && (
            <>
            <mesh ref={meshRef} geometry={geo} material={materialSolid.current}>
            {view.shading == 'flat' && (
                <meshBasicMaterial
                    color="white"
                />
            )}
            </mesh>
            </>
        )}
        {view.material == "albedo" && (
            <>
            <mesh ref={meshRef} geometry={geo}>
                {props.textures.alpha == 'true' && (
                <TextureWithAlphaLoaderComponent key={props.key} textures={props.textures} itemcode={item.itemcode}/>
                )}
                {props.textures.alpha == 'false' && (
                <TextureLoaderComponent key={props.key} textures={props.textures} itemcode={item.itemcode}/>
                )}
            </mesh>
            </>
        )}
        </>
    )
}

/*

        {view.wireframe == true && (
            <mesh ref={wfRef} geometry={geo} material={materialWF.current}/>
        )}
*/
/*
props
maps: string[]
mapkey: string 
itemcode: string
alpha: boolean
displacement: boolean
*/
export function TextureLoaderComponent(props) {
    const item = useModelContext();
    const view = useViewerStateContext();

    const [colorMap, normalMap, roughnessMap, metalnessMap] = props.textures.uniquevariants == "true" ? useLoader(THREE.TextureLoader, [
        `https://d2fhlomc9go8mv.cloudfront.net/static/models/${item.itemcode}/tex/${props.textures.id}_${view.color}_color.jpg`,
        `https://d2fhlomc9go8mv.cloudfront.net/static/models/${item.itemcode}/tex/${props.textures.id}_${view.color}_normal.jpg`,
        `https://d2fhlomc9go8mv.cloudfront.net/static/models/${item.itemcode}/tex/${props.textures.id}_${view.color}_roughness.jpg`,
        `https://d2fhlomc9go8mv.cloudfront.net/static/models/${item.itemcode}/tex/${props.textures.id}_${view.color}_metallic.jpg`
    ]) : useLoader(THREE.TextureLoader, [
        `https://d2fhlomc9go8mv.cloudfront.net/static/models/${item.itemcode}/tex/${props.textures.id}_${view.color}_color.jpg`,
        `https://d2fhlomc9go8mv.cloudfront.net/static/models/${item.itemcode}/tex/${props.textures.id}_normal.jpg`,
        `https://d2fhlomc9go8mv.cloudfront.net/static/models/${item.itemcode}/tex/${props.textures.id}_roughness.jpg`,
        `https://d2fhlomc9go8mv.cloudfront.net/static/models/${item.itemcode}/tex/${props.textures.id}_metallic.jpg`
    ]);
    colorMap.flipY = normalMap.flipY = roughnessMap.flipY = metalnessMap.flipY = false;
    return (
        <>
        {view.shading == 'flat' && (
            <meshBasicMaterial
            map={colorMap}
            />
        )}
        {view.shading != 'flat' && (
            <>
                <meshStandardMaterial
                    map={colorMap}
                    normalMap={normalMap}
                    roughnessMap={roughnessMap}
                    metalnessMap={metalnessMap}
                />
            </>
        )}
        </>
    )
}

export function TextureWithAlphaLoaderComponent(props) {
    const item = useModelContext();
    const view = useViewerStateContext();
    // TODO: in default state, view.color is NULL

    const [colorMap, normalMap, roughnessMap, metalnessMap, alphaMap] = props.textures.uniquevariants == "true" ? useLoader(THREE.TextureLoader, [
        `https://d2fhlomc9go8mv.cloudfront.net/static/models/${item.itemcode}/tex/${props.textures.id}_${view.color}_color.jpg`,
        `https://d2fhlomc9go8mv.cloudfront.net/static/models/${item.itemcode}/tex/${props.textures.id}_${view.color}_normal.jpg`,
        `https://d2fhlomc9go8mv.cloudfront.net/static/models/${item.itemcode}/tex/${props.textures.id}_${view.color}_roughness.jpg`,
        `https://d2fhlomc9go8mv.cloudfront.net/static/models/${item.itemcode}/tex/${props.textures.id}_${view.color}_metallic.jpg`,
        `https://d2fhlomc9go8mv.cloudfront.net/static/models/${item.itemcode}/tex/${props.textures.id}_${view.color}_alpha.jpg`
    ]) : useLoader(THREE.TextureLoader, [
        `https://d2fhlomc9go8mv.cloudfront.net/static/models/${item.itemcode}/tex/${props.textures.id}_${view.color}_color.jpg`,
        `https://d2fhlomc9go8mv.cloudfront.net/static/models/${item.itemcode}/tex/${props.textures.id}_normal.jpg`,
        `https://d2fhlomc9go8mv.cloudfront.net/static/models/${item.itemcode}/tex/${props.textures.id}_roughness.jpg`,
        `https://d2fhlomc9go8mv.cloudfront.net/static/models/${item.itemcode}/tex/${props.textures.id}_metallic.jpg`,
        `https://d2fhlomc9go8mv.cloudfront.net/static/models/${item.itemcode}/tex/${props.textures.id}_alpha.jpg`
    ]);
    colorMap.flipY = normalMap.flipY = roughnessMap.flipY = metalnessMap.flipY = alphaMap.flipY = false;

    return (
        <>
        {view.shading == 'flat' && (
            <meshBasicMaterial
            map={colorMap}
            />
        )}
        {view.shading != 'flat' && (
            <>
                <meshStandardMaterial
                    map={colorMap}
                    normalMap={normalMap}
                    roughnessMap={roughnessMap}
                    metalnessMap={metalnessMap}
                    alphaMap={alphaMap}
                    transparent={true}
                />
            </>
        )}
        </>
    )
}

export function LightingComponent() {
    const view = useViewerStateContext();

    return (
        <>
        {view.shading != 'flat' && (
            <>
            {view.shading == 'rural road' && (
                <Environment files="https://d2fhlomc9go8mv.cloudfront.net/static/hdri/rural_asphalt_road_256p.exr" />
            )}
            {view.shading != 'rural road' && (
                <Environment preset={view.shading} resolution={128} />
            )}
            </>
        )}
        </>
    )
}