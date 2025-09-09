
export const ENDPOINTS = {
  AUTH: {
    REGISTER: `${import.meta.env.VITE_API_URL}/auth/register`,
    LOGIN: `${import.meta.env.VITE_API_URL}/auth/login`,
    LOGOUT: `/auth/logout`,
    REFRESH: `/auth/refresh-token`,
    ME: `/auth/me`,
    GOOGLE:`${import.meta.env.VITE_API_URL}/auth/google`
  },
  CHAT: {
    CREATE_ROOM: `/chat/create-room`,
    GET_ROOMS: `/chat/rooms`,
  },

};
