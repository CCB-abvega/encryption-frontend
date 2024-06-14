import { AxiosRequestConfig } from "axios";
import {
  ApiResponse,
  ApisauceConfig,
  ApisauceInstance,
  create,
} from "apisauce";

import Errors from "@services/apiErrors";

// @Zodios

export interface BadResponse {
  message?: string;
  code?: number;
  statusCode?: number;
  ok?: boolean;
}

const TIMEOUT = 29000;
const APP_API_URL: string =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const HEADERS = {
  "content-type": "application/json; charset=UTF-8",
  Accept: "application/json",
};

type Response<T> = NonNullable<T | null> & BadResponse;

export default class HttpService {
  private static instance: HttpService;
  api: ApisauceInstance;

  private constructor(withCredentials: boolean) {
    const config: ApisauceConfig = {
      baseURL: APP_API_URL,
      headers: HEADERS,
      timeout: TIMEOUT,
    };

    if (withCredentials) {
      config.withCredentials = withCredentials;
    }

    this.api = create(config);

    this.api.addResponseTransform(this.errorResponseTransform);
  }

  private async errorResponseTransform<T>(response: ApiResponse<any, any>) {
    try {
      if (!response.ok) {
        if (response.data) {
          response.data.message =
            Errors[response?.data?.code] ||
            response?.data?.message ||
            "unknown error";
          response.data.ok = response.ok;
          response.data.problem = response.problem;
          response.data.status = response.status;
          return;
        }
        response.data = {
          code: 0,
          statusCode: 0,
          message: "undefined",
          ok: response.ok,
          problem: response.problem,
          status: response.status,
        };
        return;
      }
      response.data.ok = true;
    } catch (e) {
      response.data = {
        code: 0,
        statusCode: 0,
        message: "undefined",
        ok: response.ok,
      };
    }
  }

  public static getInstance(withCredentials: boolean = false): HttpService {
    if (!HttpService.instance) {
      HttpService.instance = new HttpService(withCredentials);
    }

    return HttpService.instance;
  }

  /**
   * method get
   * @param url
   * @param params
   * @param axiosConfig
   */
  async get<T = any>(
    url: string,
    params?: {},
    axiosConfig?: AxiosRequestConfig
  ): Promise<Response<T>> {
    try {
      const res: ApiResponse<any> = await this.api.get(
        url,
        params,
        axiosConfig
      );
      return res.data;
    } catch (e) {
      throw e;
    }
  }

  /**
   * method post
   * @param url
   * @param data
   * @param axiosConfig
   */
  async post<T = any>(
    url: string,
    data?: unknown,
    axiosConfig?: AxiosRequestConfig
  ): Promise<Response<T>> {
    try {
      const res: ApiResponse<any> = await this.api.post(url, data, axiosConfig);
      return res.data;
    } catch (e) {
      throw e;
    }
  }
  /**
   * method put
   * @param url
   * @param data
   * @param axiosConfig
   */
  //
  async put<T = any>(
    url: string,
    data?: unknown,
    axiosConfig?: AxiosRequestConfig
  ): Promise<Response<T>> {
    try {
      const res: ApiResponse<any> = await this.api.put(url, data, axiosConfig);
      return res.data;
    } catch (e) {
      throw e;
    }
  }

  /**
   * method del
   * @param url
   * @param params
   * @param axiosConfig
   */
  async del<T = any>(
    url: string,
    params?: {},
    axiosConfig?: AxiosRequestConfig
  ): Promise<Response<T>> {
    try {
      const res: ApiResponse<any> = await this.api.delete(
        url,
        params,
        axiosConfig
      );
      return res.data;
    } catch (e) {
      throw e;
    }
  }

  async patch<T = any>(
    url: string,
    data?: unknown,
    axiosConfig?: AxiosRequestConfig
  ): Promise<Response<T>> {
    try {
      const res: ApiResponse<any> = await this.api.patch(
        url,
        data,
        axiosConfig
      );
      return res.data;
    } catch (e) {
      throw e;
    }
  }
}
