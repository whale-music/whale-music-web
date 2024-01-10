<script lang="ts">
import { defineComponent } from "vue";
import AddCircleLinear from "@iconify-icons/solar/add-circle-linear";

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
  mounted() {},
  watch: {},
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
        <el-text size="large">{{ this.linkData.length }}</el-text>
      </div>
      <el-popover trigger="click" placement="left" :width="160">
        <div class="flex flex-col gap-1">
          <b class="mb-2">添加关联数据</b>
          <el-button type="primary" @click="this.addLinkData('music')" plain>
            Music
          </el-button>
          <el-button type="primary" @click="this.addLinkData('playlist')" plain>
            PlayList
          </el-button>
          <el-button type="primary" @click="this.addLinkData('album')" plain>
            Album
          </el-button>
          <el-button
            type="primary"
            @click="this.addLinkData('UserBackground')"
            plain
          >
            UserBackground
          </el-button>
          <el-button
            type="primary"
            @click="this.addLinkData('UserAvatar')"
            plain
          >
            UserAvatar
          </el-button>
          <el-button type="primary" @click="this.addLinkData('artist')" plain>
            Artist
          </el-button>
          <el-button type="primary" @click="this.addLinkData('mv')" plain>
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
        <el-form-item v-for="(item, index) in this.data" :key="item">
          <template #label>
            <h2>{{ item.type }}</h2>
            <div class="flex items-center justify-between">
              <div class="flex gap-4">
                <el-tag
                  effect="dark"
                  round
                  class="text-[var(--el-color-primary)]"
                  v-if="item.id"
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
              <el-button
                type="danger"
                @click="this.data.splice(index, 1)"
                plain
              >
                删除
              </el-button>
            </div>
          </template>
          <el-input v-model="item.value" />
        </el-form-item>
      </div>
      <div>
        <el-form-item v-for="(item, index) in this.data" :key="item">
          <template #label>
            <h2>{{ item.type }}</h2>
            <div class="flex items-center justify-between">
              <div class="flex gap-4">
                <el-tag
                  effect="dark"
                  round
                  class="text-[var(--el-color-primary)]"
                  v-if="item.id"
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
              <el-button
                type="danger"
                @click="this.data.splice(index, 1)"
                plain
              >
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
