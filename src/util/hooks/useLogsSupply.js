import React from "react";
import { getLogsBySupplyId } from "../../providers";

export const useLogsSupply = (supplyId) => {
  const [logs, setLogs] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isError, setIsError] = React.useState(false);

  React.useEffect(() => {
    const getLogs = async () => {
      try {
        setIsLoading(true);
        const logs = await getLogsBySupplyId(supplyId);
        setIsLoading(false);
        setLogs(logs);
      } catch (error) {
        setIsLoading(false);
        console.error("error getting logs");
        setIsError(true);
        throw error;
      }
    };

    supplyId && getLogs();
  }, [supplyId]);

  return { logs, setLogs, isLoading, isError };
};
