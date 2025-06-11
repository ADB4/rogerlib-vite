import * as React from "react"
import { useState, useEffect, useRef, useLayoutEffect, useMemo } from "react";
import { ViewerStateContext, useViewerStateContext, useSelectorContext, SelectorContext, ViewerOptionsContext, useViewerOptionsContext, useColorModeContext, CameraContext, useCameraContext } from "../context/galleryContext";
import { useDevice } from "../hooks/useDevice";
import { useControls } from 'leva';
import { Canvas, useLoader, useFrame, useThree } from "@react-three/fiber";
import {
    Environment,
    OrbitControls,
    OrthographicCamera,
    Html,
    useProgress,
    Wireframe,
    useGLTF,
    useTexture,
    CameraControls,
    CameraControlsImpl,
    PerspectiveCamera,
    ScrollControls
    } from "@react-three/drei";

import * as THREE from 'three';
import { Suspense } from "react";

const { ACTION } = CameraControlsImpl;
/*
ModelViewerComponent
Takes input: {item}
*/

function Loader() {
    const { active, progress, errors, item, loaded, total } = useProgress();
    return <Html center>{progress} % loaded</Html>;
}

export default function ModelComponent(props) {
    const { darkMode, setDarkMode } = useColorModeContext();
    const view = useViewerStateContext();
    const [viewState, setViewState] = useState({
        itemcode: "NULL",
        lod: "NULL",
        shading: "NULL",
        material: "NULL",
        color: "NULL",
        wireframe: true,
    });
    const [cameraContext, setCameraContext] = useState({
        autoRotate: true,
        speed: 1.0,
    });
    const [autoRotate, setAutoRotate] = useState(true);
    const compactView = useDevice();
    const orbitRef = useRef();

    const cameraRef = useRef();
    const cameraControlRef = useRef();

    const [lookAtVector, setLookAtVector] = useState(new THREE.Vector3(0,0,0));
    const DEG45 = Math.PI / 4;
    const viewContainerStyle = {
        backgroundColor: darkMode ? "transparent":"white",
    };
    function toggleAutoRotate() {
        let newContext = {
            autoRotate: !cameraContext.autoRotate,
            speed: cameraContext.speed,
        };

        setCameraContext(newContext);
    }
    useEffect(() => {
        console.log(props.zoom);
    },[])
    return (
        <>
            <ViewerDashboardComponent inData={props.item} outData={props.updateconfig}/>
            <div className="model-view-controller">
                <button className="model-view-toggle-autorotate"
                        onClick={() => toggleAutoRotate()}>
                            TOGGLE AUTOROTATE
                </button>
                <button className="model-view-toggle-autorotate"
                        onClick={() => {cameraControlRef.current?.rotate(DEG45, 0, true)}}>
                            ROTATE THETA 45DEG
                </button>
            </div>
            <div className="model-view-module" style={viewContainerStyle}>
                <Canvas>
                <Suspense fallback={<Loader />}>

                        <GLTFComponent models={props.models} textures={props.textures} itemcode={props.itemcode}/>
                        <LightingComponent />
                        <group>
                        <CameraContext.Provider value={cameraContext} >
                            <RotatingCamera distance={100} speed={0.01} zoom={props.zoom} camControls={cameraControlRef}/>
                        </CameraContext.Provider>
                        </group>

                </Suspense>
                </Canvas>
            </div>
        </> 
    )
}

export function RotatingCamera(props) {
    const {camera} = useThree();
    const [rotation, setRotation] = useState(0);
    const CameraContext = useCameraContext();

    const cameraRef = useRef();
/*
    useFrame((_, delta) => {
        if (CameraContext.autoRotate) {
            setRotation((prevRotation) => prevRotation + (delta / 2));
            camera.position.x = Math.sin(rotation) * props.distance;
            camera.position.z = Math.cos(rotation) * props.distance;
            camera.position.y = 30;
            camera.lookAt(0,0,0);
        } else {
            setRotation((prevRotation) => prevRotation);
            camera.position.x = Math.sin(rotation) * props.distance;
            camera.position.z = Math.cos(rotation) * props.distance;
            camera.position.y = 30;
            camera.lookAt(0,0,0);
        }
        camera.updateProjectionMatrix();
    });
*/
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
            position={[90,90,90]}
        />
        </>

    )
}
/*
        setRotation((prevRotation) => prevRotation + speed);
        camera.position.x = Math.sin(rotation) * distance;
        camera.position.z = Math.cos(rotation) * distance;
        camera.lookAt(0,0,0);
        camera.updateProjectionMatrix();
                        <OrbitControls 
                            ref={orbitRef}
                            autoRotate={false}
                            autoRotateSpeed={2.0}
                            enableDamping={false}
                            enablePan={false}
                        />
                        <CameraControls
                            camera={cameraRef}
                            target={new THREE.Vector3(0,0,0)}
                            enableDamping={false}
                        />
                        <OrthographicCamera
                            makeDefault
                            ref={cameraRef}
                            zoom={parseInt(props.zoom)}
                            top={200}
                            bottom={-200}
                            left={200}
                            right={-200}
                            near={1}
                            far={2000}
                            position={[90,45,200]}
                        />
*/
/*
props
itemcode: string
models: string[]
*/
export function GLTFComponent(props) {
    const view = useViewerStateContext();

    return (
        <group {...props} dispose={null}>
            {props.models.map((model, i) => (
                <GLTFLoaderComponent key={model} itemcode={props.itemcode} textures={props.textures[i]} filename={model}/>
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
    const view = useViewerStateContext();
    const { nodes, materials } = useGLTF(`https://d2fhlomc9go8mv.cloudfront.net/static/models/${props.itemcode}/gltf/${props.filename}`);
    const meshRef = useRef();

    // materials
    const materialWF = useRef(new THREE.MeshStandardMaterial({color: 'red', wireframe: true }));
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
            <mesh ref={meshRef} geometry={geo} material={materialSolid.current}/>
            </>
        )}
        {view.material == "albedo" && (
            <mesh ref={meshRef} geometry={geo}>
                <TextureLoaderComponent textures={props.textures} itemcode={props.itemcode}/>
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
    const view = useViewerStateContext();
    // TODO: in default state, view.color is NULL
    const [colorMap, normalMap, roughnessMap, metalnessMap] = useLoader(THREE.TextureLoader, [
        `https://d2fhlomc9go8mv.cloudfront.net/static/models/${props.itemcode}/tex/${props.textures.id}_color_${view.color}.jpg`,
        `https://d2fhlomc9go8mv.cloudfront.net/static/models/${props.itemcode}/tex/${props.textures.id}_normal.jpg`,
        `https://d2fhlomc9go8mv.cloudfront.net/static/models/${props.itemcode}/tex/${props.textures.id}_roughness.jpg`,
        `https://d2fhlomc9go8mv.cloudfront.net/static/models/${props.itemcode}/tex/${props.textures.id}_metallic.jpg`
      ]);
    colorMap.flipY = normalMap.flipY = roughnessMap.flipY = metalnessMap.flipY = false;
    return (
        <meshStandardMaterial
            map={colorMap}
            normalMap={normalMap}
            roughnessMap={roughnessMap}
            metalnessMap={metalnessMap}
        />
    )
}

export function LightingComponent() {
    const view = useViewerStateContext();
    const [ custom, setCustom ] = useState(false);
    const [ texture, setTexture ] = useState("https://d2fhlomc9go8mv.cloudfront.net/static/hdri/rural_asphalt_road_256p.exr");

    return (
        <>
        {view.shading == 'flat' && (
            <meshStandardMaterial color="white" />
        )}
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
export function ViewerDashboardComponent({ inData, outData }) {
    const [viewOptions, setViewOptions] = useState({
        'lod': [],
        'shading': ['flat','studio','sunset','rural road'],
        'material': ['solid','albedo'],
        'color': [],
        'wireframe': ['true', 'false'],
    });

    function handleClick(data) {
        outData(data);
    };

    let colorSelector = {
        'param': 'color',
        'title': 'COLOR',
        'options': inData.colors,
        'map': inData.colormap,
        'flexbox': "selector-flex-dynamic",
        'buttonwidth': "5.0rem",
        'maxwidth': "10rem",
    };
    let lodSelector = {
        'param': 'lod',
        'title': 'LEVEL OF DETAIL',
        'options': inData.lods,
        'map': inData.lodmap,
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
        'buttonwidth': "8rem",
        'maxwidth': "8rem",
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
        'lod': inData.lods,
        'shading': ['flat','shaded'],
        'material': ['solid','albedo'],
        'color': inData.colors,
        'colormap': inData.colormap,
    };
    return (
        <div className="dashboard-container-outer">
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
    );

}

/*
                    <div className="dashboard-fixed-container">
                        <DashboardSelectorComponent inData={shaderSelector} outData={handleClick}/>
                        <DashboardSelectorComponent inData={materialSelector} outData={handleClick}/>
                    </div>
                    <div className="dashboard-flex-container">
                        <DashboardSelectorComponent inData={lodSelector} outData={handleClick}/>
                        <DashboardSelectorComponent inData={colorSelector} outData={handleClick}/>
                    </div>
                    <SelectorToggleComponent inData={wireframeSelector} outData={handleClick}></SelectorToggleComponent>

*/
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
    const parameters = useViewerOptionsContext();
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
                    {inData.options.map((option, i) => (
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

