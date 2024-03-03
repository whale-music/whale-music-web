import { addIcon } from "@iconify/vue/dist/offline";
/**
 * 这里存放本地图标，在 src/layout/index.vue 文件中加载，避免在首启动加载
 */
// 本地菜单图标，后端在路由的icon中返回对应的图标字符串并且前端在此处使用addIcon添加即可渲染菜单图标
import HomeFilled from "@iconify-icons/ep/home-filled";
import Lollipop from "@iconify-icons/ep/lollipop";
import Loading3Fill from "@iconify-icons/mingcute/loading-3-fill";
import InformationLine from "@iconify-icons/ri/information-line";
import ArrowLeftBold from "@iconify-icons/solar/alt-arrow-left-bold";
import ArrowRightBold from "@iconify-icons/solar/alt-arrow-right-bold";
import HeartBold from "@iconify-icons/solar/heart-bold";
import PlainBoldDuotone from "@iconify-icons/solar/plain-bold-duotone";
import Playlist2Bold from "@iconify-icons/solar/playlist-2-bold";

addIcon("homeFilled", HomeFilled);
addIcon("informationLine", InformationLine);
addIcon("lollipop", Lollipop);
addIcon("loading3Fill", Loading3Fill);
addIcon("arrowLeftBold", ArrowLeftBold);
addIcon("arrowRightBold", ArrowRightBold);
addIcon("playlist2Bold", Playlist2Bold);
addIcon("heartBold", HeartBold);
addIcon("plainBoldDuotone", PlainBoldDuotone);
