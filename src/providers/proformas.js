import { baseProvider } from "./baseProvider";

const getProformas = async (params) =>
  baseProvider.httpGet(`proformas`, params);
const getProforma = async (proformaId, params) =>
  baseProvider.httpGet(`proformas/${proformaId}`, params);
//const postProduct = async body => baseProvider.httpPost("products", body);

export {
  getProformas,
  getProforma,
  /* postProduct*/
};
