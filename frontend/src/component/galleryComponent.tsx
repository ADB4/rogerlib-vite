import * as React from "react"
import { useState, useLayoutEffect, useEffect } from "react";
import { ModelContext, useModelContext } from "../context/galleryContext";
import type { ItemType } from "../context/galleryContext";
import DetailContainerComponent from "../component/detailComponent";
import FilterComponent from "../component/filterComponent";

interface DetailViewType {
    item: ItemType | null;
    toggle: boolean;
}

export default function GalleryComponent({ outData }) {
    const [informationToggle, setInformationToggle] = useState<boolean>(false);
    const [items, setItems] = useState<ItemType[]>([]);
    const [selection, setSelection] = useState<ItemType[]>([]);
    const [detailViewConfig, setDetailViewConfig] = useState<DetailViewType>({
        item: null, 
        toggle: false
    });

    function delay(ms: number) {
        return new Promise(res => setTimeout(res, ms));
    }

    async function openDetailView(data) {
        const detailViewVar: DetailViewType = {
            item: null,
            toggle: false,
        };
        setDetailViewConfig(detailViewVar);
        if (informationToggle) {
            setInformationToggle(false);
        }
        if (detailViewConfig.item == null) {
            const detailViewBefore: DetailViewType = {
                item: data,
                toggle: false,
            };
            setDetailViewConfig(detailViewBefore);
            await delay(200);
            const detailViewAfter: DetailViewType = {
                item: data,
                toggle: true,
            };
            setDetailViewConfig(detailViewAfter);
        } else if (data.itemcode != detailViewConfig.item.itemcode) {
            setDetailViewConfig({item: data, 
                toggle: false});
            await delay(200);
            setDetailViewConfig({item: data, 
                toggle: true});
        }
    }
    function handleFilterResults(data) {
        if (data.length == 0) {
            setSelection(items);
        } else {
            const currentItems = items;
            const filterItems: ItemType[] = [];
            for (const item of currentItems) {
                if (data.includes(item.subcategory)) {
                    filterItems.push(item);
                }
            }
            setSelection(filterItems);
        }
    }
    function closeDetailView() {
        setDetailViewConfig({item: null, toggle: false});
    }
    useLayoutEffect(() => {
        const data = {
            'backgroundColors': ["black","white"],
            'textColors': ["white","black"],
            'beanColors': ["white","black"],
            'beanTextColors': ["black","white"],
        };
        outData(data);
    }, []);
    useEffect(() => {
        let ignoreStaleRequest = false;
        const url = "/api/v1/items/all/";
        fetch(url, { credentials: "same-origin"})
            .then((response) => {
                if (!response.ok) throw Error(response.statusText);
                return response.json();
            })
            .then((data) => {
                if (!ignoreStaleRequest) {
                    const itemList = data.models.slice();
                    const itemArray: ItemType[] = [];
                    for (const model of itemList) {
                        const itemDict: ItemType = {
                            'itemcode': model.itemcode,
                            'itemname': model.itemname,
                            'material': model.material,
                            'colormap': model.colormap,
                            'colorcodes': model.colorcodes,
                            'colors': model.colorcodes,
                            'lods': model.lods,
                            'lodmap': model.lodmap,
                            'polycount': model.polycount,
                            'category': model.category,
                            'subcategory': model.subcategory,
                            'description': model.description,
                            'creatornote': model.creatornote,
                            'shader': model.shader,
                            'preview': model.preview,
                            'imagepath': model.imagepath,
                            'images': model.images,
                            'models': model.models,
                            'modelanimation': model.modelanimation,
                            'zoom': model.zoom,
                            'texturesets': model.texturesets,
                            'texturemap': model.texturemap,
                            'version': model.version,
                        };
                        itemArray.push(itemDict);
                    }
                    setItems(itemArray);
                    setSelection(itemArray);
                }
            })
            .catch((error) => console.log(error));
        return () => {
            ignoreStaleRequest = true;
        };
    }, []);
    if (detailViewConfig == null) {
        return null;
    } else {
        return (
            <>
            <div id="model-gallery-container-outer">
                <div id="standard-header">
                    <hr className="solid"/>
                </div>
                <FilterComponent outData={handleFilterResults}/>
                <LibraryListComponent inData={{selection: selection, items: items}} outData={openDetailView}/>
                {detailViewConfig.toggle && (
                        <ModelContext.Provider value={detailViewConfig.item}>
                            <DetailContainerComponent outData={closeDetailView}></DetailContainerComponent>
                        </ModelContext.Provider>

                )}
            </div>
            </>
        )
    }
}

/*
                    <FilterComponent outData={handleFilterResults}/>
                    <LibraryListComponent inData={{selection: selection, items: items}} outData={openDetailView}/>
                    {detailViewConfig.toggle && (
                            <DetailContainerComponent inData={inData} outData={closeDetailView}></DetailContainerComponent>
                    )}
*/
export function LibraryListComponent({ inData, outData }) {
    return (
        <>
        <div id="model-gallery-grid">
            <div id="model-gallery-list">
                <div id="model-gallery-flex">
                {inData.selection.map((model: ItemType) => (
                    <ModelContext.Provider key={model.itemcode} value={model}>
                        <LibraryItemComponent key={model.itemcode} outData={outData}>
                        </LibraryItemComponent>
                    </ModelContext.Provider>
                ))}
                {inData.items.map((model: ItemType) => (
                    <ModelContext.Provider key={model.itemcode} value={model}>
                        <GhostItemComponent key={model.itemcode} outData={outData}>
                        </GhostItemComponent>
                    </ModelContext.Provider>
                ))}
                </div>
                <div id="model-gallery-end">
                    <p>YOU'VE REACHED THE END.</p>
                </div>
            </div>
        </div>
        </>
    )
}
/*
            <div id="model-gallery-end">
                <p>YOU'VE REACHED THE END.</p>
            </div>
*/

export function LibraryItemComponent({ outData }) {
    const modelcontext = useModelContext();

    const galleryItemStyle = {
        height: "20rem",
        width: "20rem",
        cursor: "pointer",
        zIndex: "2",
    };
    return (
        <div role="tablist" tabIndex={0} className="item" style={galleryItemStyle} onClick={() => {outData(modelcontext)}}>
            <img src={modelcontext.preview} alt={modelcontext.itemname+" preview image"}  loading="lazy"/>
        </div>
    )
}

export function GhostItemComponent({ outData }) {
    const modelcontext = useModelContext();

    const galleryItemStyle = {
        height: "20rem",
        width: "20rem",
        cursor: "pointer",
        zIndex: "2",
        opacity: "25%",
    };
    return (
        <div className="item" style={galleryItemStyle} onClick={() => {outData(modelcontext)}}>
            <img src={modelcontext.preview} alt={modelcontext.itemname+" preview image"} loading="lazy"/>
        </div>
    )
}