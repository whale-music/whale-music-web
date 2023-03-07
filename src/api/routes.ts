import { http } from "@/utils/http";

export type Result = {
  code: string;
  message: string;
  data: Array<Router>;
};
export interface Router {
  path: string;
  meta: Meta;
  children: Children[];
}

export interface Children {
  path: string;
  name: string;
  meta: Meta;
}
export interface Meta {
  title: string;
  icon: string;
  rank: number;
  auths: string[];
}

export const getAsyncRoutes = () => {
  return http.request<Result>("get", "/admin/user/getAsyncRoutes");
};
