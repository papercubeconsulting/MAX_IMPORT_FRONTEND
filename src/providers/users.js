import { baseProvider } from "./baseProvider";

const getUsers = async (providerId) => {
  const params = {};
  if (providerId) params.providerId = providerId;
  return baseProvider.httpGet("users", params);
};

export { getUsers };
