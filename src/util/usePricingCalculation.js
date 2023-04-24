import React from "react";

export const usePricingCalculation = ({
  _price = "",
  _cost = "",
  _margin = "",
}) => {
  const [cost, setCost] = React.useState(_cost);
  const [price, setSuggestedPrice] = React.useState(_price);
  const [margin, setMargin] = React.useState(_margin);

  function handleDecimalsOnValue(value) {
    const regex = /([0-9]*[\.|\,]{0,1}[0-9]{0,2})/s;
    return value.match(regex)[0];
  }

  const costInputProps = {
    type: "number",
    onChange: (event) => {
      const value = handleDecimalsOnValue(event.target.value);

      if (margin === 100) {
        setCost(value);
        setSuggestedPrice(value);
        return;
      }

      const price = value * (1 + margin / 100);
      if (!isNaN(price)) {
        setSuggestedPrice(price.toFixed(2));
        setCost(value);
      }
    },
  };

  const priceInputProps = {
    type: "number",
    onChange: (event) => {
      const value = handleDecimalsOnValue(event.target.value);
      if (cost === 0) {
        setSuggestedPrice(value);
        return;
      }

      const price = value;
      const margin = ((price / cost) * 100).toFixed(2);
      if (!isNaN(margin)) {
        setMargin((margin - 100).toFixed(2));
        setSuggestedPrice(value);
      }
    },
  };

  const marginInputProps = {
    type: "number",
    onBlur: (e) => {
      const realMargin = (price / cost - 1) * 100;
      setMargin(Number(realMargin).toFixed(2));
    },
    onChange: (event) => {
      const margin = handleDecimalsOnValue(event.target.value);
      const price = (cost * (margin / 100 + 1)).toFixed(2);
      if (!isNaN(price)) {
        setMargin(margin);
        // setMargin(realMargin);
        setSuggestedPrice(price);
      }
    },
  };

  return {
    costInputProps,
    priceInputProps,
    marginInputProps,
    setCost,
    setSuggestedPrice,
    setMargin,
    price,
    cost,
    margin,
  };
};
