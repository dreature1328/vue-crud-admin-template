<template>
  <div class="dashboard-container">
    <!-- 统计 -->
    <div class="dashboard-header">
      <div class="dashboard-subtitle">
        共 <strong>{{ total }}</strong> 条数据在库
        <router-link to="/data/index" class="more-link">查看全部 →</router-link>
      </div>
    </div>

    <!-- 卡片网格 -->
    <el-row :gutter="16" class="data-cards">
      <el-col
        v-for="item in items"
        :key="item.id"
        :xs="24"
        :sm="12"
        :md="8"
        :lg="6"
      >
        <el-card
          shadow="hover"
          class="data-card clickable"
          @click.native="openDetail(item)"
        >
          <!-- 卡片头：ID -->
          <div class="card-header">
            <span class="card-id" :title="item.id">{{ item.id || '—' }}</span>
          </div>

          <!-- 卡片体 -->
          <div class="card-body">
            <div class="info-row">
              <span class="label">整型数值</span>
              <span class="value">{{ item.numericValue != null ? item.numericValue : '—' }}</span>
            </div>
            <div class="info-row">
              <span class="label">分数数值</span>
              <span class="value">{{ item.decimalValue != null ? item.decimalValue : '—' }}</span>
            </div>
            <div class="info-row">
              <span class="label">文本内容</span>
              <span class="value value-multiline" :title="item.textContent">
                {{ item.textContent || '—' }}
              </span>
            </div>
            <div class="info-row">
              <span class="label">有效标志</span>
              <span class="value">
                <el-tag :type="item.activeFlag ? 'success' : 'info'" size="mini">
                  {{ item.activeFlag ? '有效' : '无效' }}
                </el-tag>
              </span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- ===== 加载更多 ===== -->
    <div v-if="items.length > 0" class="load-more-wrap">
      <span class="load-more-tip">
        已加载 {{ items.length }} / {{ total }} 条
      </span>

      <el-button
        v-if="hasMore"
        :loading="loadingMore"
        plain
        size="small"
        @click="loadMore"
      >
        加载更多
      </el-button>

      <span v-else class="load-more-done">
        已全部加载
        <router-link to="/data/index" class="more-link">前往数据管理 →</router-link>
      </span>
    </div>

    <!-- 空状态占位 -->
    <div v-if="!loading && items.length === 0" class="empty-state">
      暂无数据
    </div>

    <!-- ===== 详情弹窗 ===== -->
    <el-dialog
      title="数据详情"
      :visible.sync="detailVisible"
      width="560px"
      class="data-detail-dialog"
      @closed="onDetailClosed"
    >
      <div class="detail-body">
        <!-- 头部：ID -->
        <div class="detail-title">
          <span class="detail-title-text">{{ detail.id || '—' }}</span>
        </div>

        <!-- 字段列表 -->
        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-label">整型数值</span>
            <span class="detail-value">{{ detail.numericValue != null ? detail.numericValue : '—' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">分数数值</span>
            <span class="detail-value">{{ detail.decimalValue != null ? detail.decimalValue : '—' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">有效标志</span>
            <span class="detail-value">
              <el-tag :type="detail.activeFlag ? 'success' : 'info'">
                {{ detail.activeFlag ? '有效' : '无效' }}
              </el-tag>
            </span>
          </div>
          <div class="detail-item detail-item-full">
            <span class="detail-label">文本内容</span>
            <span class="detail-value">{{ (detail.textContent || '—').trim() }}</span>
          </div>
        </div>
      </div>

      <div slot="footer">
        <el-button type="primary" @click="detailVisible = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'DataDashboard',
  data() {
    return {
      items: [],
      total: 0,
      loading: false,

      // ===== 分页 / 加载更多 =====
      pageSize: 12,       // 每页展示数量
      currentPage: 1,     // 当前已加载到第几页
      hasMore: true,      // 是否还有更多
      loadingMore: false, // “加载更多”按钮 loading

      // 详情弹窗
      detailVisible: false,
      detail: {}
    }
  },
  mounted() {
    this.loadPreview()
  },
  methods: {
    // 首次加载：先拿总数，再拉第一页
    async loadPreview() {
      this.loading = true
      this.currentPage = 1
      this.hasMore = true
      try {
        const totalRes = await this.$API.data.reqDataCount()
        if (this.isOk(totalRes)) {
          this.total = Number(totalRes.data) || 0
        }
        await this.fetchPage(1)
      } catch (e) {
        console.error('[DataDashboard] 加载数据列表失败', e)
      } finally {
        this.loading = false
      }
    },

    // 拉取指定页；page === 1 覆盖，其余追加
    async fetchPage(page) {
      const listRes = await this.$API.data.reqDataList(page, this.pageSize)
      if (!this.isOk(listRes)) return

      const list = listRes.data || []
      this.items = page === 1 ? list : this.items.concat(list)
      this.currentPage = page

      // 返回数量不足一页 → 到底了；
      // 若已知总数，再叠加“已加载 < 总数”的校验（总数未知时只看是否满页）
      const loaded = this.items.length
      const reachedEndByCount = this.total > 0 ? loaded >= this.total : false
      this.hasMore = list.length === this.pageSize && !reachedEndByCount
    },

    // 点击“加载更多”
    async loadMore() {
      if (this.loadingMore || !this.hasMore) return
      this.loadingMore = true
      try {
        await this.fetchPage(this.currentPage + 1)
      } catch (e) {
        console.error('[DataDashboard] 加载更多失败', e)
      } finally {
        this.loadingMore = false
      }
    },

    // 点击卡片 → 打开详情弹窗
    openDetail(item) {
      this.detail = { ...item }
      this.detailVisible = true
    },

    // 弹窗关闭 → 清理数据
    onDetailClosed() {
      this.detail = {}
    },

    isOk(res) {
      return res && (res.code == 200 || res.code == 20000 || res.code === 'SUCCESS')
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 24px;
}

/* ===== 顶部 ===== */
.dashboard-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 18px;
}

.dashboard-subtitle {
  font-size: 13px;
  color: #909399;

  strong {
    color: #409eff;
    font-size: 15px;
    margin: 0 2px;
    font-weight: 600;
  }
}

.more-link {
  margin-left: 16px;
  color: #409eff;
  text-decoration: none;
  font-size: 13px;

  &:hover {
    text-decoration: underline;
  }
}

/* ===== 卡片 ===== */
.data-card {
  margin-bottom: 16px;
  border-radius: 6px;

  ::v-deep .el-card__body {
    padding: 12px 14px;
  }
}

/* 可点击卡片 */
.clickable {
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-2px);
  }
}

.card-header {
  display: flex;
  align-items: center;
  padding-bottom: 8px;
  margin-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

/* 卡片头 ID */
.card-id {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-row {
  display: flex;
  font-size: 12px;
  line-height: 18px;
}

.label {
  flex: 0 0 64px;
  color: #909399;
}

.value {
  flex: 1;
  min-width: 0;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 文本内容：两行截断 */
.value-multiline {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  white-space: normal;
  overflow: hidden;
  word-break: break-all;
}

/* ===== 加载更多 ===== */
.load-more-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 0 8px;
}

.load-more-tip {
  font-size: 12px;
  color: #909399;
}

.load-more-done {
  font-size: 13px;
  color: #909399;

  .more-link {
    margin-left: 8px;
  }
}

/* ===== 空状态 ===== */
.empty-state {
  padding: 40px 0;
  text-align: center;
  color: #c0c4cc;
  font-size: 13px;
}

/* ===== 详情弹窗 ===== */
.detail-body {
  padding: 4px 4px 0;
}

.detail-title {
  display: flex;
  align-items: center;
  padding-bottom: 12px;
  margin-bottom: 14px;
  border-bottom: 1px solid #f0f0f0;
}

/* 详情头部 ID */
.detail-title-text {
  flex: 1;
  min-width: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 24px;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  min-width: 0;
  font-size: 15px;
  line-height: 22px;
}

.detail-item-full {
  grid-column: 1 / -1;
}

.detail-label {
  flex: 0 0 90px;
  color: #909399;
}

.detail-value {
  flex: 1;
  min-width: 0;
  color: #303133;
  word-break: break-all;
  white-space: pre-line;
}
</style>