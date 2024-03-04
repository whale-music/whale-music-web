import type { ArtistConvert } from "@/api/model/Artist";
import type { LinkItem, Page, PicUrl } from "@/api/model/common";
import type { MusicConvert } from "@/api/model/Music";

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
  albumGenre: string;
  musicList: MusicConvert[];
  artistList: ArtistConvert[];
  albumSize: number;
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

export interface SaveOrUpdateAlbum extends AlbumListPageRes {
  albumGenre: string;
  artistIds: number[];
  tempFile: string;
}
