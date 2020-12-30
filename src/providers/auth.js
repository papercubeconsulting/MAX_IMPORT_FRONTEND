import { baseProvider } from "./baseProvider";

const login = async (body) => baseProvider.httpPost("auth/login", body);
const forgotPassword = async (body) =>
  baseProvider.httpPost("users/forgotpassword", body);
const resetPassword = async (body) =>
  baseProvider.httpPost("users/resetpassword", body);
const updatePassword = async (body) =>
  baseProvider.httpPost("users/updatepassword", body);

export { login, forgotPassword, resetPassword, updatePassword };
