
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  userId: string;
  name: string;
  
}

export const getCurrentUser = (): { id: string; name: string } | null => {
  const token = localStorage.getItem("accessToken");
  if (!token) return null;

  try {
    const decoded = jwtDecode<JwtPayload>(token);
   
    return {
      id: decoded.userId,
      name: decoded.name,
    };
  } catch (err) {
    console.error("Failed to decode token", err);
    return null;
  }
};
