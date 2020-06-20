import {baseProvider} from "./baseProvider";

export const userProvider = {
    getUser: async () => baseProvider.httpGet("users/me"),
};
