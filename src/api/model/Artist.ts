import type { LinkItem, PicUrl } from "@/api/model/common";

export interface Artist {
  id: number;
  artistName: string;
  aliasName: string;
  sex: string;
  pic: string;
  birth: string;
  location: string;
  introduction: string;
  createTime: string;
  updateTime: string;
}

export interface ArtistConvert extends Artist, PicUrl {}

export interface SelectArtist extends ArtistConvert, LinkItem {}

export interface SaveOrUpdateArtist extends ArtistConvert {
  tempFile: string;
}
