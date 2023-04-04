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
        <el-button type="primary" size="large" class="mr-4">新建</el-button>
      </div>
    </div>
    <div class="plugin-grid" v-if="this.isPluginListShow">
      <div class="plugin-show" v-for="i in pluginList" :key="i.id">
        <div class="flex justify-between">
          <h3>{{ i.pluginName }}</h3>
          <div class="flex items-center">
            <el-icon :size="20" class="cursor-pointer">
              <Icon icon="ep:caret-right" />
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
import { getPluginList } from "@/api/plugin";
import { Icon } from "@iconify/vue";

export default {
  setup() {
    return {};
  },
  components: {
    Icon
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
    toEditCode(pluginInfo) {
      this.$router.push({
        path: "/plugin/addPlugin",
        query: { id: pluginInfo.id }
      });
      console.log(`to router ${pluginInfo.id}`);
    }
  },
  data() {
    return {
      pluginSearch: "",
      isPluginListShow: false,
      pluginList: []
    };
  }
};
</script>

<style scoped>
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
</style>
