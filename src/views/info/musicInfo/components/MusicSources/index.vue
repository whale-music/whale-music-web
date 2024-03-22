<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { message } from "@/utils/message";
import { usePlaySongListStoreHook } from "@/store/modules/playSongList";
import axios from "axios";
import { downloadByData, useCopyToClipboard } from "@pureadmin/utils";
import { deleteSourceMusic, MusicDetailInfo, MusicSources } from "@/api/music";
import PlayStreamBold from "@iconify-icons/solar/play-stream-bold";
import { useNav } from "@/layout/hooks/useNav";
import { ref, unref } from "vue";
import DialogEditSource from "@/views/info/musicInfo/components/Dialog/DialogEditSource/index.vue";
import { ElMessageBox } from "element-plus";
import { StringUtils } from "@/utils/ObjectsUtil";

defineOptions({
  name: "MusicSources"
});

const { onPlayMusic } = useNav();

const musicInfo = defineModel<MusicDetailInfo>();
const emits = defineEmits(["onSubmit"]);

const onSubmit = () => {
  emits("onSubmit");
};

const toMusicPlay = async res => {
  if (StringUtils.isBlank(res.url)) {
    message(`该音源无效`, { type: "error" });
    return;
  }
  try {
    await usePlaySongListStoreHook().playSongList(musicInfo.value.id);
  } catch (e) {
    message(e, { type: "error" });
    return;
  }
  onPlayMusic();
};

const iconColor = (val: string) => {
  return StringUtils.isBlank(val) ? "#7d7d7d" : "#626aef";
};

const iconTip = (val: string) => {
  return StringUtils.isBlank(val) ? "不可播放" : "可播放";
};

function copy(value: string) {
  const { clipboardValue, copied } = useCopyToClipboard();
  if (StringUtils.isBlank(value)) {
    message("空地址", { type: "error" });
    return;
  }
  clipboardValue.value = unref(value);
  if (copied.value) {
    message("拷贝成功", { type: "success" });
  }
}

const download = (suffix, url) => {
  axios
    .get(url, {
      responseType: "blob"
    })
    .then(({ data }) => {
      downloadByData(data, `${musicInfo.value.musicName}.${suffix}`);
    });
};

function DropdownMusic() {
  const editSourceFlag = ref<boolean>(false);
  const editSourceValue = ref<MusicSources>({
    createTime: "",
    encodeType: "",
    id: undefined,
    level: "",
    md5: "",
    musicId: undefined,
    path: "",
    rate: undefined,
    size: undefined,
    updateTime: "",
    url: "",
    userId: undefined
  });
  const editSource = async (url: MusicSources) => {
    editSourceFlag.value = true;
    editSourceValue.value = url;
  };

  const deleteSource = async (id: number) => {
    ElMessageBox.confirm("是否删除音源, 该操作只会删除数据库中文件.", "确认", {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "error"
    })
      .then(async () => {
        const r = await deleteSourceMusic(id);
        if (r.code === "200") {
          message("删除成功", { type: "success" });
          onSubmit();
        } else {
          message(`删除失败${r.message}`, { type: "success" });
        }
      })
      .catch(e => {});
  };
  return {
    editSourceFlag,
    editSourceValue,
    deleteSource,
    editSource
  };
}

const { deleteSource, editSource, editSourceValue, editSourceFlag } =
  DropdownMusic();
</script>

<template>
  <div>
    <DialogEditSource v-model="editSourceFlag" :source="editSourceValue" />
    <div v-for="(item, index) in musicInfo.sources" :key="index">
      <div
        class="flex flex-nowrap content-center justify-between items-center w-full h-[3.6rem] bg-[var(--el-bg-color)] rounded-2xl"
      >
        <div
          class="ml-4 flex items-center h-full cursor-pointer gap-2"
          @click="toMusicPlay(item)"
        >
          <span class="text-[var(--el-color-info-light-3)]">
            {{ index + 1 }}
          </span>
          <span class="font-bold lg:w-full w-44 truncate">
            {{ musicInfo.musicName }}
          </span>
          <span class="text-[var(--el-color-info-light-3)] hidden md:inline">
            {{ item.md5 }}
          </span>
        </div>
        <!-- 占位元素 -->
        <div class="grow h-full cursor-pointer" @click="toMusicPlay(item)" />
        <div class="flex items-center justify-center mr-8 gap-2">
          <span class="font-medium text-[#a2a2a2]">{{ item.level }}</span>
          <el-tooltip
            class="box-item"
            effect="dark"
            :content="iconTip(item.url)"
          >
            <IconifyIconOffline
              :icon="PlayStreamBold"
              :style="{ color: iconColor(item.url) }"
              width="2rem"
              height="2rem"
            />
          </el-tooltip>
          <div class="flex items-center">
            <el-button round class="mr-4" @click="copy(item.url)">
              复制
            </el-button>
            <el-link :underline="false">
              <el-dropdown>
                <el-icon :size="20" class="cursor-pointer">
                  <Icon icon="ep:more-filled" />
                </el-icon>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item
                      @click="download(item.encodeType, item.url)"
                      >下载音源
                    </el-dropdown-item>
                    <el-dropdown-item @click="editSource(item)"
                      >编辑音源
                    </el-dropdown-item>
                    <el-dropdown-item @click="deleteSource(item.id)"
                      >删除音源
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </el-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
