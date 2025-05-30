import * as React from "react"
import { useState, useLayoutEffect } from 'react';
import Markdown from 'react-markdown';
import { Link } from "react-router";
import { useColorModeContext } from '../context/galleryContext';
import { useDevice } from '../hooks/useDevice';

export default function AboutComponent({ outData }) {
    const [visible, setVisible] = useState<boolean>(false);
    const [footer, setFooter] = useState<string>("#### ROGER MOTORSPORTS LIBRARY (RML) is a repository of 3D assets made by ANDY BUI. It is a web library created with REACT.JS and FLASK that features a model gallery, interactive model viewer, and downloads served from AMAZON S3. With the help of HTML, CSS, & JAVASCRIPT ALL-IN-ONE FOR DUMMIES by PAUL MCFREDIES, the application was designed by ANDY BUI using the SWISS721, GARAMOND font families.  \n#### ANDY BUI is a programmer and 3D artist with expertise in cloud infrastructure. Based out of Michigan, he created ROGER MOTORSPORTS LIBRARY as a proxy for his endeavors in game development, which include but are not limited to environmental and character art. Assets catalogued in the library are licensed under CC BY-NC 4.0. Users may remix, tweak, and build upon each work for non-commercial purposes with proper attribution only. For commercial licenses, please see the contact page.");
    const { darkMode, setDarkMode } = useColorModeContext();
    const compactView = useDevice();

    useLayoutEffect(() => {
        const data = {
            'backgroundColors': ["black","white"],
            'textColors': ["white","black"],
            'beanColors': ["white","black"],
            'beanTextColors': ["black","white"],
        };
        outData(true, data);
    }, []);
    const aboutContainer: React.CSSProperties = {
        color: darkMode ? "white":"black",
        width: compactView ? "calc(100% - 1rem)":"calc(100% - 6rem)",
    };
    const externalContainer: React.CSSProperties = {
        backgroundColor: darkMode ? "white":"black",
    };
    const externalText: React.CSSProperties = {
        color: darkMode ? "black":"white",
    };
    return (
    <>
        <div className="root-container-inner">
            <div style={aboutContainer}
                 className="roger-about-container">
                <Markdown className="markdown-roger-about">
                            {footer}
                </Markdown>
                <a className="library-external-container" 
                   href="https://ndybui.dev"
                   style={externalContainer}>
                    <h4 style={externalText}>[EXTERNAL] ANDY BUI</h4>
                </a>
            </div>
            <nav id="root-nav-desktop-container">
                <h2>{compactView ? "RML":"Roger Motorsports Library"}</h2>
                    <Link to="/gallery"
                          className="root-nav-desktop-link">
                        <div className="root-nav-header-flex">
                            <h3>ENTER</h3>
                        </div>
                    </Link>
            </nav>
        </div>
    </>
    );
}