import * as React from "react"
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

export default function ModelViewerComponent() {
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
    const cameraContext = {
        autoRotate: true,
        speed: 1.0,
    };

    const cameraControlRef = useRef();
    const DEG45 = Math.PI / 4;
    const viewContainerStyle = {
        backgroundColor: darkMode ? "transparent":"white",
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
    }, []);

    return (
        <>
        <ViewerStateContext.Provider value={viewState}>
            <ViewerDashboardComponent outData={handleConfigUpdate}/>
            <div className="model-view-controller">
                <div className="model-view-polycount">
                    <p>{model.polycount[viewState.lod]} TRIANGLES</p>
                </div>
            {!compactView && (
                <>
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
                </>
            )}
            </div>
            <div className="model-view-module" style={viewContainerStyle}>
            {model && (
                <Canvas>
                <Suspense fallback={<Loader />}>
                        <GLTFComponent models={activeModels} textures={activeTextureSet} itemcode={model.itemcode}/>
                        <LightingComponent />
                        <group>
                        <CameraContext.Provider value={cameraContext} >
                            {compactView && (
                            <RotatingCameraComponent distance={100} speed={0.01} zoom={compactView? model.zoom / 2.0 : model.zoom} camControls={cameraControlRef}/>
                            )}
                            {!compactView && (
                            <StandardCameraComponent distance={100} speed={0.01} zoom={compactView? model.zoom / 2.0 : model.zoom} camControls={cameraControlRef}/>
                            )}
                        </CameraContext.Provider>
                        </group>
                </Suspense>
                </Canvas>
            )}
            </div>
        </ViewerStateContext.Provider>
        </> 
    )
}

export function StandardCameraComponent(props) {
    const {camera} = useThree();
    const cameraRef = useRef();

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
            zoom={parseInt(props.zoom)}
            top={200}
            bottom={-200}
            left={200}
            right={-200}
            near={1}
            far={2000}
            position={[200,90,200]}
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
            zoom={parseInt(props.zoom)}
            top={200}
            bottom={-200}
            left={200}
            right={-200}
            near={1}
            far={2000}
            position={[200,90,200]}
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
        <group {...props} dispose={null}>
            {props.models.map((model, i) => (
                <GLTFLoaderComponent key={model} itemcode={item.itemcode} textures={props.textures[i]} filename={model}/>
            ))}
        </group>
    )
}

/*
props
itemcode: string
filename: string
*/
export function GLTFLoaderComponent(props) {
    const item = useModelContext();
    const view = useViewerStateContext();
    const { nodes } = useGLTF(`https://d2fhlomc9go8mv.cloudfront.net/static/models/${item.itemcode}/gltf/${props.filename}`);
    const meshRef = useRef();

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
            <mesh ref={meshRef} geometry={geo} material={materialWF.current}/>
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
            <mesh ref={meshRef} geometry={geo}>
                {props.textures.alpha == 'true' && (
                <TextureWithAlphaLoaderComponent key={props.key} textures={props.textures} itemcode={item.itemcode}/>
                )}
                {props.textures.alpha == 'false' && (
                <TextureLoaderComponent key={props.key} textures={props.textures} itemcode={item.itemcode}/>
                )}
            </mesh>
        )}
        </>
    )
}
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

/*
<DetailParametersComponent inData={inData.item} outData={handleConfigUpdate}/>
*/
export function ViewerDashboardComponent({ outData }) {
    const item = useModelContext();
    const compactView = useDeviceContext();

    function handleClick(data) {
        outData(data);
    };

    let colorSelector = {
        'param': 'color',
        'title': 'COLOR',
        'options': item.colors,
        'map': item.colormap,
        'flexbox': "selector-flex-dynamic",
        'buttonwidth': "5.0rem",
        'maxwidth': "10rem",
    };
    let lodSelector = {
        'param': 'lod',
        'title': 'LEVEL OF DETAIL',
        'options': item.lods,
        'map': item.lodmap,
        'flexbox': "selector-flex-dynamic",
        'buttonwidth': "5rem",
        'maxwidth': "8rem",
    };
    let shaderSelector = {
        'param': 'shading',
        'title': 'SHADING',
        'options': ['flat','studio','sunset','rural road'],
        'default': 0,
        'map': {'flat': 'FLAT', 'studio': 'STUDIO', 'sunset': 'SUNSET', 'rural road': 'RURAL ROAD'},
        'flexbox': "selector-flex",
        'buttonwidth': "7rem",
        'maxwidth': "10rem",
    };
    let materialSelector = {
        'param': 'material',
        'title': 'MATERIAL',
        'options': ['solid','albedo'],
        'default': 0,
        'map': {'solid': 'SOLID', 'albedo': 'ALBEDO'},
        'flexbox': "selector-flex",
        'buttonwidth': "6rem",
        'maxwidth': "6rem",
    };

    let wireframeSelector = {
        'param': 'wireframe',
        'title': 'WIREFRAME',
        'options': ['wireframe'],
        'default': true,
        'map' : {'wireframe': 'WIREFRAME'},
        'outercontainer': "wireframe-selector-outer",
        'innercontainer': "wireframe-selector-inner",
    }
    let optionsGlossary = {
        'lod': item.lods,
        'shading': ['flat','shaded'],
        'material': ['solid','albedo'],
        'color': item.colors,
        'colormap': item.colormap,
    };
    return (
    <>
    {!compactView && (
        <div className="dashboard-container-standard">
            <div id="dashboard">
                <ViewerOptionsContext.Provider value={optionsGlossary}>
                    <div className="dashboard-fixed-container">
                        <DashboardSelectorComponent inData={shaderSelector} outData={handleClick}/>
                        <DashboardSelectorComponent inData={materialSelector} outData={handleClick}/>
                    </div>
                    <div className="dashboard-flex-container">
                        <DashboardSelectorComponent inData={lodSelector} outData={handleClick}/>
                        <ColorSelectorComponent inData={colorSelector} outData={handleClick}/>
                    </div>
                    <SelectorToggleComponent inData={wireframeSelector} outData={handleClick}></SelectorToggleComponent>
                </ViewerOptionsContext.Provider>
            </div>
        </div>
    )}
    {compactView && (
        <div className="dashboard-container-compact">
            <div id="dashboard">
                <ViewerOptionsContext.Provider value={optionsGlossary}>
                    <div className="dashboard-fixed-container">
                        <DashboardSelectorComponent inData={materialSelector} outData={handleClick}/>
                    </div>
                    <div className="dashboard-flex-compact">
                        <CompactLODSelectorComponent inData={lodSelector} outData={handleClick}/>
                        <ColorSelectorComponent inData={colorSelector} outData={handleClick}/>
                    </div>
                    <SelectorToggleComponent inData={wireframeSelector} outData={handleClick}></SelectorToggleComponent>
                </ViewerOptionsContext.Provider>
            </div>
        </div>
    )}
    </>
    );
}

export function CompactLODSelectorComponent({inData, outData}) {
    const view = useViewerStateContext();
    const parameters = useViewerOptionsContext();

    function handleClick(action) {
        let viewConfig = {
                          'lod': view.lod,
                          'shading': view.shading,
                          'material': view.material,
                          'color': view.color,
                          'wireframe': view.wireframe};
        let lod = parseInt(view.lod[3]);
        switch (action) {
            case 'increment':
                if (lod == parameters.lod.length - 1) {
                    viewConfig['lod'] = 'lod0';
                } else {
                    lod += 1;
                    viewConfig['lod'] = 'lod' + lod.toString();
                }
                break;
            case 'decrement':
                if (lod == 0) {
                    lod = parameters.lod.length - 1;
                    viewConfig['lod'] = 'lod' + lod.toString();
                } else {
                    lod -= 1;
                    viewConfig['lod'] = 'lod' + lod.toString();
                }
                break;
        }
        outData(viewConfig);
    }
    return (
        <>
            <div id="lod-selector-compact">
                <p>{inData.title}</p>
                <div id="lod-selector-compact-interface">
                    <button id="lod-selector-compact-button"
                            onClick={() => handleClick('decrement')}>
                        -
                    </button>
                    <div id="lod-selector-compact-display">
                        <p>{view.lod.toUpperCase()}</p>
                    </div>
                    <button id="lod-selector-compact-button"
                            onClick={() => handleClick('increment')}>
                        +
                    </button>
                </div>
            </div>
        </>
    );
}

export function DashboardSelectorComponent({ inData, outData }) {
    const view = useViewerStateContext();
    const parameters = useViewerOptionsContext();

    function handleSelect(value) {
        let viewConfig = {
                          'lod': view.lod,
                          'shading': view.shading,
                          'material': view.material,
                          'color': view.color,
                          'wireframe': view.wireframe};
        
        switch (inData.param) {
            case 'lod':
                viewConfig['lod'] = value;
                break;
            case 'shading':
                viewConfig['shading'] = value;
                break;
            case 'material':
                // if selecting solid material, clear chosen color
                viewConfig['material'] = value;
                if (value == 'solid') {
                    viewConfig['color'] = null;
                } else if (value == 'albedo') {
                    viewConfig['color'] = parameters['color'][0];
                }
                break;
            case 'color':
                // if selecting a color when material is solid, switch material to albedo
                if (viewConfig['material'] == 'solid') {
                    viewConfig['material'] = 'albedo';

                }
                viewConfig['color'] = value;
                break;
            case 'wireframe':
                // repetitive but let's see if it works
                viewConfig['wireframe'] = !viewConfig['wireframe'];
                break;
        }
        outData(viewConfig);
    }
    let paramHeaderStyle = {
        height: "1.2rem",
        marginTop: "0rem",
        marginBottom: "0rem",
        marginLeft: "0.5rem",
        fontSize: "0.85rem",
        fontFamily: "Swiss721",
        fontWeight: "300",
        zIndex: "9",
    }
    return (
        <>
            <div id={inData.param+"-selector"}>
                <p style={paramHeaderStyle}>{inData.title}</p>
                <SelectorContext.Provider value={inData}>
                    <div className={inData.flexbox}>
                    {inData.options.map((option, i) => (
                        <SelectorComponent key={option} inData={{'param': inData.param, 'option': option, 'i': i, 'minwidth': inData.buttonwidth, 'maxwidth': inData.maxwidth}} outData={handleSelect}></SelectorComponent>
                    ))}
                    </div>
                </SelectorContext.Provider>
            </div>
        </>
    );
}

export function SelectorToggleComponent({ inData, outData }) {
    const view = useViewerStateContext()
    const [checked, setChecked] = useState(true);

    function handleChange() {
        let viewConfig = {'lod': view.lod,
                          'shading': view.shading,
                          'material': view.material,
                          'color': view.color,
                          'wireframe': view.wireframe};
        if (inData.param == "wireframe") {
            viewConfig['wireframe'] = !viewConfig['wireframe'];
        }
        setChecked(!checked);
        outData(viewConfig);
    }
    const paramStyle = {
        color: "black",
        fontSize: "0.85rem",
        fontFamily: "Swiss721",
        fontWeight: "300",
    };
    return (
        <div className={inData.outercontainer}>
            <div className={inData.innercontainer}>
                <label className="toggle-switch">
                    <input type="checkbox"
                        checked={view[inData.param] == true ? (true) : (false)}
                        onChange={() => handleChange()}/>
                    <span className="slider"/>
                </label>
                <p style={paramStyle}>{inData.title}</p>
            </div>
        </div>
    )
}

export function SelectorComponent({ inData, outData }) {
    const view = useViewerStateContext();
    const selector = useSelectorContext();

    function handleClick() {
        // set all other options as inactive
        outData(inData.option);
    };
    const buttonStyle = {
        minWidth: inData.minwidth,
        maxWidth: inData.maxwidth,
        boxShadow: view[inData.param] == inData.option ? ("rgba(0, 0, 0, 0.06) 0px 2px 4px 0px inset") : ("none"),
        background: view[inData.param] == inData.option ? ("#E1E7A7") : ("transparent"),
    };
    const buttonEm = { 
        color: "#7C4E00",
    };
    return (
        <button className="selector-button" value={inData.option} style={buttonStyle} onClick={() => handleClick()}>
            {view[inData.param] == inData.option && (
                <p style={buttonEm}>{selector.map[inData.option].toUpperCase()}</p>
            )}
            {view[inData.param] != inData.option && (
                <p>{selector.map[inData.option].toUpperCase()}</p>
            )}
        </button>
    );
}

export function ColorSelectorComponent({ inData, outData}) {
    const view = useViewerStateContext();

    function handleSelect(value) {
        let viewConfig = {
                          'lod': view.lod,
                          'shading': view.shading,
                          'material': view.material,
                          'color': view.color,
                          'wireframe': view.wireframe};
        
        if (viewConfig['material'] == 'solid') {
            viewConfig['material'] = 'albedo';

        }
        viewConfig['color'] = value;
        outData(viewConfig);
    }
    let paramHeaderStyle = {
        height: "1.2rem",
        marginTop: "0rem",
        marginBottom: "0rem",
        marginLeft: "0.5rem",
        fontSize: "0.85rem",
        fontFamily: "Swiss721",
        fontWeight: "300",
        zIndex: "9",
    }
    return (
        <>
            <div id="color-selector-container">
                <p style={paramHeaderStyle}>COLOR</p>
                    <div className={inData.flexbox}>
                    {inData.options.map((option) => (
                        <>
                        <div key={option} className="color-selector-outer">
                            <button key={option}
                                    id={'color-selector-'+option} 
                                    onClick={() => handleSelect(option)}
                                    style={{height: "1.0rem",
                                            width:"1.0rem",
                                            cursor: "pointer",
                                            borderRadius:"0.5rem",
                                            margin: "auto",
                                            border:"none",
                                            backgroundColor:option,
                                            gridColumnStart: "1",
                                            gridColumnEnd:"-1",
                                            gridRowStart: "1",
                                            gridRowEnd: "-1"}}/>
                        </div>
                        </>
                    ))}
                    </div>
            </div>
        </>
    );
}
