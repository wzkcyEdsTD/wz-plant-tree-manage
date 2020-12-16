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
        placement="top"
        transfer
      ></Page>
    </div>

    <!-- 自定义Modal -->
    <Modal v-model="modal.show" width="1100" :mask-closable="false">
      <p slot="header" style="text-align: center">
        <span>详情</span>
      </p>
      <!--表单-->
      <div>
        <Form :model="formItem" :label-width="80">
          <Row>
            <Col :span="12">
              <FormItem label="订单编号">
                <span>{{ formItem.order_num }}</span>
              </FormItem>
            </Col>
            <Col :span="12">
              <FormItem label="项目名称">
                <span>{{ formItem.project_name }}</span>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col :span="12">
              <FormItem label="用户昵称">
                <span>{{ formItem.registered_name || `无` }}</span>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col :span="6">
              <FormItem label="订单金额">
                <span>{{ formItem.amount }}</span>
              </FormItem>
            </Col>
            <Col :span="6">
              <FormItem label="订单状态">
                <span>{{
                  formItem.state == "1" && formItem.payment_date
                    ? "已付款"
                    : formItem.state == "0"
                    ? "待支付"
                    : formItem.state == "2"
                    ? "已退款"
                    : "无"
                }}</span>
              </FormItem>
            </Col>
            <Col :span="6">
              <FormItem label="现场种植">
                <span>{{ formItem.attending_flg == "0" ? "是" : "否" }}</span>
              </FormItem>
            </Col>
            <Col :span="6">
              <FormItem label="提交时间">
                <span>{{
                  formItem.createtime
                    ? new Date(formItem.createtime).Format(
                        "yyyy-MM-dd hh:mm:ss"
                      )
                    : `-`
                }}</span>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col :span="12">
              <FormItem label="认养寄语">
                <span>{{
                  formItem.correctd_wishes || formItem.wishes || `无`
                }}</span>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col :span="5">
              <FormItem label="树木详情">
                <span
                  v-if="
                    !(formItem.yOrderTreeList && formItem.yOrderTreeList.length)
                  "
                  >无</span
                >
              </FormItem>
            </Col>
          </Row>
          <template
            v-if="formItem.yOrderTreeList && formItem.yOrderTreeList.length"
          >
            <Row
              v-for="(item, index) in formItem.yOrderTreeList"
              :key="index"
              style="border: solid 1px #dddee1"
            >
              <Col :span="8">
                <FormItem label="项目名称">
                  <span>{{ item.project_name }}</span>
                </FormItem>
              </Col>
              <Col :span="8">
                <FormItem label="树木名称"
                  ><span>{{ item.tree_name }}</span>
                </FormItem>
              </Col>
              <Col :span="8">
                <FormItem label="树苗费用">
                  <span>{{ item.sapling_price }}</span>
                </FormItem>
              </Col>
              <Col :span="8">
                <FormItem label="树木图片">
                  <img
                    :src="item.tree_pic"
                    style="
                      max-width: 95%;
                      max-height: 100px;
                      background: transparent !important;
                    "
                  />
                </FormItem>
              </Col>
            </Row>
          </template>
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
      // 接口前缀
      apiUrlPrefix: "/api/sys/yl/order/",
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
      formItem: {
        status: 0,
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
          title: "订单编号",
          key: "order_num",
          width: 320,
          align: "center",
        },
        {
          title: "用户昵称",
          key: "registered_name",
          width: 200,
          align: "center",
        },
        {
          title: "手机号",
          key: "phone",
          width: 150,
          align: "center",
        },
        {
          title: "项目名称",
          key: "project_name",
          width: 200,
          align: "center",
        },
        {
          title: "订单金额",
          key: "amount",
          width: 100,
          align: "center",
        },
        {
          title: "订单状态",
          width: 100,
          align: "center",
          render: (h, params) => {
            return h(
              "span",
              params.row.state == "1" && params.row.payment_date
                ? "已付款"
                : params.row.state == "0"
                ? "待支付"
                : params.row.state == "2"
                ? "已退款"
                : "无"
            );
          },
        },
        {
          title: "提交时间",
          width: 200,
          align: "center",
          render: (h, params) => {
            return h(
              "span",
              params.row.createtime
                ? new Date(params.row.createtime).Format("yyyy-MM-dd hh:mm:ss")
                : ""
            );
          },
        },
        {
          title: "现场种植",
          width: 100,
          align: "center",
          render: (h, params) => {
            return h("span", params.row.attending_flg == "0" ? "是" : "否");
          },
        },
        {
          title: "认种认养寄语",
          width: 250,
          align: "center",
          render: (h, params) => {
            return h(
              "span",
              params.row.correctd_wishes || params.row.wishes || "无"
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
                "查看"
              ),
            ]);
          },
        },
      ],
      data1: [],
      tableSelect: [],
      loading: true,
    };
  },
  methods: {
    //初始化
    init() {
      const self = this;
      self.loading = true;
      Util.ajax.post(this.apiUrlPrefix + "list", this.page).then((response) => {
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
      const self = this;
      Util.ajax
        .post(this.apiUrlPrefix + "info?id=" + params.row.id)
        .then((response) => {
          if (response.data.code == "100") {
            self.clearFormItem();
            self.formItem = response.data.formItem;
            self.modal.show = true;
          } else {
            alert(response.data.msg);
          }
        });
    },

    // 表格选中项
    dochange(selection) {
      this.tableSelect = selection;
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
      this.formItem = { status: 0 };
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