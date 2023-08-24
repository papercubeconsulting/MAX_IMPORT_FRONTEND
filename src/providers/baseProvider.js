import * as config from "../config";
import { get } from "lodash";

export const buildUrl = (url, params = {}) => {
  const queries = Object.keys(params)
    .map(
      (key) => encodeURIComponent(key) + "=" + encodeURIComponent(params[key])
    )
    .join("&");

  if (!queries.length) return `${config.serverUrl}${url}?`;

  return `${config.serverUrl}${url}?${queries}`;
};

export const getToken = async () => {
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
  httpGetSiigo: async (url, params = {}) => {
    const token = await getToken();

    /* console.log(params); */
    const prueba1 = params.map((elem) => `id=${elem}`);

    /* console.log(prueba1); */

    const prueba2 = prueba1.join("&");

    /* console.log(prueba2); */

    let urlnuevo = `${config.serverUrl}${url}?${prueba2}`;
    const response = await fetch(urlnuevo, {
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
    return validate(response);
  },
  httpGetFile: async (url, params = {}) => {
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
    return validate(response);
  },
  httpDelete: async (url) => {
    const token = await getToken();

    const response = await fetch(buildUrl(url), {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        accept: " */*",
        Authorization: `Bearer ${token}`,
      },
    });

    const responseJson = await response.json();

    return validate(responseJson);
  },

  httpPostFile: async (url, body = {}) => {
    const token = await getToken();

    const response = await fetch(buildUrl(url), {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        accept: " */*",
        Authorization: `Bearer ${token}`,
      },
      responseType: "blob",
    });

    const responseJson = await response.json();

    return validate(responseJson);
  },
};
