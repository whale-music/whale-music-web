import { defineStore } from "pinia";

import { Resource } from "@/api/model/Music";
import {
  getAllMusicList,
  getMusicLyric,
  getMusicUrl,
  Lyric,
  MusicSearchRes
} from "@/api/music";
import { store } from "@/store";

const playSongList = "Play-Song-List";
export const userPlaySongList = defineStore({
  id: playSongList,
  state: () => {
    return {
      // 播放音乐信息
      playListMusicArr: [] as MusicSearchRes[],
      // 当前播放音乐
      currentIndex: 0,
      // 当前音乐地址
      currentMusicUrlArr: new Map<Number, Resource[]>(),
      // 当前音乐歌词信息
      musicLyricArr: new Map<Number, Lyric[]>(),
      // 是否在播放
      isPlay: false
    };
  },
  getters: {
    getCurrentMusic: state => state.playListMusicArr[state.currentIndex],
    getPlayListMusic: state => state.playListMusicArr,
    isLastMusic: state => state.currentIndex > 0,
    isNextMusic: state =>
      state.playListMusicArr.length - 1 > state.currentIndex,
    isEmpty: state => state.playListMusicArr.length === 0
  },
  actions: {
    clearPlaySong() {
      this.playListMusicArr = [];
      this.currentIndex = 0;
    },
    // 获取下一首音乐
    nextMusic() {
      this.playListMusicArr.length - 1 >= this.currentIndex &&
        this.currentIndex++;
      return this.getCurrentMusic;
    },
    // 获取上一首音乐
    lastMusic() {
      this.currentIndex > 0 && this.currentIndex--;
      return this.getCurrentMusic;
    },
    setPlaySongList(musicList: MusicSearchRes[]) {
      this.playListMusicArr = musicList;
      this.currentIndex = 0;
    },
    // 添加歌曲到下一个播放
    async addMusicToNextPlaySongList(musicId: number | number[]) {
      const b = this.playListMusicArr == null;
      this.playListMusicArr = b ? [] : this.playListMusicArr;

      const withoutIds = [];
      const ids = musicId instanceof Array ? musicId : [musicId];
      ids.forEach(id => {
        const musicIndex = this.playListMusicArr.findIndex(
          value => value.id === id
        );
        if (musicIndex === -1) {
          withoutIds.push(id);
        }
      });
      if (withoutIds.length !== 0) {
        const tempMusicInfo = await getAllMusicList({
          refresh: false,
          afterDate: "",
          albumName: "",
          artistName: "",
          beforeDate: "",
          musicIds: withoutIds,
          musicName: "",
          order: false,
          orderBy: "",
          isShowNoExist: false,
          page: { pageIndex: 0, pageNum: 0 }
        });
        // 添加到数组中
        this.playListMusicArr.splice(
          this.currentIndex + 1,
          0,
          tempMusicInfo.data.records[0]
        );
      }
    },
    async playSongList(musicId: number | number[], index?: number) {
      this.clearPlaySong();
      const ids = musicId instanceof Array ? musicId : [musicId];
      const tempMusicInfo = await getAllMusicList({
        refresh: false,
        afterDate: "",
        albumName: "",
        artistName: "",
        beforeDate: "",
        musicIds: ids,
        musicName: "",
        order: false,
        orderBy: "",
        isShowNoExist: false,
        page: { pageIndex: 0, pageNum: 99999 }
      });
      if (tempMusicInfo.code === "200") {
        tempMusicInfo.data.records.forEach(value =>
          this.playListMusicArr.push(value)
        );
        if (index != null && index > 0 && index < this.playListMusicArr) {
          this.currentIndex = index;
        }
      } else {
        throw new Error(`获取音乐信息失败${tempMusicInfo.message}`);
      }
    },
    // 获取音乐的所有音源
    async getAllMusicUrl(musicId: number) {
      this.currentMusicUrlArr =
        this.currentMusicUrlArr instanceof Map
          ? this.currentMusicUrlArr
          : new Map<Number, MusicUrl[]>();

      const url = this.currentMusicUrlArr.get(musicId);
      // 判断是否有缓存
      if (
        this.currentMusicUrlArr.size === 0 ||
        url == null ||
        url.length === 0
      ) {
        return new Promise<MusicUrl[]>((resolve, reject) => {
          getMusicUrl(musicId.toString())
            .then(res => {
              if (res.code === "200") {
                this.currentMusicUrlArr.set(musicId, res.data);
                resolve(res.data);
              } else {
                resolve(res.data);
              }
            })
            .catch(error => {
              reject(error);
            });
        });
      } else {
        return url;
      }
    },
    // 获取音乐音源
    async getOneMusicUrl(musicId: number) {
      const musicSearchRes = this.playListMusicArr.filter(
        value => value.id === musicId
      );
      return musicSearchRes[0];
    },
    // 重新设置当前歌单播放音乐
    seekMusic(musicId: number) {
      if (this.playListMusicArr.length > 0) {
        const number = this.playListMusicArr.findIndex(
          value => value.id === musicId
        );
        this.currentMusic = number;
        return this.playListMusicArr[number];
      }
    },
    async getLyric(musicId: number) {
      this.musicLyricArr =
        this.musicLyricArr instanceof Map
          ? this.musicLyricArr
          : new Map<Number, Lyric[]>();

      const lyrics = this.musicLyricArr.get(musicId);
      if (this.musicLyricArr || lyrics == null || lyrics.length === 0) {
        const tempMusicLyric = await getMusicLyric(musicId.toString());
        this.musicLyricArr.set(musicId, tempMusicLyric.data);
        return tempMusicLyric.data;
      } else {
        return lyrics;
      }
    }
  },
  persist: {
    key: playSongList,
    storage: localStorage
  }
});

export function usePlaySongListStoreHook() {
  return userPlaySongList(store);
}
