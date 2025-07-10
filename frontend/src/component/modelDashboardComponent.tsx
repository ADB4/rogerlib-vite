import * as React from "react"
import { useState, useEffect } from "react";
import { ViewerStateContext, useViewerStateContext, useSelectorContext, SelectorContext, ViewerOptionsContext, useViewerOptionsContext, useColorModeContext, CameraContext, useModelContext, useDeviceContext } from "../context/galleryContext";

import type { ViewerStateType } from "../context/galleryContext";
/*
<DetailParametersComponent inData={inData.item} outData={handleConfigUpdate}/>
*/
export default function ModelDashboardComponent({ outData }) {
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
                        <SelectorToggleComponent inData={wireframeSelector} outData={handleClick}></SelectorToggleComponent>   
                        <DashboardSelectorComponent inData={shaderSelector} outData={handleClick}/>
                        <DashboardSelectorComponent inData={materialSelector} outData={handleClick}/>
                    </div>
                    <div className="dashboard-flex-container">
                        <DashboardSelectorComponent inData={lodSelector} outData={handleClick}/>
                        <ColorSelectorComponent inData={colorSelector} outData={handleClick}/>
                    </div>
                </ViewerOptionsContext.Provider>
            </div>
        </div>
    )}
    {compactView && (
        <div className="dashboard-container-compact">
            <div id="dashboard-compact">
                <ViewerOptionsContext.Provider value={optionsGlossary}>
                    <div className="dashboard-fixed-compact">
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
        let viewConfig: ViewerStateType = {
                          'lod': view.lod,
                          'shading': view.shading,
                          'material': view.material,
                          'color': view.color,
                          'wireframe': view.wireframe};
        let lod: number = parseInt(view.lod[3]);
        const numlods: number = Number(parameters.lod.length) - 1;
        switch (action) {
            case 'increment':
                if (lod == numlods) {
                    viewConfig['lod'] = 'lod0';
                } else {
                    lod += 1;
                    viewConfig['lod'] = 'lod' + lod.toString();
                }
                break;
            case 'decrement':
                if (lod == 0) {
                    lod = numlods;
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
    const item = useModelContext();
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
        marginLeft: "0.5rem",
        marginBottom: "0rem",
        marginTop: "0rem",
        fontSize: "0.85rem",
        fontFamily: "Swiss721",
        fontWeight: "300",
        zIndex: "9",
    }
    return (
        <>
            <div id="color-selector-container">
                <p className="color-selector-header">COLOR</p>
                <div className="color-selector-flex">
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
