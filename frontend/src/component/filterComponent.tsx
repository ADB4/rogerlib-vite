import * as React from "react"
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { ColorModeContext, useColorModeContext } from "../context/galleryContext";

interface CategoryDict {
    [key: string]: string[];
}
export default function FilterComponent({ outData }) {
    const [visible, setVisible] = useState<boolean>(false);
    const [categories, setCategories] = useState<string[]>([]);
    const [categoryMap, setCategoryMap] = useState<CategoryDict>({});
    const [selection, setSelection] = useState<string[]>([]);
    const { darkMode, setDarkMode } = useColorModeContext();


    function handleClick(data: string, role) {
        let current: string[] = [];
        if (role == 'parent') {
            current = selection;
            // check if all subcategories are present in selection
            if (categoryMap[data].every(item => selection.includes(item))) {
                let newCurrent = current.filter(item => !categoryMap[data].includes(item));
                current = newCurrent;
            } else {
                for (const item of categoryMap[data]) {
                    current.push(item);
                }
            }
            outData(current);
        } else if (role == 'god') {
            console.debug("Selecting all");
        } else {
            current = selection;
            if (!selection.includes(data)) {
                current.push(data);
                outData(current);
            } else {
                let newCurrent = current.filter(item => item != data);
                current = newCurrent;
                outData(newCurrent);
            }
        }
        setSelection(current);
    }
    function toggleVisibility() {
        setVisible(!visible);
    }
    function clearFilter() {
        setSelection([]);
        outData([]);
    }
    useEffect(() => {
        let ignoreStaleRequest = false;
        let caturl = "/api/v1/categories/all/";
        fetch(caturl, { credentials: "same-origin" })
            .then((response) => {
                if (!response.ok) throw Error(response.statusText);
                return response.json();
            })
            .then((data) => {
                if (!ignoreStaleRequest) {
                    setCategoryMap(data.categories);
                    let cats: string[] = [];
                    for (const key in data.categories) {
                        cats.push(key);
                    }
                    setCategories(cats);
                }
            })
            .catch((error) => console.log(error));
    return () => {
        ignoreStaleRequest = true;
    };

    }, []);
    const colorScheme: React.CSSProperties = {
        backgroundColor: darkMode ? "black":"white",
        color: darkMode ? "white":"black",
        border: darkMode ? "2px solid white":"2px solid #DFDDD5",
    };
    const textColor: React.CSSProperties = {
        color: darkMode ? "white":"black",
    };
    return (
        <>
        {!visible && (
            <div className="lib-nav-inactive" style={colorScheme} onClick={() => {toggleVisibility()}}>
                <button style={textColor} className="lib-nav-button">FILTER</button>
            </div>
        )}
        {visible && (
            <div className="lib-nav" style={colorScheme}>
                {categories.map((category, i) => (
                    <div className="nav-category" key={category}> 
                        <p onClick={() => handleClick(category, "parent")}>
                            {category.replace("_"," ").toUpperCase()}
                        </p>
                        <ul className="nav-subcategories">
                        {categoryMap[category].map((subcategory, j) => (
                            <li
                                key={subcategory}
                                value={subcategory}
                                onClick={() => handleClick(subcategory, "child")}>
                                    {selection.includes(subcategory) ? "->":""}
                                    {subcategory.replace("_"," ").toUpperCase()}
                            </li>
                        ))}
                        </ul>
                    </div>
                ))}
                <div className="lib-nav-actions">
                    <button className="lib-nav-button" onClick={() => {toggleVisibility()}} style={textColor}>CLOSE</button>
                    <button className="lib-nav-button" onClick={() => {clearFilter()}} style={textColor}>CLEAR</button>
                </div>
            </div>
        )}
        </>
    );
}

/*
            <div className="lib-nav">
                <>
                {categoriesList.map((cat, i) => (
                    <NavigationCategory key={cat} inData={{category: cat, subcategories: categoryMap[cat]}} outData={handleDataFromChild}/>
                ))}
                <div className="lib-nav-close">
                    <p onClick={() => {toggleVisibility()}}>CLOSE</p>
                </div>
                </>
            </div>
*/
FilterComponent.proptypes = {
    categoriesList: PropTypes.array.isRequired,
};