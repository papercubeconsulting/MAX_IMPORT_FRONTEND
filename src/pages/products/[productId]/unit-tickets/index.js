import React from "react";
import codes from "rescode";

const UnitTickets = () => null;

const getLogoDataUri = () => {
  const fs = eval("require")("fs");
  const path = eval("require")("path");
  const logoPath = path.join(process.cwd(), "public", "max-import-ticket.jpg");
  return `data:image/jpeg;base64,${fs.readFileSync(logoPath).toString("base64")}`;
};

const TicketLine = ({ label, value, fontSize = "34px" }) => (
  <div style={{ margin: "0 1rem 10px", fontSize }}>
    <strong>{label}: </strong>
    <span>{value || "-"}</span>
  </div>
);

UnitTickets.getInitialProps = async ({ req, res, query }) => {
  if (!req) return {};
  try {
    const quantity = Math.min(10000, Math.max(1, Number(query.quantity) || 1));
    const barcode = String(query.barcode || "");
    if (!/^2\d{15}$/.test(barcode)) throw new Error("Código unitario inválido");

    codes.loadModules(["code128"], {
      includetext: true,
      scaleX: 4,
      scaleY: 3,
      textyoffset: 10,
    });
    const barcodeImage = codes.create("code128", barcode).toString("base64");
    const logoSrc = getLogoDataUri();
    const { componentToPDFBuffer } = require("../../../../util/componentToPDFBuffer");

    const buffer = await componentToPDFBuffer(
      <div>
        {Array.from({ length: quantity }, (_, index) => (
          <div
            key={index}
            style={{
              fontFamily: "Arial, Helvetica, sans-serif",
              breakAfter: index === quantity - 1 ? "auto" : "page",
              pageBreakAfter: index === quantity - 1 ? "auto" : "always",
              breakInside: "avoid",
              pageBreakInside: "avoid",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <img
                src={logoSrc}
                alt="Max Import"
                style={{ height: "253px", width: "413px" }}
              />
            </div>
            <TicketLine label="Código inventario" value={query.productCode} fontSize="38px" />
            <TicketLine label="Familia" value={query.familyName} />
            <TicketLine label="Sub-Familia" value={query.subfamilyName} />
            <TicketLine label="Elemento" value={query.elementName} />
            <TicketLine label="Modelo" value={query.modelName} />
            <TicketLine label="Nombre Comercial" value={query.tradename} fontSize="38px" />
            <TicketLine label="Proveedor" value={query.providerName} />
            {query.originBoxCode && (
              <TicketLine label="Caja origen" value={query.originBoxCode} />
            )}
            <img
              src={`data:image/png;base64,${barcodeImage}`}
              alt={barcode}
              style={{ height: "267px", marginTop: "2rem", width: "100%" }}
            />
          </div>
        ))}
      </div>
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="tickets-unitarios-${query.productCode || query.productId}.pdf"`
    );
    res.setHeader("Content-Type", "application/pdf");
    res.end(buffer);
  } catch (error) {
    console.log("Error al generar PDF de tickets unitarios", error);
    if (res && !res.headersSent) {
      res.statusCode = 500;
      res.end("Error al generar PDF de tickets unitarios");
    }
  }
  return {};
};

export default UnitTickets;
