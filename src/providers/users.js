import { baseProvider } from "./baseProvider";

/* const getUsers = async (providerId) => {
  const params = {};
  if (providerId) params.providerId = providerId;
  return baseProvider.httpGet("users", params);
}; */

const getUsers = async (params) => baseProvider.httpGet("users", params);

const putUser = async (id, body) => baseProvider.httpPut(`users/${id}`, body);

export { getUsers, putUser };
