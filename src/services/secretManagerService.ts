import awsConfig from "@/config/aws-config";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";

let secretsClient: SecretsManagerClient;

interface EncryptedDataKey {
  encrypted_dek: string;
}
function initializeSecretsClient() {
  const idToken = getToken();
  const COGNITO_ID = awsConfig.cognitoId;

  const loginData = {
    [COGNITO_ID]: idToken,
  };
  try {
    secretsClient = new SecretsManagerClient({
      region: "us-east-1",
      credentials: fromCognitoIdentityPool({
        clientConfig: {
          region: awsConfig.region,
        },
        identityPoolId: awsConfig.identityPoolId,
        logins: loginData,
      }),
    });
    console.log("Secrets Client initialized");
  } catch (e) {
    console.log(e);
  }
}

function getToken() {
  return sessionStorage.getItem("idToken") || "";
}

export async function getSecret(secretName: string) {
  const response = await secretsClient.send(
    new GetSecretValueCommand({
      SecretId: secretName,
    })
  );

  return JSON.parse(response.SecretString || "{}") as EncryptedDataKey;
}

initializeSecretsClient();

export { secretsClient, initializeSecretsClient };
