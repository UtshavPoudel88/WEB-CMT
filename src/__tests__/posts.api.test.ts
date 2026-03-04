import { AxiosError } from "axios";


jest.mock("@/lib/api/axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

import axiosInstance from "@/lib/api/axios";
import { API } from "@/lib/api/endpoints";
import {
  createPost,
  deletePost,
  getAllPosts,
  getPostsByCommunity,
  getPostsByUser,
  reactToPost,
  updatePost,
} from "@/lib/api/posts";

describe("posts API", () => {
  const mockedAxios = axiosInstance as unknown as {
    get: jest.Mock;
    post: jest.Mock;
    put: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("getPostsByCommunity returns array data", async () => {
    mockedAxios.get.mockResolvedValue({ data: { success: true, data: [{ _id: "p1", text: "hello" }] } });

    const result = await getPostsByCommunity("c1");

    expect(mockedAxios.get).toHaveBeenCalledWith(API.POSTS.BY_COMMUNITY("c1"));
    expect(result).toHaveLength(1);
  });

  it("getPostsByCommunity returns [] for non-array payload", async () => {
    mockedAxios.get.mockResolvedValue({ data: { success: true, data: { _id: "p1" } } });

    await expect(getPostsByCommunity("c1")).resolves.toEqual([]);
  });

  it("getPostsByCommunity preserves status=403 on error", async () => {
    const err = new AxiosError("forbidden");
    (err as any).response = { status: 403, data: { message: "Access denied" } };
    mockedAxios.get.mockRejectedValue(err);

    try {
      await getPostsByCommunity("c1");
      throw new Error("should not reach");
    } catch (caught) {
      const e = caught as Error & { status?: number };
      expect(e.message).toBe("Access denied");
      expect(e.status).toBe(403);
    }
  });

  it("getPostsByCommunity throws default message for unknown error", async () => {
    mockedAxios.get.mockRejectedValue(new Error("x"));

    await expect(getPostsByCommunity("c1")).rejects.toThrow("Failed to fetch posts");
  });

  it("getAllPosts returns data array", async () => {
    mockedAxios.get.mockResolvedValue({ data: { success: true, data: [{ _id: "p2" }] } });

    const result = await getAllPosts();

    expect(mockedAxios.get).toHaveBeenCalledWith(API.POSTS.ALL);
    expect(result[0]._id).toBe("p2");
  });

  it("getPostsByUser throws backend message", async () => {
    const err = new AxiosError("bad");
    (err as any).response = { data: { message: "User posts unavailable" } };
    mockedAxios.get.mockRejectedValue(err);

    await expect(getPostsByUser("u1")).rejects.toThrow("User posts unavailable");
  });

  it("createPost sends multipart payload", async () => {
    const formData = new FormData();
    formData.append("text", "post");
    mockedAxios.post.mockResolvedValue({ data: { success: true, data: { _id: "p3", text: "post" } } });

    const result = await createPost(formData);

    expect(mockedAxios.post).toHaveBeenCalledWith(API.POSTS.CREATE, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    expect(result._id).toBe("p3");
  });

  it("updatePost sends text payload", async () => {
    mockedAxios.put.mockResolvedValue({ data: { success: true, data: { _id: "p4", text: "updated" } } });

    const result = await updatePost("p4", "updated");

    expect(mockedAxios.put).toHaveBeenCalledWith(API.POSTS.UPDATE("p4"), { text: "updated" });
    expect(result.text).toBe("updated");
  });

  it("deletePost calls delete endpoint", async () => {
    mockedAxios.delete.mockResolvedValue({});

    await deletePost("p5");

    expect(mockedAxios.delete).toHaveBeenCalledWith(API.POSTS.DELETE("p5"));
  });

  it("reactToPost posts reaction type", async () => {
    mockedAxios.post.mockResolvedValue({ data: { success: true, data: { _id: "p6", likeCount: 1 } } });

    const result = await reactToPost("p6", "like");

    expect(mockedAxios.post).toHaveBeenCalledWith(API.POSTS.REACTION("p6"), { type: "like" });
    expect(result._id).toBe("p6");
  });
});
