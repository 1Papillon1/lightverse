// Authorization.jsx
import React from "react";
import { Head, usePage } from "@inertiajs/react";
import Signup from "@/components/authentication/Signup";
import Login from "@/components/authentication/Login";
import MainLayout from "@/MainLayout";
import UniverseBackdrop from "@/components/visuals/UniverseBackdrop";

export default function Authorization() {
  const { mode } = usePage().props;  // 'login' ili 'signup'

  return (
    <>
      <Head title={mode === "login" ? "Login" : "Sign Up"} />
      {mode === "signup" ? <Signup /> : <Login />}
      <UniverseBackdrop mode={mode} />
    </>
  );
}

Authorization.layout = (page) => <MainLayout>{page}</MainLayout>;
