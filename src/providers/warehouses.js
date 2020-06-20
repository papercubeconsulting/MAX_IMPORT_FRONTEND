import {baseProvider} from "./baseProvider";

const getWarehouses = async type => {
    const params = {}
    if (type) params.type = type;

    return  baseProvider.httpGet("warehouses", params);
};

export {
    getWarehouses
};
