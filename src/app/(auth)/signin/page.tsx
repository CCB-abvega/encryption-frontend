import SignInForm from "@/components/organisms/SIgnInForm";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import React from "react";

export const SignInPage = () => {
  return <SignInForm></SignInForm>;
};

export default SignInPage;
