import React, { useState, useRef } from "react";
import Modal from "../ui/Modal";
import { Camera, Upload, Check, Loader2 } from "lucide-react";
import axiosInstance from "../../services/axiosInstance";
import { getCurrentUser, updateLocalStorageUser } from "../../utils/auth";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (user: any) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, onUpdate }) => {
  const user = getCurrentUser();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.profilePic || null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      let finalProfilePic = user?.profilePic;

      if (selectedFile) {
        // 1. Get S3 upload URL
        const { data: uploadData } = await axiosInstance.post("/chat/media/upload-url", {
          fileName: `profile_${user?.id}_${Date.now()}`,
          fileType: selectedFile.type,
        });

        // 2. Upload to S3
        await fetch(uploadData.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": selectedFile.type },
          body: selectedFile,
        });

        finalProfilePic = uploadData.mediaUrl;
      }

      // 3. Update User in Backend
      const { data: updateResponse } = await axiosInstance.patch("/users/profile", {
        profilePic: finalProfilePic,
      });

      // 4. Update Local State and Tokens
      if (updateResponse.accessToken) {
        localStorage.setItem("accessToken", updateResponse.accessToken);
      }

      // 4. Update Local State
      const updatedUser = { ...user, profilePic: finalProfilePic };
      updateLocalStorageUser(updatedUser);
      onUpdate(updatedUser);
      onClose();
    } catch (error) {
      console.error("Failed to update profile", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile">
      <div className="flex flex-col items-center gap-8">
        {/* Avatar Preview */}
        <div className="relative group">
          <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-purple-500/20 shadow-2xl relative">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-400">
                <Camera size={40} />
              </div>
            )}
            {loading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                <Loader2 className="text-white animate-spin" size={32} />
              </div>
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-2 -right-2 p-3 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl shadow-xl transition-all hover:scale-110 active:scale-95"
            disabled={loading}
          >
            <Upload size={20} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
        </div>

        <div className="w-full space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-gray-500 px-1">Display Name</label>
            <input
              type="text"
              readOnly
              value={user?.name}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-gray-400 cursor-not-allowed"
            />
          </div>
          
          <button
            onClick={handleUpdateProfile}
            disabled={loading || (!selectedFile)}
            className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
              loading || (!selectedFile)
                ? "bg-gray-800 text-gray-600 grayscale cursor-not-allowed"
                : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-purple-500/40 text-white hover:scale-[1.02] active:scale-95"
            }`}
          >
            {loading ? "Updating..." : (
              <>
                <Check size={20} />
                Save Profile
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ProfileModal;
