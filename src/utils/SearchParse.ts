import { LocationQuery } from "vue-router";

import { MusicTabsPageReq } from "@/api/music";

export const nameKey = "name";
export const musicKey = "music";
export const artistKey = "artist";
export const albumKey = "album";
export const pageIndexKey = "pageIndex";
export const pageNumKey = "pageNum";
export const randomKey = "random";

export function parseSearchToQuery(str: string) {
  const parts = str.trim().split(/\s+/); // 以空格分割字符串
  const obj = {};

  parts.forEach(part => {
    if (part.startsWith("@")) {
      // 如果字符串以 @ 开头，则将 key 设置为 'artist'
      obj[artistKey] = part.substring(1); // 去除 @ 后将字符串添加到数组中
    } else if (part.startsWith("#")) {
      // 如果字符串以 # 开头，则将 key 设置为 'album'
      obj[albumKey] = part.substring(1); // 去除 # 后将字符串添加到数组中
    } else if (part.startsWith("$")) {
      // 如果没有特殊符号，则将 key 设置为 'music'
      part !== "" && (obj[musicKey] = part); // 直接将字符串赋给对象的属性
    } else {
      part !== "" && (obj[nameKey] = part); // 直接将字符串赋给对象的属性
    }
  });
  return obj;
}

export function paramsQueryToPageReq(query: LocationQuery): MusicTabsPageReq {
  // const route = useRoute();
  // const query = route.query;
  const name = query[nameKey];
  const music = query[musicKey];
  const artist = query[artistKey];
  const album = query[albumKey];
  const isShowSource = query["isShowSource"];
  const refresh = query["refresh"];
  const pageIndex = query[pageIndexKey];
  const pageNum = query[pageNumKey];
  return {
    name: String(name ?? ""),
    musicName: String(music ?? ""),
    artistName: String(artist ?? ""),
    albumName: String(album ?? ""),
    refresh: Boolean(refresh),
    isShowSource: Boolean(isShowSource),
    pageIndex: Number(pageIndex ?? 1),
    pageNum: Number(pageNum ?? 50)
  };
}

export function parseQueryToSearchName(query: LocationQuery) {
  const name = query[nameKey] ?? "";
  const musics = query[musicKey] ?? "";
  const albums = query[albumKey] ?? "";
  const artists = query[artistKey] ?? "";
  const musicStr = Array(...(Array.isArray(musics) ? [...musics] : [musics]))
    .map(value => {
      return value ? `$${value}` : "";
    })
    .join(" ")
    .trim();
  const albumStr = Array(...(Array.isArray(albums) ? [...albums] : [albums]))
    .map(value => {
      return value ? `#${value}` : "";
    })
    .join(" ")
    .trim();
  const artistStr = Array(
    ...(Array.isArray(artists) ? [...artists] : [artists])
  )
    .map(value => {
      return value ? `@${value}` : "";
    })
    .join(" ")
    .trim();
  return {
    nameStr: name,
    musicStr: musicStr === "" ? "" : ` ${musicStr} `,
    albumStr: albumStr === "" ? "" : ` ${albumStr} `,
    artistStr: artistStr === "" ? "" : ` ${artistStr} `
  };
}
