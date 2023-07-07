import { http } from "@/utils/http";
import { R } from "@/api/model/common";

export const deleteSourceMusic = (file: string) => {
  return http.request<R<string>>("get", `/admin/pic/get/temp/${file}`);
};
