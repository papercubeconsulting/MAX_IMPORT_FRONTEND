import { PRODUCT_GROUP_PREFIXES } from "./productGroupPrefixes";

const escapeRegExp = (value = "") =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const normalizeProductGroupCode = (code) =>
  `${code || ""}`.trim().toUpperCase();

export const isValidProductGroupCode = (code, allowedPrefixes = []) =>
  allowedPrefixes.some((prefix) =>
    new RegExp(`^${escapeRegExp(prefix)}-\\d+$`).test(
      normalizeProductGroupCode(code)
    )
  );

export const getMatchingProductGroupPrefix = (value, allowedPrefixes = []) => {
  const normalizedValue = normalizeProductGroupCode(value);

  return allowedPrefixes.find((prefix) => normalizedValue.startsWith(prefix));
};

export { PRODUCT_GROUP_PREFIXES };
