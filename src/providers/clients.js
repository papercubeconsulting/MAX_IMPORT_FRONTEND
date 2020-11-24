import { baseProvider } from "./baseProvider";

const getClients = async (params) => baseProvider.httpGet(`clients`, params);
const getClientById = async (id) => baseProvider.httpGet(`clients/${id}`);
const getClientPerCode = async (code) =>
  baseProvider.httpGet(`clients/${code}`);

export { getClients, getClientById, getClientPerCode };
