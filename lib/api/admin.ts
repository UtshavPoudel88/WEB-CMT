import axiosInstance from "./axios";
import { API } from "./endpoints";
import { AxiosError } from "axios";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string;
  _id?: string;
}

type AdminUserRaw = {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: string;
  image?: string;
};

export interface AdminUsersResponse {
  success: boolean;
  message: string;
  data: AdminUser[];
}

export interface AdminUserResponse {
  success: boolean;
  message: string;
  data: AdminUser;
}

const normalizeUser = (user: AdminUserRaw): AdminUser => ({
  id: user.id || user._id || "",
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  image: user.image,
});

const normalizeError = (err: unknown, fallback: string) => {
  let message = fallback;

  if (err instanceof AxiosError && err.response) {
    message = err.response.data?.message || message;
  } else if (err instanceof Error) {
    message = err.message;
  }

  return new Error(message);
};

export const adminGetUsers = async (): Promise<AdminUsersResponse> => {
  try {
    const res = await axiosInstance.get<{ success: boolean; message: string; data: AdminUserRaw[] }>(API.ADMIN.USERS);
    return {
      ...res.data,
      data: (res.data.data || []).map(normalizeUser),
    };
  } catch (err: unknown) {
    throw normalizeError(err, "Failed to load users");
  }
};

export const adminGetUser = async (id: string): Promise<AdminUserResponse> => {
  try {
    const res = await axiosInstance.get<{ success: boolean; message: string; data: AdminUserRaw }>(API.ADMIN.USER_BY_ID(id));
    return {
      ...res.data,
      data: normalizeUser(res.data.data),
    };
  } catch (err: unknown) {
    throw normalizeError(err, "Failed to load user");
  }
};

export const adminCreateUser = async (formData: FormData): Promise<AdminUserResponse> => {
  try {
    const res = await axiosInstance.post<{ success: boolean; message: string; data: AdminUserRaw }>(API.ADMIN.USERS, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return {
      ...res.data,
      data: normalizeUser(res.data.data),
    };
  } catch (err: unknown) {
    throw normalizeError(err, "Failed to create user");
  }
};

export const adminUpdateUser = async (id: string, formData: FormData): Promise<AdminUserResponse> => {
  try {
    const res = await axiosInstance.put<{ success: boolean; message: string; data: AdminUserRaw }>(API.ADMIN.USER_BY_ID(id), formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return {
      ...res.data,
      data: normalizeUser(res.data.data),
    };
  } catch (err: unknown) {
    throw normalizeError(err, "Failed to update user");
  }
};

export const adminDeleteUser = async (id: string): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await axiosInstance.delete<{ success: boolean; message: string }>(API.ADMIN.USER_BY_ID(id));
    return res.data;
  } catch (err: unknown) {
    throw normalizeError(err, "Failed to delete user");
  }
};
