import { createContext, useContext } from 'react';
import type { Dispatch, SetStateAction } from 'react';

// ViewportContext: For light/dark mode AND mobile/desktop
interface ViewType {
    darkMode: boolean;
    compactView: boolean;
}

export interface ViewportContextType {
    viewContext: ViewType;
    setViewContext: Dispatch<SetStateAction<ViewType>>;
}
export const ViewportContext = createContext<ViewportContextType | undefined>(undefined);

export const useViewportContext = () => {
    const context = useContext(ViewportContext);
    if (context === undefined) {
        throw new Error('ViewportContext not found.');
    }
    return context;
};

// Model Viewer Context
export interface ViewerStateType {
    lod: string;
    shading: string;
    material: string;
    color: string;
    wireframe: boolean;
}
export const ViewerStateContext = createContext<ViewerStateType | undefined>(undefined);
export const useViewerStateContext = () => {
    const context = useContext(ViewerStateContext);
    if (context === undefined) {
        throw new Error('Viewer State context not found.');
    }
    return context;
}
export interface ViewerOptionsType {
    [key: string]: string[];
}
export const ViewerOptionsContext = createContext<ViewerOptionsType | undefined>(undefined);
export const useViewerOptionsContext = () => {
    const context = useContext(ViewerOptionsContext);
    if (context === undefined) {
        throw new Error('Viewer State context not found.');
    }
    return context;
}
// ColorModeContext: For light/dark mode
export interface ColorModeContextType {
    darkMode: boolean;
    setDarkMode: Dispatch<SetStateAction<boolean>>;
}
export const ColorModeContext = createContext<ColorModeContextType | undefined>(undefined);
export const useColorModeContext = () => {
    const context = useContext(ColorModeContext);
    if (context === undefined) {
        throw new Error('Context not found.');
    }
    return context;
};


export interface DictType {
    [key: string]: string;
}
export interface ItemType {
    preview: string;
    imagepath: string;
    images: string[];
    itemcode: string;
    itemname: string;
    category: string;
    subcategory: string;
    lods: string[];
    lodmap: DictType;
    polycount: DictType;
    material: string;
    colormap: DictType;
    colors: string[];
    description: string;
    creatornote: string;
    shader: string;
    version: string;
}
export interface ModelContextType {
    model: ItemType;
}
export const ModelContext = createContext<ModelContextType | undefined>(undefined);
export const useModelContext = () => {
    const context = useContext(ModelContext);
    if (context === undefined) {
        throw new Error('Model context not found.');
    }
    return context;
};

export const GalleryContext = createContext({'resolutionX': null, 'resolutionY': null});


export interface DetailContextType {
    item: ItemType;
    imageresolution: number;
}
export const DetailContext = createContext<DetailContextType | undefined>(undefined);
export const useDetailContext = () => {
    const context = useContext(DetailContext);
    if (context === undefined) {
        throw new Error('Detail context not found.');
    }
    return context;
}

export interface ViewContextType {
    [key: string]: string | boolean | null;
}
export const ViewContext = createContext<ViewContextType | undefined>(undefined);
export const useViewContext = () => {
    const context = useContext(ViewContext);
    if (context === undefined) {
        throw new Error('View context not found.');
    }
    return context;
}

export interface ParameterContextType {
    [key: string]: string | string[] | DictType;
}
export const ParameterContext = createContext<ParameterContextType | undefined>(undefined);
export const useParameterContext = () => {
    const context = useContext(ParameterContext);
    if (context === undefined) {
        throw new Error('Viewer Options context not found.');
    }
    return context;
}

export interface SelectorContextType {
    [key: string]: string | string[] | boolean | DictType;
}
export const SelectorContext = createContext<SelectorContextType | undefined>(undefined);
export const useSelectorContext = () => {
    const context = useContext(SelectorContext);
    if (context === undefined) {
        throw new Error('Selector context not found.');
    }
    return context;
}
// export const ViewportContext = createContext(null);
// export const ColorModeContext = createContext(null);
export const FilterContext = createContext(null);
// export const DetailContext = createContext(null);
export const ContentContext = createContext(null);
// export const ModelContext = createContext(null);
// export const SelectorContext = createContext(null);
// export const ParameterContext = createContext(null);