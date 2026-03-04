import axiosInstance from "./axios";

import { API } from "./endpoints";
import { AxiosError } from "axios";

export interface Community {
  _id: string;
  title: string;
  image: string;
  description: string;
  createdAt: string;
}

export interface CommunityResponse {
  success: boolean;
  data: Community | Community[];
  message?: string;
}

export const getAllCommunities = async (): Promise<Community[]> => {
  try {
    const res = await axiosInstance.get<CommunityResponse>(API.COMMUNITIES.LIST_ALL);
    return Array.isArray(res.data.data) ? res.data.data : [];
  } catch (err) {
    if (err instanceof AxiosError && err.response) {
      throw new Error(err.response.data?.message || "Failed to fetch communities");
    }
    throw new Error("Failed to fetch communities");
  }
};

export const getMyCommunities = async (): Promise<Community[]> => {
  try {
    const res = await axiosInstance.get<CommunityResponse>(API.COMMUNITIES.MY_COMMUNITIES);
    return Array.isArray(res.data.data) ? res.data.data : [];
  } catch (err) {
    if (err instanceof AxiosError && err.response) {
      throw new Error(err.response.data?.message || "Failed to fetch my communities");
    }
    throw new Error("Failed to fetch my communities");
  }
};

export const createCommunity = async (data: {
  title: string;
  image?: string; // URL (optional if file is provided)
  imageFile?: File; // File (optional if URL is provided)
  description?: string;
}): Promise<Community> => {
  try {
    // If imageFile is provided, use FormData; otherwise use JSON
    if (data.imageFile) {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("image", data.imageFile);
      if (data.description) {
        formData.append("description", data.description);
      }
      const res = await axiosInstance.post<CommunityResponse>(API.COMMUNITIES.CREATE, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.data as Community;
    } else {
      // Use JSON for URL-based images
      const res = await axiosInstance.post<CommunityResponse>(API.COMMUNITIES.CREATE, {
        title: data.title,
        image: data.image,
        description: data.description,
      });
      return res.data.data as Community;
    }
  } catch (err) {
    if (err instanceof AxiosError && err.response) {
      throw new Error(err.response.data?.message || "Failed to create community");
    }
    throw new Error("Failed to create community");
  }
};

export const joinCommunity = async (communityId: string): Promise<void> => {
  try {
    await axiosInstance.post(API.COMMUNITIES.JOIN(communityId));
  } catch (err) {
    if (err instanceof AxiosError && err.response) {
      throw new Error(err.response.data?.message || "Failed to join community");
    }
    throw new Error("Failed to join community");
  }
};

export const leaveCommunity = async (communityId: string): Promise<void> => {
  try {
    await axiosInstance.delete(API.COMMUNITIES.LEAVE(communityId));
  } catch (err) {
    if (err instanceof AxiosError && err.response) {
      throw new Error(err.response.data?.message || "Failed to leave community");
    }
    throw new Error("Failed to leave community");
  }
};

