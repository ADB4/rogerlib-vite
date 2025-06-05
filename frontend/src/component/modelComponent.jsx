import * as React from "react"
import { useState, useEffect, useRef, useLayoutEffect, useMemo } from "react";
import { ViewerStateContext, useViewerStateContext, useSelectorContext, SelectorContext, ViewerOptionsContext, useViewerOptionsContext, useColorModeContext } from "../context/galleryContext";
import { useDevice } from "../hooks/useDevice";
import { useControls } from 'leva';
import { Canvas, useLoader, useFrame, useThree } from "@react-three/fiber";
import {
    Environment,
    OrbitControls,
    Html,
    useProgress,
    Wireframe,
    useGLTF,
    useTexture
    } from "@react-three/drei";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

import * as THREE from 'three';
import { Suspense } from "react";


//import HDRIFile from "../../../rogerlib/static/hdri/rural_asphalt_road_1024p.hdr";
// jsx geo
// import { Model } from "../../public/Trw0_lod2";
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
    const [url, setUrl] = useState("");
    const compactView = useDevice();



    // 3D MANIPULATION
    const meshRef = useRef();
    const Model = () => {
        const gltf = useLoader(GLTFLoader, props.url);
        return (
            <mesh ref={meshRef}>
                <meshStandardMaterial attach="material" color="#424242" roughness={0.5} metalness={0.3}/>
                <primitive 
                object={gltf.scene} 
                scale={1.0}
                dispose={null} />
            </mesh>
        )
    };
    const viewContainerStyle = {
        backgroundColor: darkMode ? "transparent":"white",
    };
    return (
        <>
            <div className="model-view-module" style={viewContainerStyle}>
                <Canvas orthographic camera={{ zoom: 75, position: [90, 45, 100] }}>
                <Suspense fallback={<Loader />}>
                        <GLTFComponent url={props.url} itemcode={props.itemcode}/>
                        <LightingComponent />
                        <OrbitControls />
                </Suspense>
                </Canvas>
            </div>
        </> 
    )
}

/*
                        <Environment background={true} files={`https://s3.us-east-2.amazonaws.com/static.rogerlib.com/static/hdri/rural_asphalt_road_1024p.exr`} />
                        <ambientLight intensity={8.0} />
                        <directionalLight position={[0, 7, -12]} 
                                        color="white"
                                        intensity={0.0} />
                        <directionalLight position={[0, 2, 12]} 
                                        color="white"
                                        intensity={1.0} />
*/
export function GLTFComponent(props) {
    const view = useViewerStateContext();
    const meshRef = useRef();
    const { nodes, materials } = useGLTF(props.url);

    // materials
    const materialWF = useRef(new THREE.MeshStandardMaterial({color: 'red', wireframe: true }));
    const materialSolid = useRef(new THREE.MeshStandardMaterial({ color: '#757575', polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1}));

    // map
    // TODO: in default state, view.color is NULL
    const [colorMap, displacementMap, normalMap, roughnessMap, metalnessMap] = useLoader(THREE.TextureLoader, [
        `https://d2fhlomc9go8mv.cloudfront.net/static/models/gltf/tirew0/tex/tirew0_color_${view.color}.jpg`,
        "https://d2fhlomc9go8mv.cloudfront.net/static/models/gltf/tirew0/tex/tirew0_height.jpg",
        "https://d2fhlomc9go8mv.cloudfront.net/static/models/gltf/tirew0/tex/tirew0_normal.jpg",
        "https://d2fhlomc9go8mv.cloudfront.net/static/models/gltf/tirew0/tex/tirew0_roughness.jpg",
        "https://d2fhlomc9go8mv.cloudfront.net/static/models/gltf/tirew0/tex/tirew0_metallic.jpg"
      ]);
    colorMap.flipY = displacementMap.flipY = normalMap.flipY = roughnessMap.flipY = metalnessMap.flipY = false;

    // the second key in nodes is our object name
    const keys = Object.keys(nodes);
    const k = keys[1];
    const geo = nodes[k].geometry;
    return (
        <group {...props} dispose={null}>
        {view.material == 'solid' && (
            <>
            {view.wireframe && (
                <mesh ref={meshRef} geometry={geo} material={materialWF.current} />
            )}
            <mesh ref={meshRef} geometry={geo} material={materialSolid.current}>
            </mesh>
          </>
        )}
        {view.material == 'albedo' && (
            <>
            <mesh ref={meshRef} geometry={geo}>
                <meshStandardMaterial
                    map={colorMap}
                    normalMap={normalMap}
                    roughnessMap={roughnessMap}
                    metalnessMap={metalnessMap}
                />
            </mesh>
            {view.wireframe && (
                <mesh ref={meshRef} geometry={geo} material={materialWF.current} />
            )}
            </>
        )}
        </group>
    )
}

export function LightingComponent() {
    const view = useViewerStateContext();
    const [ custom, setCustom ] = useState(false);
    const [ texture, setTexture ] = useState("https://d2fhlomc9go8mv.cloudfront.net/static/hdri/rural_asphalt_road_256p.exr");


    useLayoutEffect(() => {
        console.log(view.shading);
    }, []);

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
            <meshStandardMaterial attach="material" color="#424242" roughness={0.5} metalness={0.3}/>
        useFrame(() => {
            if (meshRef.current) {
              meshRef.current.rotation.y += 0.01; // Rotate around the y-axis
            }
          });


    const view = useViewerStateContext();
    const { nodes, materials } = useGLTF(props.url);
    const [activeMaterial, setActiveMaterial] = useState('B');
    const meshRef = useRef();

    const materialA = useRef(materials.albedo);
    const materialB = useRef(new THREE.MeshStandardMaterial({color: 'red', wireframe: true }));
    const materialC = useRef(new THREE.MeshStandardMaterial({ color: '#757575', polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1}));
    const currentMaterial = activeMaterial === 'A' ?  materialA.current : materialB.current;
    const matprops = useTexture({
        map:'https://d2fhlomc9go8mv.cloudfront.net/static/models/gltf/tirew0/tex/tirew0_color_black.jpg',
        displacementMap: 'https://d2fhlomc9go8mv.cloudfront.net/static/models/gltf/tirew0/tex/tirew0_height.jpg',
        normalMap: 'https://d2fhlomc9go8mv.cloudfront.net/static/models/gltf/tirew0/tex/tirew0_normal.jpg',
        roughnessMap: 'https://d2fhlomc9go8mv.cloudfront.net/static/models/gltf/tirew0/tex/tirew0_roughness.jpg',
    });
    const keys = Object.keys(nodes);
    let key = keys[1];
    const geo = nodes[key].geometry;
    const solidmaterial = useRef(new THREE.MeshPhongMaterial( {
        color: "#757575",
        polygonOffset: true,
        polygonOffsetFactor: 1, // positive value pushes polygon further away
        polygonOffsetUnits: 1
    }));

    return (
        <group {...props} dispose={null}>
        {view.material == 'solid' && (
            <>
            {view.wireframe && (
                <mesh ref={meshRef} geometry={geo} material={currentMaterial} />
            )}
            <mesh ref={meshRef} geometry={geo} material={materialC.current}>
            </mesh>
          </>
        )}
        {view.material == 'albedo' && (
            <>
            <mesh ref={meshRef} geometry={geo} material={materialA.current}>
            </mesh>
            {view.wireframe && (
                <mesh ref={meshRef} geometry={geo} material={currentMaterial} />
            )}
            </>
        )}
        </group>
    )
*/
