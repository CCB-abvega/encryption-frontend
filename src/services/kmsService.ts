import awsConfig from "@/config/aws-config";
import { KMSClient, DecryptCommand } from "@aws-sdk/client-kms";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import { getSecret } from "./secretManagerService";

let kmsClient: KMSClient;

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

export async function decryptData(iv_ciphertext_base64: string) {
  const encrypted_dek_base64 = await getEncryptedDek();
  const encrypted_dek = Uint8Array.from(atob(encrypted_dek_base64), (c) =>
    c.charCodeAt(0)
  );
  const iv_ciphertext = Uint8Array.from(atob(iv_ciphertext_base64), (c) =>
    c.charCodeAt(0)
  );

  const response = await kmsClient.send(
    new DecryptCommand({
      CiphertextBlob: encrypted_dek,
    })
  );

  const plaintextDek = response.Plaintext as Uint8Array;

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

initializeKMSClient();

export { kmsClient, initializeKMSClient };
