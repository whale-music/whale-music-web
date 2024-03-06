import { isAllEmpty } from "@pureadmin/utils";

const { VITE_PROXY_HOST } = import.meta.env;
export const PROXY_HOST = isAllEmpty(VITE_PROXY_HOST) ? "" : VITE_PROXY_HOST;

export const UPLOAD_PIC_URL = `${PROXY_HOST}/admin/pic/upload`;
export const UPLOAD_AUTO_MUSIC = `${PROXY_HOST}/admin/music/auto/upload`;
