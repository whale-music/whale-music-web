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
  computed: {
    isShow: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit("update:value", val);
      }
    }
  },
  watch: {
    setSeekFrame(newVal) {
      this.$emit("update-seek-frame", newVal);
    }
  },
  mounted() {}
};
</script>

<template>
  <el-dialog v-model="isShow">
    <template #header>
      <h1>设置视频封面帧</h1>
    </template>
    <div class="flex justify-between">
      <p>设置视频封面，指定从第 {{ setSeekFrame }} 秒，截取图片作为MV封面</p>
      <el-input-number v-model="setSeekFrame" :min="1" />
    </div>
  </el-dialog>
</template>
