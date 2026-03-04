import axiosInstance from "./axios";

import { API } from "./endpoints";
import { AxiosError } from "axios";

export interface Post {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
  } | string;
  communityId: {
    _id: string;
    title: string;
    image: string;
  } | string;
  text: string;
  mediaUrl?: string;
  mediaType?: "image" | "video" | "";
  likes: string[];
  dislikes: string[];
  likeCount: number;
  dislikeCount: number;
  createdAt: string;
  displayName?: string;
}

export interface PostResponse {
  success: boolean;
  data: Post | Post[];
  message?: string;
}

export const getPostsByCommunity = async (communityId: string): Promise<Post[]> => {
  try {
    const res = await axiosInstance.get<PostResponse>(API.POSTS.BY_COMMUNITY(communityId));
    return Array.isArray(res.data.data) ? res.data.data : [];
  } catch (err) {
    if (err instanceof AxiosError && err.response) {
      const message = err.response.data?.message || "Failed to fetch posts";
      // Preserve 403 status for access denied errors
      if (err.response.status === 403) {
        const error = new Error(message);
        (error as any).status = 403;
        throw error;
      }
      throw new Error(message);
    }
    throw new Error("Failed to fetch posts");
  }
};

export const getAllPosts = async (): Promise<Post[]> => {
  try {
    const res = await axiosInstance.get<PostResponse>(API.POSTS.ALL);
    return Array.isArray(res.data.data) ? res.data.data : [];
  } catch (err) {
    if (err instanceof AxiosError && err.response) {
      throw new Error(err.response.data?.message || "Failed to fetch posts");
    }
    throw new Error("Failed to fetch posts");
  }
};

export const getPostsByUser = async (userId: string): Promise<Post[]> => {
  try {
    const res = await axiosInstance.get<PostResponse>(API.POSTS.BY_USER(userId));
    return Array.isArray(res.data.data) ? res.data.data : [];
  } catch (err) {
    if (err instanceof AxiosError && err.response) {
      throw new Error(err.response.data?.message || "Failed to fetch user posts");
    }
    throw new Error("Failed to fetch user posts");
  }
};

export const createPost = async (formData: FormData): Promise<Post> => {
  try {
    const res = await axiosInstance.post<PostResponse>(API.POSTS.CREATE, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data.data as Post;
  } catch (err) {
    if (err instanceof AxiosError && err.response) {
      throw new Error(err.response.data?.message || "Failed to create post");
    }
    throw new Error("Failed to create post");
  }
};

export const updatePost = async (postId: string, text: string): Promise<Post> => {
  try {
    const res = await axiosInstance.put<PostResponse>(API.POSTS.UPDATE(postId), { text });
    return res.data.data as Post;
  } catch (err) {
    if (err instanceof AxiosError && err.response) {
      throw new Error(err.response.data?.message || "Failed to update post");
    }
    throw new Error("Failed to update post");
  }
};

export const deletePost = async (postId: string): Promise<void> => {
  try {
    await axiosInstance.delete(API.POSTS.DELETE(postId));
  } catch (err) {
    if (err instanceof AxiosError && err.response) {
      throw new Error(err.response.data?.message || "Failed to delete post");
    }
    throw new Error("Failed to delete post");
  }
};

export const reactToPost = async (postId: string, type: "like" | "dislike"): Promise<Post> => {
  try {
    const res = await axiosInstance.post<PostResponse>(API.POSTS.REACTION(postId), { type });
    return res.data.data as Post;
  } catch (err) {
    if (err instanceof AxiosError && err.response) {
      throw new Error(err.response.data?.message || "Failed to react to post");
    }
    throw new Error("Failed to react to post");
  }
};

