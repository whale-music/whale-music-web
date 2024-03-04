<script>
import Artplayer from "artplayer";

export default {
  props: {
    option: {
      type: Object,
      required: true
    },
    url: String
  },
  data() {
    return {
      instance: null
    };
  },
  mounted() {
    this.instance = new Artplayer({
      ...this.option,
      container: this.$refs.artRef
    });

    this.$nextTick(() => {
      this.$emit("get-instance", this.instance);
    });
  },
  beforeUnmount() {
    if (this.instance?.destroy) {
      this.instance.destroy(false);
    }
  }
};
</script>

<template>
  <div ref="artRef" />
</template>
