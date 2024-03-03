import { onMounted, ref } from "vue";

import { emitter } from "@/utils/mitt";

export function useDialog() {
  const widthRef = ref<string>();
  onMounted(() => {
    const width =
      window.innerWidth ||
      document.documentElement.clientWidth ||
      document.body.clientWidth;
    reDrawLayout(width);
  });
  // 监听容器
  emitter.on("resize", ({ detail }) => {
    const { width } = detail;
    reDrawLayout(width);
  });

  function reDrawLayout(width: number) {
    if (width <= 720) {
      widthRef.value = "90%";
    } else {
      widthRef.value = "40%";
    }
  }
  return {
    widthRef
  };
}
