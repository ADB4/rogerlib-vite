import * as React from "react"

export default function DownloadComponent({ inData }) {
    function handleClick(itemcode: string) {
        let url: string = "api/v1/downloads/" + itemcode;
        fetch(url, { 
            credentials: "same-origin"})
            .then((response) => {
                if (!response.ok) throw Error(response.statusText);
                return response.json();
            })
            .then((data) => {
                const a = document.createElement('a');
                a.href = data.presigned_url;
                a.download = "testdownload.zip";
                document.body.appendChild(a);
                a.click();
                a.remove();
            })
            .catch((error) => console.log(error));
    }

    return (
        <div className="download-button-container">
            <div id="download-button" 
                onClick={() => handleClick(inData.item.itemcode)}>
                <p id="download-text-top">.ZIP FILE INCLUDES ALL LODS(FBX), PBR TEXTURES, AND LICENSE.</p>
                <p id="download-text-bottom">CLICK TO DOWNLOAD</p>
            </div>
        </div>
    );
}