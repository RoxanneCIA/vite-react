import axios from 'axios';

declare module 'axios' {
  export interface AxiosInstance {
    (config: AxiosRequestConfig): AxiosPromise;
    (url: string, config?: AxiosRequestConfig): AxiosPromise;
    defaults: AxiosRequestConfig;
    interceptors: {
      request: AxiosInterceptorManager<AxiosRequestConfig>;
      response: AxiosInterceptorManager<AxiosResponse>;
    };
    getUri(config?: AxiosRequestConfig): string;
    request<R>(config: AxiosRequestConfig): Promise<R>;
    get<R>(url: string, config?: AxiosRequestConfig): Promise<R>;
    delete<R>(url: string, config?: AxiosRequestConfig): Promise<R>;
    head<R>(url: string, config?: AxiosRequestConfig): Promise<R>;
    options<R>(url: string, config?: AxiosRequestConfig): Promise<R>;
    post<R>(url: string, data?: any, config?: AxiosRequestConfig): Promise<R>;
    put<R>(url: string, data?: any, config?: AxiosRequestConfig): Promise<R>;
    patch<R>(url: string, data?: any, config?: AxiosRequestConfig): Promise<R>;
  }
}
