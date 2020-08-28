import {baseProvider} from "./baseProvider";

const postSale = async body => baseProvider.httpPost("sales", body);

export {
    postSale
};