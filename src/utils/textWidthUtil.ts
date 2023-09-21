export function getActualWidthOfChars(text) {
  const size = 2;
  const family = `'Helvetica Neue',Helvetica,'PingFang SC','Hiragino Sans GB','Microsoft YaHei','微软雅黑',Arial,sans-serif`;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  ctx.font = `${size}rem ${family}`;
  const metrics = ctx.measureText(text);
  const actual =
    Math.abs(metrics.actualBoundingBoxLeft) +
    Math.abs(metrics.actualBoundingBoxRight);
  return Math.max(metrics.width, actual);
}
