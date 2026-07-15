import React from "react";

const UnitTickets = () => null;

const zebraLabelDefaults = {
  labelWidthMm: 50.8,
  labelHeightMm: 25.4,
  horizontalGapMm: 2.38,
  verticalGapMm: 2.63,
  leftMarginMm: 0,
  topMarginMm: 0,
};

const mmToPt = (millimeters) => (Number(millimeters) * 72) / 25.4;
const mm = (value) => `${Number(value).toFixed(3)}mm`;
const pdfPx = (value) => `${mmToPt(value).toFixed(3)}px`;

const getNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

const getTicketConfig = (query) => {
  const config = Object.keys(zebraLabelDefaults).reduce(
    (current, key) => ({
      ...current,
      [key]: getNumber(query[key], zebraLabelDefaults[key]),
    }),
    {}
  );

  return {
    ...config,
    // Defaults match the observed driver size:
    // 50.8 + 2.38 + 50.8 = 103.98 mm wide, 25.4 + 2.63 = 28.03 mm high.
    pageWidthMm: getNumber(
      query.pageWidthMm,
      config.leftMarginMm + config.labelWidthMm * 2 + config.horizontalGapMm
    ),
    pageHeightMm: getNumber(
      query.pageHeightMm,
      config.topMarginMm + config.labelHeightMm + config.verticalGapMm
    ),
  };
};

const getBarcodeRuns = (barcode) => {
  const JsBarcode = eval("require")("jsbarcode");
  const rendered = {};
  JsBarcode(rendered, barcode, {
    format: "CODE128",
    displayValue: false,
    width: 2,
    height: 48,
    margin: 0,
  });

  const binary = rendered.encodings.map((encoding) => encoding.data).join("");
  const runs = [];
  let start = null;

  for (let index = 0; index <= binary.length; index += 1) {
    if (binary[index] === "1" && start === null) {
      start = index;
    }

    if (binary[index] !== "1" && start !== null) {
      runs.push({ start, width: index - start });
      start = null;
    }
  }

  return { runs, modules: binary.length };
};

const Barcode = ({ barcode }) => {
  const moduleWidthMm = 0.254; // 2 dots at 203 dpi.
  const quietZoneMm = 2.54;
  const heightMm = 10.8;
  const { runs, modules } = getBarcodeRuns(barcode);
  const widthMm = modules * moduleWidthMm + quietZoneMm * 2;

  return (
    <div
      className="barcodeBlock"
      style={{ height: pdfPx(heightMm), width: pdfPx(widthMm) }}
    >
      {runs.map((run, index) => (
        <span
          key={`${run.start}-${index}`}
          style={{
            height: pdfPx(heightMm),
            left: pdfPx(quietZoneMm + run.start * moduleWidthMm),
            width: pdfPx(run.width * moduleWidthMm),
          }}
        />
      ))}
    </div>
  );
};

const Field = ({ label, value, className = "" }) => (
  <div className={`field ${className}`}>
    <span>{label}</span>
    <strong>{value || "-"}</strong>
  </div>
);

const UnitLabel = ({ data, barcode }) => (
  <div className="unitLabel">
    <div className="labelHeader">
      <Field label="Codigo Max" value={data.productCode} className="primary" />
      <Field label="Caja" value={data.originBoxCode} />
    </div>
    <Field label="Modelo" value={data.modelName} className="model" />
    <div className="barcodeWrap">
      <Barcode barcode={barcode} />
      <div className="barcodeValue">{barcode}</div>
    </div>
  </div>
);

const CalibrationLabel = ({ side, config, barcode }) => (
  <div className="unitLabel calibrationLabel">
    <div className="corner tl" />
    <div className="corner tr" />
    <div className="corner bl" />
    <div className="corner br" />
    <div className="calibrationTitle">{side}</div>
    <div className="calibrationRule" />
    <Barcode barcode={barcode} />
    <div className="barcodeValue">{barcode}</div>
    <div className="calibrationText">
      Etiqueta {config.labelWidthMm} x {config.labelHeightMm} mm
      <br />
      Pagina {config.pageWidthMm} x {config.pageHeightMm} mm
      <br />
      Gap H {config.horizontalGapMm} mm / Gap V {config.verticalGapMm} mm
    </div>
  </div>
);

const TicketRow = ({ labels, config, barcode, calibration, isLast }) => (
  <div
    className="ticketPage"
    style={{
      breakAfter: isLast ? "auto" : "page",
      pageBreakAfter: isLast ? "auto" : "always",
    }}
  >
    {[0, 1].map((slot) => {
      const label = labels[slot];
      const side = slot === 0 ? "LEFT" : "RIGHT";

      return (
        <div
          key={side}
          className="labelSlot"
          style={{
            height: pdfPx(config.labelHeightMm),
            left: pdfPx(
              config.leftMarginMm +
                slot * (config.labelWidthMm + config.horizontalGapMm)
            ),
            top: pdfPx(config.topMarginMm),
            width: pdfPx(Math.max(1, config.labelWidthMm - 0.3)),
          }}
        >
          {calibration ? (
            <CalibrationLabel side={side} config={config} barcode={barcode} />
          ) : (
            label && <UnitLabel data={label} barcode={barcode} />
          )}
        </div>
      );
    })}
  </div>
);

const ticketCss = (config) => `
  @page {
    size: ${mm(config.pageWidthMm)} ${mm(config.pageHeightMm)};
    margin: 0;
  }

  * {
    box-sizing: border-box;
  }

  html,
  body,
  body > div {
    margin: 0;
    overflow: hidden;
    padding: 0;
    width: ${pdfPx(config.pageWidthMm)};
  }

  .ticketPage {
    height: ${pdfPx(Math.max(config.labelHeightMm, config.pageHeightMm - 0.5))};
    overflow: hidden;
    position: relative;
    width: ${pdfPx(config.pageWidthMm)};
  }

  .labelSlot {
    overflow: hidden;
    position: absolute;
  }

  .unitLabel {
    height: 100%;
    overflow: hidden;
    padding: ${pdfPx(1.2)} ${pdfPx(1.6)} ${pdfPx(0.9)};
    position: relative;
    width: 100%;
  }

  .labelHeader {
    display: grid;
    gap: ${pdfPx(1.2)};
    grid-template-columns: 1fr 0.8fr;
  }

  .field {
    min-width: 0;
  }

  .field span {
    color: #111;
    display: block;
    font-size: 4.8pt;
    font-weight: 700;
    line-height: 1;
    text-transform: uppercase;
  }

  .field strong {
    color: #000;
    display: block;
    font-size: 6pt;
    font-weight: 700;
    line-height: 1.05;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .field.primary strong {
    font-size: 9pt;
  }

  .field.model {
    margin-top: ${pdfPx(0.8)};
  }

  .field.model strong {
    font-size: 7.4pt;
  }

  .barcodeWrap {
    align-items: center;
    display: flex;
    flex-direction: column;
    margin-top: ${pdfPx(0.8)};
  }

  .barcodeBlock {
    background: #fff;
    max-width: 100%;
    position: relative;
  }

  .barcodeBlock span {
    background: #000;
    display: block;
    position: absolute;
    top: 0;
  }

  .barcodeValue {
    color: #000;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 6.2pt;
    font-weight: 700;
    line-height: 1;
    margin-top: ${pdfPx(0.35)};
    text-align: center;
    white-space: nowrap;
  }

  .calibrationLabel {
    border: ${pdfPx(0.2)} solid #000;
    padding: ${pdfPx(1.5)};
  }

  .corner {
    border-color: #000;
    height: ${pdfPx(3)};
    position: absolute;
    width: ${pdfPx(3)};
  }

  .corner.tl {
    border-left: ${pdfPx(0.35)} solid;
    border-top: ${pdfPx(0.35)} solid;
    left: ${pdfPx(0.8)};
    top: ${pdfPx(0.8)};
  }

  .corner.tr {
    border-right: ${pdfPx(0.35)} solid;
    border-top: ${pdfPx(0.35)} solid;
    right: ${pdfPx(0.8)};
    top: ${pdfPx(0.8)};
  }

  .corner.bl {
    border-bottom: ${pdfPx(0.35)} solid;
    border-left: ${pdfPx(0.35)} solid;
    bottom: ${pdfPx(0.8)};
    left: ${pdfPx(0.8)};
  }

  .corner.br {
    border-bottom: ${pdfPx(0.35)} solid;
    border-right: ${pdfPx(0.35)} solid;
    bottom: ${pdfPx(0.8)};
    right: ${pdfPx(0.8)};
  }

  .calibrationTitle {
    font-size: 9pt;
    font-weight: 700;
    text-align: center;
  }

  .calibrationRule {
    border-top: ${pdfPx(0.25)} solid #000;
    margin: ${pdfPx(1)} ${pdfPx(4)};
  }

  .calibrationLabel .barcodeBlock {
    margin: 0 auto;
  }

  .calibrationText {
    bottom: ${pdfPx(1.5)};
    font-size: 4.4pt;
    font-weight: 700;
    left: ${pdfPx(1.5)};
    line-height: 1.15;
    position: absolute;
    right: ${pdfPx(1.5)};
    text-align: center;
  }
`;

UnitTickets.getInitialProps = async ({ req, res, query }) => {
  if (!req) return {};
  try {
    const quantity = Math.min(10000, Math.max(1, Number(query.quantity) || 1));
    const calibration = query.calibration === "1" || query.calibration === "true";
    const barcode = String(query.barcode || "2123456789012345");
    const config = getTicketConfig(query);

    if (!/^2\d{15}$/.test(barcode)) throw new Error("Código unitario inválido");

    const { componentToPDFBuffer } = require("../../../../util/componentToPDFBuffer");
    const data = {
      productCode: query.productCode,
      familyName: query.familyName,
      subfamilyName: query.subfamilyName,
      elementName: query.elementName,
      modelName: query.modelName,
      tradename: query.tradename,
      providerName: query.providerName,
      originBoxCode: query.originBoxCode,
    };
    const labels = Array.from({ length: calibration ? 2 : quantity }, () => data);
    const rows = [];

    for (let index = 0; index < labels.length; index += 2) {
      rows.push(labels.slice(index, index + 2));
    }

    const buffer = await componentToPDFBuffer(
      <div>
        {rows.map((row, index) => (
          <TicketRow
            key={index}
            labels={row}
            config={config}
            barcode={barcode}
            calibration={calibration}
            isLast={index === rows.length - 1}
          />
        ))}
      </div>,
      {
        width: mm(config.pageWidthMm),
        height: mm(config.pageHeightMm),
        margin: { top: "0", right: "0", bottom: "0", left: "0" },
        preferCSSPageSize: true,
        scale: 0.99,
        viewport: {
          width: Math.ceil(mmToPt(config.pageWidthMm)),
          height: Math.ceil(mmToPt(config.pageHeightMm)),
        },
        css: ticketCss(config),
      }
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${
        calibration ? "calibracion" : "tickets-unitarios"
      }-${query.productCode || query.productId}.pdf"`
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
