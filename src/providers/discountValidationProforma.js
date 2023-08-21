import { baseProvider } from "./baseProvider";

const getInfoValidationProforma = async (validationTransactionId) =>
  baseProvider.httpGet(
    `proformas/validate_discount/${validationTransactionId}`
  );
const validateDiscountProforma = async (
  validationTransactionId,
  payloadToSubmit
) =>
  baseProvider.httpPost(
    `proformas/validate_discount/${validationTransactionId}`,
    payloadToSubmit
  );

export { getInfoValidationProforma, validateDiscountProforma };
