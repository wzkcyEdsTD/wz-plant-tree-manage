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
        <span>公益牌状态信息</span>
      </p>
      <!-- 表单 -->
      <div>
        <Form :model="formItem" :label-width="80">
          <Row>
            <Col :span="6">
              <FormItem label="项目名称">
                <span>{{ formItem.project_name }}</span>
              </FormItem>
            </Col>
            <Col :span="6">
              <FormItem label="树种">
                <span> {{ formItem.tree_name }} </span>
              </FormItem>
            </Col>
            <Col :span="6">
              <FormItem label="公益牌数量">
                <span> {{ formItem.project_scale || 0 }} </span>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col :span="8">
              <FormItem label="公益牌状态">
                <Select
                  v-model="grandType"
                  placeholder="状态"
                  style="width: 180px"
                >
                  <Option
                    v-for="item in grandTypeList"
                    :key="item.value"
                    :value="item.value"
                    >{{ item.name }}</Option
                  >
                </Select>
              </FormItem>
            </Col>
            <Col :span="8">
              <FormItem label="挂牌日期">
                <DatePicker
                  type="date"
                  placeholder="选择挂牌日期"
                  style="width: 180px"
                  :value="
                    new Date(formItem.nameplate_date).Format('yyyy-MM-dd')
                  "
                  v-model="nameplateDate"
                ></DatePicker>
              </FormItem>
            </Col>
            <Col :span="8">
              <FormItem label="撤牌日期">
                <DatePicker
                  type="date"
                  placeholder="选择撤牌日期"
                  style="width: 180px"
                  :value="
                    new Date(formItem.nameplate_remove_date).Format(
                      'yyyy-MM-dd'
                    )
                  "
                  v-model="nameplateRemoveDate"
                ></DatePicker>
              </FormItem>
            </Col>
          </Row>
        </Form>
      </div>
      <Row slot="footer">
        <Button type="info" size="large" @click="update">立即保存</Button>
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
      apiUrlPrefix: "/api/sys/yl/project/",
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
          title: "项目名称",
          key: "project_name",
          width: 250,
          align: "center",
        },
        {
          title: "树种",
          key: "tree_name",
          width: 160,
          align: "center",
        },
        {
          title: "学名",
          key: "tree_sci_name",
          width: 180,
          align: "center",
        },
        {
          title: "公益牌状态",
          width: 150,
          align: "center",
          render: (h, params) => {
            return h(
              "span",
              params.row.nameplate_state == 1
                ? "审核中"
                : params.row.nameplate_state == 2
                ? "制作中"
                : params.row.nameplate_state == 3
                ? "已挂牌"
                : params.row.nameplate_state == 4
                ? "已解挂"
                : "无"
            );
          },
        },
        {
          title: "公益牌数量",
          width: 150,
          align: "center",
          render: (h, params) => {
            return h("span", params.row.project_scale || 0);
          },
        },
        {
          title: "状态修改日期",
          width: 200,
          align: "center",
          render: (h, params) => {
            return h(
              "span",
              params.row.nameplate_state_updatetime
                ? new Date(params.row.nameplate_state_updatetime).Format(
                    "yyyy-MM-dd"
                  )
                : ""
            );
          },
        },
        {
          title: "挂牌时间",
          width: 200,
          align: "center",
          render: (h, params) => {
            return h(
              "span",
              params.row.nameplate_date
                ? new Date(params.row.nameplate_date).Format("yyyy-MM-dd")
                : ""
            );
          },
        },

        {
          title: "解牌时间",
          width: 200,
          align: "center",
          render: (h, params) => {
            return h(
              "span",
              params.row.nameplate_remove_date
                ? new Date(params.row.nameplate_remove_date).Format(
                    "yyyy-MM-dd"
                  )
                : ""
            );
          },
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
                      this.check(params);
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
                  on: {
                    click: () => {
                      this.downLoad(params);
                    },
                  },
                },
                "下载"
              ),
            ]);
          },
        },
      ],
      data1: [],
      tableSelect: [],
      loading: true,

      grandType: "",
      grandTypeList: [
        {
          name: "审核中",
          value: 1,
        },
        {
          name: "制作中",
          value: 2,
        },
        {
          name: "已挂牌",
          value: 3,
        },
        {
          name: "已解挂",
          value: 4,
        },
      ],

      nameplateDate: "",
      nameplateRemoveDate: "",
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    // 初始化
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
      const self = this;
      Util.ajax
        .post(self.apiUrlPrefix + "info/" + params.row.id)
        .then((response) => {
          if (response.data.code == "100") {
            self.clearFormItem();
            self.formItem = response.data.formItem;
            self.grandType = self.formItem.nameplate_state;
            self.nameplateDate = "";
            self.nameplateRemoveDate = "";

            self.formItem.nameplate_date &&
              (self.nameplateDate = new Date(
                self.formItem.nameplate_date
              ).Format("yyyy-MM-dd"));

            self.formItem.nameplate_remove_date &&
              (self.nameplateRemoveDate = new Date(
                self.formItem.nameplate_remove_date
              ).Format("yyyy-MM-dd"));

            self.modal.show = true;
          } else {
            alert(response.data.msg);
          }
        });
    },

    // 保存
    update() {
      const self = this;

      this.grandType && (this.formItem["nameplate_state"] = this.grandType);
      this.nameplateDate &&
        (this.formItem["nameplate_date"] = Date.parse(
          new Date(this.nameplateDate)
        ));
      this.nameplateRemoveDate &&
        (this.formItem["nameplate_remove_date"] = Date.parse(
          new Date(this.nameplateRemoveDate)
        ));

      // 删除不需要传的属性
      const form = {};
      for (let k in this.formItem) {
        if (
          ~[
            "id",
            "nameplate_state",
            "nameplate_date",
            "nameplate_remove_date",
          ].indexOf(k)
        ) {
          form[k] = this.formItem[k];
        }
      }
      this.formItem = form;

      Util.ajax
        .post(this.apiUrlPrefix + "update", this.formItem)
        .then((response) => {
          if (response.data.code == "100") {
            self.init();
            self.modal.show = false;
          } else {
            alert(response.data.msg);
          }
        });
    },

    // 表格选中项
    dochange(selection) {
      this.tableSelect = selection;
    },

    // 下载
    downLoad(params) {
      const self = this;
      this.$Modal.confirm({
        onOk() {
          Util.ajax
            .post(
              `/api/sys/yl/nameplate/GetNameplateZipByProjectNum?id=${params.row.id}`
            )
            .then((response) => {
              if (response.data.code == "100") {
                if (response.data.data) {
                  window.open(response.data.data, "target", "");
                } else {
                  self.$Message.error("暂无可下载的公益牌！");
                }
              }
            });
        },
        content: "您确定要下载该项目下的所有公益牌吗？",
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
};
</script>