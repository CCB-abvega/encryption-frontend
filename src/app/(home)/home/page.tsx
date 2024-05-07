"use client";

import { Button } from "@/components/ui/button";
import { logout } from "@/services/authService";
import { decryptData, initializeKMSClient } from "@/services/kmsService";
import {
  getSecret,
  initializeSecretsClient,
} from "@/services/secretManagerService";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import privateApi from "@/services/privateApi";
import services from "@/services/services";
const HomePage = () => {
  const router = useRouter();
  const [data, setData] = useState({});

  const handleLogout = () => {
    logout();
    router.replace("/signin");
  };
  useEffect(() => {
    initializeKMSClient();
    initializeSecretsClient();
    privateApi
      .post<{ encrypted_data: string }>(
        services.private.avaliablePayments,
        {
          category: "COMMERCIAL",
          channel: "1",
          company: 1,
          country: 1,
          format: "JSON",
          ipwebservice: "tty",
          search: "",
          source: "n5",
        },
        { withCredentials: false }
      )
      .then((data) => {
        decryptData(data.encrypted_data).then((decryptedData) => {
          setData(decryptedData);
        });
      })
      .catch((error) => console.log(error));
  }, []);
  return (
    <Fragment>
      <Button onClick={handleLogout}>Logout</Button>
      <div className=' flex '>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    </Fragment>
  );
};

export default HomePage;

HomePage.requireAuth = true;
