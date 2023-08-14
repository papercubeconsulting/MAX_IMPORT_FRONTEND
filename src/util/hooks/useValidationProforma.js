import React from "react";
import {
  getInfoValidationProforma,
  validateDiscountProforma,
} from "../../providers/discountValidationProforma";
import Big from "big.js";

export const useValidationProforma = (transactionId) => {
  const [validationInfoStatus, setValidationInfoStatus] = React.useState(null);
  const [fetchStatus, setFetchStatus] = React.useState({
    isLoading: false,
    error: null,
  });
  const [submitValidationStatus, setSubmitValidationStatus] = React.useState({
    isLoading: false,
    error: null,
  });

  const [discountPercentageInput, setDiscountPercentageInput] = React.useState(
    new Big(0)
  );

  const initDiscountRef = React.useRef(null);

  // const discountPercentage = new Big(validationInfoStatus.proforma.discount);
  // const discount = new Big(validationInfoStatus.proforma.discount);

  const handleChangeDiscountInput = (event) => {
    const inputValue = event;
    console.log({ inputValue, is: inputValue === "" });
    console.log(discountPercentageInput);

    // Check if the input value is numeric
    if (inputValue !== null) {
      // setDiscountPercentageInput(inputValue);
      const p = new Big(inputValue);
      setDiscountPercentageInput(p);
      const discount =
        (inputValue / 100) * validationInfoStatus.proforma.subtotal;
      const total = validationInfoStatus.proforma.subtotal - discount;
      setValidationInfoStatus((prev) => ({
        ...prev,
        proforma: {
          ...prev.proforma,
          discountPercentage: inputValue,
          discount,
          total,
        },
      }));
    }
  };

  const resetDiscount = () => {
    if (initDiscountRef.current) {
      setDiscountPercentageInput(initDiscountRef.current);
    }
  };

  // console.log({ discountPercentageInput });

  const getValidationInfo = async (transactionId) => {
    try {
      setFetchStatus({ ...fetchStatus, isLoading: true });
      const validationInfoResult = await getInfoValidationProforma(
        transactionId
      );
      setValidationInfoStatus(validationInfoResult);
      const discount = new Big(validationInfoResult.proforma.discount);
      const subtotal = new Big(validationInfoResult.proforma.subtotal);
      const total = new Big(validationInfoResult.proforma.total);
      const discountPercentage = discount.div(subtotal).mul(100).toFixed(2);
      initDiscountRef.current = discountPercentage;
      // console.log({ discount, subtotal, total, discountPercentage });
      setDiscountPercentageInput(discountPercentage);
      // setDiscountInput(validationInfoStatus.proforma);
    } catch (error) {
      console.error(error);
      setFetchStatus({ ...fetchStatus, error: error });
    } finally {
      setFetchStatus({ ...fetchStatus, isLoading: false });
    }
  };

  React.useEffect(() => {
    if (transactionId) {
      getValidationInfo(transactionId);
    }
  }, [transactionId]);

  const handleSubmitApproval = async () => {
    let _error;
    try {
      setSubmitValidationStatus((prev) => {
        return { ...prev, isLoading: true };
      });
      await validateDiscountProforma(transactionId);
      await getValidationInfo(transactionId);
    } catch (error) {
      console.info("error", error);
      _error = error;
      setSubmitValidationStatus((prev) => ({
        ...prev,
        error: error,
      }));
    } finally {
      console.log("finaly", _error);
      setSubmitValidationStatus((prev) => ({
        ...prev,
        error: _error,
        isLoading: false,
      }));
    }
  };

  const cleanError = () => {
    setSubmitValidationStatus((prev) => ({ ...prev, error: null }));
  };

  console.log("submit", { submitValidationStatus });

  return {
    isLoading: fetchStatus.isLoading,
    error: fetchStatus.error,
    isLoadingSubmitValidation: submitValidationStatus.isLoading,
    errorSubmitValidation: submitValidationStatus.error,
    handleSubmitApproval,
    validationInfoStatus,
    discountPercentageInput,
    handleChangeDiscountInput,
    discountPercentageInput,
    resetDiscount,
    cleanError,
  };
};

// I was thinking adding a commet in the discount transaction
