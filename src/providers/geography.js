import { baseProvider } from "./baseProvider";

const getRegions = async () => baseProvider.httpGet("geography/regions");

const getProvinces = async (regionId) => baseProvider.httpGet(`geography/regions/${regionId}/provinces`);

const getDistricts = async (regionId, provinceId) => baseProvider.httpGet(`geography/regions/${regionId}/provinces/${provinceId}/districts`);

export { getRegions, getProvinces, getDistricts };
