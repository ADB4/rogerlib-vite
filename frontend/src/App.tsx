import * as React from "react"
import { useState, useLayoutEffect} from 'react';
import GalleryComponent from "./component/galleryComponent";
import { ColorModeContext, DeviceContext } from './context/galleryContext';
import { BrowserRouter, Routes, Route, Link } from "react-router";
import { useDevice } from './hooks/useDevice';
import HomeComponent from './component/homeComponent';
import CntctComponent from './component/cntctComponent';
import AboutComponent from './component/aboutComponent';


import './App.css'

interface ColorSchemeType {
    logoURL: string[];
    backgroundColors: string[];
    textColors: string[];
    beanColors: string[];
    beanTextColors: string[];
}
export default function App() {
    const defaultColor = {
        darkMode: false,
    };
    const [darkMode, setDarkMode] = useState<boolean>(defaultColor.darkMode);
    const [colorScheme, setColorScheme] = useState<ColorSchemeType>({
        logoURL: ["",""],
        backgroundColors: ["",""],
        textColors: ["",""],
        beanColors: ["",""],
        beanTextColors: ["",""],
    });
    const compactView = useDevice();

    function handleColorToggle(data: ColorSchemeType): void {
        const scheme: ColorSchemeType = {
            'logoURL': ["https://d2fhlomc9go8mv.cloudfront.net/static/graphics/logo_rogerlib_white.svg","https://d2fhlomc9go8mv.cloudfront.net/static/graphics/logo_rogerlib_black.svg"],
            'backgroundColors': [data.backgroundColors[0],data.backgroundColors[1]],
            'textColors': [data.textColors[0],data.textColors[1]],
            'beanColors': [data.beanColors[0],data.beanColors[1]],
            'beanTextColors': [data.beanTextColors[0],data.beanTextColors[1]],
        };
        setColorScheme(scheme);
    }
    function toggleDarkMode(): void {
        setDarkMode(!darkMode);
    }

    useLayoutEffect(() => {
        setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
    },[]);
    const rootContainerStyle: React.CSSProperties = {
        display: "grid",
        gridTemplateColumns: "auto",
        gridTemplateRows: "4.0rem auto",
        marginLeft: "auto",
        marginRight: "auto",
        width: compactView ? ("100%") : ("calc(100vw - 2rem)"),
        maxWidth: "2750px",
        height: compactView ? ("100%") : ("calc(100vh - 1rem)"),
        minHeight: "12rem",
        maxHeight: "1560px",
        overflowY: "visible",
        overflowX: "visible",
        borderRadius: compactView ? ("0rem 0rem 0rem 0rem") : ("0rem 0rem 1.5rem 1.5rem"),
        backgroundColor: darkMode ? colorScheme.backgroundColors[0] : colorScheme.backgroundColors[1],
    };
    const h1style: React.CSSProperties = {
        color: darkMode ? colorScheme.textColors[0] : colorScheme.textColors[1],
    };
    const webColorSlider = {
        backgroundColor: darkMode ? colorScheme.beanColors[0] : colorScheme.beanColors[1],
        marginLeft: darkMode ? "0.125rem":"1.125rem",
        marginRight: darkMode ? "auto":"auto",
    };
    const webColorBackground = {
        backgroundColor: darkMode ? colorScheme.beanColors[0] : colorScheme.beanColors[1],
    };
    const webColorToggle = {
        backgroundColor: darkMode ? colorScheme.beanTextColors[0] : colorScheme.beanTextColors[1],
    };
    const webColorToggleInfoText = {
        color: darkMode ? colorScheme.beanColors[0] : colorScheme.beanColors[1],
    };
    const webColorToggleInfo = {
        backgroundColor: darkMode ? colorScheme.beanTextColors[0] : colorScheme.beanTextColors[1],
    };

    return (
        <div className="root-container" 
             style={rootContainerStyle}>
            <DeviceContext.Provider value={compactView}>
            <ColorModeContext.Provider value={darkMode}>
            <BrowserRouter>
                <header>
                <div className="roger-header-container">
                    <>
                    <Link role="button" to="/" className="roger-header-logo">
                        <img className="graphic-rml" src={darkMode ? colorScheme.logoURL[0] : colorScheme.logoURL[1]} alt="Roger Motorsports Library logo, white"/>
                    </Link>
                    </>
                    <nav className="roger-header-nav-container">
                        <Link role="button" to="/about"        
                              className="roger-header-nav-link"
                              style={h1style}>
                            ABOUT
                        </Link>
                        <Link role="button" to="/cntct"             
                              className="roger-header-nav-link"
                              style={h1style}>
                            CONTACT
                        </Link>
                        <a href="https://github.com/ADB4/rogerlib-vite"
                            target="_blank"
                            rel="noreferrer"
                            className="roger-header-nav-link">
                            <img className="graphic-github" src={darkMode ? "https://d2fhlomc9go8mv.cloudfront.net/static/graphics/github-mark-white.svg" : "https://d2fhlomc9go8mv.cloudfront.net/static/graphics/github-mark.svg"} alt="Github logo"/>
                        </a>
                    </nav>
                    <div id="web-color-toggle-container">
                        <div id="web-color-toggle-background"
                             style={webColorBackground}>
                            <div id="web-color-toggle-info"
                                 style={webColorToggleInfo}>
                                    <h4 style={webColorToggleInfoText}>THEME</h4>
                                    </div>
                            <label className="web-color-toggle-switch"
                            style={webColorToggle}>
                                <input type="checkbox"
                                    checked={darkMode}
                                    onChange={() => toggleDarkMode()}/>
                                <span className="web-color-slider"
                                      style={webColorSlider}/>
                            </label>
                        </div>
                    </div>
                </div>

                </header>
                <Routes>
                    <Route path="/" element={
                        <>
                            <HomeComponent outData={handleColorToggle}/>
                        </>
                    }/>
                    <Route path="/gallery" element={
                        <>
                            <GalleryComponent outData={handleColorToggle}/>
                        </>
                    }/>
                    <Route path="/about" element={
                        <>
                            <AboutComponent outData={handleColorToggle}/>
                        </>
                    }/>
                    <Route path="/cntct" element={
                        <>
                            <CntctComponent outData={handleColorToggle}/>
                        </>
                    }/>
                </Routes>
            </BrowserRouter>
            </ColorModeContext.Provider>
            </DeviceContext.Provider>
            </div>
        );
}
