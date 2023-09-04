import React from "react";
import { notification } from "antd";
import { buildUrl, getToken } from "../../providers/baseProvider";
import { getLocalHostWithPath } from "../url";

export const useSendEmailProforma = ({ proforma, proformaId }) => {
  const [api] = notification.useNotification();
  const [loading, setLoading] = React.useState(false);

  const bodyUrlPDF = React.useMemo(() => {
    const sendEmailProformaApi = `proformas/${proformaId}/pdf`;
    const url = buildUrl(sendEmailProformaApi).slice(0, -1);
    const bodyUrl = getLocalHostWithPath(`/proformas/${proformaId}/pdf`);
    return bodyUrl;
  }, [proformaId]);

  const sendEmail = async () => {
    const sendEmailProformaApi = `proformas/${proformaId}/pdf`;
    const token = await getToken();
    // remote the last ?
    const url = buildUrl(sendEmailProformaApi).slice(0, -1);
    const bodyUrl = getLocalHostWithPath(`/proformas/${proformaId}/pdf`);
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify({ url: bodyUrl }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Error HTTP:" + response.status);
    }

    return response;
  };

  const downloadPDF = async () => {
    const sendEmailProformaApi = `proformas/${proformaId}/downloadpdf`;
    const token = await getToken();
    // remote the last ?
    const url = buildUrl(sendEmailProformaApi).slice(0, -1);
    const bodyUrl = getLocalHostWithPath(`/proformas/${proformaId}/pdf`);
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify({ url: bodyUrl }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Error HTTP:" + response.status);
    }

    return response;
  };

  const handleSendEmail = async () => {
    try {
      if (!proforma?.status) {
        notification.open({
          message: "Ups. Algo salio mal",
          type: "warning",
          description:
            "No se puedo enviar el email. numero de proforma no se ha encontrado",
          onclick: () => {
            // console.log();
          },
        });
      }
      if (!proformaId) {
        notification.open({
          message: "algo salio mal",
          type: "warning",
          description:
            "No se puedo enviar el email. numero de proforma no se ha encontrado",
          onclick: () => {
            // console.log();
          },
        });
      }
      if (proforma.status === "PENDING_DISCOUNT_APPROVAL") {
        notification.open({
          message: "Pendiente de validacion de descuento",
          type: "warning",
          description: "No se puede enviar el correo",
          onClick: () => {
            // console.log();
          },
        });
      } else {
        setLoading(true);
        const url = getLocalHostWithPath(`/proformas/${proformaId}/pdf`);
        const response = await sendEmail(proformaId, url);
        const file = await response.blob();
        const pdfURL = URL.createObjectURL(file);

        let a = document.createElement("a");
        a.href = pdfURL;
        a.download = `Proforma N°${proformaId} - ${new Date().toISOString()}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(pdfURL);

        notification.open({
          message: "E-mail enviado!",
          type: "info",
          description: "Se ha realizado el envio de la proforma correctamente",
          onClick: () => {
            // console.log();
          },
        });
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      notification.open({
        message: "Error al generar el pdf",
        type: "error",
        description: "No se puede enviar el correo",
        onClick: () => {
          // console.log();
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadEmail= async()=>{
    try {
      if (!proforma?.status) {
        notification.open({
          message: "Ups. Algo salio mal",
          type: "warning",
          description:
            "No se puede descargar la proforma. numero de proforma no se ha encontrado",
          onclick: () => {
            // console.log();
          },
        });
      }
      if (!proformaId) {
        notification.open({
          message: "algo salio mal",
          type: "warning",
          description:
            "No se puede descargar la proforma. numero de proforma no se ha encontrado",
          onclick: () => {
            // console.log();
          },
        });
      }
      if (proforma.status === "PENDING_DISCOUNT_APPROVAL") {
        notification.open({
          message: "Pendiente de validacion de descuento",
          type: "warning",
          description: "No se puede descargar la proforma",
          onClick: () => {
            // console.log();
          },
        });
      } else {
        setLoading(true);
        const url = getLocalHostWithPath(`/proformas/${proformaId}/pdf`);
        const response = await downloadPDF(proformaId, url);
        const file = await response.blob();
        const pdfURL = URL.createObjectURL(file);

        let a = document.createElement("a");
        a.href = pdfURL;
        a.download = `Proforma N°${proformaId} - ${new Date().toISOString()}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(pdfURL);

        notification.open({
          message: "PDF descargado!",
          type: "info",
          description: "Se ha realizado la descarga de PDF correctamente.",
          onClick: () => {
            // console.log();
          },
        });
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      notification.open({
        message: "Error al generar el pdf",
        type: "error",
        description: "No se puede enviar el correo",
        onClick: () => {
          // console.log();
        },
      });
    } finally {
      setLoading(false);
    }
  }
  return { handleSendEmail, setLoading, loading, bodyUrlPDF, handleDownloadEmail };
};
