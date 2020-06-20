import * as config from "../config";


const buildUrl = (url, params = {}) => {
    const queries = Object
        .keys(params)
        .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(params[key]))
        .join("&");

    if (!queries.length) return `${config.serverUrl}${url}`;

    return `${config.serverUrl}${url}?${queries}`
};

const getToken = async () => {
    try {
        // const token = localStorage.getItem('token');
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJudWV2b0Bjb3JyZW8uY29tIiwicm9sZSI6InN1cGVydXNlciIsImlhdCI6MTU5MjYzNDg5OH0.rWYOucFqOZLTOK-CDRs8H-P6K8N76fVZ5BLqc_YY0yM';
        // const token = null;

        return token || null;
    } catch (error) {
        console.log(`Error (token): ${error.message}`);
    }
};

const validate = responseJson => {
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
                "accept": " */*",
                "Authorization": `Bearer ${token}`
            }
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
                "accept": " */*",
                "Authorization": `Bearer ${token}`
            }
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
                "accept": " */*",
                "Authorization": `Bearer ${token}`
            }
        });

        const responseJson = await response.json();

        return validate(responseJson);
    }
};
