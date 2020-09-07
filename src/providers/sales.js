import { baseProvider } from "./baseProvider";

const postSale = async (body) => baseProvider.httpPost("sales", body);
const getSales = async () => baseProvider.httpGet(`sales`);
const putSale = async (proformaId, body) =>
  baseProvider.httpPut(`sales/${proformaId}/pay`, body);

export { postSale, getSales, putSale };
