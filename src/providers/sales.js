import { baseProvider } from "./baseProvider";

const postSale = async (body) => baseProvider.httpPost("sales", body);
const getSales = async () => baseProvider.httpGet(`sales`);

export { postSale, getSales };
