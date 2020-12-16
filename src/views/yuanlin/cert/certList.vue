<template>
  <div class="layout">
    <Row>
      <Input
        v-model="page.key"
        placeholder="请输入关键字搜一搜..."
        style="width: 200px"
        @keyup.enter.native="searchInit"
      />
      <span style="margin: 0 10px"
        ><Button type="primary" icon="search" @click="searchInit"
          >搜索</Button
        ></span
      >
      <span style="margin: 0"
        ><Button type="success" @click="batchDownload">下载</Button></span
      >
    </Row>
    <br />
    <!-- 表单 -->
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
    <!-- 分页 -->
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
        placement="top"
        transfer
      ></Page>
    </div>

    <!-- 自定义Modal -->
    <Modal v-model="modal.show" width="800" :mask-closable="false">
      <p slot="header" style="text-align: center">
        <span>公益牌预览</span>
      </p>
      <!-- 表单 -->
      <div>
        <Form :label-width="80">
          <div>
            <img v-if="certPath" :src="certPath" style="width: 100%" />
            <div v-else>
              <span style="display: block; text-align: center; padding: 20px"
                >暂无相关信息</span
              >
            </div>
          </div>
        </Form>
      </div>
      <Row slot="footer">
        <Button type="info" size="large" @click="modal.show = false"
          >确定</Button
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
      apiUrlPrefix: "/api/sys/yl/cert/",
      modal: {
        show: false,
      },
      page: {
        pageSize: 10,
        nowPage: 1,
        total: 100,
        sizeopt: [10, 30, 60, 100],
        key: "",
        bean: {},
      },
      formItem: {},
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
          key: "year_num",
          width: 200,
          align: "center",
        },
        {
          title: "证书编号",
          key: "certificate_num",
          width: 250,
          align: "center",
        },
        {
          title: "证书持有人",
          key: "registered_name",
          width: 200,
          align: "center",
        },
        {
          title: "证书类型",
          width: 200,
          align: "center",
          render: (h, params) => {
            return h(
              "span",
              params.row.certificate_type == "1"
                ? "认种认养荣誉证书"
                : params.row.certificate_type == "2"
                ? "植树尽责证明"
                : ""
            );
          },
        },
        {
          title: "发证日期",
          width: 250,
          align: "center",
          render: (h, params) => {
            return h(
              "span",
              params.row.createtime
                ? new Date(params.row.createtime).Format("yyyy-MM-dd")
                : ""
            );
          },
        },
        {
          title: "操作",
          fixed: "right",
          minWidth: 100,
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
                  on: {
                    click: () => {
                      this.check(params);
                    },
                  },
                },
                "预览"
              ),
            ]);
          },
        },
      ],
      data1: [],
      tableSelect: [],
      loading: true,
      certPath: null,
    };
  },
  methods: {
    //初始化
    init() {
      const self = this;
      self.loading = true;
      Util.ajax.post(self.apiUrlPrefix + "list", self.page).then((response) => {
        self.loading = false;
        const data = response.data;
        self.data1 = data.datas || [];
        self.page.pageSize = data.pageSize;
        self.page.nowPage = data.nowPage;
        self.page.total = data.total;
      });
    },

    //编辑
    check(params) {
      this.certPath = null;
      params.row.path &&
        (this.certPath =
          params.row.path.substr(0, 1) == "/"
            ? `${params.row.path}`
            : `/${params.row.path}`);
      this.modal.show = true;
    },

    // 表格选中项
    dochange(selection) {
      this.tableSelect = selection;
    },

    // 批量下载
    batchDownload() {
      const self = this;
      if (!self.tableSelect.length) {
        this.$Modal.warning({
          content: "未选中任何选项！",
        });
        return;
      }
      this.$Modal.confirm({
        onOk() {
          const ids = [];
          self.tableSelect.forEach((item) => {
            ids.push(item.certificate_file_id);
          });

          Util.ajax
            .post("/api/sys/attachment/download_batch", ids)
            .then((response) => {
              if (response.data.code == "100") {
                window.open(response.data.path, "target", "");
              }
            });
        },
        content: "您确定要下载选中项吗？",
      });
    },

    // 分页
    pageOnChange(num) {
      this.page.nowPage = num;
      this.init();
    },
    pageSizeChange(size) {
      this.page.pageSize = size;
      this.init();
    },

    // 清空
    clearFormItem() {
      this.formItem = {};
    },

    // 搜索重置
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