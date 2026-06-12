import api from "./axios";
import { type User } from "../types";

export interface LoginResult {
  accessToken: string;
  user: User;
  requires2FA?: boolean;
}

export interface MessageResult {
  message: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  two_fa_token?: string;
}

export const authApi = {
  register: async (payload: RegisterPayload) => {
    const { data } = await api.post<{ data: User & MessageResult }>("/auth/register", payload);
    return data.data;
  },

  login: async (payload: LoginPayload): Promise<LoginResult> => {
    const { data } = await api.post<{ data: LoginResult }>("/auth/login", payload);
    console.log("====================================");
    console.log(data);
    console.log("====================================");
    return data.data;
  },

  logout: async () => {
    await api.post("/auth/logout");
  },

  verifyEmail: async (token: string) => {
    const { data } = await api.post<{ data: MessageResult }>("/auth/verify-email", { token });
    return data.data;
  },

  resendVerification: async (email: string) => {
    const { data } = await api.post<{ data: MessageResult }>("/auth/resend-verification", { email });
    return data.data;
  },

  forgotPassword: async (email: string) => {
    const { data } = await api.post<{ data: MessageResult }>("/auth/forgot-password", { email });
    return data.data;
  },

  resetPassword: async (token: string, password: string) => {
    const { data } = await api.post<{ data: MessageResult }>("/auth/reset-password", { token, password });
    return data.data;
  },

  setup2FA: async () => {
    const { data } = await api.post<{ data: { secret: string; qrCode: string } }>("/auth/2fa/setup");
    return data.data;
  },

  enable2FA: async (token: string) => {
    const { data } = await api.post<{ data: MessageResult }>("/auth/2fa/enable", { token });
    return data.data;
  },

  disable2FA: async (password: string) => {
    const { data } = await api.post<{ data: MessageResult }>("/auth/2fa/disable", { password });
    return data.data;
  }
};
