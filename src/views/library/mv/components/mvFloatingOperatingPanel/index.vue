<script lang="ts">
import CloseCircleOutline from "@iconify-icons/solar/close-circle-outline";
import TrashBin_2Outline from "@iconify-icons/solar/trash-bin-2-outline";
import { defineComponent } from "vue";

import FloatingOperatingPanel from "@/views/components/floatingOperatingPanel/index.vue";

export default defineComponent({
  name: "MvFloatingOperatingPanel",
  components: { FloatingOperatingPanel },
  props: {
    selectCount: Number
  },
  setup() {
    return {
      CloseCircleOutline,
      TrashBin_2Outline
    };
  },
  computed: {
    getSelectCount() {
      return this.selectCount;
    }
  },
  methods: {
    cancelButton() {
      this.$emit("clean-check");
    },
    removeMvButton() {
      this.$emit("remove-event");
    }
  }
});
</script>

<template>
  <floating-operating-panel>
    <div class="flex items-center rounded">
      <span class="p-4">
        <span class="text-sm" style="color: var(--el-text-color-regular)">
          已选择
        </span>
        {{ getSelectCount }}
      </span>
      <IconifyIconOffline
        class="cursor-pointer select-icon"
        style="color: #636e72"
        :icon="CloseCircleOutline"
        width="2rem"
        height="2rem"
        @click="cancelButton"
      />
    </div>
    <div class="flex items-center rounded">
      <el-divider direction="vertical" />
    </div>
    <div class="flex items-center rounded">
      <IconifyIconOffline
        class="cursor-pointer select-icon"
        :icon="TrashBin_2Outline"
        width="2rem"
        height="2rem"
        @click="removeMvButton"
      />
    </div>
  </floating-operating-panel>
</template>

<style scoped lang="scss">
.select-icon:hover {
  background-color: var(--el-color-info-light-8);
  border-radius: 0.5rem;
}
</style>
