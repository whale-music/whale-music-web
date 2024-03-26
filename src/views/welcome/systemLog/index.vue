<script setup lang="ts">
import {
  getSystemLogPage,
  removeSystemLog,
  SystemLogReq,
  SystemLogRes
} from "@/api/system";
import { onMounted, ref, watch } from "vue";
import type { PageResCommon } from "@/api/model/common";
import { ObjectsUtils } from "@/utils/ObjectsUtil";
import { FriendlyTime } from "@/utils/DateFormat";
import { dateFormater } from "@/utils/dateUtil";
import dayjs from "dayjs";
import TeenyiconsAppleSolid from "@/assets/components/TeenyiconsAppleSolid.vue";
import BxBxlWindows from "@/assets/components/BxBxlWindows.vue";
import IcBaselineAndroid from "@/assets/components/IcBaselineAndroid.vue";
import MdiIpod from "@/assets/components/MdiIpod.vue";
import MacOsIcon from "@/assets/components/MacOsIcon.vue";
import AntDesignLinuxOutlined from "@/assets/components/AntDesignLinuxOutlined.vue";
import { cloneDeep } from "@pureadmin/utils";
import WButton from "@/components/button/index.vue";
import { message } from "@/utils/message";

const selectPageSize = [10, 50, 100, 500, 1000];
const page = ref<PageResCommon<SystemLogRes>>({
  content: [],
  current: 0,
  size: 0,
  total: 0
});
const reqInitDate: SystemLogReq = {
  order: "desc",
  orderBy: "createTime",
  betweenDate: null,
  executionTime: null,
  logName: [],
  mappingPath: "",
  methodName: "",
  os: [],
  remoteHost: "",
  requestMethod: [],
  success: "all",
  pageIndex: 1,
  pageNum: 10
};

const req = ref<SystemLogReq>(cloneDeep(reqInitDate));
const init = async () => {
  const r = await getSystemLogPage(req.value);
  page.value = r.data;
};

watch(
  () => [
    req.value.logName,
    req.value.requestMethod,
    req.value.os,
    req.value.success,
    req.value.betweenDate,
    req.value.orderBy,
    req.value.order
  ],
  () => {
    init();
  }
);

const handleSizeChange = (val: number) => {
  req.value.pageNum = val;
  init();
};
const handleCurrentChange = (val: number) => {
  req.value.pageIndex = val;
  init();
};

const useSearch = () => {
  const requestMethodOpt = [
    {
      value: "GET",
      label: "GET"
    },
    {
      value: "HEAD",
      label: "HEAD"
    },
    {
      value: "POST",
      label: "POST"
    },
    {
      value: "PUT",
      label: "PUT"
    },
    {
      value: "DELETE",
      label: "DELETE"
    },
    {
      value: "CONNECT",
      label: "CONNECT"
    },
    {
      value: "OPTIONS",
      label: "OPTIONS"
    },
    {
      value: "PATCH",
      label: "PATCH"
    }
  ];

  const logNameOpt = [
    {
      value: "Admin",
      label: "Admin"
    },
    {
      value: "NMusic",
      label: "NMusic"
    },
    {
      value: "Subsonic",
      label: "Subsonic"
    },
    {
      value: "Webdav",
      label: "Webdav"
    },
    {
      value: "RedirectException",
      label: "RedirectException"
    }
  ];
  const osOpt = [
    {
      value: "Windows",
      label: "Windows"
    },
    {
      value: "iPhone",
      label: "iPhone"
    },
    {
      value: "iPod",
      label: "iPod"
    },
    {
      value: "Mac",
      label: "Mac"
    },
    {
      value: "Linux",
      label: "Linux"
    },
    {
      value: "Android",
      label: "Android"
    }
  ];
  const successOpt = [
    {
      value: "all",
      label: "全部"
    },
    {
      value: "success",
      label: "成功"
    },
    {
      value: "fail",
      label: "失败"
    }
  ];
  const orderByOpt = [
    {
      value: "createTime",
      label: "创建时间"
    },
    {
      value: "updateTime",
      label: "更新时间"
    },
    {
      value: "executionTime",
      label: "执行时间"
    }
  ];
  const orderOpt = [
    {
      value: "asc",
      label: "升序"
    },
    {
      value: "desc",
      label: "降序"
    }
  ];
  return {
    requestMethodOpt,
    logNameOpt,
    osOpt,
    successOpt,
    orderOpt,
    orderByOpt
  };
};

const useTable = () => {
  const requestMethod = new Map<
    string,
    "success" | "warning" | "info" | "primary" | "danger"
  >([
    ["GET", "primary"],
    ["POST", "warning"]
  ]);

  const platform = new Map([
    ["iPhone", TeenyiconsAppleSolid],
    ["Windows", BxBxlWindows],
    ["iPod", MdiIpod],
    ["Mac", MacOsIcon],
    ["Linux", AntDesignLinuxOutlined],
    ["Android", IcBaselineAndroid]
  ]);

  // 计算文本长度，当长度之和大于等于dom元素的宽度后，返回当前文字所在的索引，截取时会用到。
  function calcTextLength(text: string, width: number) {
    let realLength = 0;
    let index = 0;
    for (let i = 0; i < text.length; i++) {
      let charCode = text.charCodeAt(i);
      if (charCode >= 0 && charCode <= 128) {
        realLength += 1;
      } else {
        realLength += 2 * 14; // 14是字体大小
      }
      // 判断长度，为true时终止循环，记录索引并返回
      if (realLength >= width) {
        index = i;
        break;
      }
    }
    return index;
  }

  // 设置文本内容
  function setTextContent(text: string, width: number) {
    let str: string;
    const widthExceeded = text.length > 20;
    if (widthExceeded) {
      // 翻转文本
      let reverseStr = text.split("").reverse().join("");

      // 计算左右两边文本要截取的字符索引
      const leftTextIndex = calcTextLength(text, 5);
      const rightTextIndex = calcTextLength(reverseStr, width + 5);

      // 将右侧字符先截取，后翻转
      reverseStr = reverseStr.substring(0, rightTextIndex);
      reverseStr = reverseStr.split("").reverse().join("");

      // 字符拼接
      str = `${text.substring(0, leftTextIndex)}...${reverseStr}`;
    } else {
      str = text;
    }
    return str;
  }

  return {
    requestMethod,
    platform,
    setTextContent,
    calcTextLength
  };
};

const useDialog = () => {
  const dialogFlag = ref(false);
  const desc = ref<
    {
      label: string;
      value: string;
    }[]
  >([]);

  const checkDesc = (val: any) => {
    const keys = Object.keys(val);
    desc.value = keys.map(value => ({ label: value, value: val[value] }));
    dialogFlag.value = true;
  };

  const descFlag = ref(false);
  const text = ref("");
  const showTextDialog = (val: string) => {
    descFlag.value = true;
    text.value = val;
  };
  return {
    descFlag,
    dialogFlag,
    text,
    checkDesc,
    showTextDialog,
    desc
  };
};
const { dialogFlag, showTextDialog, text, descFlag, checkDesc, desc } =
  useDialog();

const { requestMethod, setTextContent, platform } = useTable();
const {
  requestMethodOpt,
  logNameOpt,
  osOpt,
  successOpt,
  orderOpt,
  orderByOpt
} = useSearch();

const optionFlag = ref(false);

const removeSystemLogBtn = async (day?: number) => {
  await removeSystemLog(day);
  message("删除日志成功", { type: "success" });
};
onMounted(() => {
  init();
});
</script>

<template>
  <div>
    <ElDialog v-model="descFlag">
      <ElScrollbar height="20rem">
        <span>{{ text }}</span>
      </ElScrollbar>
    </ElDialog>
    <ElDialog v-model="dialogFlag">
      <ElDescriptions :column="1" border>
        <ElDescriptionsItem v-for="i in desc" :key="i.label" :label="i.label">
          <ElLink
            v-if="i?.value?.length >= 50"
            type="primary"
            @click="showTextDialog(i.value)"
          >
            <p class="w-96 truncate">
              {{ i.value }}
            </p>
          </ElLink>
          <p v-else class="w-96 truncate">
            {{ i.value }}
          </p>
        </ElDescriptionsItem>
      </ElDescriptions>
    </ElDialog>
    <ElDialog v-model="optionFlag" title="选项">
      <div>
        <h2>清除日志</h2>
        <div class="flex justify-between pl-4 pr-4">
          <div class="flex gap-2 items-center">
            <span>清除全部日志</span>
            <ElButton type="danger" @click="removeSystemLogBtn()"
              >删除</ElButton
            >
          </div>
          <div class="flex gap-2 items-center">
            <span>清除15天之前日志</span>
            <ElButton type="danger" @click="removeSystemLogBtn(15)"
              >删除</ElButton
            >
          </div>
          <div class="flex gap-2 items-center">
            <span>清除7天之前日志</span>
            <ElButton type="danger" @click="removeSystemLogBtn(7)"
              >删除</ElButton
            >
          </div>
        </div>
      </div>
      <div>
        <h2>选择创建时间</h2>
        <ElDatePicker
          v-model="req.betweenDate"
          type="datetimerange"
          size="large"
          start-placeholder="Start date"
          end-placeholder="End date"
          format="YYYY-MM-DD HH:mm:ss"
          date-format="YYYY/MM/DD ddd"
          value-format="YYYY-MM-DDThh:mm:ss"
        />
      </div>
    </ElDialog>
    <div class="mb-2">
      <div class="flex gap-2">
        <ElFormItem label="请求路径" size="large" class="w-full">
          <ElInput v-model="req.mappingPath" />
        </ElFormItem>
        <ElFormItem label="请求主机" size="large" class="w-full">
          <ElInput v-model="req.remoteHost" />
        </ElFormItem>
        <ElFormItem label="Java方法名" size="large" class="w-full">
          <ElInput v-model="req.methodName" />
        </ElFormItem>
        <ElButton size="large" type="primary" @click="init"> 查询</ElButton>
        <WButton size="large" type="primary" @click="optionFlag = true">
          选项
        </WButton>
        <ElButton
          size="large"
          type="info"
          @click="req = cloneDeep(reqInitDate)"
        >
          清除
        </ElButton>
      </div>
      <div class="flex space-x-4">
        <div class="flex w-full flex-col">
          <h4 class="ml-2">日志模块</h4>
          <ElSelect
            v-model="req.logName"
            multiple
            collapse-tags
            collapse-tags-tooltip
            placeholder="Select"
            size="large"
          >
            <el-option
              v-for="item in logNameOpt"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </ElSelect>
        </div>
        <div class="flex w-full flex-col">
          <h4 class="ml-2">Method</h4>
          <ElSelect
            v-model="req.requestMethod"
            multiple
            collapse-tags
            collapse-tags-tooltip
            placeholder="Select"
            size="large"
          >
            <el-option
              v-for="item in requestMethodOpt"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </ElSelect>
        </div>
        <div class="flex w-full flex-col">
          <h4 class="ml-2">系统</h4>
          <ElSelect
            v-model="req.os"
            multiple
            collapse-tags
            collapse-tags-tooltip
            placeholder="Select"
            size="large"
          >
            <el-option
              v-for="item in osOpt"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </ElSelect>
        </div>
        <div class="flex w-full flex-col">
          <h4 class="ml-2">状态</h4>
          <ElSelect
            v-model="req.success"
            collapse-tags-tooltip
            placeholder="Select"
            size="large"
          >
            <el-option
              v-for="item in successOpt"
              :key="item.label"
              :label="item.label"
              :value="item.value"
            />
          </ElSelect>
        </div>
        <div class="flex w-full flex-col">
          <h4 class="ml-2">排序字段</h4>
          <ElSelect
            v-model="req.orderBy"
            collapse-tags-tooltip
            placeholder="Select"
            size="large"
          >
            <el-option
              v-for="item in orderByOpt"
              :key="item.label"
              :label="item.label"
              :value="item.value"
            />
          </ElSelect>
        </div>
        <div class="flex w-full flex-col">
          <h4 class="ml-2">排序</h4>
          <ElSelect
            v-model="req.order"
            collapse-tags-tooltip
            placeholder="Select"
            size="large"
          >
            <el-option
              v-for="item in orderOpt"
              :key="item.label"
              :label="item.label"
              :value="item.value"
            />
          </ElSelect>
        </div>
      </div>
    </div>
    <ElTable :data="page.content" class="rounded-xl">
      <ElTableColumn prop="logName" label="日志名称" width="90" />
      <ElTableColumn prop="requestMethod" label="请求方法" width="100">
        <template #default="{ row }">
          <el-check-tag checked :type="requestMethod.get(row.requestMethod)">
            {{ row.requestMethod }}
          </el-check-tag>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="executionTime" label="耗时(毫秒)" width="90" />
      <ElTableColumn prop="processId" label="进程ID" width="90" />
      <ElTableColumn prop="threadId" label="线程ID" width="90" />
      <ElTableColumn prop="threadName" label="线程名" width="160" />
      <ElTableColumn label="请求信息">
        <template #default="{ row }">
          <ElTooltip :content="row?.webRequest?.mappingPath">
            <ElLink type="primary" @click="checkDesc(row?.webRequest)">
              {{ setTextContent(row?.webRequest?.mappingPath, 12) }}
            </ElLink>
          </ElTooltip>
        </template>
      </ElTableColumn>
      <ElTableColumn label="方法">
        <template #default="{ row }">
          <ElTooltip :content="row?.methodCallDetail?.methodName">
            <ElLink type="primary" @click="checkDesc(row?.methodCallDetail)">
              {{ setTextContent(row?.methodCallDetail?.methodName, 12) }}
            </ElLink>
          </ElTooltip>
        </template>
      </ElTableColumn>
      <ElTableColumn label="设备信息" width="90">
        <template #default="{ row }">
          <ElButton text type="info" @click="checkDesc(row?.devices)">
            <ElIcon>
              <component :is="platform.get(row?.devices?.platform)" />
            </ElIcon>
          </ElButton>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="exceptionReport" label="异常信息" width="90">
        <template #default="{ row }">
          <ElButton
            v-if="ObjectsUtils.isObjectEmpty(row?.exceptionReport)"
            type="success"
            disabled
            size="small"
          >
            成功
          </ElButton>
          <ElButton
            v-else
            type="danger"
            size="small"
            @click="checkDesc(row.exceptionReport)"
          >
            查看错误
          </ElButton>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="startTime" label="开始时间" width="90">
        <template #default="{ row }">
          <span>
            {{
              FriendlyTime(
                dateFormater("YYYY-MM-dd HH:mm:ss", row?.startTime),
                dayjs()
              )
            }}
          </span>
        </template>
      </ElTableColumn>
    </ElTable>
    <div class="relative">
      <ElPagination
        v-model:current-page="page.current"
        v-model:page-size="page.size"
        class="mt-4 pb-4 ml-auto w-min"
        background
        :hide-on-single-page="page.total === 0"
        :default-current-page="1"
        :default-page-size="page.size"
        :total="page.total"
        :page-sizes="selectPageSize"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>
