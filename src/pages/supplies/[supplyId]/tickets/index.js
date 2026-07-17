import React from "react";

const Tickets = () => null;

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

const getQueryArray = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") return value.split(",").filter(Boolean);
  return [];
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

const getBarcodeRuns = (value) => {
  const JsBarcode = eval("require")("jsbarcode");
  const rendered = {};
  JsBarcode(rendered, String(value || "0"), {
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
    if (binary[index] === "1" && start === null) start = index;
    if (binary[index] !== "1" && start !== null) {
      runs.push({ start, width: index - start });
      start = null;
    }
  }

  return { runs, modules: binary.length };
};

const Barcode = ({ value, maxWidthMm = 45.2 }) => {
  const quietZoneMm = 2.54;
  const heightMm = 9.4;
  const { runs, modules } = getBarcodeRuns(value);
  const moduleWidthMm = Math.min(
    0.34,
    Math.max(0.19, (maxWidthMm - quietZoneMm * 2) / modules)
  );
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

const TextLine = ({ value, className = "" }) => (
  <div className={`textLine ${className}`}>{value || "-"}</div>
);

const formatBoxSuffix = (boxNumber) => {
  const value = String(boxNumber || "").trim();
  return /^\d+$/.test(value) ? value.padStart(2, "0") : value;
};

const getCodeMaxDisplay = (label) => {
  const productCode = label.productCode || "-";
  return label.boxNumber
    ? `${productCode} / ${formatBoxSuffix(label.boxNumber)}`
    : productCode;
};

const BoxLabel = ({ label }) => (
  <div className="boxLabel">
    <div className="primaryLine">{label.modelName || "-"}</div>
    <TextLine value={label.description} className="description" />
    <TextLine value={getCodeMaxDisplay(label)} />
    <div className="barcodeWrap">
      <Barcode value={label.productBoxCode} />
      <div className="barcodeValue">{label.productBoxCode}</div>
    </div>
  </div>
);

const TicketRow = ({ labels, config, isLast }) => (
  <div
    className="ticketPage"
    style={{
      breakAfter: isLast ? "auto" : "page",
      pageBreakAfter: isLast ? "auto" : "always",
    }}
  >
    {[0, 1].map((slot) => {
      const label = labels[slot];

      return (
        <div
          key={slot}
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
          {label && <BoxLabel label={label} />}
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
    background: #fff;
    overflow: hidden;
    position: absolute;
  }

  .boxLabel {
    height: 100%;
    overflow: hidden;
    padding: ${pdfPx(1.55)} ${pdfPx(2.35)} ${pdfPx(1.15)};
    position: relative;
    width: 100%;
  }

  .primaryLine,
  .textLine {
    min-width: 0;
  }

  .primaryLine {
    color: #000;
    font-size: 8.1pt;
    font-weight: 700;
    line-height: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .textLine {
    color: #000;
    font-size: 4.7pt;
    font-weight: 700;
    line-height: 1.05;
    margin-top: ${pdfPx(0.12)};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .textLine.description {
    font-size: 4.5pt;
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

  .barcodeWrap {
    align-items: center;
    bottom: ${pdfPx(1.25)};
    display: flex;
    flex-direction: column;
    left: ${pdfPx(2.35)};
    position: absolute;
    right: ${pdfPx(2.35)};
  }

  .barcodeValue {
    color: #000;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 5.2pt;
    font-weight: 700;
    line-height: 1;
    margin-top: ${pdfPx(0.25)};
    text-align: center;
    white-space: nowrap;
  }

`;

Tickets.getInitialProps = async ({ req, res, query }) => {
  if (!req) return {};

  try {
    const { componentToPDFBuffer } = require("../../../../util/componentToPDFBuffer");
    const config = getTicketConfig(query);
    const boxes = getQueryArray(query.boxes);
    const productBoxesCodes = getQueryArray(query.productBoxesCodes);
    const labels = boxes.map((boxNumber, index) => ({
      boxNumber,
      productBoxCode: productBoxesCodes[index] || boxNumber,
      productCode: query.productCode,
      description: query.tradename || query.description,
      modelName: query.modelName,
      boxSize: query.boxSize,
      providerName: query.providerName,
    }));
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

    res.setHeader("Content-disposition", 'attachment; filename="tickets.pdf"');
    res.setHeader("Content-Type", "application/pdf");
    res.end(buffer);
  } catch (error) {
    console.log("error", error);

    if (res && !res.headersSent) {
      res.statusCode = 500;
      res.end("Error al generar PDF de tickets");
    }

    return {};
  }
};

export default Tickets;
