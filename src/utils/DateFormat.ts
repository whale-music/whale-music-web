/**
 * 获取指定时间的友好时间字符串。
 * 使用
 * friendlytimejs.FriendlyTime('2018-06-04 13:20:00','2018-06-04 13:25:00');
 * 搭配day js
 * friendlytimejs.FriendlyTime('2018-06-04 13:20:00',dayjs());
 * @param str 指定的时间字符串，如yyyy-MM-dd HH:mm:ss
 * @param now 当前时间，允许时间戳，GMT时间，如果该参数为undefined，则使用浏览器时间。
 */
export const FriendlyTime = (str, now) => {
  const currentTime = new Date(now);
  const arr = str.split(/\s+/gi);
  let arr1, arr2, oldTime, delta;
  const getIntValue = function (ss, defaultValue) {
    try {
      return parseInt(ss, 10);
    } catch (e) {
      return defaultValue;
    }
  };
  const getWidthString = function (num) {
    return num < 10 ? "0" + num : num;
  };
  if (arr.length >= 2) {
    arr1 = arr[0].split(/[/-]/gi);
    arr2 = arr[1].split(":");
    oldTime = new Date();
    oldTime.setYear(getIntValue(arr1[0], currentTime.getFullYear()));
    oldTime.setMonth(getIntValue(arr1[1], currentTime.getMonth() + 1) - 1);
    oldTime.setDate(getIntValue(arr1[2], currentTime.getDate()));

    oldTime.setHours(getIntValue(arr2[0], currentTime.getHours()));
    oldTime.setMinutes(getIntValue(arr2[1], currentTime.getMinutes()));
    oldTime.setSeconds(getIntValue(arr2[2], currentTime.getSeconds()));

    delta = currentTime.getTime() - oldTime.getTime();

    if (delta <= 6000) {
      return "1分钟内";
    } else if (delta < 60 * 60 * 1000) {
      return Math.floor(delta / (60 * 1000)) + "分钟前";
    } else if (delta < 24 * 60 * 60 * 1000) {
      return Math.floor(delta / (60 * 60 * 1000)) + "小时前";
    } else if (delta < 3 * 24 * 60 * 60 * 1000) {
      return Math.floor(delta / (24 * 60 * 60 * 1000)) + "天前";
    } else if (currentTime.getFullYear() != oldTime.getFullYear()) {
      return [
        getWidthString(oldTime.getFullYear()),
        getWidthString(oldTime.getMonth() + 1),
        getWidthString(oldTime.getDate())
      ].join("-");
    } else {
      return [
        getWidthString(oldTime.getMonth() + 1),
        getWidthString(oldTime.getDate())
      ].join("-");
    }
  }
  return "";
};
