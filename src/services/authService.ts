import axiosInstance from "./axiosInstance";
import type { AuthForm } from "../types/Auth"; 
import { ENDPOINTS } from "./endpoints";
import axios from "axios";
import type { Login } from "../types/Login";

export const Register = (data: AuthForm) => axios.post(ENDPOINTS.AUTH.REGISTER, data);
export const login = (data: AuthForm) =>
  axios.post<Login>(ENDPOINTS.AUTH.LOGIN, data, {
    withCredentials: true,
  });
export const logout = async () => {
  try {
    const response = await axiosInstance.post(ENDPOINTS.AUTH.LOGOUT);
    return {
      success: true,
      data: response.data,
      status: response.status,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data || "Logout failed",
      status: error.response?.status || 500,
    };
  }
};
