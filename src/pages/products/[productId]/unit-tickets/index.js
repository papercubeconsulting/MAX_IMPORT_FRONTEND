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

const getDisplayValue = (value) => {
  const text = String(value || "").trim();
  return text || "-";
};

const pdfNumber = (value) => Number(value).toFixed(3).replace(/\.?0+$/, "");
const pdfPoint = (value) => pdfNumber(value);

const sanitizePdfText = (value) =>
  getDisplayValue(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7e]/g, "?");

const pdfTextHex = (value) =>
  Buffer.from(sanitizePdfText(value), "ascii").toString("hex").toUpperCase();

const estimateTextWidth = (value, fontSize) =>
  sanitizePdfText(value)
    .split("")
    .reduce((width, char) => {
      if (char === " ") return width + fontSize * 0.28;
      if ("ilI.,'`|!:;".includes(char)) return width + fontSize * 0.25;
      if ("MW@#%&".includes(char)) return width + fontSize * 0.82;
      if (/[A-Z0-9]/.test(char)) return width + fontSize * 0.6;
      return width + fontSize * 0.5;
    }, 0);

const fitText = (value, maxWidth, fontSize) => {
  const text = sanitizePdfText(value);
  if (estimateTextWidth(text, fontSize) <= maxWidth) return text;

  const suffix = "...";
  let clipped = text;
  while (
    clipped.length > 0 &&
    estimateTextWidth(`${clipped}${suffix}`, fontSize) > maxWidth
  ) {
    clipped = clipped.slice(0, -1);
  }

  return `${clipped}${suffix}`;
};

const drawText = ({ text, x, y, size, font = "F2", maxWidth }) => {
  const displayText = maxWidth
    ? fitText(text, maxWidth, size)
    : sanitizePdfText(text);

  return `BT /${font} ${pdfPoint(size)} Tf 1 0 0 1 ${pdfPoint(x)} ${pdfPoint(
    y
  )} Tm <${pdfTextHex(displayText)}> Tj ET\n`;
};

const drawCenteredText = ({ text, centerX, y, size, font = "F2", maxWidth }) => {
  const displayText = maxWidth
    ? fitText(text, maxWidth, size)
    : sanitizePdfText(text);
  const x = centerX - estimateTextWidth(displayText, size) / 2;
  return drawText({ text: displayText, x, y, size, font });
};

const drawBarcode = ({ value, x, y, maxWidthPt, heightPt }) => {
  const quietZonePt = mmToPt(2.54);
  const { runs, modules } = getBarcodeRuns(value);
  const moduleWidthPt = Math.min(
    mmToPt(0.34),
    Math.max(mmToPt(0.19), (maxWidthPt - quietZonePt * 2) / modules)
  );
  const widthPt = modules * moduleWidthPt + quietZonePt * 2;
  const startX = x + (maxWidthPt - widthPt) / 2;

  return runs
    .map((run) =>
      [
        pdfPoint(startX + quietZonePt + run.start * moduleWidthPt),
        pdfPoint(y),
        pdfPoint(run.width * moduleWidthPt),
        pdfPoint(heightPt),
        "re f",
      ].join(" ")
    )
    .join("\n")
    .concat("\n");
};

const drawField = ({
  label,
  value,
  x,
  labelY,
  maxWidth,
  valueSize = 6,
  valueOffset = 6.6,
}) => {
  let content = "";
  content += drawText({
    text: label,
    x,
    y: labelY,
    size: 4.8,
    maxWidth,
  });
  content += drawText({
    text: value,
    x,
    y: labelY - valueOffset,
    size: valueSize,
    maxWidth,
  });
  return content;
};

const buildPdf = (pages, pageWidth, pageHeight) => {
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    null,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
  ];
  const kids = [];

  pages.forEach((content) => {
    const pageObjectId = objects.length + 1;
    const contentObjectId = objects.length + 2;
    kids.push(`${pageObjectId} 0 R`);
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pdfPoint(
        pageWidth
      )} ${pdfPoint(
        pageHeight
      )}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentObjectId} 0 R >>`
    );
    objects.push(
      `<< /Length ${Buffer.byteLength(content, "ascii")} >>\nstream\n${content}endstream`
    );
  });

  objects[1] = `<< /Type /Pages /Kids [${kids.join(" ")}] /Count ${pages.length} >>`;

  const chunks = ["%PDF-1.4\n"];
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets[index + 1] = Buffer.byteLength(chunks.join(""), "ascii");
    chunks.push(`${index + 1} 0 obj\n${object}\nendobj\n`);
  });

  const xrefOffset = Buffer.byteLength(chunks.join(""), "ascii");
  chunks.push(`xref\n0 ${objects.length + 1}\n`);
  chunks.push("0000000000 65535 f \n");
  offsets.slice(1).forEach((offset) => {
    chunks.push(`${String(offset).padStart(10, "0")} 00000 n \n`);
  });
  chunks.push(
    `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
  );

  return Buffer.from(chunks.join(""), "ascii");
};

const drawUnitLabel = ({ label, barcode, x, labelBottomY, labelWidthPt, labelHeightPt }) => {
  const paddingX = mmToPt(1.6);
  const paddingTop = mmToPt(1.25);
  const barcodeBottom = mmToPt(0.25);
  const barcodeTextFontSize = 8.9;
  const barcodeTextGap = mmToPt(0.1);
  const barcodeHeight = mmToPt(7.7);
  const contentX = x + paddingX;
  const contentWidth = labelWidthPt - paddingX * 2;
  const contentTopY = labelBottomY + labelHeightPt - paddingTop;
  const centerX = x + labelWidthPt / 2;
  const barcodeValueY = labelBottomY + barcodeBottom;
  const barcodeY = barcodeValueY + barcodeTextFontSize + barcodeTextGap;

  let content = "";
  content += drawField({
    label: "CODIGO MAX",
    value: label.productCode,
    x: contentX,
    labelY: contentTopY - 4.6,
    maxWidth: contentWidth,
    valueSize: 9,
    valueOffset: 9.2,
  });
  content += drawField({
    label: "MODELO",
    value: label.modelName,
    x: contentX,
    labelY: contentTopY - 22.2,
    maxWidth: contentWidth,
    valueSize: 7.4,
    valueOffset: 7.9,
  });
  content += drawBarcode({
    value: barcode,
    x: contentX,
    y: barcodeY,
    maxWidthPt: contentWidth,
    heightPt: barcodeHeight,
  });
  content += drawCenteredText({
    text: barcode,
    centerX,
    y: barcodeValueY,
    size: barcodeTextFontSize,
    maxWidth: contentWidth,
  });

  return content;
};

const drawCalibrationLabel = ({
  side,
  barcode,
  config,
  x,
  labelBottomY,
  labelWidthPt,
  labelHeightPt,
}) => {
  const paddingX = mmToPt(1.5);
  const contentX = x + paddingX;
  const contentWidth = labelWidthPt - paddingX * 2;
  const centerX = x + labelWidthPt / 2;
  const topY = labelBottomY + labelHeightPt;
  const barcodeHeight = mmToPt(6.8);
  const barcodeY = labelBottomY + mmToPt(8.2);

  let content = "";
  content += `${pdfPoint(x + mmToPt(0.2))} ${pdfPoint(
    labelBottomY + mmToPt(0.2)
  )} ${pdfPoint(labelWidthPt - mmToPt(0.4))} ${pdfPoint(
    labelHeightPt - mmToPt(0.4)
  )} re S\n`;
  content += drawCenteredText({
    text: side,
    centerX,
    y: topY - mmToPt(4.5),
    size: 9,
    maxWidth: contentWidth,
  });
  content += `${pdfPoint(contentX + mmToPt(4))} ${pdfPoint(
    topY - mmToPt(7)
  )} ${pdfPoint(contentWidth - mmToPt(8))} ${pdfPoint(mmToPt(0.25))} re f\n`;
  content += drawBarcode({
    value: barcode,
    x: contentX,
    y: barcodeY,
    maxWidthPt: contentWidth,
    heightPt: barcodeHeight,
  });
  content += drawCenteredText({
    text: barcode,
    centerX,
    y: labelBottomY + mmToPt(5.2),
    size: 7.2,
    maxWidth: contentWidth,
  });
  content += drawCenteredText({
    text: `Etiqueta ${config.labelWidthMm} x ${config.labelHeightMm} mm`,
    centerX,
    y: labelBottomY + mmToPt(2.8),
    size: 4.4,
    maxWidth: contentWidth,
  });
  content += drawCenteredText({
    text: `Pagina ${config.pageWidthMm} x ${config.pageHeightMm} mm`,
    centerX,
    y: labelBottomY + mmToPt(1.3),
    size: 4.4,
    maxWidth: contentWidth,
  });

  return content;
};

const createUnitTicketPDFBuffer = ({ rows, config, barcode, calibration }) => {
  const pageWidth = Math.ceil(mmToPt(config.pageWidthMm));
  const pageHeight = Math.ceil(mmToPt(config.pageHeightMm));
  const labelWidthPt = mmToPt(Math.max(1, config.labelWidthMm - 0.3));
  const labelHeightPt = mmToPt(config.labelHeightMm);
  const horizontalStepPt = mmToPt(config.labelWidthMm + config.horizontalGapMm);
  const topMarginPt = mmToPt(config.topMarginMm);
  const leftMarginPt = mmToPt(config.leftMarginMm);
  const labelBottomY = pageHeight - topMarginPt - labelHeightPt;

  const pages = rows.map((labels) => {
    let content = `1 1 1 rg 0 0 ${pdfPoint(pageWidth)} ${pdfPoint(
      pageHeight
    )} re f\n0 0 0 rg\n`;
    labels.forEach((label, slot) => {
      const x = leftMarginPt + slot * horizontalStepPt;
      content += calibration
        ? drawCalibrationLabel({
            side: slot === 0 ? "LEFT" : "RIGHT",
            barcode,
            config,
            x,
            labelBottomY,
            labelWidthPt,
            labelHeightPt,
          })
        : drawUnitLabel({
            label,
            barcode,
            x,
            labelBottomY,
            labelWidthPt,
            labelHeightPt,
          });
    });
    return content;
  });

  return buildPdf(pages, pageWidth, pageHeight);
};

UnitTickets.getInitialProps = async ({ req, res, query }) => {
  if (!req) return {};

  try {
    const quantity = Math.min(10000, Math.max(1, Number(query.quantity) || 1));
    const calibration = query.calibration === "1" || query.calibration === "true";
    const barcode = String(query.barcode || "2123456789012345");
    const config = getTicketConfig(query);

    if (!/^2\d{15}$/.test(barcode)) throw new Error("Codigo unitario invalido");

    const data = {
      productCode: query.productCode,
      modelName: query.modelName,
    };
    const labels = Array.from({ length: calibration ? 2 : quantity }, () => data);
    const rows = [];

    for (let index = 0; index < labels.length; index += 2) {
      rows.push(labels.slice(index, index + 2));
    }

    const buffer = createUnitTicketPDFBuffer({
      rows,
      config,
      barcode,
      calibration,
    });

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
