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
      <Button-group>
        <i-button type="info" @click="toadd">添加</i-button>
      </Button-group>
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

    <!-- 查看详情Modal -->
    <Modal v-model="describeModal.show" width="700" :mask-closable="false">
      <p slot="header" style="text-align: center">
        <span>简介</span>
      </p>
      <div
        style="
          padding: 10px;
          font-size: 16px;
          text-align: justify;
          text-indent: 2em;
        "
      >
        {{ describeModal.content }}
      </div>
      <Row slot="footer">
        <Button type="info" size="large" @click="describeModal.show = false"
          >确定</Button
        >
      </Row>
    </Modal>

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
              <FormItem label="树种名称">
                <Input
                  v-model="formItem.tree_name"
                  placeholder="请输入名称"
                ></Input>
              </FormItem>
            </Col>
            <Col :span="12">
              <FormItem label="学名">
                <Input
                  v-model="formItem.tree_sci_name"
                  placeholder="请输入学名"
                ></Input>
              </FormItem>
            </Col>
          </Row>
          <FormItem label="树木图片">
            <Row>
              <Col :span="18">
                <Input
                  v-model="formItem.tree_pic"
                  placeholder="输入图片链接地址"
                >
                  <Button
                    slot="append"
                    icon="upload"
                    @click.native="uploadShow = true"
                    >选择或上传</Button
                  >
                </Input>
              </Col>
              <Col :span="6">
                <img
                  :src="formItem.tree_pic"
                  style="
                    max-width: 95%;
                    max-height: 100px;
                    background: transparent !important;
                  "
                />
              </Col>
            </Row>
          </FormItem>
          <Row>
            <Col :span="9">
              <FormItem label="树木类型">
                <RadioGroup v-model="formItem.tree_type" type="button">
                  <Radio label="爱情树">爱情树</Radio>
                  <Radio label="友情树">友情树</Radio>
                  <Radio label="亲情树">亲情树</Radio>
                  <Radio label="学习树">学习树</Radio>
                </RadioGroup>
              </FormItem>
            </Col>
            <Col :span="5">
              <Input
                v-model="formItem.tree_type"
                placeholder="自定义类别"
              ></Input>
            </Col>
          </Row>
          <FormItem label="树木简介">
            <Input
              type="textarea"
              :rows="5"
              v-model="formItem.tree_describe"
              placeholder="请输入内容"
            ></Input>
          </FormItem>
          <Row>
            <Col :span="5">
              <FormItem label="树苗价格">
                <InputNumber
                  v-model="formItem.sapling_price"
                  placeholder="请输入价格"
                ></InputNumber>
              </FormItem>
            </Col>
            <Col :span="5">
              <FormItem label="种植费">
                <InputNumber
                  v-model="formItem.tree_plant_price"
                  placeholder="请输入价格"
                ></InputNumber>
              </FormItem>
            </Col>
            <Col :span="5">
              <FormItem label="年养护费">
                <InputNumber
                  v-model="formItem.tree_curing_price"
                  placeholder="请输入价格"
                ></InputNumber>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col :span="5">
              <FormItem label="认养费用">
                <InputNumber
                  v-model="treePrice"
                  disabled
                  placeholder="根据上述价格自动生成"
                ></InputNumber>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col :span="5">
              <FormItem label="可获得绿值">
                <InputNumber placeholder="请输入绿值数"></InputNumber>
              </FormItem>
            </Col>
          </Row>
        </Form>
      </div>
      <Row slot="footer">
        <Button type="info" size="large" @click="update">立即保存并添加</Button>
        <Button type="ghost" size="large" @click="modal.show = false"
          >取消</Button
        >
      </Row>
    </Modal>
    <!-- 图片上传 -->
    <uploader
      :modalShow="uploadShow"
      @closemodal="closeImageModal"
      @chooseUpdate="chooseUpdate"
    ></uploader>
  </div>
</template>
<script>
import Util from "@/libs/util";
import Uploader from "@/views/mylib/imageUpload/imageUpload.vue";
export default {
  components: { Uploader },
  data() {
    return {
      //接口前缀
      apiUrlPrefix: "/api/sys/yl/tree/",
      uploadShow: false,
      modal: {
        show: false,
        isadd: true,
      },
      describeModal: {
        show: false,
        content: "",
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
        sapling_price: 1,
        tree_plant_price: 1,
        tree_curing_price: 1,
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
          title: "名称",
          key: "tree_name",
          width: 120,
          align: "center",
        },
        {
          title: "状态",
          width: 80,
          align: "center",
          render: (h, params) => {
            return h("span", params.row.state == "1" ? "上架" : "下架");
          },
        },
        {
          title: "图片",
          width: 160,
          align: "center",
          render: (h, params) => {
            return h("img", {
              attrs: {
                src: params.row.tree_pic,
                style: "width: 120px;",
              },
            });
          },
        },
        {
          title: "树木类型",
          key: "tree_type",
          width: 140,
          align: "center",
        },
        {
          title: "树木简介",
          width: 120,
          align: "center",
          render: (h, params) => {
            return h(
              "span",
              {
                props: {
                  type: "primary",
                  size: "small",
                },
                style: {
                  color: "#304be4",
                  cursor: "pointer",
                },
                on: {
                  click: () => {
                    this.check(params);
                  },
                },
              },
              "查看"
            );
          },
        },
        {
          title: "树苗价格",
          key: "sapling_price",
          width: 100,
          align: "center",
        },
        {
          title: "年养护费",
          key: "tree_curing_price",
          width: 100,
          align: "center",
        },
        {
          title: "种植费",
          key: "tree_plant_price",
          width: 100,
          align: "center",
        },
        {
          title: "认种认养费用",
          key: "tree_price",
          width: 150,
          align: "center",
        },
        {
          title: "创建时间",
          width: 200,
          align: "center",
          render: (h, params) => {
            return h(
              "span",
              params.row.create_date
                ? new Date(params.row.create_date).Format("yyyy-MM-dd hh:mm:ss")
                : ""
            );
          },
        },
        {
          title: "修改时间",
          width: 200,
          align: "center",
          render: (h, params) => {
            return h(
              "span",
              params.row.update_date
                ? new Date(params.row.update_date).Format("yyyy-MM-dd hh:mm:ss")
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
                    type: "error",
                    size: "small",
                  },
                  on: {
                    click: () => {
                      this.changeState(params);
                    },
                  },
                },
                params.row.state == "2" ? "上架" : "下架"
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
        self.data1 = data.datas
          ? data.datas.sort((a, b) => {
              return a.id - b.id;
            })
          : [];
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

    // 查看
    check(params) {
      const self = this;
      self.describeModal.show = true;
      self.describeModal.content = params.row.tree_describe;
    },

    // 改变上架、下架状态
    changeState(params) {
      const self = this;
      const formItem = params.row;
      this.$Modal.confirm({
        onOk() {
          if (formItem.state) {
            if (formItem.state == "1") formItem.state = "2";
            else if (formItem.state == "2") formItem.state = "1";
          } else {
            formItem["state"] = "1";
          }
          Util.ajax
            .post(self.apiUrlPrefix + "update", formItem)
            .then((response) => {
              if (response.data.code == "100") {
                self.init();
                self.modal.show = false;
              } else {
                alert(response.data.msg);
              }
            });
        },
        content: `您确定要${formItem.state == "1" ? "下架" : "上架"}吗？`,
      });
    },

    //编辑
    edit(params) {
      const self = this;
      Util.ajax
        .post(this.apiUrlPrefix + "info/" + params.row.id)
        .then((response) => {
          if (response.data.code == "100") {
            self.clearFormItem();
            self.formItem = response.data.formItem;
            self.modal.show = true;
            self.modal.isadd = false;
          } else {
            alert(response.data.msg);
          }
        });
    },

    //保存
    update() {
      const self = this;
      !this.formItem.state && (this.formItem["state"] = "1");
      this.formItem["tree_price"] = this.treePrice;

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
        sapling_price: 1,
        tree_plant_price: 1,
        tree_curing_price: 1,
      };
    },

    // 搜索重置
    searchInit() {
      this.page.nowPage = 1;
      this.init();
    },

    // 图片选择
    chooseUpdate(arr) {
      this.uploadShow = false;
      this.formItem.tree_pic = "/" + arr[0].path;
    },
    closeImageModal(val) {
      this.uploadShow = val;
    },
  },
  
  mounted() {
    this.init();
  },

  computed: {
    treePrice() {
      return (
        this.formItem.sapling_price +
        this.formItem.tree_plant_price +
        this.formItem.tree_curing_price * 2
      );
    },
  },
};
</script>