import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../Navbar";

const MainLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
   
      <Navbar />

     
      <main className="flex-1 bg-gray-50 p-4">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
