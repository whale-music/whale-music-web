<script setup lang="ts">
import Placeholder from "@/components/Placeholder/index.vue";
import ShowLoading from "@/components/ShowLoading/ShowLoading.vue";
import FailureDisplay from "@/components/FailureDisplay/index.vue";

defineOptions({
  name: "ContentPlaceholder"
});

type Type = "loading" | "fail" | "success";

const props = defineProps({
  type: {
    type: String as PropType<Type>,
    required: true
  },
  loading: {
    type: Object as PropType<{ height: number; width: number }>,
    default: () => ({ width: "100%", height: "20rem" })
  },
  fail: {
    type: Object as PropType<{
      msg: string;
      styleClass: string;
    }>
  }
});
</script>

<template>
  <Placeholder :type="props.type">
    <template #default>
      <slot />
    </template>
    <template #loading>
      <ShowLoading
        :loading="true"
        :height="props.loading.height"
        :width="props.loading.width"
      />
    </template>
    <template #fail>
      <FailureDisplay :msg="props.fail.msg" :class="props.fail.styleClass" />
    </template>
  </Placeholder>
</template>
