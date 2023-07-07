import { LinkItem, Page, PicUrl } from "@/api/model/common";
import { MusicConvert } from "@/api/model/Music";
import { ArtistConvert } from "@/api/model/Artist";

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

export interface AlbumInfo extends AlbumConvert {
  musicList: MusicConvert[];
  artistList: ArtistConvert[];
  albumSize: number;
}

export interface AlbumPageRes extends AlbumConvert {
  artistList: ArtistConvert[];
  albumSize: number;
  orderBy: string;
  order: boolean;
}

export interface AlbumPageReq extends AlbumConvert {
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

export interface SaveOrUpdateAlbum extends AlbumPageRes {
  artistIds: number[];
  tempFile: string;
}
