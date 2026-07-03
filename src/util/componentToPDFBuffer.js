import { renderToStaticMarkup } from "react-dom/server";

const chromiumPaths = [
  process.env.CHROME_BIN,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/usr/bin/google-chrome",
].filter(Boolean);

const getChromiumPath = () => {
  const fs = eval("require")("fs");

  return chromiumPaths.find((path) => fs.existsSync(path));
};

const hasPuppeteerCore = () => {
  try {
    eval("require").resolve("puppeteer-core");
    return true;
  } catch (error) {
    return false;
  }
};

const componentToPDFBufferWithChromium = async (component) => {
  const puppeteer = eval("require")("puppeteer-core");
  const browser = await puppeteer.launch({
    executablePath: getChromiumPath(),
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--disable-extensions",
    ],
    headless: true,
  });

  try {
    const page = await browser.newPage();
    const html = renderToStaticMarkup(component);

    await page.setContent(html, { waitUntil: "networkidle0" });

    return await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "2mm",
        right: "10mm",
        bottom: "2mm",
        left: "10mm",
      },
      timeout: 30000,
    });
  } finally {
    await browser.close();
  }
};

export const componentToPDFBuffer = (component) => {
  if (getChromiumPath() && hasPuppeteerCore()) {
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
        timeout: 30000,
      })
      .toBuffer((err, buffer) => {
        if (err) {
          return reject(err);
        }

        return resolve(buffer);
      });
  });
};
