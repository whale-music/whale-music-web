import { ElMessage, ElMessageBox } from "element-plus";
import { ref } from "vue";

import { deleteAlbum } from "@/api/album";
import { deleteMusic } from "@/api/music";
import { deleteArtist } from "@/api/singer";
import { message } from "@/utils/message";

const confirmButtonText = "删除";
const confirmDeleteText = "强制删除";

export async function removeMusic(ids: number[], onSubmit: () => void) {
  const isForceDeleteFlag = ref(false);
  await ElMessageBox.confirm(
    "正在删除音乐，需要退出直接点击关闭",
    confirmButtonText,
    {
      confirmButtonText: confirmButtonText,
      cancelButtonText: "返回",
      message: () => {
        return (
          <>
            <h3>如果歌曲绑定歌单则会删除失败</h3>
            <el-tooltip
              effect="dark"
              content="<b>该操作会强制删除<b class='text-rose-800'>歌曲</b>歌单数据</b>"
              raw-content
            >
              <el-checkbox
                v-model={isForceDeleteFlag.value}
                label={confirmDeleteText}
                size="large"
              />
            </el-tooltip>
          </>
        );
      },
      beforeClose: async (action, instance, done) => {
        if (action === "confirm") {
          instance.confirmButtonLoading = true;
          instance.confirmButtonText = "Loading...";
          try {
            const res = await deleteMusic(ids, isForceDeleteFlag.value);
            if (res.code === "200") {
              message("删除成功", { type: "success" });
              onSubmit();
              done();
            }
          } finally {
            instance.confirmButtonText = confirmButtonText;
            instance.confirmButtonLoading = false;
          }
        } else {
          done();
        }
      }
    }
  ).catch(() => {});
}
export async function removeAlbum(ids: number[], onSubmit: () => void) {
  const isForceDeleteFlag = ref(false);
  await ElMessageBox.confirm(
    "正在删除专辑，需要退出直接点击关闭",
    confirmButtonText,
    {
      confirmButtonText: confirmButtonText,
      cancelButtonText: "返回",
      message: () => {
        return (
          <>
            <h3>如果歌曲绑定歌单则会删除失败</h3>
            <el-tooltip
              effect="dark"
              content="<b>该操作会强制删除<b class='text-rose-800'>专辑</b>音乐</b>"
              raw-content
            >
              <el-checkbox
                v-model={isForceDeleteFlag.value}
                label={confirmDeleteText}
                size="large"
              />
            </el-tooltip>
          </>
        );
      },
      beforeClose: async (action, instance, done) => {
        if (action === "confirm") {
          instance.confirmButtonLoading = true;
          instance.confirmButtonText = "Loading...";
          try {
            const res = await deleteAlbum(ids, isForceDeleteFlag.value);
            if (res.code === "200") {
              message("删除成功", { type: "success" });
              onSubmit();
              done();
            }
          } finally {
            instance.confirmButtonText = confirmButtonText;
            instance.confirmButtonLoading = false;
          }
        } else {
          done();
        }
      }
    }
  ).catch(() => {});
}

export async function removeArtist(ids: number[], onSubmit: () => void) {
  ElMessageBox.confirm("正在删除歌曲", {
    confirmButtonText: confirmButtonText,
    cancelButtonText: "Cancel"
  })
    .then(async () => {
      const res = await deleteArtist(ids);
      if (res.code === "200") {
        message("删除成功", { type: "success" });
        onSubmit();
      }
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "Delete canceled"
      });
    });
}
