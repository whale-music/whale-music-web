<script lang="ts">
import { Icon } from "@iconify/vue";
import ContextMenu from "@imengyu/vue3-context-menu";
import { ElMessageBox } from "element-plus";
import { defineComponent } from "vue";
import { useRouter } from "vue-router";

import { getEnabledPluginStatus } from "@/api/config";
import {
  deletePlugin,
  getPluginList,
  PluginList,
  savePluginInfo
} from "@/api/plugin";
import Wbutton from "@/components/button/index.vue";
import ShowLoading from "@/components/ShowLoading/ShowLoading.vue";
import { message } from "@/utils/message";

export default defineComponent({
  components: {
    ShowLoading,
    Icon,
    Wbutton
  },
  setup() {
    return {};
  },
  data() {
    return {
      router: useRouter(),
      pluginSearch: "",
      isPluginListShow: false,
      pluginListLoadingFlag: false,
      pluginList: [] as PropType<(PluginList | number)[]>,
      deletePlugin: false,
      tempDeletePlugin: null,
      tempDeleteIndex: null,
      showDialogFlag: false,
      pluginInfo: {} as PropType<PluginList | number>
    };
  },
  mounted() {
    this.isEnabledPlugin();
  },
  methods: {
    async isEnabledPlugin() {
      const enablePlugin = await getEnabledPluginStatus();
      if (enablePlugin.data) {
        this.initPluginList();
      } else {
        const enablePluginStr = "插件未启动";
        message(enablePluginStr, { type: "error" });
        ElMessageBox.alert(enablePluginStr, "提示", {
          confirmButtonText: "首页",
          callback: () => {
            this.$router.push({
              path: "/"
            });
          }
        });
      }
    },
    initPluginList(name?: string) {
      this.pluginListLoadingFlag = true;
      getPluginList(null, name)
        .then(res => {
          this.pluginListLoadingFlag = false;
          if (res.data.length == 0) {
            this.isPluginListShow = false;
            return;
          }
          this.pluginList = res.data;
          this.isPluginListShow = true;
        })
        .catch(reason => {
          this.pluginListLoadingFlag = false;
          message(`请求错误${reason}`, { type: "error" });
        });
    },
    creatPlugin() {
      savePluginInfo(this.pluginInfo)
        .then(res => {
          if (res.code === "200") {
            message(`${this.pluginInfo.pluginName}保存成功`, {
              type: "success"
            });
            this.pluginList.push(res.data);
            this.pluginInfo = {};
          } else {
            message(`保存失败${res.message}`, { type: "error" });
          }
          this.showDialogFlag = false;
        })
        .catch(reason => {
          this.showDialogFlag = false;
          message(`${this.pluginInfo.pluginName}保存失败: ${reason}`, {
            type: "error"
          });
        });
    },
    toEditCode(pluginInfo: PluginList) {
      this.$router.push({
        path: "/plugin/addPlugin",
        query: { id: pluginInfo.id }
      });
    },
    toRunPlugin(id: number) {
      this.router.push({
        path: "/plugin/runPlugin",
        query: { id: id }
      });
    },
    async deletePluginMethod() {
      try {
        const r = await deletePlugin(this.tempDeletePlugin);
        if (r.code === "200") {
          message("删除成功", { type: "success" });
          this.pluginList.splice(this.tempDeleteIndex, 1);
        } else {
          message(`删除失败${r.message}`, { type: "error" });
        }
      } catch (e) {
        message(`请求失败${e}`, { type: "error" });
      }
    },
    // 右键菜单
    onContextMenu(e: MouseEvent, id: number, index: number) {
      //prevent the browser's default menu
      e.preventDefault();
      //show our menu
      ContextMenu.showContextMenu({
        x: e.x,
        y: e.y,
        items: [
          {
            label: "删除插件",
            onClick: () => {
              this.deletePlugin = true;
              this.tempDeletePlugin = id;
              this.tempDeleteIndex = index;
            }
          }
        ]
      });
    },
    showPluginTypeText(type: string) {
      switch (type) {
        case "common-plugin":
          return "普通插件";
        case "interactive-plugin":
          return "聚合插件";
      }
    },
    showPluginTypeColor(type: string) {
      switch (type) {
        case "common-plugin":
          return "";
        case "interactive-plugin":
          return "warning";
      }
    }
  }
});
</script>
<template>
  <div>
    <div class="ml-4">
      <h2>插件</h2>
      <div class="search-line">
        <div class="input-box">
          <el-input
            v-model="pluginSearch"
            size="large"
            placeholder="输入搜索插件名"
            class="plugin-input-with-select"
            @keydown.enter="initPluginList(pluginSearch)"
          >
            <template #suffix>
              <IconifyIconOnline
                v-show="pluginSearch != null && pluginSearch !== ''"
                class="cursor-pointer"
                icon="solar:close-circle-outline"
                width="1rem"
                height="1rem"
                @click="
                  () => {
                    initPluginList();
                    pluginSearch = '';
                  }
                "
              />
            </template>
          </el-input>
          <el-button
            type="primary"
            size="large"
            @click="initPluginList(pluginSearch)"
            >搜索</el-button
          >
        </div>
        <el-button
          type="primary"
          size="large"
          class="mr-4"
          @click="showDialogFlag = true"
          >新建</el-button
        >
        <el-dialog v-model="showDialogFlag" width="30%" center>
          <el-form
            label-position="top"
            label-width="100px"
            :model="pluginInfo"
            style="max-width: 460px"
          >
            <el-form-item label="插件名">
              <el-input v-model="pluginInfo.pluginName" />
            </el-form-item>
            <el-form-item label="作者">
              <el-input v-model="pluginInfo.createName" />
            </el-form-item>
            <el-form-item label="插件描述">
              <el-input v-model="pluginInfo.description" />
            </el-form-item>
            <el-form-item label="插件类型">
              <el-select v-model="pluginInfo.type" placeholder="选择插件类型">
                <el-option label="普通插件" value="common-plugin" />
                <el-option label="聚合插件" value="interactive-plugin" />
              </el-select>
            </el-form-item>
          </el-form>
          <Wbutton type="primary" @click="creatPlugin">创建</Wbutton>
        </el-dialog>
      </div>
    </div>
    <el-dialog v-model="deletePlugin" width="30%">
      <template #header>
        <h1>确定删除吗？</h1>
      </template>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deletePlugin = false">否</el-button>
          <el-button
            type="primary"
            @click="
              () => {
                deletePlugin = false;
                deletePluginMethod();
              }
            "
          >
            是
          </el-button>
        </span>
      </template>
    </el-dialog>
    <ShowLoading :loading="pluginListLoadingFlag" />
    <div v-if="isPluginListShow && !pluginListLoadingFlag" class="plugin-grid">
      <div
        v-for="(i, index) in pluginList"
        :key="i.id"
        class="plugin-show"
        @contextmenu="onContextMenu($event, i.id, index)"
      >
        <div class="flex justify-between mb-4">
          <div class="flex flex-nowrap items-center">
            <IconifyIconOnline
              class="cursor-pointer"
              style="color: var(--el-color-primary)"
              icon="solar:plug-circle-bold-duotone"
              width="3rem"
              height="3rem"
            />
            <el-tag :type="showPluginTypeColor(i.type)" round>
              {{ showPluginTypeText(i.type) }}
            </el-tag>
          </div>
          <div class="flex items-center">
            <el-icon :size="25" class="cursor-pointer icon">
              <a @click="toRunPlugin(i.id)">
                <Icon icon="mingcute:play-fill" />
              </a>
            </el-icon>
            <el-icon :size="25" class="icon">
              <router-link :to="{ name: 'ScheduleEdit', query: { id: i.id } }">
                <Icon icon="mingcute:time-fill" />
              </router-link>
            </el-icon>
            <el-button link type="primary" @click="toEditCode(i)">
              编辑
            </el-button>
          </div>
        </div>
        <h3 class="w-[7rem] truncate">{{ i.pluginName }}</h3>
        <p class="text-xs font-bold text-neutral-500">{{ i.createName }}</p>
        <p class="h-5 truncate">
          {{ i.description }}
        </p>
      </div>
    </div>
    <div v-show="!isPluginListShow && !pluginListLoadingFlag">
      <el-empty>
        <el-button type="primary">新建</el-button>
      </el-empty>
    </div>
  </div>
</template>
<style lang="scss" scoped>
@import url("@/style/element/input.scss");

.input-box {
  display: flex;
  align-items: center;
  min-width: 10rem;
  margin-right: 0;
}

.search-line {
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
}

.plugin-input-with-select {
  width: 28rem;
  height: 2.8rem;
  margin-right: 1rem;
}

.plugin-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
}

.plugin-show {
  height: 10rem;
  padding: 1rem;
  margin: 1rem;
  background-color: var(--el-color-info-light-9);
  border: 1px solid var(--el-border);
  border-radius: 1rem;
}

/* 选择框样式，没有生效 */
:deep(.el-dialog) {
  border-radius: 1rem !important;
}

.icon {
  color: var(--el-color-primary);
}

.icon:hover {
  color: var(--el-color-primary-light-3);
}
</style>
