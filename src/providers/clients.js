import { baseProvider } from "./baseProvider";

const getClients = async () => baseProvider.httpGet(`clients`);
const getClientPerCode = async (code) =>
  baseProvider.httpGet(`clients/${code}`);

export { getClientPerCode, getClients };
