import { baseProvider } from "./baseProvider";

const getInfoValidationProforma = async (validationTransactionId) =>
  baseProvider.httpGet(
    `proformas/validate_discount/${validationTransactionId}`
  );
const validateDiscountProforma = async (validationTransactionId) =>
  baseProvider.httpPost(
    `proformas/validate_discount/${validationTransactionId}`
  );

export { getInfoValidationProforma, validateDiscountProforma };
