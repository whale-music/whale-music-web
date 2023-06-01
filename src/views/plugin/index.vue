<script lang="ts">
import {
  deletePlugin,
  getPluginList,
  PluginList,
  savePluginInfo
} from "@/api/plugin";
import { Icon } from "@iconify/vue";
import { useRouter } from "vue-router";
import ContextMenu from "@imengyu/vue3-context-menu";
import { message } from "@/utils/message";
import Wbutton from "@/components/button/index.vue";
import ShowLoading from "@/components/ShowLoading/ShowLoading.vue";
import { defineComponent } from "vue";

export default defineComponent({
  setup() {
    return {};
  },
  components: {
    ShowLoading,
    Icon,
    Wbutton
  },
  mounted() {
    this.initPluginList();
  },
  methods: {
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
            size="large"
            v-model="pluginSearch"
            placeholder="输入搜索插件名"
            class="plugin-input-with-select"
            @keydown.enter="this.initPluginList(this.pluginSearch)"
          >
            <template #suffix>
              <IconifyIconOnline
                v-show="this.pluginSearch != null && this.pluginSearch !== ''"
                @click="
                  () => {
                    this.initPluginList();
                    this.pluginSearch = '';
                  }
                "
                class="cursor-pointer"
                icon="solar:close-circle-outline"
                width="1rem"
                height="1rem"
              />
            </template>
          </el-input>
          <el-button
            @click="this.initPluginList(this.pluginSearch)"
            type="primary"
            size="large"
            >搜索</el-button
          >
        </div>
        <el-button
          type="primary"
          size="large"
          class="mr-4"
          @click="this.showDialogFlag = true"
          >新建</el-button
        >
        <el-dialog v-model="this.showDialogFlag" width="30%" center>
          <el-form
            label-position="top"
            label-width="100px"
            :model="this.pluginInfo"
            style="max-width: 460px"
          >
            <el-form-item label="插件名">
              <el-input v-model="this.pluginInfo.pluginName" />
            </el-form-item>
            <el-form-item label="作者">
              <el-input v-model="this.pluginInfo.createName" />
            </el-form-item>
            <el-form-item label="插件描述">
              <el-input v-model="this.pluginInfo.description" />
            </el-form-item>
            <el-form-item label="插件类型">
              <el-select
                v-model="this.pluginInfo.type"
                placeholder="选择插件类型"
              >
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
      <span>确定删除吗？</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deletePlugin = false">否</el-button>
          <el-button
            type="primary"
            @click="
              () => {
                this.deletePlugin = false;
                this.deletePluginMethod();
              }
            "
          >
            是
          </el-button>
        </span>
      </template>
    </el-dialog>
    <ShowLoading :loading="this.pluginListLoadingFlag" />
    <div
      class="plugin-grid"
      v-if="this.isPluginListShow && !this.pluginListLoadingFlag"
    >
      <div
        class="plugin-show"
        v-for="(i, index) in pluginList"
        :key="i.id"
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
            <el-tag :type="this.showPluginTypeColor(i.type)" round>
              {{ this.showPluginTypeText(i.type) }}
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
    <div v-show="!this.isPluginListShow && !this.pluginListLoadingFlag">
      <el-empty>
        <el-button type="primary">新建</el-button>
      </el-empty>
    </div>
  </div>
</template>
<style lang="scss" scoped>
@import "@/style/element/input.scss";

.input-box {
  display: flex;
  margin-right: 0;
  align-items: center;
  min-width: 10rem;
}

.search-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
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
  border-radius: 1rem;
  border: 1px solid var(--el-border);
  padding: 1rem;
  margin: 1rem;
  background-color: var(--el-color-info-light-9);
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
