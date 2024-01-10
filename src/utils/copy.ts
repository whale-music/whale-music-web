import { unref } from "vue";
import { useCopyToClipboard } from "@pureadmin/utils";
import { message } from "@/utils/message";

export function useCopy(value: string) {
  const { clipboardValue, copied } = useCopyToClipboard();

  clipboardValue.value = unref(value);
  if (copied.value) {
    message("拷贝成功", { type: "success" });
  }
}
