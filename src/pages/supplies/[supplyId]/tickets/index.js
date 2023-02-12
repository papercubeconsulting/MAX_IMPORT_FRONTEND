import React from "react";
import { componentToPDFBuffer } from "../../../../util";
import styled from "styled-components";
import codes from "rescode";
import { get } from "lodash";
import PDFLayout from "../../../../components/PDFLayout";

const Tickets = () => null;

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
      //? Para caso en el que se pide solo un ticket y el query parameter no se genera como arreglo
      if (boxes.constructor !== Array) {
        boxes = [boxes];
        productBoxesCodes = [productBoxesCodes];
      }

      const buffer = await componentToPDFBuffer(
        <div>
          {boxes.map((box, index) => {
            const productBoxCode = productBoxesCodes[index];

            const data8 = codes.create("code128", productBoxCode);

            return (
              <>
                <div>
                  {/* <img
                      src={"data:image/png;base64," + data8.toString("base64")}
                      style={{ marginBottom: "1rem" }}
                      alt={productBoxCode}
                    /> */}
                  <div style={{ textAlign: "center" }}>
                    <img
                      style={{
                        width: "310px",
                        height: "190px",
                      }}
                      src="https://maximportassets.s3.amazonaws.com/max-import.jpg"
                    />
                  </div>
                  <div style={{ marginLeft: "1rem", marginBottom: "10px" }}>
                    <strong style={{ fontSize: "30px" }}>Familia: </strong>
                    <span style={{ fontSize: "30px" }}>{familyName}</span>
                  </div>
                  <div style={{ marginLeft: "1rem", marginBottom: "10px" }}>
                    <strong
                      style={{
                        fontSize: "28px",
                        fontWeight: "bold",
                      }}
                    >
                      Sub-Familia:{" "}
                    </strong>
                    <span style={{ fontSize: "28px" }}>{subfamilyName}</span>
                  </div>
                  <div style={{ marginLeft: "1rem", marginBottom: "10px" }}>
                    <strong style={{ fontSize: "28px" }}>Elemento: </strong>
                    <span style={{ fontSize: "28px" }}>{elementName}</span>
                  </div>
                  <div style={{ marginLeft: "1rem", marginBottom: "10px" }}>
                    <strong style={{ fontSize: "28px" }}>Modelo: </strong>
                    <span style={{ fontSize: "28px" }}>{modelName}</span>
                  </div>
                  <div style={{ marginLeft: "1rem", marginBottom: "10px" }}>
                    <strong style={{ fontSize: "32px" }}>
                      Nombre Comercial:{" "}
                    </strong>
                    <span style={{ fontSize: "32px" }}>{tradename}</span>
                  </div>
                  <div style={{ marginLeft: "1rem", marginBottom: "10px" }}>
                    <strong style={{ fontSize: "25px", fontWeight: "bold" }}>
                      Proveedor:{" "}
                    </strong>
                    <span style={{ fontSize: "25px" }}>{providerName}</span>
                  </div>
                  <div style={{ marginLeft: "1rem" }}>
                    <strong style={{ fontSize: "25px" }}>Unid/Caja: </strong>
                    <span style={{ fontSize: "25px" }}>{boxSize} // </span>
                    <strong style={{ fontSize: "25px" }}> #Caja: </strong>
                    <span style={{ fontSize: "25px" }}>{box}</span>
                  </div>
                  <img
                    src={"data:image/png;base64," + data8.toString("base64")}
                    style={{
                      marginTop: "1.5rem",
                      height: "200px",
                      width: "100%",
                    }}
                    alt={productBoxCode}
                  />
                </div>
              </>
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
