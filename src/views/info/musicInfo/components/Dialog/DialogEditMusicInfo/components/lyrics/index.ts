import { saveOrUpdateLyric } from "@/api/music";
import { message } from "@/utils/message";

export const updateLyric = async (id: number, type: string, lyric: string) => {
  try {
    const r = await saveOrUpdateLyric(id, type, lyric);
    if (r.code === "200") {
      message("更新成功", { type: "success" });
    } else {
      message(`更新失败${r.message}`, { type: "error" });
    }
  } catch (e) {
    message(`更新失败${e}`, { type: "error" });
  }
};
