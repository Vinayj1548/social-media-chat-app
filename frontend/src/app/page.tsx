// src/app/page.tsx

import Navbar from "@/components/Navbar";
import LoginForm from "@/components/LoginForm";

export default function HomePage() {
  return (
    <>
      <div className="flex justify-center bg-[#504673] w-screen items-center h-screen">
        <LoginForm />
      </div>
    </>
  );
}