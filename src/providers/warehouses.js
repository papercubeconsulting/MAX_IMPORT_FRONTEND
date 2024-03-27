import { baseProvider } from "./baseProvider";

const getWarehouses = async (type) => {
  const params = {};
  if (type) params.type = type;

  return baseProvider.httpGet("warehouses", params);
};

const getWarehouseById = async (warehouseId) =>
  baseProvider.httpGet(`warehouses/${warehouseId}`);

export { getWarehouses, getWarehouseById };
