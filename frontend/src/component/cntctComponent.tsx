import * as React from "react"
import { useState, useLayoutEffect} from 'react';
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
export default function CntctComponent({ outData }) {
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

    function handleCopyToClipboard(text) {
        let copiedState: CopiedType = {
            info: copied.info,
            andy: copied.andy,
        };
        switch (text) {
            case "help":
                copiedState = {
                    info: true,
                    andy: copied.andy,
                };
                navigator.clipboard.writeText(deets.info);
                break;
            case "andy":
                copiedState = {
                    info: copied.info,
                    andy: true,
                };
                navigator.clipboard.writeText(deets.andy);
                break;
        }
        setCopied(copiedState);
    }
    useLayoutEffect(() => {
        const data = {
            'backgroundColors': ["black","white"],
            'textColors': ["white","black"],
            'beanColors': ["white","black"],
            'beanTextColors': ["black","white"],
        };
        outData(true, data);
    }, []);
    const blackwhite = darkMode ? "black":"white";
    const whiteblack = darkMode ? "#d4d4d4":"black";
    const buttonColor: React.CSSProperties = {
        color: darkMode? "white":"black",
    };
    const cntctCopy: React.CSSProperties = {
        backgroundColor: blackwhite,
        color: whiteblack,
    };
    const textColor = {
        color: darkMode ?"white":"black",
    };
    const cntctContainer: React.CSSProperties = {
        color: darkMode ? "white":"black",
        width: compactView ? "calc(100% - 1rem)":"calc(100% - 6rem)",
    };
    const cntctForm: React.CSSProperties = {
        backgroundColor: darkMode ? "white":"black",
    };
    const cntctText: React.CSSProperties = {
        color: darkMode ? "black":"white",
    };
    return (
    <>
        <div className="root-container-inner">
            <div className="roger-cntct-container"
                 style={cntctContainer}>
                <Markdown className="markdown-roger-cntct">
                            {footer}
                </Markdown>
                <div className="library-cntct-container"
                     style={cntctForm}>
                    <div className="library-cntct-info">
                        <h5 style={cntctText}>For assistance with assets:</h5>
                    </div>
                    <div className="library-cntct-module">
                        <h6 style={cntctText}>help@rogerlibrary.com</h6>
                        <button className="cntct-copy"
                                style={cntctCopy}>
                            <p style={buttonColor} onClick={() => {handleCopyToClipboard("info")}}>{copied.info ? ("COPIED"): ("COPY")}</p>
                        </button>
                    </div>
                    <div className="library-cntct-info">
                        <h5 style={cntctText}>For general inquiries, including commercial licensing:</h5>
                    </div>
                    <div className="library-cntct-module">
                        <h6 style={cntctText}>andy@rogerlibrary.com</h6>
                        <button className="cntct-copy"
                                style={cntctCopy}>
                            <p style={buttonColor} onClick={() => {handleCopyToClipboard("andy")}}>{copied.andy ? ("COPIED"): ("COPY")}</p>
                        </button>
                    </div>
                </div>
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