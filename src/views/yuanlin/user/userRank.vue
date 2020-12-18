<template>
  <div class="layout">
    <Row>
      <Input
        v-model="page.key"
        placeholder="请输入关键字搜搜..."
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
    <Row>
      <RadioGroup v-model="type" type="button" @on-change="changeType">
        <Radio label="type1" class="radio_type">认种认养树木总量排行</Radio>
        <Radio label="type3" class="radio_type">认种认养捐资总额排行</Radio>
        <Radio label="type2" class="radio_type" disabled
          >绿值余额总量排行</Radio
        >
        <Radio label="type4" class="radio_type" disabled
          >植树尽责捐资总额排行</Radio
        >
      </RadioGroup>
    </Row>
    <br />
    <!-- 表单 -->
    <Table
      ref="table"
      stripe
      border
      :loading="loading"
      :columns="currentCol"
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
      ></Page>
    </div>
    <!-- 自定义Modal -->
    <Modal v-model="modal.show" width="1100" :mask-closable="false">
      <p slot="header" style="text-align: center">
        <span>详情</span>
      </p>
      <!-- 表单 -->
      <div>
        <Form :model="formItem" :label-width="80">
          <div style="border: solid 1px #dddee1">
            <div
              style="
                font-weight: bolder;
                font-size: 14px;
                padding: 10px 20px 5px;
              "
            >
              用户基本信息
            </div>
            <Row>
              <Col :span="7">
                <FormItem label="OpenID">
                  <span>{{ formItem.openid }}</span>
                </FormItem>
              </Col>
              <Col :span="6">
                <FormItem label="昵称">
                  <span>{{ formItem.nickname }}</span>
                </FormItem>
              </Col>
              <Col :span="5">
                <FormItem label="认种树木数">
                  <span>{{ formItem.treecount }} 棵</span>
                </FormItem>
              </Col>
              <Col :span="5">
                <FormItem label="下单次数">
                  <span>{{ formItem.ordercount }} 次</span>
                </FormItem>
              </Col>
            </Row>
          </div>
          <div style="border: solid 1px #dddee1; margin-top: 10px">
            <div
              style="
                font-weight: bolder;
                font-size: 14px;
                padding: 10px 20px 5px;
              "
            >
              {{
                type == "type1" ? "树木清单" : type == "type3" ? "订单清单" : ""
              }}
            </div>
            <div v-if="data2">
              <!-- 内部表格 -->
              <Table
                ref="table1"
                stripe
                border
                :loading="loading"
                :columns="subCurrentCol"
                :data="data2"
              ></Table>
            </div>
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
      // 接口前缀
      apiUrlPrefix: "/api/sys/yl/ranking/",
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
          title: "OpenID",
          key: "openid",
          width: 350,
          align: "center",
        },
        {
          title: "昵称",
          key: "nickname",
          width: 250,
          align: "center",
        },
        {
          title: "认种树木总数",
          key: "treecount",
          minWidth: 80,
          align: "center",
        },
        {
          title: "养护树木次数",
          key: "treemaintain",
          minWidth: 80,
          align: "center",
        },
        {
          title: "操作",
          fixed: "right",
          minWidth: 80,
          key: "action",
          align: "center",
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
      columns2: [
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
          title: "OpenID",
          key: "openid",
          width: 350,
          align: "center",
        },
        {
          title: "昵称",
          key: "nickname",
          width: 250,
          align: "center",
        },
        {
          title: "下单量",
          key: "ordercount",
          minWidth: 80,
          align: "center",
        },
        {
          title: "支付总金额",
          key: "amountsum",
          minWidth: 80,
          align: "center",
        },
        {
          title: "操作",
          fixed: "right",
          minWidth: 80,
          key: "action",
          align: "center",
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
      currentCol: null,
      data1: [],
      tableSelect: [],
      loading: true,
      type: "type1",
      typeHash: {
        type1: {
          rankUrl: "pctreeranking",
          infoUrl: "pctreerankinginfo",
          column: "columns1",
          subCol: "subColumns1",
        },
        type3: {
          rankUrl: "pcamountranking",
          infoUrl: "pcamountrankinginfo",
          column: "columns2",
          subCol: "subColumns2",
        },
      },
      data2: [],
      subCurrentCol: null,
      subColumns1: [
        {
          title: "序号",
          width: 120,
          align: "center",
          render: (h, params) => {
            return h("span", params.index + 1);
          },
        },
        {
          title: "树木名称",
          key: "tree_name",
          width: 200,
          align: "center",
        },
        {
          title: "认种起始日期",
          width: 200,
          align: "center",
          render: (h, params) => {
            return h(
              "span",
              params.row.maintain_startTime
                ? new Date(params.row.maintain_startTime).Format("yyyy-MM-dd")
                : "无"
            );
          },
        },
        {
          title: "认种截止日期",
          minWidth: 200,
          align: "center",
          render: (h, params) => {
            return h(
              "span",
              params.row.maintain_endTime
                ? new Date(params.row.maintain_endTime).Format("yyyy-MM-dd")
                : "无"
            );
          },
        },
        {
          title: "认种认养已到期",
          minWidth: 200,
          align: "center",
          render: (h, params) => {
            return h(
              "span",
              params.row.maintain_endTime
                ? params.row.maintain_endTime < Date.parse(new Date())
                  ? "是"
                  : "否"
                : ""
            );
          },
        },
      ],
      subColumns2: [
        {
          title: "序号",
          width: 120,
          align: "center",
          render: (h, params) => {
            return h("span", params.index + 1);
          },
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
          width: 150,
          align: "center",
        },
        {
          title: "订单状态",
          width: 150,
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
          width: 240,
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
          title: "认种认养寄语",
          width: 250,
          render: (h, params) => {
            return h(
              "span",
              params.row.correctd_wishes || params.row.wishes || "无"
            );
          },
        },
      ],
    };
  },

  created() {
    this.currentCol = this.columns1;
    this.subCurrentCol = this.subColumns1;
  },

  methods: {
    // 初始化
    init(type) {
      const self = this;
      self.loading = true;
      const url = this.typeHash[type].rankUrl;
      Util.ajax.post(this.apiUrlPrefix + url, this.page).then((response) => {
        self.loading = false;
        const data = response.data;
        self.data1 = data.datas;
        self.page.pageSize = data.pageSize;
        self.page.nowPage = data.nowPage;
        self.page.total = data.total;
        self.currentCol = self[self.typeHash[type].column];
        self.subCurrentCol = self[self.typeHash[type].subCol];
      });
    },

    // 编辑
    check(params) {
      const self = this;
      const url = this.typeHash[this.type].infoUrl;
      const page = self.page;
      page.bean["id"] = params.row.id;

      Util.ajax.post(this.apiUrlPrefix + url, page).then((response) => {
        if (response.data.code == "100") {
          self.clearFormItem();
          self.formItem = response.data.data;

          self.data2 =
            self.type == "type1"
              ? self.formItem.treelist
              : self.type == "type3"
              ? self.formItem.orderlist
              : [];

          self.modal.show = true;
          self.modal.isadd = false;
        } else {
          alert(response.data.msg);
        }
      });
    },

    //表格选中项
    dochange(selection) {
      this.tableSelect = selection;
    },

    // 分页
    pageOnChange(num) {
      this.page.nowPage = num;
      this.init(this.type);
    },
    pageSizeChange(size) {
      this.page.pageSize = size;
      this.init(this.type);
    },

    // 清空
    clearFormItem() {
      this.formItem = {
        id: "",
        name: "",
        urlPattern: "",
      };
    },

    // 搜索重置
    searchInit() {
      this.page.nowPage = 1;
      this.init(this.type);
    },

    changeType(val) {
      if (~["type1", "type3"].indexOf(val)) {
        this.init(val);
      }
    },
  },

  mounted() {
    this.init("type1");
  },
};
</script>

<style>
.radio_type {
  font-size: 16px !important;
  padding: 0px 18px !important;
  margin: 0 10px !important;
  height: 36px !important;
  line-height: 36px !important;
}
</style>