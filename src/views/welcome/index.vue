<script setup lang="ts">
import { ref, reactive } from "vue";
import { Icon } from "@iconify/vue";
import { message } from "@/utils/message";
import { getSelectAlbumList, selectAlbum } from "@/api/album";
import { SingerRes, getArtistListByAlbumId } from "@/api/singer";
import LyricSVG from "@/assets/svg/lyric.svg?component";
defineOptions({
  name: "Welcome"
});

const musicInfo = reactive<MusicInfo>({
  musicName: "",
  musicAliasName: "",
  singerId: [],
  artistName: [],
  albumId: null,
  albumName: "",
  pic: "",
  timeLength: 0
});

interface MusicInfo {
  musicName: string;
  musicAliasName: string;
  singerId: Array<number>;
  artistName: Array<string>;
  albumId: number;
  albumName: string;
  pic: string;
  timeLength: number;
}

const uploadFlag = ref<boolean>(false);
const albumPic = ref<string>();

const musicTempUrl = ref("");
const artistList = ref<SingerRes[]>([]);

const querySearchAsync = (queryString: string, cb: (arg: any) => void) => {
  getSelectAlbumList(queryString).then(res => {
    cb(res.data);
  });
};

// ev: Event
const albumInputClear = () => {
  // 删除输入框名
  musicInfo.albumName = "";
  // 删除歌手显示
  artistList.value = [];
  // 删除专辑信息
  albumPic.value = "";
};

const handleSelect = (item: selectAlbum) => {
  musicInfo.albumId = Number(item.link);
  albumPic.value = item.pic;
  // 获取专辑下所有歌手
  getArtistListByAlbumId(musicInfo.albumId).then(res => {
    artistList.value = res.data;
  });
};

// 上传音乐
const uploadSuccess = (
  response: any
  // uploadFile: UploadFile,
  // uploadFiles: UploadFiles
) => {
  if (response.code !== "200") {
    message(response.message, { type: "error" });
  } else {
    uploadFlag.value = true;
    musicInfo.albumName = response.data.albumName;
    musicInfo.musicName = response.data.musicName;
    musicInfo.timeLength = response.data.timeLength;
    musicTempUrl.value = `http://localhost:8000/admin/music/get/temp/${response.data.musicFileTemp}`;
  }
  console.log(response);
};
</script>

<template>
  <div class="welcome">
    <div class="box upload">
      <div v-if="uploadFlag" class="w-full top">
        <el-icon :size="20" class="ml-3" @click="uploadFlag = !uploadFlag">
          <Icon icon="ep:delete-filled" />
        </el-icon>
        <span class="mr-3">{{ musicInfo.albumName }}</span>
      </div>
      <el-upload
        v-if="!uploadFlag"
        class="upload-music"
        :on-success="uploadSuccess"
        drag
        action="http://localhost:8000/admin/music/upload/file"
        multiple
      >
        <el-icon :size="80">
          <Icon icon="ep:upload-filled" />
        </el-icon>
        <div class="el-upload__text">
          Drop file here or <em>click to upload</em>
        </div>
        <template #tip>
          <div class="text-center el-upload__tip">
            上传音乐后缀名限定<b>mp3</b>,<b>ogg</b>,<b>flac</b>
          </div>
        </template>
      </el-upload>
      <img
        v-if="uploadFlag"
        class="rounded-md shadow-2xl"
        src="https://p4.music.126.net/JB_tX_b1VMtRA00XjHRnNg==/109951165375410549.jpg"
        alt="网络错误"
        width="100"
        height="100"
      />
      <div v-if="uploadFlag">
        <!-- <p v-show="musicInfo.">{{ musicInfo.musicName }}</p> -->
        <p class="text-center play-singer">{{ musicInfo.artistName }}</p>
      </div>
      <audio v-if="uploadFlag" :src="musicTempUrl" controls preload="auto" />
    </div>
    <div class="box info">
      <div class="info-box music-name">
        <div class="flex flex-row-reverse">
          <el-button type="success">提交</el-button>
        </div>
        <div>
          <p>音乐名</p>
          <div class="flex">
            <el-input
              class="input-text"
              v-model="musicInfo.musicName"
              placeholder="Please input"
            />

            <Transition name="slide-fade"
              ><el-input
                v-show="musicInfo.musicName !== ''"
                class="input-text"
                v-model="musicInfo.musicAliasName"
                placeholder="请输入音乐别名"
              />
            </Transition>
          </div>
        </div>

        <div>
          <p>音乐封面地址</p>
          <el-input
            class="input-text"
            v-model="musicInfo.pic"
            placeholder="Please input"
          />
        </div>

        <div>
          <p>文件MD5</p>
          <el-input
            class="input-text"
            v-model="musicInfo.pic"
            placeholder="Please input"
          />
        </div>

        <div class="flex">
          <div>
            <p>音乐时长</p>
            <el-input
              class="input-text"
              v-model="musicInfo.pic"
              placeholder="Please input"
            />
          </div>

          <div>
            <p>文件大小</p>
            <el-input
              class="input-text"
              v-model="musicInfo.pic"
              placeholder="Please input"
            />
          </div>
        </div>

        <div class="upload-lyric">
          <div>
            <el-button color="#d9dcff"><LyricSVG />上传普通歌词</el-button>
          </div>
          <div>
            <el-button color="#d9dcff"><LyricSVG />上传逐字歌词</el-button>
          </div>
        </div>
      </div>
      <div class="info-box album-singer">
        <div>
          <div class="flex justify-between">
            <p class="pl-1">专辑</p>
            <el-button class="mr-1" type="primary" link>添加新专辑</el-button>
          </div>
          <el-autocomplete
            class="w-full p-1"
            v-model="musicInfo.albumName"
            :fetch-suggestions="querySearchAsync"
            placeholder="请选择专辑"
            @select="handleSelect"
          >
            <template #suffix>
              <el-icon :size="18" @click="albumInputClear">
                <Icon icon="mdi:close-circle" />
              </el-icon>
            </template>
            <template #default="{ item }">
              <span class="value">{{ item.value }}</span>
              <span class="ml-4 text-blue-300">{{ item.link }}</span>
            </template>
          </el-autocomplete>
          <div
            class="album"
            v-if="albumPic !== '' && albumPic != undefined && albumPic !== null"
          >
            <img
              class="info-img"
              :src="albumPic"
              alt="网络错误"
              height="100"
              width="100"
            />
          </div>
        </div>
      </div>
      <div class="info-box artist">
        <p>歌手</p>
        <div class="artist-avatar">
          <div
            class="singerImg"
            v-for="(i, index) in artistList"
            :key="i.id"
            v-show="index <= 5"
          >
            <el-avatar size="large" :src="i.pic" />
            <p>{{ i.artistName }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.welcome {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  // flex-wrap: wrap;
  margin: 0;
}

.box {
  margin: 0rem;
}

.upload {
  flex-grow: 1;
  height: 18rem;
  width: 90%;
  // margin-left: 3rem;
  opacity: 1;
  border-radius: 14px;
  background: rgba(255, 255, 255, 1);

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
}

.upload-music {
  width: 80%;
}

.top {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.play-singer {
  color: var(--el-color-info-light-3);
}

.info {
  width: 90%;
  height: 26rem;
  opacity: 1;
  border-radius: 21px;
  // background: rgba(255, 255, 255, 1);

  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
}

.info-img {
  border-radius: 1rem;
  padding: 5px;
}

.album {
  display: flex;
  align-items: center;
  flex-direction: row;
  // justify-content: center;
  justify-content: space-around;
}

.info-box {
  height: 100%;
  margin: 1rem;
  border: 2px solid #d8d8d8ff;
  padding: 10px;

  border-radius: 25px;
  background: rgba(255, 255, 255, 1);

  flex: 0 0 20rem;
}

.input-text {
  padding: 0.25rem;
}

.infinite-list .infinite-list-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 20px;
  background: var(--el-color-primary-light-9);
  margin: 5px;
  color: var(--el-color-primary);
}

.infinite-list .infinite-list-item + .list-item {
  margin-top: 10px;
}

.slide-fade-enter-active {
  transition: all 0.5s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.5s ease-in;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

.singerImg {
  margin: 0.8rem;
  padding: 1rem;
  width: 6rem;
  text-align: center;
  border-radius: 18px;
  color: #313c6e;
  background: rgba(217, 220, 255, 0.65);
}

.artist-avatar {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
}

.upload-lyric {
  text-align: center;
  overflow: auto;
  height: 6rem;
}

.upload-lyric > div {
  display: flex;
  height: 2.8rem;
  margin: 0.1rem;
  align-items: center;
  justify-content: center;

  border: 1px dotted #626aef;
  border-radius: 10px;
}
</style>
