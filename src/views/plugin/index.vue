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
      <div class="plugin-show" v-for="i in pluginList" :key="i">
        <h3>插件1</h3>
        <p class="text-xs font-bold text-neutral-500">@Sakura</p>
        <p>
          文章开头简而得当，通过环境描写来衬托人物心情，十分艺术化。杂而不乱，能做到详略得当，重点突出。结尾恰到好处地点明中心，语言朴实而含义深刻，耐人寻味。
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
export default {
  setup() {
    return {};
  },
  data() {
    return {
      pluginSearch: "",
      isPluginListShow: true,
      pluginList: [1, 23, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4]
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
  border-radius: 1rem;
  border: 1px solid var(--el-color-primary-light-3);
  padding: 1rem;
  margin: 1rem;
  background-color: var(--el-color-primary-light-5);
}
</style>
