import HttpService from "./http";

const api: HttpService = HttpService.getInstance(true);

api.api.addAsyncRequestTransform((request) => async () => {
  const token = sessionStorage.getItem("ccbToken");
  if (!token) return;

  if (request.headers) {
    request.headers["Authorization"] = `Bearer ${token}`;
  }
});

export default HttpService.getInstance(false);
