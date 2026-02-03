//backend routes
export const API = {
    AUTH: {
        REGISTER: "/api/auth/register",
        LOGIN: "/api/auth/login",
        CREATE_USER: "/api/auth/user",
        UPDATE_USER: (id: string) => `/api/auth/${id}`
    },
    ADMIN: {
        USERS: "/api/admin/users",
        USER_BY_ID: (id: string) => `/api/admin/users/${id}`
    }
}