import JsBarcode from "jsbarcode";

const defaults = {
  labelWidthMm: 50.8,
  labelHeightMm: 25.4,
  horizontalGapMm: 2.38,
  verticalGapMm: 2.63,
  leftMarginMm: 0,
  topMarginMm: 0,
};

const mmToPt = (value) => (Number(value) * 72) / 25.4;
const pdfNumber = (value) =>
  Number(value)
    .toFixed(3)
    .replace(/\.?0+$/, "");

const sanitizePdfText = (value) =>
  String(value || "-")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7e]/g, "?");

const textToHex = (value) =>
  Array.from(sanitizePdfText(value))
    .map((character) => character.charCodeAt(0).toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();

const estimateTextWidth = (value, fontSize) =>
  sanitizePdfText(value)
    .split("")
    .reduce((width, character) => {
      if (character === " ") return width + fontSize * 0.28;
      if ("ilI.,'`|!:;".includes(character)) return width + fontSize * 0.25;
      if ("MW@#%&".includes(character)) return width + fontSize * 0.82;
      if (/[A-Z0-9]/.test(character)) return width + fontSize * 0.6;
      return width + fontSize * 0.5;
    }, 0);

const fitText = (value, maxWidth, fontSize) => {
  const text = sanitizePdfText(value);
  if (estimateTextWidth(text, fontSize) <= maxWidth) return text;
  let clipped = text;
  while (
    clipped.length &&
    estimateTextWidth(`${clipped}...`, fontSize) > maxWidth
  )
    clipped = clipped.slice(0, -1);
  return `${clipped}...`;
};

const drawText = ({ text, x, y, size, font = "F2", maxWidth }) => {
  const value = maxWidth
    ? fitText(text, maxWidth, size)
    : sanitizePdfText(text);
  return `BT /${font} ${pdfNumber(size)} Tf 1 0 0 1 ${pdfNumber(
    x,
  )} ${pdfNumber(y)} Tm <${textToHex(value)}> Tj ET\n`;
};

const drawCenteredText = ({ text, centerX, y, size, maxWidth }) => {
  const value = maxWidth
    ? fitText(text, maxWidth, size)
    : sanitizePdfText(text);
  return drawText({
    text: value,
    x: centerX - estimateTextWidth(value, size) / 2,
    y,
    size,
  });
};

const getBarcodeRuns = (value) => {
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

const drawBarcode = ({ value, x, y, maxWidthPt, heightPt }) => {
  const quietZonePt = mmToPt(2.54);
  const { runs, modules } = getBarcodeRuns(value);
  const moduleWidthPt = Math.min(
    mmToPt(0.34),
    Math.max(mmToPt(0.19), (maxWidthPt - quietZonePt * 2) / modules),
  );
  const widthPt = modules * moduleWidthPt + quietZonePt * 2;
  const startX = x + (maxWidthPt - widthPt) / 2;
  return runs
    .map((run) =>
      [
        pdfNumber(startX + quietZonePt + run.start * moduleWidthPt),
        pdfNumber(y),
        pdfNumber(run.width * moduleWidthPt),
        pdfNumber(heightPt),
        "re f",
      ].join(" "),
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
  valueSize,
  valueOffset,
}) =>
  drawText({ text: label, x, y: labelY, size: 4.8, maxWidth }) +
  drawText({
    text: value,
    x,
    y: labelY - valueOffset,
    size: valueSize,
    maxWidth,
  });

const drawUnitLabel = ({
  label,
  x,
  labelBottomY,
  labelWidthPt,
  labelHeightPt,
}) => {
  const paddingX = mmToPt(1.6);
  const contentX = x + paddingX;
  const contentWidth = labelWidthPt - paddingX * 2;
  const contentTopY = labelBottomY + labelHeightPt - mmToPt(1.25);
  const centerX = x + labelWidthPt / 2;
  const barcodeValueY = labelBottomY + mmToPt(0.25);
  const barcodeY = barcodeValueY + 8.9 + mmToPt(0.1);

  return (
    drawField({
      label: "CODIGO MAX",
      value: label.productCode,
      x: contentX,
      labelY: contentTopY - 4.6,
      maxWidth: contentWidth,
      valueSize: 9,
      valueOffset: 9.2,
    }) +
    drawField({
      label: "MODELO",
      value: label.modelName,
      x: contentX,
      labelY: contentTopY - 22.2,
      maxWidth: contentWidth,
      valueSize: 7.4,
      valueOffset: 7.9,
    }) +
    drawBarcode({
      value: label.barcode,
      x: contentX,
      y: barcodeY,
      maxWidthPt: contentWidth,
      heightPt: mmToPt(7.7),
    }) +
    drawCenteredText({
      text: label.barcode,
      centerX,
      y: barcodeValueY,
      size: 8.9,
      maxWidth: contentWidth,
    })
  );
};

const asciiLength = (value) => value.length;

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
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pdfNumber(
        pageWidth,
      )} ${pdfNumber(
        pageHeight,
      )}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentObjectId} 0 R >>`,
    );
    objects.push(
      `<< /Length ${asciiLength(content)} >>\nstream\n${content}endstream`,
    );
  });

  objects[1] = `<< /Type /Pages /Kids [${kids.join(" ")}] /Count ${
    pages.length
  } >>`;
  const chunks = ["%PDF-1.4\n"];
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets[index + 1] = asciiLength(chunks.join(""));
    chunks.push(`${index + 1} 0 obj\n${object}\nendobj\n`);
  });
  const xrefOffset = asciiLength(chunks.join(""));
  chunks.push(`xref\n0 ${objects.length + 1}\n`);
  chunks.push("0000000000 65535 f \n");
  offsets.slice(1).forEach((offset) => {
    chunks.push(`${String(offset).padStart(10, "0")} 00000 n \n`);
  });
  chunks.push(
    `trailer\n<< /Size ${
      objects.length + 1
    } /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`,
  );
  return new TextEncoder().encode(chunks.join(""));
};

export const createMixedUnitTicketPdfBlob = (boxes) => {
  const config = defaults;
  const pageWidth = Math.ceil(
    mmToPt(
      config.leftMarginMm + config.labelWidthMm * 2 + config.horizontalGapMm,
    ),
  );
  const pageHeight = Math.ceil(
    mmToPt(config.topMarginMm + config.labelHeightMm + config.verticalGapMm),
  );
  const labelWidthPt = mmToPt(config.labelWidthMm - 0.3);
  const labelHeightPt = mmToPt(config.labelHeightMm);
  const horizontalStepPt = mmToPt(config.labelWidthMm + config.horizontalGapMm);
  const labelBottomY = pageHeight - mmToPt(config.topMarginMm) - labelHeightPt;
  const pages = [];
  let currentLabels = [];

  boxes.forEach((box) => {
    const barcode = String(box.productBarcode?.barcode || "");
    if (!/^2\d{15}$/.test(barcode))
      throw new Error(
        `Código unitario inválido para la caja ${box.trackingCode}.`,
      );
    for (let index = 0; index < Number(box.boxSize); index += 1) {
      currentLabels.push({
        productCode: box.product?.code,
        modelName: box.product?.modelName,
        barcode,
      });
      if (currentLabels.length === 2) {
        pages.push(currentLabels);
        currentLabels = [];
      }
    }
  });
  if (currentLabels.length) pages.push(currentLabels);
  if (!pages.length) throw new Error("No hay tickets para generar.");

  const pageContents = pages.map((labels) => {
    let content = `1 1 1 rg 0 0 ${pdfNumber(pageWidth)} ${pdfNumber(
      pageHeight,
    )} re f\n0 0 0 rg\n`;
    labels.forEach((label, slot) => {
      content += drawUnitLabel({
        label,
        x: mmToPt(config.leftMarginMm) + slot * horizontalStepPt,
        labelBottomY,
        labelWidthPt,
        labelHeightPt,
      });
    });
    return content;
  });

  return new Blob([buildPdf(pageContents, pageWidth, pageHeight)], {
    type: "application/pdf",
  });
};
