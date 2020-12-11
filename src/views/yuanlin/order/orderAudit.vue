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
    <Modal v-model="modal.show" width="1100" :mask-closable="false">
      <p slot="header" style="text-align: center">
        <span>详情</span>
      </p>
      <!-- 表单 -->
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
            <Col :span="12">
              <FormItem label="手机号">
                <span>{{ formItem.phone || `无` }}</span>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col :span="12">
              <FormItem label="认养寄语">
                <span>{{ formItem.wishes || `无` }}</span>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col :span="12">
              <FormItem label="修正寄语">
                <Input
                  v-model="editWishes"
                  placeholder="若需要修改，请输入"
                ></Input>
              </FormItem>
            </Col>
          </Row>
        </Form>
      </div>
      <Row slot="footer">
        <Button type="info" size="large" @click="update">确定</Button>
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
          width: 350,
          align: "center",
        },
        {
          title: "用户昵称",
          key: "registered_name",
          width: 150,
          align: "center",
        },
        {
          title: "手机号",
          key: "phone",
          width: 160,
          align: "center",
        },
        {
          title: "项目名称",
          key: "project_name",
          width: 200,
          align: "center",
        },
        {
          title: "审核状态",
          width: 120,
          align: "center",
          render: (h, params) => {
            let val = "未审核";
            let props = {
              color: "yellow",
            };
            if (params.row.wishes_status == 1) {
              val = "通过";
              props.color = "green";
            } else if (params.row.wishes_status == 2) {
              val = "不通过";
              props.color = "red";
            } else if (params.row.wishes_status == 3) {
              val = "修正后通过";
              props.color = "blue";
            }
            return h("Tag", { props: props }, val);
          },
        },
        {
          title: "认种认养寄语",
          width: 350,
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
          minWidth: 180,
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
                "编辑"
              ),
              h(
                "Button",
                {
                  props: {
                    type: "success",
                    size: "small",
                  },
                  style: {
                    marginRight: "10px",
                  },
                  on: {
                    click: () => {
                      this.audit(1, params);
                    },
                  },
                },
                "通过"
              ),
              h(
                "Button",
                {
                  props: {
                    type: "error",
                    size: "small",
                  },
                  on: {
                    click: () => {
                      this.audit(2, params);
                    },
                  },
                },
                "驳回"
              ),
            ]);
          },
        },
      ],
      data1: [],
      tableSelect: [],
      loading: true,
      editWishes: "",
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
        self.data1 = data.datas || [];
        self.page.pageSize = data.pageSize;
        self.page.nowPage = data.nowPage;
        self.page.total = data.total;
      });
    },

    // 审核
    audit(auditState, params) {
      const self = this;
      if (auditState == params.row.wishes_status) {
        if (auditState == 1) {
          this.$Message.error("您已经审核通过该项！");
        } else {
          this.$Message.error("您已经驳回该项！");
        }
        return;
      } else if (auditState == 1 && params.row.wishes_status == 3) {
        this.$Message.error("您已经审核通过该项！");
        return;
      }

      this.$Modal.confirm({
        onOk() {
          Util.ajax
            .post(self.apiUrlPrefix + "update", {
              id: params.row.id,
              wishes_status: auditState,
            })
            .then((response) => {
              if (response.data.code == "100") {
                self.init();
              } else {
                self.$Message.error(response.data.msg);
              }
            });
        },
        content: `您确定要${auditState == 1 ? `通过` : `驳回`}该项吗？`,
      });
    },

    // 编辑
    edit(params) {
      const self = this;
      self.editWishes = "";
      Util.ajax
        .post(this.apiUrlPrefix + "info?id=" + params.row.id)
        .then((response) => {
          if (response.data.code == "100") {
            self.clearFormItem();
            self.formItem = response.data.formItem;
            self.formItem.correctd_wishes &&
              (self.editWishes = self.formItem.correctd_wishes);
            self.modal.show = true;
          } else {
            alert(response.data.msg);
          }
        });
    },

    // 保存
    update() {
      const self = this;
      self.modal.show = false;

      if (self.editWishes != self.formItem.wishes) {
        self.$Modal.confirm({
          onOk() {
            Util.ajax
              .post(self.apiUrlPrefix + "update", {
                id: self.formItem.id,
                correctd_wishes: self.editWishes,
                wishes_status: 3,
              })
              .then((response) => {
                if (response.data.code == "100") {
                  self.init();
                }
              });
          },
          content: "您确定要修改寄语并通过吗？",
        });
      }
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