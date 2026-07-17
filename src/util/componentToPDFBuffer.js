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

const defaultPdfOptions = {
  format: "A4",
  margin: {
    top: "2mm",
    right: "10mm",
    bottom: "2mm",
    left: "10mm",
  },
};

const componentToPDFBufferWithChromium = async (component, options = {}) => {
  const puppeteer = eval("require")("puppeteer-core");
  const browser = await puppeteer.launch({
    executablePath: getChromiumPath(),
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
    ],
    headless: true,
    protocolTimeout: pdfTimeout,
  });

  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(pdfTimeout);
    page.setDefaultNavigationTimeout(pdfTimeout);
    if (options.viewport) {
      await page.setViewport(options.viewport);
    }
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
            ${options.css || ""}
          </style>
        </head>
        <body>${renderToStaticMarkup(component)}</body>
      </html>
    `;

    await page.setContent(html, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.emulateMediaType("print");

    const pdfOptions = {
      printBackground: true,
      timeout: pdfTimeout,
      format: options.format || defaultPdfOptions.format,
      margin: options.margin || defaultPdfOptions.margin,
      preferCSSPageSize: options.preferCSSPageSize,
      scale: options.scale,
    };

    if (options.width && options.height) {
      delete pdfOptions.format;
      pdfOptions.width = options.width;
      pdfOptions.height = options.height;
    }

    const buffer = await page.pdf(pdfOptions);

    return buffer;
  } finally {
    await browser.close();
  }
};

export const componentToPDFBuffer = (component, options = {}) => {
  if (getChromiumPath()) {
    return componentToPDFBufferWithChromium(component, options);
  }

  return new Promise((resolve, reject) => {
    const pdf = eval("require")("html-pdf");
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
            ${options.css || ""}
          </style>
        </head>
        <body>${renderToStaticMarkup(component)}</body>
      </html>
    `;
    const pdfOptions = {
      format: options.format || defaultPdfOptions.format,
      orientation: "portrait",
      border: options.margin || defaultPdfOptions.margin,
      type: "pdf",
      timeout: pdfTimeout,
    };

    if (options.width && options.height) {
      delete pdfOptions.format;
      pdfOptions.width = options.width;
      pdfOptions.height = options.height;
    }

    const buffer = pdf
      .create(html, pdfOptions)
      .toBuffer((err, buffer) => {
        if (err) {
          return reject(err);
        }

        return resolve(buffer);
      });
  });
};
