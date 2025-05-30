import * as React from "react"
import { useState, useEffect } from "react";
import { ViewerStateContext, useViewerStateContext, useSelectorContext, SelectorContext, ViewerOptionsContext, useViewerOptionsContext, useColorModeContext } from "../context/galleryContext";
import type { ViewerStateType, ViewerOptionsType, ViewContextType } from "../context/galleryContext";
import { useDevice } from "../hooks/useDevice";

/* 
ModelViewerComponent
Takes input: {item}
*/
export default function ModelViewerComponent({ inData, outData }) {
    const { darkMode, setDarkMode } = useColorModeContext();
    const [activeImage, setActiveImage] = useState<string>('');
    const [viewState, setViewState] = useState<ViewerStateType>({
        lod: "NULL",
        shading: "NULL",
        material: "NULL",
        color: "NULL",
        wireframe: true,
    });
    const compactView = useDevice();

    function handleConfigUpdate(data) {
        // construct new active image url
        const currentItem = inData.item;
        let updateURL = currentItem.category+"_"+currentItem.itemcode;
        updateURL = updateURL.concat("_"+data.lod+"_"+data.shading+"_"+data.material);

        if (data.material == 'albedo') {
            updateURL = updateURL.concat("_"+data.color);
        }
        if (data.wireframe == true) {
            updateURL = updateURL.concat("_wf.jpg");
        } else {
            updateURL = updateURL.concat(".jpg");
        }
        setActiveImage(inData.item.imagepath.concat(updateURL));
        setViewState(data);
    }

    useEffect(() => {
        let ignoreStaleRequest = false;

        const item = inData.item;
        let lodString = "lod" + (item.lods.length - 1).toString();
        let defaultImage = item.category.concat("_",item.itemcode,"_",lodString,"_flat_solid_wf.jpg");
        setActiveImage(inData.item.imagepath.concat(defaultImage));

        // set default view
        const initialstate: ViewerStateType = {
            lod: lodString,
            shading: 'flat',
            material: 'solid',
            color: 'NULL',
            wireframe: true,
        };
        setViewState(initialstate);
        return () => {
            ignoreStaleRequest = true;
        };
    }, [inData]);

    const imageContainerStyle = {
        backgroundColor: darkMode ? "white":"white",
    };
    const detailToggle = {
        backgroundColor: "#E5FFFE",
    };
    const detailToggleDark = {
        border: "none",
        backgroundColor: "#CBE3E2",
    };
    const detailToggleText = {
        color: "#3B6F88",
    };
    return (
        <>
            <div id="model-image-container" style={imageContainerStyle}>
                <img id="model-image"
                     src={activeImage}
                     alt={inData.item.itemname}/>
            </div>
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
        </>
    )
}

/*
                <ViewContext.Provider value={viewState}>
                    <ViewerDashboardComponent inData={inData.item} outData={handleConfigUpdate}/>
                </ViewContext.Provider>
*/
/*
<DetailParametersComponent inData={inData.item} outData={handleConfigUpdate}/>
*/
export function ViewerDashboardComponent({ inData, outData }) {
    const [viewOptions, setViewOptions] = useState<ViewerOptionsType>({
        'lod': [],
        'shading': ['flat','shaded'],
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
        'buttonwidth': "4rem",
        'maxwidth': "4rem",
    };
    let shaderSelector = {
        'param': 'shading',
        'title': 'SHADING',
        'options': ['flat','shaded'],
        'default': 0,
        'map': {'flat': 'FLAT', 'shaded': 'SHADED'},
        'flexbox': "selector-flex",
        'buttonwidth': "4rem",
        'maxwidth': "4rem",
    };
    let materialSelector = {
        'param': 'material',
        'title': 'MATERIAL',
        'options': ['solid','albedo'],
        'default': 0,
        'map': {'solid': 'SOLID', 'albedo': 'ALBEDO'},
        'flexbox': "selector-flex",
        'buttonwidth': "4rem",
        'maxwidth': "4rem",
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
                        <DashboardSelectorComponent inData={colorSelector} outData={handleClick}/>
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
/*
                        <DashboardSelectorComponent inData={lodSelector} outData={handleClick}/>
                        <DashboardSelectorComponent inData={colorSelector} outData={handleClick}/>
Encompasses parameter header + options:
SHADING
->FLAT
SHADED
*/
export function DashboardSelectorComponent({ inData, outData }) {
    const view = useViewerStateContext();
    const parameters = useViewerOptionsContext();

    function handleSelect(value) {
        let viewConfig: ViewContextType = {'lod': view.lod,
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
        marginLeft: "0rem",
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
        let viewConfig: ViewerStateType = {'lod': view.lod,
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
        color: "#7C4E00",
        fontSize: "1.0rem",
        fontFamily: "Swiss721",
        fontWeight: "200",
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
        outData(inData.option, inData.i);
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