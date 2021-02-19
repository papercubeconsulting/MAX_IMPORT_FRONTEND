import { baseProvider } from "./baseProvider";

const getClients = async (params) => baseProvider.httpGet(`clients`, params);

const getClientById = async (id) => baseProvider.httpGet(`clients/${id}`);

const getClientPerCode = async (code) =>
  baseProvider.httpGet(`clients/${code}`);

const postClient = async (body) => baseProvider.httpPost(`clients`, body);

const putClient = async (id, body) =>
  baseProvider.httpPut(`clients/${id}`, body);

export { getClients, getClientById, getClientPerCode, postClient, putClient };
