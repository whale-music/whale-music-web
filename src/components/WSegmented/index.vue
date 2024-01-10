<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "WSegmented",
  props: {
    modelValue: String,
    options: Array<{ name: string; value: string }>
  },
  data() {
    return {
      selectedIndex: 0,
      indicatorPosition: 0
    };
  },
  computed: {
    segments() {
      return this.options;
    }
  },
  mounted() {
    this.selectedIndex = this.options.findIndex(
      v => this.modelValue === v.value
    );
  },
  methods: {
    selectSegment(index) {
      this.selectedIndex = index;
      this.$emit("updateSelection", this.segments[this.selectedIndex].value);
      this.$emit("update:modelValue", this.segments[this.selectedIndex].value);
      this.updateIndicatorPosition();
    },
    updateIndicatorPosition() {
      const segmentWidth = 100 / this.segments.length;
      this.indicatorPosition = `${this.selectedIndex * segmentWidth}%`;
    }
  }
});
</script>
<template>
  <div>
    <div
      class="segmented-control"
      :style="{
        '--indicator-width': `${100 / this.segments.length}%`
      }"
    >
      <div
        v-for="(item, index) in segments"
        :key="index"
        @click="selectSegment(index)"
        :class="{ selected: selectedIndex === index }"
        ref="selectSegmentRef"
      >
        {{ item.label }}
      </div>
      <div class="indicator" :style="{ left: indicatorPosition }" />
    </div>
  </div>
</template>

<style scoped>
.segmented-control {
  position: relative;
  display: flex;
  justify-content: space-between;
  border: 1px solid var(--el-border-color);
  border-radius: var(--el-border-radius-base);
  overflow: hidden;
}

.segmented-control div {
  flex: 1;
  min-height: 28px;
  line-height: 28px;
  padding: 0 11px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  text-align: center;
  cursor: pointer;
  user-select: none;
  border-radius: var(--el-border-radius-base);
}

.segmented-control div.selected {
  background-color: transparent;
  color: white;
  z-index: 1;
  transition: color 0.3s;
}

.indicator {
  position: absolute;
  bottom: 0;
  height: 2px;
  width: var(--indicator-width);
  background-color: var(--el-color-primary);
  transition: left 0.3s;
  z-index: 0;
}
</style>
