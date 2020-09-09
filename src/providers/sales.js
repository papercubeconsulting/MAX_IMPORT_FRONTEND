import { baseProvider } from "./baseProvider";

const postSale = async (body) => baseProvider.httpPost("sales", body);
const getSales = async (type, params) => baseProvider.httpGet(`sales?status=${type}`);
const putSale = async (proformaId, body) =>
  baseProvider.httpPut(`sales/${proformaId}/pay`, body);

export { postSale, getSales, putSale };
