import { baseProvider } from "./baseProvider";

const getProformas = async (params) =>
  baseProvider.httpGet(`proformas`, params);
const getProforma = async (proformaId, params) =>
  baseProvider.httpGet(`proformas/${proformaId}`, params);
//const postProduct = async body => baseProvider.httpPost("products", body);
const postProforma = async (proforma) =>
  baseProvider.httpPost("proformas", proforma);
const putProforma = async (productId, proforma) =>
  baseProvider.httpPut(`proformas/${productId}`, proforma);
const sendEmail = async (proformaId, url) =>
  baseProvider.httpPost(`proforma/pdf/${proformaId}`, { url });

export {
  getProformas,
  getProforma,
  postProforma,
  putProforma,
  sendEmail,
  /* postProduct*/
};
