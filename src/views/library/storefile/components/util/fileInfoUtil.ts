export const getFileTypeColor = (val: "audio" | "video" | "image"): string => {
  const causality = "--typeColor: ";
  switch (val) {
    case "audio":
      return causality + "var(--el-color-primary)";
    case "video":
      return causality + "var(--el-color-success)";
    case "image":
      return causality + "var(--el-color-warning)";
    default:
      return causality + "var(--el-color-info)";
  }
};
