// src/components/auth/GoogleAuthButton.tsx
import { GoogleLogin, type GoogleCredentialResponse } from "@react-oauth/google";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { ENDPOINTS } from "../../services/endpoints";

const GoogleAuthButton = () => {
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse: GoogleCredentialResponse) => {
    try {
      const credential = credentialResponse.credential;
      console.log(credential,'credential')
      if (!credential) {
        toast.error("Google login failed: No credential received");
        return;
      }

      // Send credential (JWT from Google) to your backend
      const res = await axios.post(
        ENDPOINTS.AUTH.GOOGLE,
        {  credential },
        { withCredentials: true }
      );

      const { accessToken, name } = res.data;

      localStorage.setItem("accessToken", accessToken);

      toast.success(`Welcome, ${name}! 🎉`);
      navigate("/room", { replace: true });
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Google login failed");
    }
  };

  const handleError = () => {
    toast.error("Google Login was unsuccessful. Try again later.");
  };

  return (
    <div className="flex justify-center mt-4">
      <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
    </div>
  );
};

export default GoogleAuthButton;
