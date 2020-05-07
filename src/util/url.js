export const urlQueryParams = params => {
    if (!params || !Object.keys(params).length) return "";
    return "?" + Object.keys(params)
        .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(params[key]))
        .join("&");
};
