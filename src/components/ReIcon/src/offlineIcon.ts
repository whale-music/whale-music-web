import { addIcon } from "@iconify/vue/dist/offline";
/**
 * 这里存放本地图标，在 src/layout/index.vue 文件中加载，避免在首启动加载
 */
// 本地菜单图标，后端在路由的icon中返回对应的图标字符串并且前端在此处使用addIcon添加即可渲染菜单图标
// @iconify-icons/ep
import Menu from "@iconify-icons/ep/menu";
import Edit from "@iconify-icons/ep/edit";
import SetUp from "@iconify-icons/ep/set-up";
import Guide from "@iconify-icons/ep/guide";
import Monitor from "@iconify-icons/ep/monitor";
import Lollipop from "@iconify-icons/ep/lollipop";
import Histogram from "@iconify-icons/ep/histogram";
import HomeFilled from "@iconify-icons/ep/home-filled";
import UserFilled from "@iconify-icons/ep/user-filled";
addIcon("ep:menu", Menu);
addIcon("ep:edit", Edit);
addIcon("ep:set-up", SetUp);
addIcon("ep:guide", Guide);
addIcon("ep:monitor", Monitor);
addIcon("ep:lollipop", Lollipop);
addIcon("ep:histogram", Histogram);
addIcon("ep:home-filled", HomeFilled);

addIcon("ep:user-filled", UserFilled);

// @iconify-icons/ri
import Tag from "@iconify-icons/ri/bookmark-2-line";
import Ppt from "@iconify-icons/ri/file-ppt-2-line";
import Card from "@iconify-icons/ri/bank-card-line";
import Role from "@iconify-icons/ri/admin-fill";
import Info from "@iconify-icons/ri/file-info-line";
import Dept from "@iconify-icons/ri/git-branch-line";
import Table from "@iconify-icons/ri/table-line";
import Search from "@iconify-icons/ri/search-line";
import FlUser from "@iconify-icons/ri/admin-line";
import Setting from "@iconify-icons/ri/settings-3-line";
import Artboard from "@iconify-icons/ri/artboard-line";
import ListCheck from "@iconify-icons/ri/list-check";
import UbuntuFill from "@iconify-icons/ri/ubuntu-fill";
import InformationLine from "@iconify-icons/ri/information-line";
import TerminalWindowLine from "@iconify-icons/ri/terminal-window-line";
import CheckboxCircleLine from "@iconify-icons/ri/checkbox-circle-line";
addIcon("ri:bookmark-2-line", Tag);
addIcon("ri:file-ppt-2-line", Ppt);
addIcon("ri:bank-card-line", Card);
addIcon("ri:admin-fill", Role);
addIcon("ri:file-info-line", Info);
addIcon("ri:git-branch-line", Dept);
addIcon("ri:table-line", Table);
addIcon("ri:search-line", Search);
addIcon("ri:admin-line", FlUser);
addIcon("ri:settings-3-line", Setting);
addIcon("ri:artboard-line", Artboard);
addIcon("ri:list-check", ListCheck);
addIcon("ri:ubuntu-fill", UbuntuFill);
addIcon("ri:information-line", InformationLine);
addIcon("ri:terminal-window-line", TerminalWindowLine);
addIcon("ri:checkbox-circle-line", CheckboxCircleLine);

// @iconify-icons/solar
import Playlist2Bold from "@iconify-icons/solar/playlist-2-bold";
import MusicLibrary2BoldDuotone from "@iconify-icons/solar/music-library-2-bold-duotone";
import BoxMinimalisticBold from "@iconify-icons/solar/box-minimalistic-bold";
import UserBoldDuotone from "@iconify-icons/solar/user-bold-duotone";
import PlaylistMinimalistic2BoldDuotone from "@iconify-icons/solar/playlist-minimalistic-2-bold-duotone";
import HistoryBold from "@iconify-icons/solar/history-bold";
import VideocameraRecordBoldDuotone from "@iconify-icons/solar/videocamera-record-bold-duotone";
import FolderWithFilesBold from "@iconify-icons/solar/folder-with-files-bold";
import TestTubeMinimalisticBoldDuotone from "@iconify-icons/solar/test-tube-minimalistic-bold-duotone";
import CalendarMarkBoldDuotone from "@iconify-icons/solar/calendar-mark-bold-duotone";
import AlarmBoldDuotone from "@iconify-icons/solar/alarm-bold-duotone";
import DevicesBold from "@iconify-icons/solar/devices-bold";
addIcon("solar:playlist-2-bold", Playlist2Bold);
addIcon("solar:music-library-2-bold-duotone", MusicLibrary2BoldDuotone);
addIcon("solar:box-minimalistic-bold", BoxMinimalisticBold);
addIcon("solar:user-bold-duotone", UserBoldDuotone);
addIcon(
  "solar:playlist-minimalistic-2-bold-duotone",
  PlaylistMinimalistic2BoldDuotone
);
addIcon("solar:history-bold", HistoryBold);
addIcon("solar:videocamera-record-bold-duotone", VideocameraRecordBoldDuotone);
addIcon("solar:folder-with-files-bold", FolderWithFilesBold);
addIcon(
  "solar:test-tube-minimalistic-bold-duotone",
  TestTubeMinimalisticBoldDuotone
);
addIcon("solar:calendar-mark-bold-duotone", CalendarMarkBoldDuotone);
addIcon("solar:alarm-bold-duotone", AlarmBoldDuotone);
addIcon("solar:devices-bold", DevicesBold);

// @iconify-icons/mingcute
import Home3Fill from "@iconify-icons/mingcute/home-3-fill";
import AlbumLine from "@iconify-icons/mingcute/album-line";
import Plugin2Fill from "@iconify-icons/mingcute/plugin-2-fill";
import Alarm2Fill from "@iconify-icons/mingcute/alarm-2-fill";
addIcon("mingcute:home-3-fill", Home3Fill);
addIcon("mingcute:album-line", AlbumLine);
addIcon("mingcute:plugin-2-fill", Plugin2Fill);
addIcon("mingcute:alarm-2-fill", Alarm2Fill);
