import { AxiosError } from "axios";


import axiosInstance from "./axios";
import { API } from "./endpoints";

// ---------- Types ----------
export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

// Backend response types
export interface RegisterResponse {
  success: boolean;
  data: {
    _id: string;
    name: string;
    email: string;
    createdAt?: string;
  };
}

export interface LoginResponse {
  success: boolean;
  token: string;
  data?: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
    createdAt?: string;
  };
}

export interface CreateUserResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    name: string;
    email: string;
    role?: string;
    image?: string;
  };
}

// ---------- API Calls ----------
export const registerUser = async (data: RegisterFormData): Promise<RegisterResponse> => {
  try {
    const res = await axiosInstance.post<RegisterResponse>(API.AUTH.REGISTER, data);
    return res.data;
  } catch (err: unknown) {
    let message = "Registration failed";

    if (err instanceof AxiosError && err.response) {
      message = err.response.data?.message || message;
    } else if (err instanceof Error) {
      message = err.message;
    }

    throw new Error(message);
  }
};

export const loginUser = async (data: LoginFormData): Promise<LoginResponse & { data: { _id: string; name: string; email: string; profilePicture?: string; createdAt?: string } }> => {
  try {
    const res = await axiosInstance.post<LoginResponse>(API.AUTH.LOGIN, data);
    
    // Backend doesn't return user data in login response, so we need to fetch it
    // We'll decode the token to get user ID, or fetch current user
    // For now, we'll return a minimal response and let the context handle fetching
    if (res.data.token) {
      // Try to get user info from token or fetch it
      // Since backend doesn't return user data, we'll need to fetch it separately
      // For now, return token and let the calling code handle user fetch
      return {
        ...res.data,
        data: {
          _id: "", // Will be fetched separately
          name: "",
          email: data.email,
        },
      };
    }
    
    // If token is not present, return the response as is with an empty data object
    return {
      ...res.data,
      data: {
        _id: "",
        name: "",
        email: data.email,
      },
    };
  } catch (err: unknown) {
    let message = "Login failed";

    if (err instanceof AxiosError && err.response) {
      message = err.response.data?.message || message;
    } else if (err instanceof Error) {
      message = err.message;
    }

    throw new Error(message);
  }
};

export const createUser = async (formData: FormData): Promise<CreateUserResponse> => {
  try {
    const res = await axiosInstance.post<CreateUserResponse>(API.AUTH.REGISTER, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (err: unknown) {
    let message = "Create user failed";

    if (err instanceof AxiosError && err.response) {
      message = err.response.data?.message || message;
    } else if (err instanceof Error) {
      message = err.message;
    }

    throw new Error(message);
  }
};

export const updateUser = async (id: string, formData: FormData): Promise<CreateUserResponse> => {
  try {
    const res = await axiosInstance.put<CreateUserResponse>(API.AUTH.UPDATE_USER(id), formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (err: unknown) {
    let message = "Update user failed";

    if (err instanceof AxiosError && err.response) {
      message = err.response.data?.message || message;
    } else if (err instanceof Error) {
      message = err.message;
    }

    throw new Error(message);
  }
};