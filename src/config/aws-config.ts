const region = "us-east-1";
const userPoolId = "us-east-1_pWX0zvOxS";

const awsConfig = {
  region,
  userPoolId,
  clientId: "43i50b5n4k0r8k87m3dcuq4v96",
  identityPoolId: "us-east-1:66201081-444c-4783-95fd-1f95cd43338d",
  cognitoId: `cognito-idp.${region}.amazonaws.com/${userPoolId}`,
};

export default awsConfig;
