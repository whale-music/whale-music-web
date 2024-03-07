import { defineStore } from "pinia";

import type {
  MusicPlayInfo,
  MusicPlayLyrics,
  MusicPlaySources
} from "@/api/model/Music";
import { getMusicPlayInfo } from "@/api/music";
import { store } from "@/store";
import { isAllEmpty, isArray } from "@pureadmin/utils";
import { message } from "@/utils/message";
import { toArray } from "@/utils/array";

const playSongList = "play-music-list";
export const userPlaySongList = defineStore({
  id: playSongList,
  state: () => ({
    // 播放音乐信息
    playListMusicArr: [] as PropType<MusicPlayInfo[]>,
    // 当前播放音乐
    currentIndex: 0,
    // 是否在播放
    isPlay: false
  }),
  getters: {
    getCurrentMusic: (state): MusicPlayInfo =>
      state.playListMusicArr[state.currentIndex],
    getPlayListMusic: (state): MusicPlayInfo[] => state.playListMusicArr,
    getPlayMusicLength: state => state.playListMusicArr.length,
    getCurrentIndex: state => state.currentIndex,
    // 是否有上一首音乐
    isLastMusic: state => state.currentIndex > 0,
    // 是否有下一首音乐
    isNextMusic: (state): boolean => {
      return state.currentIndex + 1 >= state.playListMusicArr.length;
    },
    // 歌单是否为空
    isEmpty: state => isAllEmpty(state.playListMusicArr),
    isNotEmpty: state => !isAllEmpty(state.playListMusicArr)
  },
  actions: {
    clearPlaySong() {
      this.playListMusicArr = [];
      this.currentIndex = 0;
    },
    // 获取下一首音乐
    nextMusic(): MusicPlayInfo {
      if (this.isNextMusic) {
        this.currentIndex++;
      }
      return this.getCurrentMusic;
    },
    // 获取上一首音乐
    lastMusic(): MusicPlayInfo {
      if (this.isLastMusic) {
        this.currentIndex--;
      }
      return this.getCurrentMusic;
    },
    removeMusicByIndex(index: number) {
      if (index !== -1 && this.getPlayMusicLength >= index) {
        this.getPlayListMusic.splice(index, 1);
      }
    },
    removeMusicByMusicId(musicId: number) {
      const index = this.getPlayListMusic.findIndex(v => v.musicId === musicId);
      this.removeMusicByIndex(index);
    },
    setPlaySongListByMusicDetail(musicList: MusicPlayInfo[], index?: number) {
      this.playListMusicArr = musicList;
      this.currentIndex = index ?? 0;
    },
    async setPlaySongListByMusicIds(
      musicIds: number | number[],
      index?: number
    ) {
      try {
        const r = await getMusicPlayInfo(toArray(musicIds));
        this.setPlaySongListByMusicDetail(r.data, index);
      } catch (e) {
        message(e, { type: "error" });
        new Error(e);
      }
    },
    async addMusicToPlayByMusicInfo(musicList: MusicPlayInfo[]) {
      this.playListMusicArr.push(musicList);
    },
    // 添加歌曲到下一个播放
    async addMusicToNextPlaySongList(musicId: number | number[]) {
      if (isAllEmpty(musicId)) return;
      const ids = isArray(musicId) ? musicId : [musicId];
      const r = await getMusicPlayInfo(ids);
      this.addMusicToPlayByMusicInfo(r.data);
    },
    async playSongList(musicId: number | number[], index?: number) {
      this.clearPlaySong();
      this.setPlaySongListByMusicIds(musicId, index);
    },
    // todo remove this method
    // 获取音乐的所有音源
    async getMusicSources(musicId: number): Promise<MusicPlaySources[]> {
      return this.getMusicById(musicId).sources;
    },
    getMusicById(musicId: number): MusicPlayInfo {
      const index = this.getPlayListMusic.findIndex(
        value => value.id === musicId
      );
      return this.getPlayListMusic[index];
    },
    // 重新设置当前歌单播放音乐
    seekMusicById(musicId: number): MusicPlayInfo {
      if (this.getPlayMusicLength > 0) {
        this.currentMusic = this.getMusicById(musicId);
        return this.getCurrentMusic;
      }
    },
    // 重新设置当前歌单播放音乐
    seekMusicByIndex(index: number): MusicPlayInfo {
      if (this.getPlayMusicLength > 0) {
        this.currentMusic = index;
        return this.getCurrentMusic;
      }
    },
    getMusicLyric(musicId: number): MusicPlayLyrics {
      const music = this.getMusicById(musicId);
      return music?.lyrics;
    },
    getCurrentMusicLyric(): MusicPlayLyrics {
      const music = this.getCurrentMusic;
      return music?.lyrics;
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
