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
      ></Page>
    </div>
    <!-- 自定义Modal -->
    <Modal v-model="modal.show" width="1100" :mask-closable="false">
      <p slot="header" style="text-align: center">
        <span>详情</span>
      </p>
      <!-- 表单 -->
      <div>
        <Form :model="formItem" :label-width="110">
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
              <Col :span="8">
                <FormItem label="OpenID">
                  <span>{{ formItem.openid }}</span>
                </FormItem>
              </Col>
              <Col :span="5">
                <FormItem label="国家">
                  <span>{{ formItem.country }}</span>
                </FormItem>
              </Col>
              <Col :span="5">
                <FormItem label="省份">
                  <span>{{ formItem.province }}</span>
                </FormItem>
              </Col>
              <Col :span="5">
                <FormItem label="城市">
                  <span>{{ formItem.city }}</span>
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col :span="6">
                <FormItem label="昵称">
                  <span>{{ formItem.nickname }}</span>
                </FormItem>
              </Col>
              <Col :span="6">
                <FormItem label="性别">
                  <span>{{
                    formItem.sex == 1 ? "男" : formItem.sex == 2 ? "女" : ""
                  }}</span>
                </FormItem>
              </Col>
              <Col :span="6">
                <FormItem label="关注时间">
                  <span>{{
                    new Date(formItem.createtime).Format("yyyy-MM-dd")
                  }}</span>
                </FormItem>
              </Col>
              <Col :span="6">
                <FormItem label="状态">
                  <span>{{
                    formItem.status == 1
                      ? "正常"
                      : formItem.status == 0
                      ? "禁用"
                      : ""
                  }}</span>
                </FormItem>
              </Col>
            </Row>
            <FormItem label="头像">
              <img v-if="formItem.headpic" :src="formItem.headpic" width="80" />
            </FormItem>
          </div>
          <div style="border: solid 1px #dddee1; margin-top: 10px">
            <div
              style="
                font-weight: bolder;
                font-size: 14px;
                padding: 10px 20px 5px;
              "
            >
              用户认种认养相关信息
            </div>
            <div v-if="formItem.firstorder || formItem.statisticsinfo">
              <div style="border-bottom: solid 1px #dddee1">
                <span style="display: block; padding: 20px">首次认种认养</span>
                <Row>
                  <Col :span="6">
                    <FormItem label="订单日期">
                      <span>{{
                        formItem.firstorder.payment_date
                          ? new Date(formItem.firstorder.payment_date).Format(
                              "yyyy-MM-dd"
                            )
                          : "无"
                      }}</span>
                    </FormItem>
                  </Col>
                  <Col :span="6">
                    <FormItem label="区域">
                      <span
                        >{{ formItem.firstorder.project_name || "无" }}
                      </span>
                    </FormItem>
                  </Col>
                  <Col :span="6">
                    <FormItem label="树种">
                      <span>{{ formItem.firstorder.tree_name || "无" }}</span>
                    </FormItem>
                  </Col>
                  <Col :span="6">
                    <FormItem label="所属类型">
                      <span>{{ formItem.firstorder.tree_type || "无" }} </span>
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col :span="4">
                    <FormItem label="种养类型">
                      <span>认种</span>
                    </FormItem>
                  </Col>
                  <Col :span="4">
                    <FormItem label="数量">
                      <span
                        >{{ formItem.statisticsinfo.quantity || 0 }} 棵</span
                      >
                    </FormItem>
                  </Col>
                  <Col :span="4">
                    <FormItem label="支付金额">
                      <span>{{ formItem.statisticsinfo.amount || 0 }} 元</span>
                    </FormItem>
                  </Col>
                  <Col :span="6">
                    <FormItem label="种植起始日期">
                      <span>{{
                        formItem.firstorder.maintain_starttime
                          ? new Date(
                              formItem.firstorder.maintain_starttime
                            ).Format("yyyy-MM-dd")
                          : "无"
                      }}</span>
                    </FormItem>
                  </Col>
                  <Col :span="6">
                    <FormItem label="种植到期日期">
                      <span>{{
                        formItem.firstorder.maintain_endtime
                          ? new Date(
                              formItem.firstorder.maintain_endtime
                            ).Format("yyyy-MM-dd")
                          : "无"
                      }}</span>
                    </FormItem>
                  </Col>
                </Row>
                <FormItem label="认种寄语">
                  <span>{{
                    formItem.firstorder.correctd_wishes ||
                    formItem.firstorder.wishes ||
                    "无"
                  }}</span>
                </FormItem>
              </div>
              <span style="display: block; padding: 20px">累计认种认养</span>
              <Row>
                <Col :span="6">
                  <FormItem label="下单量">
                    <span
                      >{{ formItem.statisticsinfo.ordercount || 0 }} 次</span
                    >
                  </FormItem>
                </Col>
                <Col :span="6">
                  <FormItem label="区域数">
                    <span>{{ formItem.statisticsinfo.pjcount || 0 }} 块</span>
                  </FormItem>
                </Col>
                <Col :span="6">
                  <FormItem label="树木总量">
                    <span
                      >{{ formItem.statisticsinfo.quantitycount || 0 }} 棵</span
                    >
                  </FormItem>
                </Col>
                <Col :span="6">
                  <FormItem label="支付总金额">
                    <span>{{ formItem.statisticsinfo.amountsum || 0 }} 元</span>
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col :span="6">
                  <FormItem label="最近下单">
                    <span>{{
                      formItem.statisticsinfo.createtime
                        ? new Date(formItem.statisticsinfo.createtime).Format(
                            "yyyy-MM-dd"
                          )
                        : "无"
                    }}</span>
                  </FormItem>
                </Col>
                <Col :span="6">
                  <FormItem label="最近认养起始">
                    <span>{{
                      formItem.statisticsinfo.maintain_starttime
                        ? new Date(
                            formItem.statisticsinfo.maintain_starttime
                          ).Format("yyyy-MM-dd")
                        : "无"
                    }}</span>
                  </FormItem>
                </Col>
                <Col :span="6">
                  <FormItem label="最近认养结束">
                    <span>{{
                      formItem.statisticsinfo.maintain_endtime
                        ? new Date(
                            formItem.statisticsinfo.maintain_endtime
                          ).Format("yyyy-MM-dd")
                        : "无"
                    }}</span>
                  </FormItem>
                </Col>
                <Col :span="6">
                  <FormItem label="未支付订单数">
                    <span
                      >{{ formItem.statisticsinfo.unpaidcount || 0 }} 次</span
                    >
                  </FormItem>
                </Col>
              </Row>
              <div></div>
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
      apiUrlPrefix: "/api/sys/yl/user/",
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
          width: 300,
          align: "center",
        },
        {
          title: "昵称",
          key: "nickname",
          width: 200,
          align: "center",
        },
        {
          title: "性别",
          width: 80,
          align: "center",
          render: (h, params) => {
            return h(
              "span",
              params.row.sex == 1 ? "男" : params.row.sex == 2 ? "女" : ""
            );
          },
        },
        {
          title: "头像",
          width: 150,
          align: "center",
          render: (h, params) => {
            return h("img", {
              attrs: {
                src: params.row.headpic,
                style: "width: 80px;",
              },
            });
          },
        },
        {
          title: "国家",
          key: "country",
          minWidth: 80,
          align: "center",
        },
        {
          title: "省份",
          key: "province",
          minWidth: 80,
          align: "center",
        },
        {
          title: "城市",
          key: "city",
          minWidth: 80,
          align: "center",
        },
        {
          title: "状态",
          width: 120,
          align: "center",
          render: (h, params) => {
            return h(
              "span",
              params.row.status == 1
                ? "正常"
                : params.row.status == 0
                ? "禁用"
                : ""
            );
          },
        },
        {
          title: "关注时间",
          width: 150,
          align: "center",
          render: (h, params) => {
            return h(
              "span",
              new Date(params.row.createtime).Format("yyyy-MM-dd")
            );
          },
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
      data1: [],
      tableSelect: [],
      loading: true,
    };
  },
  methods: {
    // 初始化
    init() {
      const self = this;
      self.loading = true;
      Util.ajax.post(this.apiUrlPrefix + "list", this.page).then((response) => {
        self.loading = false;
        const data = response.data;
        self.data1 = data.datas;
        self.page.pageSize = data.pageSize;
        self.page.nowPage = data.nowPage;
        self.page.total = data.total;
      });
    },

    // 编辑
    check(params) {
      const self = this;
      Util.ajax
        .post(this.apiUrlPrefix + "info?id=" + params.row.id)
        .then((response) => {
          if (response.data.code == "100") {
            self.clearFormItem();
            self.formItem = response.data.data;
            self.formItem["firstorder"] = response.data.firstorder;
            self.formItem["statisticsinfo"] = response.data.statisticsinfo;
            self.modal.show = true;
            self.modal.isadd = false;
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
      this.formItem = {
        id: "",
        name: "",
        urlPattern: "",
      };
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