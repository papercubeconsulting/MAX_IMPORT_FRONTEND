import React from "react";
import styled from "styled-components";
import codes from "rescode";
import { get } from "lodash";
import PDFLayout from "../../../../components/PDFLayout";

const Tickets = () => null;

const getQueryArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    return value.split(",").filter(Boolean);
  }

  return [];
};

const getLogoDataUri = () => {
  const fs = eval("require")("fs");
  const path = eval("require")("path");
  const logoPath = path.join(process.cwd(), "public", "max-import-ticket.jpg");
  const logo = fs.readFileSync(logoPath).toString("base64");

  return `data:image/jpeg;base64,${logo}`;
};

Tickets.getInitialProps = async ({ req, res, query }) => {
  try {
    codes.loadModules(["code128", "gs1-128"], {
      includetext: true,
      scaleX: 4,
      scaleY: 3,
      textyoffset: 10,
    });

    const isServer = !!req;

    const {
      familyName,
      subfamilyName,
      elementName,
      modelName,
      boxSize,
      tradename,
      providerName,
    } = query;
    let { boxes, productBoxesCodes } = query;

    if (isServer) {
      const {
        componentToPDFBuffer,
      } = require("../../../../util/componentToPDFBuffer");

      boxes = getQueryArray(boxes);
      productBoxesCodes = getQueryArray(productBoxesCodes);
      const logoSrc = getLogoDataUri();

      const buffer = await componentToPDFBuffer(
        <div>
          {boxes.map((box, index) => {
            const productBoxCode = productBoxesCodes[index];

            const data8 = codes.create("code128", productBoxCode);

            return (
              <React.Fragment key={productBoxCode || box}>
                <div
                  style={{
                    fontFamily: "Arial, Helvetica, sans-serif",
                    breakAfter: index === boxes.length - 1 ? "auto" : "page",
                    pageBreakAfter:
                      index === boxes.length - 1 ? "auto" : "always",
                    breakInside: "avoid",
                    pageBreakInside: "avoid",
                  }}
                >
                  {/* <img
                      src={"data:image/png;base64," + data8.toString("base64")}
                      style={{ marginBottom: "1rem" }}
                      alt={productBoxCode}
                    /> */}
                  <div style={{ textAlign: "center" }}>
                    <img
                      style={{
                        width: "413px",
                        height: "253px",
                      }}
                      src={logoSrc}
                    />
                  </div>
                  <div style={{ marginLeft: "1rem", marginBottom: "10px" }}>
                    <strong style={{ fontSize: "40px" }}>Familia: </strong>
                    <span style={{ fontSize: "40px" }}>{familyName}</span>
                  </div>
                  <div style={{ marginLeft: "1rem", marginBottom: "10px" }}>
                    <strong
                      style={{
                        fontSize: "37px",
                        fontWeight: "bold",
                      }}
                    >
                      Sub-Familia:{" "}
                    </strong>
                    <span style={{ fontSize: "37px" }}>{subfamilyName}</span>
                  </div>
                  <div style={{ marginLeft: "1rem", marginBottom: "10px" }}>
                    <strong style={{ fontSize: "37px" }}>Elemento: </strong>
                    <span style={{ fontSize: "37px" }}>{elementName}</span>
                  </div>
                  <div style={{ marginLeft: "1rem", marginBottom: "10px" }}>
                    <strong style={{ fontSize: "37px" }}>Modelo: </strong>
                    <span style={{ fontSize: "37px" }}>{modelName}</span>
                  </div>
                  <div style={{ marginLeft: "1rem", marginBottom: "10px" }}>
                    <strong style={{ fontSize: "43px" }}>
                      Nombre Comercial:{" "}
                    </strong>
                    <span style={{ fontSize: "43px" }}>{tradename}</span>
                  </div>
                  <div style={{ marginLeft: "1rem", marginBottom: "10px" }}>
                    <strong style={{ fontSize: "33px", fontWeight: "bold" }}>
                      Proveedor:{" "}
                    </strong>
                    <span style={{ fontSize: "33px" }}>{providerName}</span>
                  </div>
                  <div style={{ marginLeft: "1rem", marginBottom: "10px" }}>
                    <strong style={{ fontSize: "33px" }}>Unid/Caja: </strong>
                    <span style={{ fontSize: "33px" }}>{boxSize} // </span>
                    <strong style={{ fontSize: "33px" }}>#Caja: </strong>
                    <span style={{ fontSize: "33px" }}>{box}</span>
                  </div>
                  <img
                    src={"data:image/png;base64," + data8.toString("base64")}
                    style={{
                      marginTop: "2rem",
                      height: "267px",
                      width: "100%",
                    }}
                    alt={productBoxCode}
                  />
                </div>
              </React.Fragment>
            );
          })}
        </div>
      );

      res.setHeader(
        "Content-disposition",
        'attachment; filename="tickets.pdf"'
      );

      res.setHeader("Content-Type", "application/pdf");

      res.end(buffer);
    }

    return {};
  } catch (error) {
    console.log("error", error);

    if (res && !res.headersSent) {
      res.statusCode = 500;
      res.end("Error al generar PDF de tickets");
    }

    return {};
  }
};

const BarcodeContainer = styled.div`
  border: 2px dashed black;
  text-align: center;
  padding: 60px 0;

  p {
    font-size: 25px;
  }
`;

export default Tickets;
