<script lang="ts">
export default {
  props: {
    value: {
      type: Boolean,
      default: false
    },
    seekFrame: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      setSeekFrame: this.seekFrame
    };
  },
  mounted() {},
  watch: {
    setSeekFrame(newVal) {
      this.$emit("update-seek-frame", newVal);
    }
  },
  computed: {
    isShow: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit("update:value", val);
      }
    }
  }
};
</script>

<template>
  <el-dialog v-model="this.isShow">
    <template #header>
      <h1>设置视频封面帧</h1>
    </template>
    <p>设置视频封面，指定从第 {{ this.setSeekFrame }} 秒，截取图片作为MV封面</p>
    <el-input-number v-model="this.setSeekFrame" :min="1" />
  </el-dialog>
</template>

<style scoped lang="scss"></style>
