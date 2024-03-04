<script lang="ts" setup>
import { useVModel } from "@vueuse/core";
import HighlightableInput from "highlightable-input/vue";
import { defineComponent, ref, watch } from "vue";

import { tweet } from "@/components/LibPage/rules";

defineComponent({
  name: "HighlightInput"
});

const props = defineProps<{
  modelValue: string;
}>();
const emit = defineEmits(["update:modelValue", "change"]);
const value = useVModel(props, "modelValue", emit);

const multiline = ref(false);
const readonly = ref(false);
const disabled = ref(false);

watch(readonly, value => {
  if (value) {
    disabled.value = false;
  }
});

watch(disabled, value => {
  if (value) {
    readonly.value = false;
  }
});
</script>

<template>
  <HighlightableInput
    v-model="value"
    class="w-full highlight-input"
    theme="chakra"
    :highlight="tweet"
    :multiline="multiline"
    :readonly="readonly"
    :disabled="disabled"
  />
</template>

<style lang="scss">
@import url("../../style/HighlightTableInput.scss");

.highlight-input {
  --chakra-colors-chakra-border-color: var(--el-border-color);
  --chakra-colors-gray-300: var(--el-color-primary);
  --chakra-radii-md: var(--el-border-radius-base);
}

highlightable-input[aria-disabled] mark {
  opacity: 0.6;
}

highlightable-input {
  --album-color-rgb: 98, 0, 234;
  --artist-color-rgb: 255, 109, 0;

  .album {
    padding: 4px;
    font-weight: 400;
    color: rgb(var(--album-color-rgb));
    cursor: pointer;
    background-color: rgb(var(--album-color-rgb) 0.2);
    border-radius: 10px;
  }

  .album:hover {
    text-decoration: underline;
  }

  &[aria-disabled="true"] .album {
    pointer-events: none;
  }

  .artist {
    padding: 4px;
    font-weight: 400;
    color: rgb(var(--artist-color-rgb));
    cursor: pointer;
    background-color: rgb(var(--artist-color-rgb) 0.2);
    border-radius: 10px;
  }

  .artist:hover {
    text-decoration: underline;
  }

  &[aria-disabled="true"] .artist {
    pointer-events: none;
  }
}

highlightable-input .variable {
  margin: 1px;
  font-weight: 500;
  color: var(--el-color-primary-light-3);
  background-color: var(--el-color-primary-dark-2);
  border-radius: var(--el-border-radius-base);
}

highlightable-input .variable span {
  opacity: 0.6;
}
</style>
