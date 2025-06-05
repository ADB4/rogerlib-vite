import * as React from "react"
import { useState, useEffect, useLayoutEffect} from 'react';
import Markdown from 'react-markdown';
import { useColorModeContext } from '../context/galleryContext';
import { Link } from "react-router";
import { useDevice } from '../hooks/useDevice';

interface DeetsType {
    info: string;
    andy: string;
}
interface CopiedType {
    info: boolean;
    andy: boolean;
}
export default function ChangelogComponent({ outData }) {
    const [deets, setDeets] = useState<DeetsType>({
        info: "help@rogerlibrary.com",
        andy: "andy@rogerlibrary.com",
    });
    const [copied, setCopied] = useState<CopiedType>({
        info: false,
        andy: false,
    });
    const [footer, setFooter] = useState<string>("#### Hello, and thank you for visiting! Since the library launched at the beginning of the year, the main priority has been building out internal tooling to facilitate the various processes needed to catalogue new models, including automated product photography to ensure each model is compatible with the 3D model viewer.  \n#### In the mean time, please feel free to reach out to the appropriate email below for any inquiries related to Roger Motorsports Library.");
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
    useEffect(() => {
        let ignoreStaleRequest = false;
        const url = "/api/v1/changelog/";
        fetch(url, { credentials: "same-origin"})
            .then((response) => {
                if (!response.ok) throw Error(response.statusText);
                return response.json();
            })
            .then((data) => {
                if (!ignoreStaleRequest) {
                    
                }
            })
            .catch((error) => console.log(error));
        return () => {
            ignoreStaleRequest = true;
        };
    }, []);
    const blackwhite = darkMode ? "black":"white";
    const whiteblack = darkMode ? "#d4d4d4":"black";
    const buttonColor: React.CSSProperties = {
        color: darkMode? "white":"black",
    };
    const textColor = {
        color: darkMode ?"white":"black",
    };
    const cntctContainer: React.CSSProperties = {
        color: darkMode ? "white":"black",
        width: compactView ? "calc(100% - 1rem)":"calc(100% - 6rem)",
    };
    return (
    <>
        <div className="root-container-inner">
            <div className="roger-changelog-container"
                 style={cntctContainer}>
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
/*
        <div className="markdown-landing-container" style={aboutparagraph}>
            <Markdown className="markdown-landing">{content}</Markdown>
        </div>
        {!compactView && (
        <>
            <footer className="landing-footer">
                <img className="graphic-rml" src="https://d2fhlomc9go8mv.cloudfront.net/static/graphics/RML_white.png" alt="Roger Motorsports Library logo, white"/>
                <h4 style={footerText}>{footer}</h4>
            </footer>
        </>
        )}
        */