import React, { useState } from "react";
import { Head, usePage } from "@inertiajs/react";
import Signup from "@/components/authentication/Signup";
import Login from "@/components/authentication/Login";
import MainLayout from "@/MainLayout";
import UniverseBackdrop from "@/components/visuals/UniverseBackdrop";
import VerificationModal from "@/components/authentication/VerificationModal";

export default function Authorization() {
  const { mode } = usePage().props;

  const [verificationId, setVerificationId] = useState(null);

  const handleVerificationRequired = (id) => {
    setVerificationId(id);
  };

  return (
    <>
      <Head title={mode === "login" ? "Login" : "Sign Up"} />

      {mode === "signup"
        ? <Signup onVerificationRequired={handleVerificationRequired} />
        : <Login onVerificationRequired={handleVerificationRequired} />}

      <UniverseBackdrop mode={mode} />

      {verificationId && (
        <VerificationModal
          verificationId={verificationId}
          onSuccess={() => (window.location = "/dashboard")}
        />
      )}
    </>
  );
}

Authorization.layout = (page) => <MainLayout>{page}</MainLayout>;
