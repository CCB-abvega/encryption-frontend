import awsConfig from "@/config/aws-config";
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommandInput,
} from "@aws-sdk/client-cognito-identity-provider";
export const cognitoClient = new CognitoIdentityProviderClient({
  region: awsConfig.region,
});

import axios from "axios";
import { initializeKMSClient } from "./kmsService";
import { initializeSecretsClient } from "./secretManagerService";

interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export const signIn = async (username: string, password: string) => {
  const params: InitiateAuthCommandInput = {
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: awsConfig.clientId,
    AuthParameters: {
      USERNAME: username,
      PASSWORD: password,
    },
  };
  try {
    const command = new InitiateAuthCommand(params);
    const { AuthenticationResult } = await cognitoClient.send(command);
    if (AuthenticationResult) {
      sessionStorage.setItem("idToken", AuthenticationResult.IdToken || "");
      sessionStorage.setItem(
        "accessToken",
        AuthenticationResult.AccessToken || ""
      );
      sessionStorage.setItem(
        "refreshToken",
        AuthenticationResult.RefreshToken || ""
      );
      const ccbToken = await getCCBToken();
      sessionStorage.setItem("ccbToken", ccbToken || "");
      initializeSecretsClient();
      initializeKMSClient();
      return AuthenticationResult;
    }
  } catch (error) {
    console.error("Error signing in: ", error);
    throw error;
  }
};

export const signUp = async (email: string, password: string) => {
  const params = {
    ClientId: awsConfig.clientId,
    Username: email,
    Password: password,
    UserAttributes: [
      {
        Name: "email",
        Value: email,
      },
    ],
  };
  try {
    const command = new SignUpCommand(params);
    const response = await cognitoClient.send(command);
    console.log("Sign up success: ", response);
    return response;
  } catch (error) {
    console.error("Error signing up: ", error);
    throw error;
  }
};

export const confirmSignUp = async (username: string, code: string) => {
  const params = {
    ClientId: awsConfig.clientId,
    Username: username,
    ConfirmationCode: code,
  };
  try {
    const command = new ConfirmSignUpCommand(params);
    await cognitoClient.send(command);
    console.log("User confirmed successfully");
    return true;
  } catch (error) {
    console.error("Error confirming sign up: ", error);
    throw error;
  }
};

export const logout = () => {
  sessionStorage.clear();
};

const getCCBToken = async () => {
  try {
    const response = await axios.post<TokenResponse>(
      process.env.NEXT_PUBLIC_TOKEN_URL as string,
      new URLSearchParams({
        grant_type: "client_credentials",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            process.env.NEXT_PUBLIC_CLIENT_ID +
              ":" +
              process.env.NEXT_PUBLIC_CLIENT_SECRET
          ).toString("base64")}`,
        },
      }
    );

    if (response.status === 200) {
      return response.data.access_token;
    }
  } catch (error) {
    console.error("Error while fetching CCB token:", error);
  }

  return null;
};
