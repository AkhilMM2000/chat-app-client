import React from "react";
import { Routes, Route } from "react-router-dom";
import GroupChat from "../pages/GroupChat";
import AuthPage from "../pages/AuthPage";
import MainLayout from "../components/layout/MainLayout";
import Room from "../pages/Room";
import PrivateRoute from "../components/PrivateRoute";
const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AuthPage/>} />
      
        <Route path="/chat/:roomId"  element={
      <PrivateRoute>
        <GroupChat />
      </PrivateRoute>
    }/>
   <Route element={<MainLayout />}>
         <Route path="/room" element={
      <PrivateRoute>
        <Room />
      </PrivateRoute>
    }/>
        </Route>
    </Routes>
  );
};

export default AppRouter;
