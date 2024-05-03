"use client";

import { Button } from "@/components/ui/button";
import { logout } from "@/services/authService";
import { useRouter } from "next/navigation";
import { Fragment } from "react";

const HomePage = () => {
  const router = useRouter();
  const handleLogout = () => {
    logout();
    router.replace("/signin");
  };
  return (
    <Fragment>
      <Button onClick={handleLogout}>Logout</Button>
    </Fragment>
  );
};

export default HomePage;

HomePage.requireAuth = true;
