
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  userId: string;
  name: string;
  profilePic?: string;
}

export const updateLocalStorageUser = (user: any) => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const getCurrentUser = (): { id: string; name: string; profilePic?: string } | null => {
  // 1. Check local cache first for latest profile info
  const cachedUser = localStorage.getItem("user");
  if (cachedUser) {
    try {
      return JSON.parse(cachedUser);
    } catch (e) {
      localStorage.removeItem("user");
    }
  }

  // 2. Fallback to token
  const token = localStorage.getItem("accessToken");
  if (!token) return null;

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return {
      id: decoded.userId,
      name: decoded.name,
      profilePic: decoded.profilePic,
    };
  } catch (err) {
    console.error("Failed to decode token", err);
    return null;
  }
};
