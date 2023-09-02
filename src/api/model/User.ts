import { Page } from "@/api/model/common";

export interface User {
  id: number;
  username: string;
  nickname: string;
  password: string;
  signature: string;
  accountType: number;
  status: boolean;
  roleName: string;
  lastLoginIp: string;
  lastLoginTime: string;
  createTime: string;
  updateTime: string;
}

export type PageUserRes = User;

export interface UserConverter extends User {
  avatarUrl: string;
  backgroundPicUrl: string;
}

export interface PageUserReq extends User {
  page: Page;
}

export interface SaveOrUpdateUserReq extends UserConverter {
  avatarTempFile: string;
  backgroundTempFile: string;
}
export type SaveOrUpdateUserRes = UserConverter;

export interface Config {
  enablePlugin: boolean;
  logEnable: boolean;
  enableAdminSpringBootApplication: boolean;
  enableNeteaseCloudMusicSpringBootApplication: boolean;
  enableSubsonicSpringBootApplication: boolean;
}
