import type { ArtistConvert } from "@/api/model/Artist";
import type { LinkItem, Page, PicUrl } from "@/api/model/common";

export interface Album {
  id: number;
  albumName: string;
  subType: string;
  description: string;
  company: string;
  pic: string;
  publishTime: Date;
  updateTime: string;
  createTime: string;
}

export interface AlbumConvert extends Album, PicUrl {}

export interface AlbumInfo {
  albumGenre: string[];
  musicList: Array<{
    id: number;
    musicName: string;
    aliasName: string;
    timeLength: number;
  }>;
  albumSize: number;
  artistList: Array<{ id: number; artistName: string; aliasName: string }>;
  picUrl: string;
  id: number;
  albumName: string;
  subType: string;
  description: string;
  company: string;
  publishTime: Date;
  userId: number;
  updateTime: string;
  createTime: string;
}

export interface AlbumListPageRes extends AlbumConvert {
  artistList: ArtistConvert[];
  albumSize: number;
  orderBy: string;
  order: boolean;
}

export interface AlbumListPageReq extends AlbumConvert {
  artistName: string;
  orderBy: string;
  order: boolean;
  timeBy: boolean;
  beforeTime: string;
  laterTime: string;
  page: Page;
}

export interface SelectAlbum extends AlbumConvert, LinkItem {
  artists: ArtistConvert[];
}

export interface SaveOrUpdateAlbum {
  id: number;
  albumName: string;
  subType: string;
  description: string;
  company: string;
  publishTime: Date;

  albumGenre: string[];
  artistIds: number[];
  tempFile: string;
}
