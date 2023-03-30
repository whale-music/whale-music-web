<template>
  <div>
    <h1>添加插件</h1>
    <codemirror
      v-model="code"
      placeholder="Code goes here..."
      :style="{ height: '400px' }"
      :autofocus="true"
      :indent-with-tab="true"
      :tab-size="2"
      :extensions="extensions"
      @ready="handleReady"
      @change="log('change', $event)"
      @focus="log('focus', $event)"
      @blur="log('blur', $event)"
    />
  </div>
</template>

<script>
import { defineComponent, onMounted, ref, shallowRef } from "vue";
import { useRouter } from "vue-router";
import { Codemirror } from "vue-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";

export default defineComponent({
  components: {
    Codemirror
  },
  setup() {
    const code = ref(`console.log('Hello, world!')`);
    const extensions = [javascript(), oneDark];
    const router = useRouter();

    // Codemirror EditorView instance ref
    const view = shallowRef();
    const handleReady = payload => {
      view.value = payload.view;
    };

    onMounted(() => {
      router.currentRoute.value.id;
    });
    return {
      code,
      extensions,
      handleReady,
      log: console.log
    };
  }
});
</script>
