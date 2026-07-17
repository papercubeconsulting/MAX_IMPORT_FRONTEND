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

const getDisplayValue = (value) => {
  const text = String(value || "").trim();
  return text || "-";
};

const formatBoxSuffix = (boxNumber) => {
  const value = String(boxNumber || "").trim();
  return /^\d+$/.test(value) ? value.padStart(2, "0") : value;
};

const getCodeMaxDisplay = (label) => {
  const productCode = getDisplayValue(label.productCode);
  return label.boxNumber
    ? `${productCode} / ${formatBoxSuffix(label.boxNumber)}`
    : productCode;
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

const drawLabel = ({ label, x, labelBottomY, labelWidthPt, labelHeightPt }) => {
  const paddingX = mmToPt(2.35);
  const paddingTop = mmToPt(1.55);
  const barcodeBottom = mmToPt(1.25);
  const barcodeTextFontSize = 5.9;
  const barcodeTextGap = mmToPt(0.8);
  const barcodeHeight = mmToPt(8.6);
  const contentX = x + paddingX;
  const contentWidth = labelWidthPt - paddingX * 2;
  const contentTopY = labelBottomY + labelHeightPt - paddingTop;
  const centerX = x + labelWidthPt / 2;
  const barcodeValueY = labelBottomY + barcodeBottom + mmToPt(0.4);
  const barcodeY = barcodeValueY + barcodeTextFontSize + barcodeTextGap;

  let content = "";
  content += drawText({
    text: label.modelName,
    x: contentX,
    y: contentTopY - 6.9,
    size: 8.1,
    maxWidth: contentWidth,
  });
  content += drawText({
    text: label.description,
    x: contentX,
    y: contentTopY - 13.6,
    size: 5.6,
    maxWidth: contentWidth,
  });
  content += drawText({
    text: getCodeMaxDisplay(label),
    x: contentX,
    y: contentTopY - 19.6,
    size: 5.7,
    maxWidth: contentWidth,
  });
  content += drawBarcode({
    value: label.productBoxCode,
    x: contentX,
    y: barcodeY,
    maxWidthPt: contentWidth,
    heightPt: barcodeHeight,
  });
  content += drawCenteredText({
    text: label.productBoxCode,
    centerX,
    y: barcodeValueY,
    size: barcodeTextFontSize,
    maxWidth: contentWidth,
  });

  return content;
};

const createTicketPDFBuffer = (rows, config) => {
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
      content += drawLabel({
        label,
        x: leftMarginPt + slot * horizontalStepPt,
        labelBottomY,
        labelWidthPt,
        labelHeightPt,
      });
    });
    return content;
  });

  return buildPdf(pages, pageWidth, pageHeight);
};

Tickets.getInitialProps = async ({ req, res, query }) => {
  if (!req) return {};

  try {
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

    const buffer = createTicketPDFBuffer(rows, config);

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
