"use client";

import { Button } from "@/components/ui/button";
import { logout } from "@/services/authService";
import { decryptData, initializeKMSClient, obtainPublicKey } from "@/services/kmsService";
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
        .then(async () => {
          await obtainPublicKey("766970bf-75ca-4aa5-adc0-e36e12d7b7ab")
          privateApi
            .post<{ data:{encrypted_data: string, encrypted_data_key:string} }>(
              services.private.getData,
              {
               public_key: sessionStorage.getItem('public_key')
              },
              { withCredentials: false }
            )
            .then((response) => {
  
              decryptData(response.data.encrypted_data, response.data.encrypted_data_key)
                .then((decryptedData) => {
                  console.log(decryptedData)
                  setData(decryptedData || '');
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
        <h1>Calling service {services.private.getData}</h1>
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
