import * as React from "react"
import { useState } from 'react';
import { useColorModeContext } from '../context/galleryContext';
import { useDevice } from '../hooks/useDevice';

export default function QuoteComponent() {
    const { darkMode, setDarkMode } = useColorModeContext();
    const [activeQuote, setActiveQuote] = useState({
            'content': "I am crouched, half hidden but feeling very vulnerable, behind a drudge, peering through tall weeds into a barren valley. The huge plane eventually lands in the clearing and comes to a rest. I am momentarily relieved, but soon a hatch opens in the plane's belly and out flies a smaller silver airplane to begin the search all over again. I am frozen in terror. Just as the plane spots me I wake up.",
            'author': "Pippa Garner; Unpublished, 1992",
    });
    const compactView = useDevice();
    const fontsize = compactView ? "1.5rem":"2.0rem";
    const textColor: React.CSSProperties = {
        fontSize: fontsize,
        lineHeight: fontsize,
        color: darkMode ? "white":"black",
    };
    const author: React.CSSProperties = {
        fontSize: fontsize,
        lineHeight: fontsize,
        textAlign: "right",
        color: darkMode ? "white":"black",
    };
    const contentContainer: React.CSSProperties = {
        maxWidth: compactView ? "calc(100% - 1rem)":"calc(100% - 8rem)",
    };
    return (
    <>
        <div className="quote-container-outer">
                <div className="quote-content-container"
                     style={contentContainer}>
                        <p style={textColor}><i>"{activeQuote.content}"</i></p>
                        <p style={author}><i>- {activeQuote.author}</i></p>
                </div>
        </div>
    </>
    );
}
