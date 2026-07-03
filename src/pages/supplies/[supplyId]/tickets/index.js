import React from "react";
import codes from "rescode";

const Tickets = () => null;

const ellipsize = (value, maxLength) => {
  if (!value) return "-";

  const text = String(value).trim();

  return text.length > maxLength ? `${text.slice(0, maxLength - 3)}...` : text;
};

const renderField = (label, value) => (
  <div className="ticket-field">
    <strong>{label}: </strong>
    <span>{value || "-"}</span>
  </div>
);

Tickets.getInitialProps = async ({ req, res, query }) => {
  try {
    codes.loadModules(["code128", "gs1-128"], {
      includetext: false,
      scaleX: 2,
      scaleY: 1,
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
      productCode,
      providerName,
    } = query;
    let { boxes, productBoxesCodes } = query;

    if (isServer) {
      const {
        componentToPDFBuffer,
      } = require("../../../../util/componentToPDFBuffer");

      //? Para caso en el que se pide solo un ticket y el query parameter no se genera como arreglo
      if (boxes.constructor !== Array) {
        boxes = [boxes];
        productBoxesCodes = [productBoxesCodes];
      }

      const buffer = await componentToPDFBuffer(
        <html>
          <head>
            <meta charSet="utf-8" />
            <style>{`
              * {
                box-sizing: border-box;
              }

              body {
                margin: 0;
                font-family: Arial, Helvetica, sans-serif;
                color: #111;
              }

              .tickets-sheet {
                font-size: 0;
              }

              .ticket {
                display: inline-block;
                width: 2in;
                height: 1in;
                padding: 0.045in;
                margin: 0 0.08in 0.08in 0;
                page-break-inside: avoid;
                overflow: hidden;
                vertical-align: top;
              }

              .ticket-frame {
                width: 100%;
                height: 100%;
                border: 0.012in solid #111;
                border-radius: 0.12in;
                padding: 0.045in 0.055in 0.035in;
                overflow: hidden;
              }

              .ticket-model {
                border-bottom: 1px solid #111;
                font-size: 8px;
                line-height: 1;
                margin-bottom: 0.045in;
                padding-bottom: 0.025in;
                white-space: nowrap;
              }

              .ticket-description {
                font-size: 7.5px;
                font-weight: 700;
                line-height: 1.05;
                margin: 0.035in 0 0.035in;
                white-space: nowrap;
              }

              .ticket-grid {
                display: table;
                width: 100%;
                font-size: 5.6px;
                line-height: 1.12;
              }

              .ticket-column {
                display: table-cell;
                vertical-align: top;
                width: 56%;
              }

              .ticket-column + .ticket-column {
                width: 44%;
                padding-left: 0.08in;
              }

              .ticket-field {
                white-space: nowrap;
              }

              .ticket-barcode {
                height: 0.19in;
                margin-top: 0.01in;
                text-align: center;
              }

              .ticket-barcode img {
                display: block;
                width: 1.48in;
                height: 0.18in;
                margin: 0 auto;
              }

              .ticket-code-caption {
                font-size: 5.5px;
                font-weight: 700;
                line-height: 1;
                margin-top: 0.005in;
                overflow: hidden;
                text-align: center;
                white-space: nowrap;
              }
            `}</style>
          </head>
          <body>
        <div className="tickets-sheet">
          {boxes.map((box, index) => {
            const productBoxCode = productBoxesCodes[index];

            const data8 = codes.create("code128", productBoxCode);

            return (
              <div className="ticket" key={`${productBoxCode}-${box}`}>
                <div className="ticket-frame">
                  <div className="ticket-model">
                    <strong>Mod: </strong>
                    <span>{ellipsize(modelName, 22)}</span>
                  </div>
                  <div className="ticket-description">
                    Descripcion: {ellipsize(tradename, 44)}
                  </div>
                  <div className="ticket-grid">
                    <div className="ticket-column">
                      {renderField("Familia", ellipsize(familyName, 18))}
                      {renderField("SubFam", ellipsize(subfamilyName, 18))}
                      {renderField("Elemento", ellipsize(elementName, 17))}
                    </div>
                    <div className="ticket-column">
                      {renderField("Proveedor", ellipsize(providerName, 13))}
                      {renderField("Unid/Caja", boxSize)}
                      {renderField("# Caja", box)}
                    </div>
                  </div>
                  <div className="ticket-barcode">
                    <img
                      src={"data:image/png;base64," + data8.toString("base64")}
                      alt={productBoxCode}
                    />
                  </div>
                  <div className="ticket-code-caption">
                    {ellipsize(productCode, 34)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
          </body>
        </html>
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

export default Tickets;
