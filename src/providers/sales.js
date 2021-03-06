import { baseProvider } from "./baseProvider";

const postSale = async (body) => baseProvider.httpPost("sales", body);
const getSales = async (params) => baseProvider.httpGet(`sales`, params);
const getSale = async (saleId) => baseProvider.httpGet(`sales/${saleId}`);
const putSale = async (proformaId, body) =>
  baseProvider.httpPut(`sales/${proformaId}/pay`, body);
const getSalesSigo = async (params) =>
  baseProvider.httpGetSiigo(`sales/sigo`, params);

export { postSale, getSales, putSale, getSale, getSalesSigo };
