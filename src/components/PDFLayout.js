import React from "react";

const renderPDFHeader = () => (
  <div id="pageHeader" style={{ textAlign: "center" }}>
    <img
      style={{
        width: "180px",
        height: "120px",
      }}
      src="https://i.postimg.cc/XN5mGYrQ/max-import.png"
    />
  </div>
);

const PDFLayout = ({ children }) => (
  <html>
    <head>
      <meta charSet="utf8" />
    </head>
    <body>
      {renderPDFHeader()}
      {children}
    </body>
  </html>
);

export default PDFLayout;
