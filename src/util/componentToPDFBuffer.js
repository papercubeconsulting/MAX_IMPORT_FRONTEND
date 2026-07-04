import { renderToStaticMarkup } from "react-dom/server";

const chromiumPaths = [
  process.env.CHROME_BIN,
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/usr/bin/google-chrome",
].filter(Boolean);

const pdfTimeout = 180000;

const getChromiumPath = () => {
  const fs = eval("require")("fs");

  return chromiumPaths.find((path) => fs.existsSync(path));
};

const componentToPDFBufferWithChromium = async (component) => {
  const puppeteer = eval("require")("puppeteer-core");
  const browser = await puppeteer.launch({
    executablePath: getChromiumPath(),
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: true,
    protocolTimeout: pdfTimeout,
  });

  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(pdfTimeout);
    page.setDefaultNavigationTimeout(pdfTimeout);
    const html = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            html,
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, Helvetica, sans-serif;
            }
          </style>
        </head>
        <body>${renderToStaticMarkup(component)}</body>
      </html>
    `;

    await page.setContent(html, { waitUntil: "networkidle0" });
    await page.emulateMediaType("print");

    const buffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "2mm",
        right: "10mm",
        bottom: "2mm",
        left: "10mm",
      },
      timeout: pdfTimeout,
    });

    return buffer;
  } finally {
    await browser.close();
  }
};

export const componentToPDFBuffer = (component) => {
  if (getChromiumPath()) {
    return componentToPDFBufferWithChromium(component);
  }

  return new Promise((resolve, reject) => {
    const pdf = eval("require")("html-pdf");
    const html = renderToStaticMarkup(component);
    const buffer = pdf
      .create(html, {
        format: "A4",
        orientation: "portrait",
        /* border: "5mm 10mm", */
        border: {
          top: "2mm",
          right: "10mm",
          bottom: "2mm",
          left: "10mm",
        },
        type: "pdf",
        timeout: pdfTimeout,
      })
      .toBuffer((err, buffer) => {
        if (err) {
          return reject(err);
        }

        return resolve(buffer);
      });
  });
};
