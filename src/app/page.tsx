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
    const token = sessionStorage.getItem("ccbToken");
    if (!token) {
      router.replace("/signin");
    }

    const initializeClients = () => {
      return new Promise((resolve, reject) => {
        try {
          initializeKMSClient();
          initializeSecretsClient();
          resolve(undefined);
        } catch (error) {
          reject(error);
        }
      });
    };

    const fetchData = () => {
      initializeClients()
        .then(() => {
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
            .then((response) => {
              decryptData(response.encrypted_data)
                .then((decryptedData) => {
                  setData(JSON.parse(decryptedData));
                })
                .catch((error) => {
                  console.error(error);
                });
            })
            .catch((error) => {
              console.error(error);
            });
        })
        .catch((error) => {
          console.error(error);
        });
    };

    fetchData();
  }, []);

  return (
    <Fragment>
      <section className='flex justify-center flex-col items-center w-full h-full overflow-hidden'>
        <h1>Calling service {services.private.avaliablePayments}</h1>
        <pre className='p-4 overflow-auto rounded-sm bg-slate-200 h-[500px] w-[500px]'>
          <code className='text-left whitespace-pre leading-normal text-pretty text-black'>
            {JSON.stringify(data, null, 4)}
          </code>
        </pre>

        <Button className='relative mt-5' onClick={handleLogout}>
          Logout
        </Button>
      </section>
    </Fragment>
  );
};

export default HomePage;

HomePage.requireAuth = true;
