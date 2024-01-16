import React from "react";
import {
  getTradenamesAll,
  getTradenamesWithQueryParams,
} from "../../providers";
import { map } from "lodash";

export const useTradeNames = () => {
  const [tradeNames, setTradeNames] = React.useState([]);

  const fetchAllTradeNames = async () => {
    const tradeNames = await getTradenamesAll();
    setTradeNames(tradeNames.listTradename.map((obj) => obj.tradename));
  };

  React.useEffect(() => {
    fetchAllTradeNames();
  }, []);

  return {
    fetchAllTradeNames,
    tradeNames,
    setTradeNames,
  };
};
