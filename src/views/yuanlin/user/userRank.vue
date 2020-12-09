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
    <Row>
      <RadioGroup v-model="type" type="button" @on-change="changeType">
        <Radio label="type1" class="radio_type">认种认养树木总量排行</Radio>
        <Radio label="type2" class="radio_type">绿值余额总量排行</Radio>
        <Radio label="type3" class="radio_type">认种认养捐资总额排行</Radio>
        <Radio label="type4" class="radio_type">植树尽责捐资总额排行</Radio>
      </RadioGroup>
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
    <Modal v-model="modal.show" width="1100" :mask-closable="false">
      <p slot="header" style="text-align: center">
        <span>详情</span>
      </p>
      <!--表单-->
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
              <Col :span="6">
                <FormItem label="OpenID">
                  <span>{{ formItem.openid }}</span>
                </FormItem>
              </Col>
              <Col :span="6">
                <FormItem label="国家">
                  <span>{{ formItem.country }}</span>
                </FormItem>
              </Col>
              <Col :span="6">
                <FormItem label="省份">
                  <span>{{ formItem.province }}</span>
                </FormItem>
              </Col>
              <Col :span="6">
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
            <div v-if="formItem.pctreerankinginfo">
              <Row>
                <Col :span="6">
                  <FormItem label="下单量">
                    <span>{{ formItem.pctreerankinginfo.ordercount }} 次</span>
                  </FormItem>
                </Col>
                <Col :span="6">
                  <FormItem label="树木总量">
                    <span>{{ formItem.pctreerankinginfo.treecount }} 棵</span>
                  </FormItem>
                </Col>
                <Col :span="6">
                  <FormItem label="养护次数">
                    <span
                      >{{ formItem.pctreerankinginfo.treemaintain }} 次</span
                    >
                  </FormItem>
                </Col>
                <Col :span="6">
                  <FormItem label="支付总金额">
                    <span
                      >{{ formItem.pctreerankinginfo.amountsum || 0 }} 元</span
                    >
                  </FormItem>
                </Col>
              </Row>
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
          width: 250,
        },
        {
          title: "昵称",
          key: "nickname",
          width: 200,
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
          title: "下单量",
          key: "ordercount",
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
      loading: true, //表格加载
      type: "type1",
    };
  },
  methods: {
    //初始化
    init() {
      const self = this;
      self.loading = true;
      Util.ajax
        .post(this.apiUrlPrefix + "pctreeranking", this.page)
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
      Util.ajax
        .post(this.apiUrlPrefix + "info/" + params.row.id)
        .then(function (response) {
          if (response.data.code == "100") {
            self.clearFormItem();
            self.formItem = response.data.formItem;

            const page = self.page;
            page.bean["id"] = params.row.id;

            Util.ajax
              .post("/api/sys/yl/ranking/pctreerankinginfo", page)
              .then(function (response) {
                if (response.data.code == "100") {
                  self.formItem["pctreerankinginfo"] = response.data.data;
                  self.modal.show = true;
                  self.modal.isadd = false;

                  console.log(self.formItem);
                } else {
                  alert(response.data.msg);
                }
              });
          } else {
            alert(response.data.msg);
          }
        });
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
        id: "",
        name: "",
        urlPattern: "",
      };
    },
    //搜索重置
    searchInit() {
      this.page.nowPage = 1;
      this.init();
    },

    changeType(val) {
      console.log(val);
    },
  },
  mounted() {
    this.init();
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