import { renderToStaticMarkup } from "react-dom/server";
import pdf from "html-pdf";

export const componentToPDFBuffer = (component) => {
  return new Promise((resolve, reject) => {
    const html = renderToStaticMarkup(component);
    const buffer = pdf
      .create(html, {
        format: "A4",
        orientation: "portrait",
        /* border: "5mm 10mm", */
        border: {
          top: "5mm",
          right: "10mm",
          bottom: "5mm",
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
