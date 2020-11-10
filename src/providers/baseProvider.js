import * as config from "../config";
import { get } from "lodash";

const buildUrl = (url, params = {}) => {
  const queries = Object.keys(params)
    .map(
      (key) => encodeURIComponent(key) + "=" + encodeURIComponent(params[key])
    )
    .join("&");

  if (!queries.length) return `${config.serverUrl}${url}`;

  return `${config.serverUrl}${url}?${queries}`;
};

const getToken = async () => {
  try {
    const localAuthUser = localStorage.getItem("authUser") || null;

    const authUser = JSON.parse(localAuthUser);

    return get(authUser, "token", null);
  } catch (error) {
    console.log(`Error (token): ${error.message}`);
  }
};

const validate = (responseJson) => {
  if (responseJson.status >= 400) throw responseJson;
  return responseJson.data || responseJson;
};

export const baseProvider = {
  httpGet: async (url, params = {}) => {
    const token = await getToken();

    const response = await fetch(buildUrl(url, params), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        accept: " */*",
        Authorization: `Bearer ${token}`,
      },
    });

    const responseJson = await response.json();

    return validate(responseJson);
  },
  httpPost: async (url, body = {}) => {
    const token = await getToken();

    const response = await fetch(buildUrl(url), {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        accept: " */*",
        Authorization: `Bearer ${token}`,
      },
    });

    const responseJson = await response.json();

    return validate(responseJson);
  },
  httpPut: async (url, body = {}) => {
    const token = await getToken();

    const response = await fetch(buildUrl(url), {
      method: "PUT",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        accept: " */*",
        Authorization: `Bearer ${token}`,
      },
    });

    const responseJson = await response.json();

    return validate(responseJson);
  },
  httpGetPrueba: async (url, params = {}) => {
    const token = await getToken();
    const response = await fetch(buildUrl(url, params), {
      method: "GET",
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        accept: " */*",
        Authorization: `Bearer ${token}`,
      },
      responseType: "blob",
    });
    /* const responseText = await response.text();
    console.log("response", responseText);
    return validate(responseText); */
    console.log('response', response)
        return validate(response);
  },
};
