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
        <Form :model="formItem" :label-width="80">
          <div
            v-for="(item, index) in formItem.datas"
            :key="index"
            style="border: solid 1px #dddee1"
          >
            <Row>
              <Col :span="4">
                <FormItem label="记录日期">
                  <span>{{
                    new Date(item.createtime).Format("yyyy-MM-dd")
                  }}</span>
                </FormItem>
              </Col>
              <Col :span="4">
                <FormItem label="养护周期">
                  <span>{{ item.maintenance_period || 0 }}</span>
                </FormItem>
              </Col>
              <Col :span="4">
                <FormItem label="种植/养护">
                  <span>{{
                    item.maintence_flg == 1
                      ? "种植"
                      : item.maintence_flg == 2
                      ? "养护"
                      : ""
                  }}</span>
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col :span="6">
                <FormItem label="记录人员">
                  <span>{{ item.proprietor }}</span>
                </FormItem>
              </Col>
              <Col :span="6">
                <FormItem label="记录描述">
                  <Input
                    v-model="item.content"
                    placeholder="请输入记录描述"
                  ></Input>
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col :span="4">
                <FormItem label="审核状态">
                  <span>{{
                    item.state == 1
                      ? "通过"
                      : item.state == 2
                      ? "不通过"
                      : "未审核"
                  }}</span>
                </FormItem>
              </Col>
              <Col :span="6">
                <FormItem label="审核时间">
                  <span>{{
                    item.state_updatetime
                      ? new Date(item.state_updatetime).Format(
                          "yyyy-MM-dd hh:mm:ss"
                        )
                      : ""
                  }}</span>
                </FormItem>
              </Col>
              <Col :span="4">
                <FormItem label="操作">
                  <Button
                    type="success"
                    size="small"
                    @click="audit(1, item, index)"
                    >通过</Button
                  >
                  <Button
                    type="error"
                    size="small"
                    @click="audit(2, item, index)"
                    >驳回</Button
                  >
                </FormItem>
              </Col>
            </Row>
            <FormItem
              v-for="_index of 5"
              :key="_index"
              :label="`现场照片${_index}`"
            >
              <Row>
                <Col :span="10">
                  <Input
                    v-model="imgList[`item_${index}`][_index]"
                    placeholder="输入图片链接地址"
                  >
                    <Button
                      slot="append"
                      icon="upload"
                      @click.native="uploadFun(index, _index)"
                      >选择或上传</Button
                    >
                  </Input>
                </Col>
                <Col :span="6">
                  <img
                    :src="imgList[`item_${index}`][_index] || ''"
                    style="
                      max-width: 95%;
                      max-height: 100px;
                      background: transparent !important;
                    "
                  />
                </Col>
              </Row>
            </FormItem>
          </div>
        </Form>
      </div>
      <Row slot="footer">
        <Button type="info" size="large" @click="modal.show = false"
          >确定</Button
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
      apiUrlPrefix: "/api/sys/yl/maintain/",
      uploadShow: false,
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
          width: 120,
          align: "center",
        },
        {
          title: "所属项目",
          key: "project_name",
          width: 200,
          align: "center",
        },
        {
          title: "记录添加单位",
          width: 200,
          align: "center",
          render: (h, params) => {
            return h("span", params.row.proprietor || "");
          },
        },
        {
          title: "种植/养护",
          minWidth: 120,
          align: "center",
          render: (h, params) => {
            return h(
              "span",
              params.row.maintence_flg == 1
                ? "种植"
                : params.row.maintence_flg == 2
                ? "养护"
                : ""
            );
          },
        },
        {
          title: "养护进度",
          minWidth: 100,
          align: "center",
          render: (h, params) => {
            return h(
              "span",
              `${params.row.maintence_num || 0} / ${
                params.row.maintenance_period || 0
              }`
            );
          },
        },
        {
          title: "记录添加时间",
          width: 220,
          align: "center",
          render: (h, params) => {
            return h(
              "span",
              new Date(params.row.createtime).Format("yyyy-MM-dd hh:mm:ss")
            );
          },
        },
        {
          title: "本次记录描述",
          minWidth: 200,
          align: "center",
          render: (h, params) => {
            return h("span", params.row.content || "无");
          },
        },
        {
          title: "操作",
          fixed: "right",
          minWidth: 100,
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
      imgList: [],
      currentImg: null,
      projectNum: null,
      imgUploadMap: {},
    };
  },
  methods: {
    // 初始化
    init(flag) {
      const self = this;
      self.loading = true;

      const page = flag
        ? {
            pageSize: 10,
            nowPage: 1,
            total: 100,
            sizeopt: [10, 30, 60, 100],
            key: "",
            bean: {},
          }
        : this.page;

      Util.ajax.post(this.apiUrlPrefix + "pclist", page).then((response) => {
        self.loading = false;
        const data = response.data;
        self.data1 = data.datas;
        self.page.pageSize = data.pageSize;
        self.page.nowPage = data.nowPage;
        self.page.total = data.total;
      });
    },

    // 查看
    check(params) {
      const self = this;
      const page = this.page;
      this.projectNum = page.bean["project_num"] = params.row.project_num;
      Util.ajax.post(this.apiUrlPrefix + "alllist", page).then((response) => {
        if (response.data.code == "100") {
          self.clearFormItem();
          self.formItem = response.data.page;

          // 绑定图片路径
          self.formItem.datas.map((item, index) => {
            self.imgList[`item_${index}`] = {};
            for (let i = 1; i < 6; i++) {
              self.imgList[`item_${index}`][i] = item[`attachment_${i}`]
                ? item[`attachment_${i}`].path
                : "";
            }
            item["proprietor"] = params.row.proprietor || "";
          });
          self.modal.show = true;
        } else {
          alert(response.data.msg);
        }
      });
    },

    // 审核
    audit(auditState, params, listIndex) {
      const self = this;
      /* if (auditState == params.state) {
        if (auditState == 1) {
          this.$Message.error("您已经审核通过该项！");
        } else {
          this.$Message.error("您已经驳回该项！");
        }
        return;
      } else if (params.state == 1) {
        this.$Message.error("您已经审核通过该项！");
        return;
      } */

      let updateObj = {};
      if (auditState == 1) {
        updateObj = {
          id: params.id,
          content: params.content,
          state: auditState,
          state_updatetime: Date.parse(new Date()),
        };

        if (self.imgUploadMap[`item_${listIndex}`]) {
          const sObj = self.imgUploadMap[`item_${listIndex}`];
          for (let k in sObj) {
            updateObj[`picture_${k}`] = sObj[k][0].id;
            updateObj[`attachment_${k}`] = sObj[k][0];
          }
        }
      } else if (auditState == 2) {
        updateObj = {
          id: params.id,
          state: auditState,
          state_updatetime: Date.parse(new Date()),
        };
      }

      self.$Modal.confirm({
        onOk() {
          Util.ajax
            .post(self.apiUrlPrefix + "update", updateObj)
            .then((response) => {
              if (response.data.code == "100") {
                self.page.bean = {};
                const checkParams = {
                  row: {
                    project_num: self.projectNum,
                  },
                };
                self.init(true);
                self.check(checkParams);
                self.imgUploadMap = {};
              } else {
                self.$Message.error(response.data.msg);
              }
            });
        },
        content: `您确定要${auditState == 1 ? `通过` : `驳回`}该项吗？`,
      });
    },

    // 保存
    update() {
      const self = this;
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
      this.formItem = {};
    },

    // 搜索重置
    searchInit() {
      this.page.nowPage = 1;
      this.init();
    },

    // 图片上传
    uploadFun(index, _index) {
      this.uploadShow = true;
      this.currentImg = [index, _index];
    },

    // 图片选择
    chooseUpdate(arr) {
      this.uploadShow = false;
      const [index, _index] = this.currentImg;
      this.imgList[`item_${index}`][_index] =
        arr[0].path.substr(0, 1) == "/" ? `${arr[0].path}` : `/${arr[0].path}`;

      if (!this.imgUploadMap[`item_${index}`])
        this.imgUploadMap[`item_${index}`] = {};
      this.imgUploadMap[`item_${index}`][_index] = arr;
    },
    closeImageModal(val) {
      this.uploadShow = val;
    },
  },
  mounted() {
    this.init();
  },
};
</script>