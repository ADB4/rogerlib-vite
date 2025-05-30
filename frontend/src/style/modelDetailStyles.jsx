
const descriptionToggleContainer = {
    width: "12rem",
    height: "5rem",
    fontFamily: "Swiss721",
    fontWeight: "normal",
};

const compactModelImage = {
    width: "100%",
    height: "auto",
    borderRadius: "1rem",
    outline: "1px solid pink",
};
const compactDescriptionHeader = {
    gridColumnStart: "1",
    gridColumnEnd: "-1",
    gridRowStart: "1",
    gridRowEnd: "-1",
    height: "5rem",
    maxWidth: "16rem",
    marginTop: "1rem",
    marginLeft: "1.0rem",
    zIndex: "8",
    fontFamily: "Swiss721",
    fontWeight: "300",
};
const compactActionContainer = {
    gridColumnStart: "1",
    gridColumnEnd: "-1",
    gridRowStart: "3",
    gridRowEnd: "-1",
    height: "6rem",
    width: "100%",
    marginBottom: "0",
    backgroundColor: "#F4F470",
    display: "flex",
    flexDirection: "column",
};
const compactExitButton = {
    gridColumnStart: "1",
    gridColumnEnd: "-1",
    gridRowStart: "1",
    gridRowEnd: "-1",
    fontFamily: "Swiss721",
    fontWeight: "200",
    fontSize: "1.2rem",
    zIndex: "9",
};


export { descriptionToggleContainer,
         compactModelImage,
         compactDescriptionHeader,
         compactActionContainer,
         compactExitButton,
         };