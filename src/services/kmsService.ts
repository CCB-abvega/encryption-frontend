import awsConfig from "@/config/aws-config";
import { KMSClient, DecryptCommand } from "@aws-sdk/client-kms";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import { getSecret } from "./secretManagerService";
import privateApi from "./privateApi";
import services from "./services";

let kmsClient: KMSClient;

export async function obtainPublicKey(userId:string){

  const response =  await privateApi.post<{data:{
       public_key:string
   }}>(process.env.NEXT_PUBLIC_API_URL+services.private.getKey,{
       user_id: userId
   })

   sessionStorage.setItem('public_key',response.data.public_key)
}

function initializeKMSClient() {
  const idToken = getToken();
  const COGNITO_ID = awsConfig.cognitoId;

  const loginData = {
    [COGNITO_ID]: idToken,
  };
  try {
    kmsClient = new KMSClient({
      region: "us-east-1",
      credentials: fromCognitoIdentityPool({
        clientConfig: {
          region: awsConfig.region,
        },
        identityPoolId: awsConfig.identityPoolId,
        logins: loginData,
      }),
    });
    console.log("KMS Client initialized");
  } catch (e) {
    console.log(e);
  }
}

function getToken() {
  return sessionStorage.getItem("idToken") || "";
}

export async function decryptData(iv_ciphertext_base64: string, encodedDek:string) {
  const privateKey = process.env.NEXT_PUBLIC_PRIVATE_KEY;
  console.log('Private',privateKey)
  if (!privateKey){
    return
  }
  console.log('Encoded', encodedDek)
  const importedPrivateKey = await importPrivateKey(privateKey);
  const plaintextDek = await decryptDataWithRSA(importedPrivateKey,encodedDek);

  const iv_ciphertext = Uint8Array.from(atob(iv_ciphertext_base64), (c) =>
    c.charCodeAt(0)
  );

  // Convert IV ciphertext to IV and ciphertext
  const iv = iv_ciphertext.slice(0, 16);
  const ciphertext = iv_ciphertext.slice(16);

  // Import plaintext DEK as CryptoKey
  const key = await crypto.subtle.importKey(
    "raw",
    plaintextDek,
    { name: "AES-CBC" },
    false,
    ["decrypt"]
  );

  // Decrypt using AES-CBC
  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: "AES-CBC",
      iv: iv,
    },
    key,
    ciphertext
  );

  // Convert the decrypted ArrayBuffer to a string
  const plaintext = new TextDecoder().decode(decryptedBuffer);
  return plaintext;
}

function stripPemFormatting(pem: string): string {
  return pem
      .replace(/-----BEGIN .*-----/, '')
      .replace(/-----END .*-----/, '')
      .replace(/\s/g, '');
}

const pemToArrayBuffer = (pem: string): Uint8Array => {
  const pemContents = stripPemFormatting(pem);
  const binaryString = atob(pemContents);
  const uint8Array = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    uint8Array[i] = binaryString.charCodeAt(i);
  }
  return uint8Array;
};

const importPrivateKey = async (pem: string): Promise<CryptoKey> => {
  const binaryKey = pemToArrayBuffer(pem);
  return await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    {
      name: "RSA-OAEP",
      hash: "SHA-256"  
    },
    true,
    ["decrypt"]
  );
};

const base64ToArrayBuffer = (base64: string) => {
  return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
 
};

const decryptDataWithRSA = async (privateKey: CryptoKey, data: string): Promise<Uint8Array> => {
  try {
    const ciphertext = base64ToArrayBuffer(data);
    const decryptedData = await crypto.subtle.decrypt(
      { name: "RSA-OAEP" },
      privateKey,
      ciphertext
    );
    return new Uint8Array(decryptedData);
  } catch (error) {
    console.error("Error during RSA decryption:", error);
    throw error;
  }
};


const getEncryptedDek = async () => {
  let encryptedDek = sessionStorage.getItem("encryptedDek") || "";
  if (!encryptedDek) {
    const encrypted_dek = (
      await getSecret(process.env.NEXT_PUBLIC_ENCRYPTED_DEK_SECRET_NAME || "")
    ).encrypted_dek;
    sessionStorage.setItem("encryptedDek", encrypted_dek);
    encryptedDek = encrypted_dek;
  }
  return encryptedDek;
};



export { kmsClient, initializeKMSClient };
