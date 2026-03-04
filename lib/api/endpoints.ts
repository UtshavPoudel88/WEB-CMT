// Backend API endpoints and base URL for building asset URLs (e.g. images)

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

/**
 * Build URL for an image path so it loads reliably.
 * Uses same-origin path (/public/...) so Next.js rewrites proxy to the backend - avoids CORS and wrong host/port.
 */
export function getImageUrl(path?: string | null): string | null {
  if (!path || typeof path !== "string" || !path.trim()) return null;
  const trimmed = path.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  // Same-origin path: Next.js rewrites /public/* to backend, so images load without CORS/base URL issues
  let p = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  if (!p.toLowerCase().startsWith("/public/")) {
    p = "/public/" + p.replace(/^\//, "");
  }
  return p;
}

export const API = {
  AUTH: {
    REGISTER: "/community/customers/signup",
    LOGIN: "/community/customers/login",
    GET_USER: (id: string) => `/community/customers/${id}`,
    UPDATE_USER: (id: string) => `/community/customers/${id}`,
    UPLOAD_PROFILE_PICTURE: (id: string) => `/community/customers/${id}/profile-picture`,
  },
  COMMUNITIES: {
    LIST_ALL: "/community/communities",
    CREATE: "/community/communities",
    MY_COMMUNITIES: "/community/communities/my",
    JOIN: (id: string) => `/community/communities/${id}/join`,
    LEAVE: (id: string) => `/community/communities/${id}/join`,
  },
  POSTS: {
    CREATE: "/community/posts",
    ALL: "/community/posts",
    BY_COMMUNITY: (id: string) => `/community/posts/community/${id}`,
    BY_USER: (id: string) => `/community/posts/user/${id}`,
    UPDATE: (id: string) => `/community/posts/${id}`,
    DELETE: (id: string) => `/community/posts/${id}`,
    REACTION: (id: string) => `/community/posts/${id}/reaction`,
  },
};
