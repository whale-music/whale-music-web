import { ElMessageBox } from "element-plus";

export async function showAddFilterDialogText() {
  await ElMessageBox({
    title: "搜索规则",
    message: () => (
      <>
        <h3>参数描述</h3>
        <el-descriptions column={1} border>
          <el-descriptions-item label="默认(贪婪匹配)">
            <ElTag size="small" type={"success"} disable-transitions>
              无参数
            </ElTag>
          </el-descriptions-item>
          <el-descriptions-item label="歌手">
            <ElTag size="small" disable-transitions>
              @
            </ElTag>
          </el-descriptions-item>
          <el-descriptions-item label="专辑">
            <ElTag size="small" disable-transitions>
              #
            </ElTag>
          </el-descriptions-item>
          <el-descriptions-item label="音乐">
            <ElTag size="small" disable-transitions>
              $
            </ElTag>
          </el-descriptions-item>
        </el-descriptions>
        <h3>一些例子</h3>
        <el-descriptions column={1} border>
          <el-descriptions-item label="默认(贪婪匹配)">
            <ElTag size="small" disable-transitions>
              Yesterday
            </ElTag>
          </el-descriptions-item>
          <el-descriptions-item label="音乐(例子)">
            <ElTag size="small" disable-transitions>
              $origin
            </ElTag>
          </el-descriptions-item>
          <el-descriptions-item label="歌手(例子)">
            <ElTag size="small" disable-transitions>
              @Tom
            </ElTag>
          </el-descriptions-item>
          <el-descriptions-item label="专辑(例子)">
            <ElTag size="small" disable-transitions>
              #hello
            </ElTag>
          </el-descriptions-item>
          <el-descriptions-item label="复杂查询(1)">
            <ElTag size="small" disable-transitions>
              Yesterday @Tom #hello
            </ElTag>
          </el-descriptions-item>
          <el-descriptions-item label="复杂查询(2)">
            <ElTag size="small" disable-transitions>
              $origin @Tom #hello
            </ElTag>
          </el-descriptions-item>
        </el-descriptions>
      </>
    )
  }).catch(() => {});
}
