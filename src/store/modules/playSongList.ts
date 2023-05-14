import { defineStore } from "pinia";
import { store } from "@/store";
import {
  getAllMusicList,
  getMusicLyric,
  getMusicUrl,
  Lyric,
  MusicSearchRes,
  MusicUrl
} from "@/api/music";

const playSongList = "Play-Song-List";
export const userPlaySongList = defineStore({
  id: playSongList,
  state: () => ({
    // 播放音乐信息
    playListMusicArr: [] as MusicSearchRes[],
    currentIndex: 0,
    currentMusicUrlArr: [] as MusicUrl[],
    musicLyricArr: [] as Lyric[]
  }),
  getters: {
    getCurrentMusic: state => state.playListMusicArr[state.currentIndex],
    getPlayListMusic: state => state.playListMusicArr,
    isLastMusic: state => state.currentIndex > 0,
    isNextMusic: state => state.playListMusicArr.length - 1 > state.currentIndex
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
    async addMusicToNextPlaySongList(musicId: number) {
      this.playListMusicArr =
        this.playListMusicArr == null || this.playListMusicArr.length === 0
          ? []
          : this.playListMusicArr;
      const musicIndex = this.playListMusicArr.findIndex(
        value => value.id === musicId
      );
      if (musicIndex === -1) {
        const tempMusicInfo = await getAllMusicList({
          refresh: false,
          afterDate: "",
          albumName: "",
          artistName: "",
          beforeDate: "",
          musicIds: [musicId],
          musicName: "",
          order: false,
          orderBy: "",
          isShowNoExist: false,
          page: { pageIndex: 0, pageNum: 0 }
        });
        this.playListMusicArr.splice(
          this.currentIndex + 1,
          0,
          tempMusicInfo.data.records[0]
        );
      } else {
        const musicSearchRe = this.playListMusicArr[musicIndex];
        this.playListMusicArr.splice(this.currentIndex + 1, 0, musicSearchRe);
        this.playListMusicArr.splice(musicIndex, 1);
      }
    },
    async playSongList(musicId: number, index?: number) {
      this.clearPlaySong();
      const tempMusicInfo = await getAllMusicList({
        refresh: false,
        afterDate: "",
        albumName: "",
        artistName: "",
        beforeDate: "",
        musicIds: [musicId],
        musicName: "",
        order: false,
        orderBy: "",
        isShowNoExist: false,
        page: { pageIndex: 0, pageNum: 1 }
      });
      if (tempMusicInfo.code === "200") {
        this.playListMusicArr.push(tempMusicInfo.data.records[0]);
        if (index != null && index > 0 && index < this.playListMusicArr) {
          this.currentIndex = index;
        }
      } else {
        throw new Error(`获取音乐信息失败${tempMusicInfo.message}`);
      }
    },
    // 获取音乐的所有音源
    async getAllMusicUrl(musicId: number) {
      const url = this.currentMusicUrlArr.filter(
        value => value.musicId === musicId
      );
      // 判断是否有缓存
      if (url.length === 0) {
        return new Promise<MusicUrl[]>((resolve, reject) => {
          getMusicUrl(musicId.toString())
            .then(res => {
              if (res.code === "200") {
                this.currentMusicUrlArr.push(res.data);
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
      const lyrics = this.musicLyricArr.filter(
        value => value.musicId === musicId
      );
      if (lyrics.length === 0) {
        const tempMusicLyric = await getMusicLyric(musicId.toString());
        this.musicLyricArr.push(tempMusicLyric.data);
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
