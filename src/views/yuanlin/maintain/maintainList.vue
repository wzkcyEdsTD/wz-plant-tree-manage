<template>
  <div class="layout">
    <Row>
      <Input
        v-model="page.key"
        placeholder="请输入关键字搜搜..."
        style="width: 200px"
      />
      <span style="margin: 0 10px"
        ><Button type="primary" icon="search" @click="searchInit"
          >搜索</Button
        ></span
      >
    </Row>
    <br />
    <!--表单-->
    <Table
      ref="table"
      stripe
      border
      :loading="loading"
      :columns="columns1"
      :data="data1"
      @on-selection-change="dochange"
    ></Table>
    <br />
    <!--分页-->
    <div style="text-align: center">
      <Page
        :total="page.total"
        :page-size="page.pageSize"
        :current="page.nowPage"
        :page-size-opts="page.sizeopt"
        @on-page-size-change="pageSizeChange"
        @on-change="pageOnChange"
        show-sizer
        show-elevator
        show-total
      ></Page>
    </div>
    <!-- 自定义Modal -->
    <Modal v-model="modal.show" width="700" :mask-closable="false">
      <p slot="header" style="text-align: center">
        <span>详情</span>
      </p>
      <!--表单-->
      <div>
        <Form :model="formItem" :label-width="80">
          <FormItem label="公园">
            <Select v-model="formItem.parkfeature" filterable>
              <Option
                v-for="item in parkList"
                :value="item.featuregui"
                :key="item.name"
                >{{ item.name }}</Option
              >
            </Select>
          </FormItem>
          <FormItem label="养护人">
            <Input
              v-model="formItem.mtc.name"
              placeholder="请输入"
              readonly
            ></Input>
          </FormItem>
          <FormItem label="标题">
            <Input
              v-model="formItem.title"
              placeholder="请输入"
              readonly
            ></Input>
          </FormItem>
          <FormItem label="内容">
            <Input
              type="textarea"
              v-model="formItem.content"
              placeholder="请输入"
              readonly
            ></Input>
          </FormItem>
          <FormItem label="图片">
            <img :src="'/' + formItem.pic" alt="" />
          </FormItem>
        </Form>
      </div>
      <Row slot="footer">
        <Button type="info" size="large" @click="update()">确定</Button>
        <Button type="ghost" size="large" @click="modal.show = false"
          >取消</Button
        >
      </Row>
    </Modal>
  </div>
</template>
<script>
import Util from "@/libs/util";
export default {
  data() {
    return {
      //接口前缀
      apiUrlPrefix: "/api/sys/yl/maintain/",
      modal: {
        show: false,
        isadd: true,
      },
      page: {
        pageSize: 10,
        nowPage: 1,
        total: 100,
        sizeopt: [10, 30, 60, 100],
        key: "",
        bean: {},
      },
      formItem: {
        mtc: {},
        plant: {},
      },
      columns1: [
        {
          type: "selection",
          width: 60,
          align: "center",
        },
        {
          title: "序号",
          width: 80,
          align: "center",
          render: (h, params) => {
            return h(
              "span",
              params.index + (this.page.nowPage - 1) * this.page.pageSize + 1
            );
          },
        },
        {
          title: "所属年度",
          key: "year",
          width: 100,
        },
        {
          title: "所属项目",
          key: "project_name",
          width: 120,
        },
        {
          title: "记录添加单位",
          width: 120,
          render: (h, params) => {
            return h(
              "span",
              params.row.creatortype == "1" ? "业主单位" : "公众"
            );
          },
        },
        {
          title: "种植/养护",
          minWidth: 80,
          align: "center",
          render: (h, params) => {
            return h("span", params.row.maintence_flg ? "种植" : "养护");
          },
        },
        {
          title: "养护进度",
          minWidth: 80,
          align: "center",
          render: (h, params) => {
            return h("span", `${params.row.maintence_num || 0} / 24`);
          },
        },
        {
          title: "记录添加时间",
          width: 200,
          render: (h, params) => {
            return h(
              "span",
              new Date(params.row.createtime).Format("yyyy-MM-dd hh:mm:ss")
            );
          },
        },
        {
          title: "本次记录描述",
          key: "describe",
          minWidth: 120,
        },
        {
          title: "操作",
          fixed: "right",
          minWidth: 150,
          key: "action",
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    type: "primary",
                    size: "small",
                  },
                  style: {
                    marginRight: "10px",
                  },
                  on: {
                    click: () => {
                      this.edit(params);
                    },
                  },
                },
                "查看"
              ),
            ]);
          },
        },
      ],
      data1: [], //表格数据
      tableSelect: [], //表格选中项
      loading: true,
      parkList: [],
    };
  },
  methods: {
    //初始化
    init() {
      const self = this;
      self.loading = true;
      Util.ajax
        .post(this.apiUrlPrefix + "pclist", this.page)
        .then(function (response) {
          self.loading = false;
          const data = response.data;
          self.data1 = data.datas;
          self.page.pageSize = data.pageSize;
          self.page.nowPage = data.nowPage;
          self.page.total = data.total;
        });
    },
    toadd() {
      this.clearFormItem();
      this.modal.show = true;
      this.modal.isadd = true;
    },
    //编辑
    edit(params) {
      const self = this;
    },
    //保存
    update() {
      const self = this;
      Util.ajax
        .post(this.apiUrlPrefix + "update", this.formItem)
        .then(function (response) {
          if (response.data.code == "100") {
            self.init();
            self.modal.show = false;
          } else {
            alert(response.data.msg);
          }
        });
    },
    delete(params) {
      const self = this;
      this.$Modal.confirm({
        onOk() {
          Util.ajax
            .post(self.apiUrlPrefix + "delete", { id: params.row.id })
            .then(function (response) {
              if (response.data.code == "100") {
                self.init();
              }
            });
        },
        content: "您确定要删除吗？",
      });
    },
    batchDelete() {
      const self = this;
      this.$Modal.confirm({
        onOk() {
          var ids = "";
          self.tableSelect.forEach(function (item) {
            ids = ids + "," + item.id;
          });
          console.log(ids);
          Util.ajax
            .post(self.apiUrlPrefix + "delete", { id: ids.replace(",", "") })
            .then(function (response) {
              if (response.data.code == "100") {
                self.init();
              }
            });
        },
        content: "您确定要删除选中项吗？",
      });
    },
    //表格选中项
    dochange(selection) {
      this.tableSelect = selection;
    },
    //分页
    pageOnChange(num) {
      this.page.nowPage = num;
      this.init();
    },
    pageSizeChange(size) {
      this.page.pageSize = size;
      this.init();
    },
    //清空
    clearFormItem() {
      this.formItem = {
        mtc: {},
        plant: {},
        parkfeature: this.page.bean.parkfeature,
      };
    },
    //搜索重置
    searchInit() {
      this.page.nowPage = 1;
      this.init();
    },
  },
  mounted() {
    this.init();
  },
};
</script>