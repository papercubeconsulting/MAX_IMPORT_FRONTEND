import React from "react";
import {
  getInfoValidationProforma,
  validateDiscountProforma,
} from "../../providers/discountValidationProforma";
import Big from "big.js";
import { notification } from "antd";

export const useValidationProforma = (transactionId) => {
  const [validationInfoStatus, setValidationInfoStatus] = React.useState(null);
  const [api, contextHolder] = notification.useNotification();
  const [fetchStatus, setFetchStatus] = React.useState({
    isLoading: false,
    error: null,
    sucess: null,
  });
  const [submitValidationStatus, setSubmitValidationStatus] = React.useState({
    isLoading: false,
    error: null,
    sucess: null,
  });

  const [discountPercentageInput, setDiscountPercentageInput] = React.useState(
    new Big(0)
  );

  const initDiscountRef = React.useRef(null);

  // const discountPercentage = new Big(validationInfoStatus.proforma.discount);
  // const discount = new Big(validationInfoStatus.proforma.discount);

  const handleChangeDiscountInput = (event) => {
    const inputValue = event;

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
      setDiscountPercentageInput(discountPercentage);
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

  const handleSubmitApproval = async (payloadToSubmit) => {
    let _error;
    try {
      setSubmitValidationStatus((prev) => {
        return { ...prev, isLoading: true };
      });
      await validateDiscountProforma(transactionId, payloadToSubmit);
      await getValidationInfo(transactionId);
      setSubmitValidationStatus((prev) => {
        return { ...prev, sucess: "Proforma Actualizado correctamente" };
      });
    } catch (error) {
      console.error("error", error);
      _error = error;
      setSubmitValidationStatus((prev) => ({
        ...prev,
        error: error,
      }));
    } finally {
      setSubmitValidationStatus((prev) => ({
        ...prev,
        error: _error,
        isLoading: false,
      }));
    }
  };

  const cleanError = () => {
    setSubmitValidationStatus((prev) => ({
      ...prev,
      error: null,
      sucess: null,
    }));
  };

  return {
    isLoading: fetchStatus.isLoading,
    error: fetchStatus.error,
    isLoadingSubmitValidation: submitValidationStatus.isLoading,
    errorSubmitValidation: submitValidationStatus.error,
    successSubmitValidation: submitValidationStatus.sucess,
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
