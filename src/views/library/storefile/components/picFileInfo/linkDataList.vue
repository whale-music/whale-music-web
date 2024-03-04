<script lang="ts">
import AddCircleLinear from "@iconify-icons/solar/add-circle-linear";
import { defineComponent } from "vue";

export default defineComponent({
  name: "linkDataList",
  props: {
    linkData: {},
    type: String
  },
  setup() {
    return {
      AddCircleLinear
    };
  },
  data() {
    return {
      data: this.linkData
    };
  },
  watch: {},
  mounted() {},
  methods: {
    addLinkData(type: string) {
      const items = { type: type };
      this.data.push(items);
    }
  }
});
</script>

<template>
  <div>
    <div class="flex items-center justify-between mt-4 mb-4">
      <div class="flex items-center gap-2">
        <h3>关联数据</h3>
        <el-text size="large">{{ linkData.length }}</el-text>
      </div>
      <el-popover trigger="click" placement="left" :width="160">
        <div class="flex flex-col gap-1">
          <b class="mb-2">添加关联数据</b>
          <el-button type="primary" plain @click="addLinkData('music')">
            Music
          </el-button>
          <el-button type="primary" plain @click="addLinkData('playlist')">
            PlayList
          </el-button>
          <el-button type="primary" plain @click="addLinkData('album')">
            Album
          </el-button>
          <el-button
            type="primary"
            plain
            @click="addLinkData('UserBackground')"
          >
            UserBackground
          </el-button>
          <el-button type="primary" plain @click="addLinkData('UserAvatar')">
            UserAvatar
          </el-button>
          <el-button type="primary" plain @click="addLinkData('artist')">
            Artist
          </el-button>
          <el-button type="primary" plain @click="addLinkData('mv')">
            MV
          </el-button>
        </div>
        <template #reference>
          <el-button type="primary">
            添加
            <IconifyIconOffline class="ml-2" :icon="AddCircleLinear" />
          </el-button>
        </template>
      </el-popover>
    </div>
    <el-form label-position="top">
      <div>
        <el-form-item v-for="(item, index) in data" :key="item">
          <template #label>
            <h2>{{ item.type }}</h2>
            <div class="flex items-center justify-between">
              <div class="flex gap-4">
                <el-tag
                  v-if="item.id"
                  effect="dark"
                  round
                  class="text-[var(--el-color-primary)]"
                >
                  {{ item.id }}
                </el-tag>
                <el-tooltip
                  class="box-item"
                  effect="dark"
                  :content="item.name"
                  placement="top-start"
                >
                  <p class="w-40 truncate text-[var(--el-color-primary)]">
                    {{ item.name }}
                  </p>
                </el-tooltip>
              </div>
              <el-button type="danger" plain @click="data.splice(index, 1)">
                删除
              </el-button>
            </div>
          </template>
          <el-input v-model="item.value" />
        </el-form-item>
      </div>
      <div>
        <el-form-item v-for="(item, index) in data" :key="item">
          <template #label>
            <h2>{{ item.type }}</h2>
            <div class="flex items-center justify-between">
              <div class="flex gap-4">
                <el-tag
                  v-if="item.id"
                  effect="dark"
                  round
                  class="text-[var(--el-color-primary)]"
                >
                  {{ item.id }}
                </el-tag>
                <el-tooltip
                  class="box-item"
                  effect="dark"
                  :content="item.name"
                  placement="top-start"
                >
                  <p class="w-40 truncate text-[var(--el-color-primary)]">
                    {{ item.name }}
                  </p>
                </el-tooltip>
              </div>
              <el-button type="danger" plain @click="data.splice(index, 1)">
                删除
              </el-button>
            </div>
          </template>
          <el-input v-model="item.value" />
        </el-form-item>
      </div>
      <el-form-item>
        <el-button type="primary" disabled>保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped lang="scss">
:deep(.el-button + .el-button) {
  margin-left: 0;
}
</style>
