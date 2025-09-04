import axiosInstance from "./axiosInstance";
import type { AuthForm } from "../types/Auth"; 
import { ENDPOINTS } from "./endpoints";

export const register = (data: AuthForm) => axiosInstance.post(ENDPOINTS.AUTH.REGISTER, data);
export const login = (data: AuthForm) => axiosInstance.post(ENDPOINTS.AUTH.LOGIN, data);
export const logout = () => axiosInstance.post(ENDPOINTS.AUTH.LOGOUT);
