<template>
  <div class="data-page">
    <el-button type="primary" icon="el-icon-plus" class="adding-button" @click="showAddingDialog">添加</el-button>
<!--    表格组件
    data:表格组件将来需要展示的数据------数组类型border:是给表格添加边框column属性
    label:显示标题
    width:对应列的宽度
    align: 标题的对齐方式
     -->
    <el-table border :data="items" class="data-table">
      <!-- <el-table-column type="index" label="序号" width="80px" align="center"></el-table-column> -->
      <el-table-column type="index" width="180" label="操作">

        <template slot-scope="{ row, $index }">
          <el-button type="warning" icon="el-icon-edit" size="mini" @click="updateItem(row)">修改</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteItem(row)">删除</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="id" width="200" label="ID"></el-table-column>

      <el-table-column prop="numericValue" width="100" label="整型数值"></el-table-column>
      <el-table-column prop="decimalValue" width="150" label="分数数值"></el-table-column>
      <el-table-column prop="textContent" width="200" label="文本内容"></el-table-column>
      <el-table-column prop="activeFlag" width="80" label="有效标志">
        <template slot-scope="{row, $index}">
          <el-tag :type="row.activeFlag ? 'success' : 'info'">
            {{ row.activeFlag ? '有效' : '无效' }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
    <!--
      分页器
      当前第几页、数据总条数、每一页展示条数、连续页码数
      @size-change="handlesizeChange"
      @current-change="handleCurrentChange"
      current-page:代表的是当前第几页
      total:代表分页器一共需要展示数据条数
      page-size: 代表的是每一页需要展示多少条数据
      page-sizes:代表可以设置每一页展示多少条数据
      layout: 可以实现分页器布局
    -->
    <el-pagination
      :current-page="page"
      :total="total"
      :page-size="limit"
      :pager-count="7"
      :page-sizes="[10,20,50]"
      layout="prev, pager, next, jumper, ->, sizes, total"
      @current-change="handleCurrentChange"
      @size-change="handleSizeChange"
    />

    <el-dialog title="添加数据" :visible.sync="addingDialogVisible" class="adding-dialog">
      <!-- form 表单 -->
      <el-form :model="addingForm" :rules="rules" ref="addingForm" class="adding-form">
        <el-form-item label="ID:" label-width="100px">
          <el-input autocomplete="off" v-model="addingForm.id"></el-input>
        </el-form-item>
        <el-form-item label="整型数值:" label-width="100px">
          <el-input-number v-model="addingForm.numericValue" :precision="0" :step="1" />
        </el-form-item>
        <el-form-item label="分数数值:" label-width="100px">
          <el-input-number v-model="addingForm.decimalValue" :precision="2" :step="0.1" />
        </el-form-item>
        <el-form-item label="文本内容:" label-width="100px">
          <el-input type="textarea" autocomplete="off" v-model="addingForm.textContent"></el-input>
        </el-form-item>
        <el-form-item label="有效标志:" label-width="100px">
          <el-switch v-model="addingForm.activeFlag" active-text="有效" inactive-text="无效" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="danger" @click="closeAddingDialog">取 消</el-button>
        <el-button type="warning" @click="clearAddingForm">重 置</el-button>
        <el-button type="primary" @click="submitAddingForm">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="更新数据" :visible.sync="updatingDialogVisible" class="updating-dialog">
      <!-- form 表单 -->
      <!-- model 为 data 里的数据对象，被展示的元素需提供对应的 v-model 属性，v-model 的值对应数据对象里的键 -->
      <!-- rules 绑定校验规则，被校验的元素都需提供对应的 prop 属性，prop 的值对应 rules 中的键，ref 用于 this.$refs.<ref的值>.validate 配合表单提交前的检验 -->
      <el-form :model="updatingForm" :rules="rules" ref="updatingForm" class="updating-form">
        <el-form-item label="ID:" label-width="100px" prop="id">
          <el-input autocomplete="off" v-model="updatingForm.id"></el-input>
        </el-form-item>
        <el-form-item label="整型数值:" label-width="100px" prop="numericValue">
          <el-input-number v-model="updatingForm.numericValue" :precision="0" :step="1" />
        </el-form-item>
        <el-form-item label="分数数值:" label-width="100px" prop="decimalValue">
          <el-input-number v-model="updatingForm.decimalValue" :precision="2" :step="0.1" />
        </el-form-item>
        <el-form-item label="文本内容:" label-width="100px" prop="textContent">
          <el-input autocomplete="off" v-model="updatingForm.textContent"></el-input>
        </el-form-item>
        <el-form-item label="有效标志:" label-width="100px" prop="activeFlag">
          <el-switch v-model="updatingForm.activeFlag" active-text="有效" inactive-text="无效" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="danger" @click="closeUpdatingDialog">取 消</el-button>
        <el-button type="warning" @click="clearUpdatingForm">重 置</el-button>
        <el-button type="primary" @click="submitUpdatingForm">确 定</el-button>
       </div>
    </el-dialog>
  </div>
</template>

<script>
import { validUsername } from '@/utils/validate'

export default {
  name: 'data',
  filters: {
  },
  data() {
    return {
      // 分页器第几页
      page: 1,
      // 当前页数展示数据的条数
      limit: 10,
      total: 0,
      items: [],
      addingDialogVisible: false,
      updatingDialogVisible: false,
      addingForm: {
        id: '',
        numericValue: 0,
        decimalValue: 0.0,
        textContent: '',
        activeFlag: false
      },
      updatingForm: {
        id: '',
        numericValue: 0,
        decimalValue: 0.0,
        textContent: '',
        activeFlag: false
      },
      rules: {
          id: [
            { required: true, message: 'ID不能为空', trigger: 'blur' },
          ]
      }
    }
  },
  mounted() {
    this.getPageList(1,10)
  },
  methods: {
    async getPageList(pager = 1, limiter = 10) {
      this.page = pager;
      this.limit = limiter;
      const { page, limit } = this;
      let total = await this.$API.data.reqDataCount();
      let result = await this.$API.data.reqDataList(page, limit);
      if (result.code == 200 || result.code == 20000 || result.code == "SUCCESS") {
        this.total = total.data;
        this.items = result.data;
        console.log(this.items);
      }
    },
    handleCurrentChange(pager) {
      console.log(pager)
      this.getPageList(pager, this.limit);
    },
    handleSizeChange(limit) {
      console.log(limit)
      this.getPageList(this.page, limit);
    },
    closeAddingDialog() {
      this.addingDialogVisible = false;
    },
    closeUpdatingDialog() {
      this.updatingDialogVisible = false;
    },
    showAddingDialog() {
      this.addingDialogVisible = true;
    },
    showUpdatingDialog() {
      this.updatingDialogVisible = true;
    },
    clearAddingForm() {
      for (let key in this.addingForm) {
        this.addingForm[key] = '';
       }
    },
    clearUpdatingForm() {
      for (let key in this.updatingForm) {
        this.updatingForm[key] = '';
       }
    },
    submitAddingForm() {
      this.$refs.addingForm.validate(async (valid) => {
        if (valid) {
          let result = await this.$API.data.reqAddData([this.addingForm]);
          if (result.code === 200 || result.code === 20000 || result.code === 'SUCCESS') {
            this.closeAddingDialog();
            this.$message({
              type: 'success',
              message: '添加数据成功'
            })
            this.getPageList(this.page, this.limit);
          }
        } else {
          console.log('添加失败');
          return false;
        }
      });

    },
    async submitUpdatingForm() {
      this.$refs.updatingForm.validate(async (valid) => {
        if (valid) {
          let result = await this.$API.data.reqUpdateData([this.updatingForm]);
          if (result.code === 200 || result.code === 20000 || result.code === 'SUCCESS') {
            
            this.closeUpdatingDialog();
            this.$message({
              type: 'success',
              message: '修改数据成功'
            })
            this.getPageList(this.page, this.limit);
          }
        } else {
          console.log('修改失败');
          return false;
        }
      });
    },
    updateItem(row) {
      this.updatingForm = this.deepCopy(row);
      this.showUpdatingDialog();
    },
    async deleteItem(row) {
      console.log(row.id)
      this.$confirm(`是否确认删除数据（ID： ${row.id}）`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        let result = await this.$API.data.reqDeleteData(row.id);
        this.$message({
          type: 'success',
          message: '删除数据成功'
        });
        this.getPageList(this.items.length>1?this.page:this.page-1, this.limit);
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });


    },
    deepCopy(obj) {
      var newObj = {};
      if (obj instanceof Array) {
          newObj = [];
      }
      for (var key in obj) {
          var val = obj[key];
          //newObj[key] = typeof val === 'object' ? arguments.callee(val) : val; //arguments.callee 在哪一个函数中运行，它就代表哪个函数, 一般用在匿名函数中。
          newObj[key] = typeof val === 'object' ? cloneObj(val): val;
      }
      return newObj;
    }
    // 点击添加按钮

  }
}
</script>

<style lang="scss">
  .data-page{
    padding: 1.5rem;
  }
  .adding-button{
    margin-bottom: 1.5rem;
  }
  .data-table{
    width: 100%;
  }
  .adding-form{
    width: 80%;
  }
  .updating-form{
    width: 80%;
  }
</style>
