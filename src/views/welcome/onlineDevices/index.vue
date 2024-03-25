<script setup lang="ts">
import { ActivityDeviceRes, getActivityDevice } from "@/api/devices";
import { onMounted, ref } from "vue";
import DevicesList from "@/views/welcome/onlineDevices/components/index.vue";
import { TabsPaneContext } from "element-plus";
import { transformI18n } from "@/plugins/i18n";

const devicesData = ref<ActivityDeviceRes>({
  nMusicDevices: [],
  subsonicDevices: [],
  adminDevices: [],
  webdavDevices: []
});

const init = async () => {
  const r = await getActivityDevice();
  devicesData.value = r.data;
};

const activeName = ref("admin");
const handleClick = (tab: TabsPaneContext, event: Event) => {
  // console.log(tab, event);
};

onMounted(() => {
  init();
});
</script>

<template>
  <div>
    <h1 class="">{{ transformI18n("menus.onlineDevices") }}</h1>
    <el-alert
      title="目前只实现了admin与NMusic"
      description="带有refresh是刷新token缓存"
      type="warning"
      :closable="false"
      show-icon
    />
    <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
      <el-tab-pane label="Admin" name="admin">
        <DevicesList v-model="devicesData.adminDevices" @onSubmit="init" />
      </el-tab-pane>
      <el-tab-pane label="NMusic" name="nMusic">
        <DevicesList v-model="devicesData.nMusicDevices" @onSubmit="init" />
      </el-tab-pane>
      <el-tab-pane label="Subsonic" name="subsonic">
        <DevicesList v-model="devicesData.subsonicDevices" @onSubmit="init" />
      </el-tab-pane>
      <el-tab-pane label="Webdav" name="webdav">
        <DevicesList v-model="devicesData.webdavDevices" @onSubmit="init" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
