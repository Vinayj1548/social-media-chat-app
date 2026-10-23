"use client";

import type { ReactNode } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "@/context/AuthContext";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      {children}

      <ToastContainer
        position="top-right"
        theme="dark"
        autoClose={4000}
        closeOnClick
        pauseOnHover
        pauseOnFocusLoss
      />
    </AuthProvider>
  );
}
