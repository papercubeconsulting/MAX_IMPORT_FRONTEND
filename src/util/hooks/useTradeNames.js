import React from "react";
import { getTradenamesWithQueryParams } from "../../providers";
import { map } from "lodash";

export const useTradeNames = () => {
  const [tradeNames, setTradeNames] = React.useState([]);

  const fetchAllTradeNames = async () => {
    const allRowsMap = new Map();
    let hasMoreData = true;
    let maxPage = null;
    let page = null;
    while (hasMoreData) {
      // await new Promise((resolve) => setTimeout(resolve, 6000));
      if (page > maxPage) break;
      console.log("page", page);
      const queryParams = {
        ...(page === null ? {} : { page }),
      };
      console.log(queryParams);
      const tradeNamesResponse = await getTradenamesWithQueryParams(
        queryParams
      );
      console.log({ tradeNamesResponse });
      page = tradeNamesResponse.page + 1;
      maxPage = tradeNamesResponse.pages;
      const rows = tradeNamesResponse.rows;

      for (const row of rows) {
        if (allRowsMap.has(row)) {
          console.log("repetead tradename", row);
        }
        allRowsMap.set(row.tradename, true);
      }

      // console.log({ rows });
      if (rows.length === 0) {
        hasMoreData = false;
      }
    }

    setTradeNames([...allRowsMap.keys()]);
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
