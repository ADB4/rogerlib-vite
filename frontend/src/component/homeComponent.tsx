import * as React from "react"
import { useLayoutEffect } from 'react';
import QuoteComponent from './quoteComponent';
import { useDeviceContext } from '../context/galleryContext';
import { Link } from "react-router";

export default function HomeComponent({ outData }) {
    const compactView = useDeviceContext();

    useLayoutEffect(() => {
        const data = {
            'backgroundColors': ["black","white"],
            'textColors': ["white","black"],
            'beanColors': ["white","black"],
            'beanTextColors': ["black","white"],
        };
        outData(data);
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