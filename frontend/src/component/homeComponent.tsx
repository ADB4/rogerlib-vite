import * as React from "react"
import { useLayoutEffect } from 'react';
import QuoteComponent from './quoteComponent';
import { useColorModeContext } from '../context/galleryContext';
import { Link } from "react-router";
import { useDevice } from '../hooks/useDevice';

export default function HomeComponent({ outData }) {
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
    return (
    <>
        <div className="root-container-inner">
            <QuoteComponent/>
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