import { renderToStaticMarkup } from "react-dom/server";
import pdf from "html-pdf";
import { ReactElement } from "react";

const componentToPDFBuffer = (component: ReactElement) => {
  return new Promise((resolve, reject) => {
    const html = renderToStaticMarkup(component);
    const buffer = pdf
      .create(html, {
        format: "A4",
        orientation: "portrait",
        border: "15mm",
        type: "pdf",
        timeout: 30000
      })
      .toBuffer((err, buffer) => {
        if (err) {
          return reject(err);
        }

        return resolve(buffer);
      });
  });
};

export default {
  componentToPDFBuffer
};
