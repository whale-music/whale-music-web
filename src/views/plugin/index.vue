<template>
  <div>
    <div class="ml-4">
      <h2>插件</h2>
      <div class="search">
        <div class="input-box">
          <el-input
            size="large"
            v-model="pluginSearch"
            placeholder="Please input"
            class="plugin-input-with-select"
          />
          <el-button type="primary" size="large">搜索</el-button>
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
    <div class="plugin-grid" v-if="this.isPluginListShow">
      <div
        class="plugin-show"
        v-for="(i, index) in pluginList"
        :key="i.id"
        @contextmenu="onContextMenu($event, i.id, index)"
      >
        <div class="flex justify-between">
          <h3>{{ i.pluginName }}</h3>
          <div class="flex items-center">
            <el-icon
              :size="25"
              class="cursor-pointer"
              style="color: var(--el-bg-color)"
            >
              <a @click="toRunPlugin(i.id)">
                <Icon icon="mingcute:play-fill" />
              </a>
            </el-icon>
            <el-button link type="primary" @click="toEditCode(i)">
              编辑
            </el-button>
          </div>
        </div>
        <p class="text-xs font-bold text-neutral-500">{{ i.createName }}</p>
        <p>
          {{ i.description }}
        </p>
      </div>
    </div>
    <div v-else>
      <el-empty>
        <el-button type="primary">新建</el-button>
      </el-empty>
    </div>
  </div>
</template>

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

export default {
  setup() {
    return {};
  },
  components: {
    Icon,
    Wbutton
  },
  mounted() {
    getPluginList().then(res => {
      if (res.data.length == 0) {
        this.isPluginListShow = false;
        return;
      }
      this.pluginList = res.data;
      this.isPluginListShow = true;
    });
  },
  methods: {
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
    }
  },
  data() {
    return {
      router: useRouter(),
      pluginSearch: "",
      isPluginListShow: false,
      pluginList: [] as PropType<(PluginList | number)[]>,
      deletePlugin: false,
      tempDeletePlugin: null,
      tempDeleteIndex: null,
      showDialogFlag: false,
      pluginInfo: {} as PropType<PluginList | number>
    };
  }
};
</script>

<style lang="scss" scoped>
.input-box {
  display: flex;
  margin-right: 0;
  align-items: center;
}

.search {
  display: flex;
  justify-content: space-between;
}

.plugin-input-with-select {
  width: 28rem;
  height: 2.8rem;
  margin-right: 1rem;
}

.plugin-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(15rem, 1fr));
}

.plugin-show {
  height: 10rem;
  border-radius: 1rem;
  border: 1px solid var(--el-color-primary-light-3);
  padding: 1rem;
  margin: 1rem;
  background-color: var(--el-color-primary-light-5);
}

/* 选择框样式，没有生效 */
:deep(.el-dialog) {
  border-radius: 1rem !important;
}
</style>
