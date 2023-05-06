import { defineStore } from "pinia";
import { store } from "@/store";
import { getMusicUrl, Music, MusicUrl } from "@/api/music";

export const userPlaySongList = defineStore({
  id: "Play-Song-List",
  state: () => ({
    // 播放音乐信息
    playListMusicArr: [] as Music[],
    currentIndex: 0,
    currentMusicUrlArr: [] as MusicUrl[]
  }),
  getters: {
    getCurrentMusic: state => state.playListMusicArr[state.currentIndex],
    getPlayListMusic: state => state.playListMusicArr,
    isLastMusic: state => state.currentIndex > 0,
    isNextMusic: state => state.playListMusicArr.length - 1 < state.currentIndex
  },
  actions: {
    // 获取上一首音乐
    nextMusic() {
      this.playListMusicArr.length - 1 < this.currentIndex &&
        this.currentIndex++;
      return this.getCurrentMusic;
    },
    // 获取下一首音乐
    lastMusic() {
      this.currentIndex > 0 && this.currentIndex--;
      return this.getCurrentMusic;
    },
    setPlaySongList(musicList: Music[]) {
      this.playListMusicArr = musicList;
      this.currentIndex = 0;
    },
    // 添加歌曲到歌单
    addMusicToPlaySongList(music: Music[]) {
      this.playListMusicArr.splice(this.currentIndex, 0, music);
    },
    async getAllMusicUrl(music: Music) {
      const url = this.currentMusicUrlArr.filter(
        value => value.musicId === music.id
      );
      // 判断是否有缓存
      if (url.length === 0) {
        return new Promise<MusicUrl[]>((resolve, reject) => {
          getMusicUrl(music.id.toString())
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
    async getOneMusicUrl(music: Music) {
      const number = this.currentMusicUrlArr.findIndex(
        value => value.musicId === music.id
      );
      // 判断是否有缓存
      if (number === -1) {
        return new Promise<MusicUrl>((resolve, reject) => {
          getMusicUrl(music.id.toString())
            .then(res => {
              if (res.code === "200") {
                this.currentMusicUrlArr.push(res.data);
                resolve(res.data[0]);
              } else {
                resolve(res.data[0]);
              }
            })
            .catch(error => {
              reject(error);
            });
        });
      } else {
        return this.currentMusicUrlArr[number];
      }
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
    }
  }
});

export function usePlaySongListStoreHook() {
  return userPlaySongList(store);
}
