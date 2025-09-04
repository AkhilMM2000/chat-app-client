import React from "react";
import { Routes, Route } from "react-router-dom";
import GroupChat from "../pages/GroupChat";
import AuthPage from "../pages/AuthPage";
import MainLayout from "../components/layout/MainLayout";
import Room from "../pages/Room";
const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AuthPage/>} />
      
        <Route path="/chat" element={<GroupChat />} />
   <Route element={<MainLayout />}>
         <Route path="/room" element={<Room />} />
        </Route>
    </Routes>
  );
};

export default AppRouter;
