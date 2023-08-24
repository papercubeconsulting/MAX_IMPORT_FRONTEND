export const urlQueryParams = (params) => {
  if (!params || !Object.keys(params).length) return "";
  return (
    "?" +
    Object.keys(params)
      .map(
        (key) => encodeURIComponent(key) + "=" + encodeURIComponent(params[key])
      )
      .join("&")
  );
};

export const getLocalHost = () => {
  return (
    typeof window !== "undefined" &&
    `${window.location.host.includes("localhost") ? "http" : "https"}://${
      window.location.host
    }`
  );
};

export const getLocalHostWithPath = (path) => {
  const host = getLocalHost();

  return `${host}${path}`;
};
