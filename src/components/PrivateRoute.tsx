
import React, { type JSX } from "react";
import { Navigate } from "react-router-dom";
import { getCurrentUser } from "../utils/auth";

const PrivateRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const user = getCurrentUser();
  if (!user) return <Navigate to="/" replace />;
  return children;
};

export default PrivateRoute;
