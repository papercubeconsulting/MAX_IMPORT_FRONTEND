import React from "react";
import { getTradenamesAll } from "../../providers";

export const useTradeNames = () => {
  const [tradeNames, setTradeNames] = React.useState([]);
  const [tradeNameProducts, setTradeNameProducts] = React.useState([]);

  const fetchAllTradeNames = async () => {
    const response = await getTradenamesAll();
    const products = response.listTradename || [];
    const uniqueTradeNames = [
      ...new Set(products.map((product) => product.tradename).filter(Boolean)),
    ];

    setTradeNameProducts(products);
    setTradeNames(uniqueTradeNames);
  };

  React.useEffect(() => {
    fetchAllTradeNames();
  }, []);

  return {
    fetchAllTradeNames,
    tradeNames,
    tradeNameProducts,
    setTradeNames,
  };
};
