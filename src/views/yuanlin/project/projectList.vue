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
        <i-button type="info" @click="toadd()">添加</i-button>
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
    <Modal v-model="describeModal.show" width="1100" :mask-closable="false">
      <p slot="header" style="text-align: center">
        <span>详情</span>
      </p>
      <div>
        <Form :model="formItem" :label-width="80">
          <Row>
            <Col :span="8">
              <FormItem label="封面">
                <img
                  :src="formItem.project_cover"
                  style="
                    max-width: 95%;
                    max-height: 100px;
                    background: transparent !important;
                  "
                />
              </FormItem>
            </Col>
            <Col :span="8">
              <FormItem label="项目名称">
                <span>{{ formItem.project_name }}</span>
              </FormItem>
            </Col>
            <Col :span="8">
              <FormItem label="项目状态">
                <span>{{
                  formItem.state == "0"
                    ? "未上架"
                    : formItem.state == "1"
                    ? "预约上架"
                    : formItem.state == "2"
                    ? "筹款中"
                    : formItem.state == "3"
                    ? "养护中"
                    : formItem.state == "99"
                    ? "已结束"
                    : "无"
                }}</span>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col :span="24">
              <FormItem label="项目介绍">
                <!-- <span>{{
                  formItem.description
                    ? formItem.description.replace("↵", "")
                    : "无"
                }}</span> -->

                <span v-html="formItem.text"></span>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col :span="6">
              <FormItem label="创建时间">
                <span>{{
                  formItem.createtime
                    ? new Date(formItem.createtime).Format(
                        "yyyy-MM-dd hh:mm:ss"
                      )
                    : "无"
                }}</span>
              </FormItem>
            </Col>
            <Col :span="6">
              <FormItem label="发布时间">
                <span>{{
                  formItem.publish_date
                    ? new Date(formItem.publish_date).Format(
                        "yyyy-MM-dd hh:mm:ss"
                      )
                    : "无"
                }}</span>
              </FormItem>
            </Col>
            <Col :span="6">
              <FormItem label="筹款截止">
                <span>{{
                  formItem.funding_deadline
                    ? new Date(formItem.funding_deadline).Format(
                        "yyyy-MM-dd hh:mm:ss"
                      )
                    : "无"
                }}</span>
              </FormItem>
            </Col>
            <Col :span="6">
              <FormItem label="养护截止">
                <span>{{
                  formItem.maintain_deadline
                    ? new Date(formItem.maintain_deadline).Format(
                        "yyyy-MM-dd hh:mm:ss"
                      )
                    : "无"
                }}</span>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col :span="6">
              <FormItem label="树种类型">
                <span>{{
                  formItem.tree_num && treeIdMap[formItem.tree_num]
                    ? treeIdMap[formItem.tree_num].type
                    : "无"
                }}</span>
              </FormItem>
            </Col>
            <Col :span="6">
              <FormItem label="树种名称">
                <span>{{
                  formItem.tree_num && treeIdMap[formItem.tree_num]
                    ? treeIdMap[formItem.tree_num].name
                    : "无"
                }}</span>
              </FormItem>
            </Col>
            <Col :span="6">
              <FormItem label="上架数量">
                <span>{{ formItem.project_scale || 0 }}</span>
              </FormItem>
            </Col>
            <Col :span="6">
              <FormItem label="单价">
                <span>{{ formItem.sales || 0 }}</span>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col :span="6">
              <FormItem label="认养总数">
                <span>{{ formItem.rzryzs || 0 }}</span>
              </FormItem>
            </Col>
            <Col :span="6">
              <FormItem label="已认种数">
                <span>{{ formItem.yrzs || 0 }}</span>
              </FormItem>
            </Col>
            <Col :span="6">
              <FormItem label="最大认养数">
                <span>{{ formItem.zdrys || 0 }}</span>
              </FormItem>
            </Col>
            <Col :span="6">
              <FormItem label="认养用户数">
                <span>{{ formItem.yhzs || 0 }}</span>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col :span="12">
              <FormItem label="地理位置">
                <div id="arcgisMap2" style="width: 300px; height: 200px"></div>
              </FormItem>
            </Col>
            <Col :span="12">
              <FormItem label="全景链接">
                <a
                  v-if="formItem.ar_url"
                  :href="formItem.ar_url"
                  target="_blank"
                  rel="noopener noreferrer"
                  >{{ formItem.ar_url }}</a
                >
                <span v-else>无</span>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col :span="12">
              <FormItem label="分布图">
                <a
                  v-if="formItem.ar_url"
                  :href="formItem.ar_url"
                  target="_blank"
                  rel="noopener noreferrer"
                  >查看树-公益牌分布图</a
                >
                <span v-else>无</span>
              </FormItem>
            </Col>
            <Col :span="12">
              <FormItem label="公益牌状态">
                <span>{{
                  formItem.nameplate_state == "0"
                    ? "未制作"
                    : formItem.nameplate_state == "1"
                    ? "已制作"
                    : formItem.nameplate_state == "2"
                    ? "已解挂"
                    : "无"
                }}</span>
              </FormItem>
            </Col>
          </Row>
        </Form>
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
        <span>项目信息</span>
      </p>
      <!--表单-->
      <div>
        <Form :model="formItem" :label-width="80">
          <Row>
            <Col :span="8">
              <FormItem label="项目名称">
                <Input
                  v-model="formItem.project_name"
                  placeholder="请输入名称"
                ></Input>
              </FormItem>
            </Col>
          </Row>
          <FormItem label="项目封面">
            <Row>
              <Col :span="18">
                <Input
                  v-model="formItem.project_cover"
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
                  :src="formItem.project_cover"
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
            <Col :span="8">
              <FormItem label="项目状态">
                <div style="display: flex; align-items: center">
                  <span style="padding-right: 10px">立即上架</span>
                  <i-switch size="small" v-model="saleState" />
                </div>
              </FormItem>
            </Col>
            <Col :span="8">
              <FormItem label="预约上架">
                <DatePicker
                  type="date"
                  placeholder="选择预约上架日期"
                  style="width: 180px"
                  :options="publishOptions"
                  v-model="publishDate"
                ></DatePicker></FormItem
            ></Col>
          </Row>
          <Row>
            <Col :span="8">
              <FormItem label="筹款截止">
                <DatePicker
                  type="date"
                  placeholder="选择截止日期"
                  style="width: 180px"
                  :value="
                    new Date(formItem.funding_deadline).Format('yyyy-MM-dd')
                  "
                  v-model="fundingDeadlineDate"
                ></DatePicker>
              </FormItem>
            </Col>
            <Col :span="8">
              <FormItem label="养护截止">
                <DatePicker
                  type="date"
                  placeholder="选择截止日期"
                  style="width: 180px"
                  :value="
                    new Date(formItem.maintain_deadline).Format('yyyy-MM-dd')
                  "
                  v-model="maintainDeadlineDate"
                ></DatePicker>
              </FormItem>
            </Col>
          </Row>
          <FormItem label="项目介绍">
            <Input
              type="textarea"
              :rows="3"
              v-model="formItem.description"
              placeholder="请输入内容"
            ></Input>
          </FormItem>
          <Row>
            <Col :span="6">
              <FormItem label="备选树类型">
                <Select
                  v-model="checkTreeType"
                  placeholder="备选树类型"
                  style="width: 180px"
                >
                  <Option
                    v-for="item in treeTypeList"
                    :key="item.value"
                    :value="item.value"
                    >{{ item.name }}</Option
                  >
                </Select>
              </FormItem>
            </Col>
            <Col :span="6">
              <FormItem label="备选树种">
                <Select
                  v-model="checkTree"
                  placeholder="备选树种"
                  style="width: 180px"
                >
                  <Option
                    v-for="item in treeList"
                    :key="item.value"
                    :value="item.value"
                    >{{ item.name }}</Option
                  >
                </Select>
              </FormItem>
            </Col>
            <Col :span="4">
              <FormItem label="上架数量">
                <InputNumber
                  v-model="formItem.project_scale"
                  placeholder="请输入数量"
                ></InputNumber>
              </FormItem>
            </Col>
            <Col :span="4">
              <FormItem label="单价">
                <InputNumber
                  v-model="treePrice"
                  disabled
                  placeholder="单价"
                ></InputNumber>
              </FormItem>
            </Col>
            <Col :span="4">
              <FormItem label="绿值">
                <InputNumber disabled placeholder="绿值"></InputNumber>
              </FormItem>
            </Col>
          </Row>
          <Row
            ><Col :span="4">
              <FormItem label="可购上限">
                <InputNumber
                  v-model="formItem.max_purchase_count"
                  placeholder="可购上限"
                ></InputNumber>
              </FormItem> </Col
          ></Row>
          <Row>
            <Col :span="5">
              <FormItem label="项目位置">
                <div>请在地图上点选项目位置</div>
                <div id="arcgisMap" style="width: 300px; height: 200px"></div>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col :span="7">
              <FormItem label="全景VR链接">
                <Input
                  v-model="formItem.ar_url"
                  placeholder="若有全景，请输入链接"
                ></Input>
              </FormItem>
            </Col>
          </Row>
          <FormItem label="内容">
            <text-editor
              v-model="formItem.text"
              :content="formItem.text"
            ></text-editor>
          </FormItem>
        </Form>
      </div>
      <Row slot="footer">
        <Button type="info" size="large" @click="update({ type: 1 })"
          >立即发布</Button
        >
        <Button
          type="success"
          size="large"
          :disabled="saleState"
          @click="update({ type: 2 })"
          >添加至项目库，暂不发布</Button
        >
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
import { loadModules } from "esri-loader";
import Util from "@/libs/util";
import TextEditor from "@/views/mylib/text-editor/text-editor.vue";
import Uploader from "@/views/mylib/imageUpload/imageUpload.vue";
const OPTION = {
  url:
    "https://lysb.lucheng.gov.cn/lc/libs/arcgis_js_v412_api/arcgis_js_api/library/4.12/dojo/dojo.js",
};
export default {
  components: { TextEditor, Uploader },
  data() {
    return {
      //接口前缀
      apiUrlPrefix: "/api/sys/yl/project/",
      uploadShow: false,
      saleState: true,
      map: null,
      view: null,
      checkPoint: {
        x: null,
        y: null,
      },
      modal: {
        show: false,
        isadd: true,
      },
      describeModal: {
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
          width: 120,
        },
        {
          title: "封面",
          width: 160,
          align: "center",
          render: (h, params) => {
            return h("img", {
              attrs: {
                src: params.row.project_cover,
                style: "width: 120px;",
              },
            });
          },
        },
        {
          title: "业主单位",
          key: "proprietor",
          width: 120,
        },
        {
          title: "联系电话",
          key: "phone",
          width: 110,
        },
        {
          title: "养护周期",
          key: "maintenance_period",
          width: 100,
          align: "center",
        },
        {
          title: "认种认养量",
          width: 100,
          align: "center",
          render: (h, params) => {
            return h(
              "span",
              `${params.row.sales_volumequantity || 0} / ${
                params.row.project_scale || 0
              }`
            );
          },
        },
        {
          title: "当前状态",
          width: 100,
          render: (h, params) => {
            return h(
              "span",
              params.row.state == "0"
                ? "未上架"
                : params.row.state == "1"
                ? "预约上架"
                : params.row.state == "2"
                ? "筹款中"
                : params.row.state == "3"
                ? "养护中"
                : params.row.state == "99"
                ? "已结束"
                : "无"
            );
          },
        },
        {
          title: "累计筹款",
          width: 100,
          render: (h, params) => {
            return h("span", params.row.salesquantity || 0);
          },
        },
        {
          title: "公益牌状态",
          width: 100,
          render: (h, params) => {
            return h(
              "span",
              params.row.nameplate_state == "0"
                ? "未制作"
                : params.row.nameplate_state == "1"
                ? "已制作"
                : params.row.nameplate_state == "2"
                ? "已解挂"
                : "无"
            );
          },
        },
        {
          title: "发布日期",
          width: 120,
          render: (h, params) => {
            return h(
              "span",
              params.row.publish_date
                ? new Date(params.row.publish_date).Format("yyyy-MM-dd")
                : ""
            );
          },
        },
        {
          title: "筹款截止日期",
          width: 120,
          render: (h, params) => {
            return h(
              "span",
              params.row.funding_deadline
                ? new Date(params.row.funding_deadline).Format("yyyy-MM-dd")
                : ""
            );
          },
        },
        {
          title: "养护截止时间",
          width: 120,
          render: (h, params) => {
            return h(
              "span",
              params.row.maintain_deadline
                ? new Date(params.row.maintain_deadline).Format("yyyy-MM-dd")
                : ""
            );
          },
        },
        {
          title: "操作",
          fixed: "right",
          minWidth: 200,
          key: "action",
          render: (h, params) => {
            return h("div", [
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
                      this.check(params);
                    },
                  },
                },
                "查看"
              ),
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
                params.row.state == "0" || params.row.state == "1"
                  ? "上架"
                  : "下架"
              ),
            ]);
          },
        },
      ],
      data1: [], //表格数据
      tableSelect: [], //表格选中项
      loading: true, //表格加载
      parkList: [],
      publishOptions: {
        disabledDate(date) {
          return date && date.valueOf() < Date.now() - 86400000;
        },
      },
      treeMap: {},
      treeIdMap: {},
      checkTree: "",
      treeList: [],
      checkTreeType: "",
      treeTypeList: [],
      checkTreeId: "",
      treePrice: 0,
      publishDate: "",
      fundingDeadlineDate: "",
      maintainDeadlineDate: "",
    };
  },
  methods: {
    //初始化
    init() {
      const self = this;
      self.loading = true;
      Util.ajax
        .post(this.apiUrlPrefix + "list", this.page)
        .then(function (response) {
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
      this.initMap();
      this.checkTreeType = this.treeTypeList[0].value;
      this.modal.show = true;
      this.modal.isadd = true;
    },

    getRemain(data) {
      if (data.length > 1) {
        this.formItem.tree_type = [];
        let i = String(data.length - 1);
        this.formItem.tree_type = [data[i]];
      }
    },

    // 查看
    check(params) {
      const self = this;
      Util.ajax
        .post(this.apiUrlPrefix + "info/" + params.row.id)
        .then(function (response) {
          if (response.data.code == "100") {
            self.clearFormItem();
            self.formItem = response.data.formItem;

            self.fundingDeadlineDate = "";
            self.maintainDeadlineDate = "";

            self.formItem.funding_deadline &&
              (self.fundingDeadlineDate = new Date(
                self.formItem.funding_deadline
              ).Format("yyyy-MM-dd"));

            self.formItem.maintain_deadline &&
              (self.maintainDeadlineDate = new Date(
                self.formItem.maintain_deadline
              ).Format("yyyy-MM-dd"));

            self.formItem.tree_num &&
              self.treeIdMap[self.formItem.tree_num] &&
              (self.checkTreeType =
                self.treeIdMap[self.formItem.tree_num].type);

            if (self.formItem.centerx && self.formItem.centery) {
              const numX = Number(self.formItem.centerx);
              const numY = Number(self.formItem.centery);
              if (!isNaN(numX) && !isNaN(numY)) {
                const center = [numX, numY];
                self.checkPoint = {
                  x: numX,
                  y: numY,
                };
                self.initMap2({ center });
              } else {
                self.initMap2();
              }
            }

            self.describeModal.show = true;
          } else {
            alert(response.data.msg);
          }
        });
    },

    // 改变上架、下架状态
    changeState(params) {
      const self = this;
      let formItem = params.row;
      this.$Modal.confirm({
        onOk() {
          if (
            formItem.state &&
            (formItem.state == "0" || formItem.state == "1")
          ) {
            formItem.state = "2";
          } else {
            formItem.state = "0";
          }

          const form = {};
          for (let k in formItem) {
            if (~["id", "state"].indexOf(k)) {
              form[k] = formItem[k];
            }
          }
          formItem = form;

          Util.ajax
            .post(self.apiUrlPrefix + "update", formItem)
            .then(function (response) {
              if (response.data.code == "100") {
                self.init();
                self.modal.show = false;
              } else {
                alert(response.data.msg);
              }
            });
        },
        content: `您确定要${
          formItem.state == "0" || formItem.state == "1" ? "上架" : "下架"
        }吗？`,
      });
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

            self.fundingDeadlineDate = "";
            self.maintainDeadlineDate = "";

            self.formItem.funding_deadline &&
              (self.fundingDeadlineDate = new Date(
                self.formItem.funding_deadline
              ).Format("yyyy-MM-dd"));

            self.formItem.maintain_deadline &&
              (self.maintainDeadlineDate = new Date(
                self.formItem.maintain_deadline
              ).Format("yyyy-MM-dd"));

            self.formItem.tree_num &&
              self.treeIdMap[self.formItem.tree_num] &&
              (self.checkTreeType =
                self.treeIdMap[self.formItem.tree_num].type);

            if (self.formItem.centerx && self.formItem.centery) {
              const numX = Number(self.formItem.centerx);
              const numY = Number(self.formItem.centery);
              if (!isNaN(numX) && !isNaN(numY)) {
                const center = [numX, numY];
                self.checkPoint = {
                  x: numX,
                  y: numY,
                };
                self.initMap({ center });
              } else {
                self.initMap();
              }
            }

            self.modal.show = true;
            self.modal.isadd = false;
          } else {
            alert(response.data.msg);
          }
        });
    },

    //保存
    update({ type }) {
      const self = this;

      if (!this.checkPoint.x && !this.checkPoint.y) {
        this.$Modal.warning({
          content: "请选择项目位置！",
        });
      } else {
        this.formItem.centerx = String(this.checkPoint.x);
        this.formItem.centery = String(this.checkPoint.y);

        if (type == 1) {
          this.formItem["state"] = "2";
        } else if (type == 2) {
          this.formItem["state"] = "0";
        }

        if (!this.formItem.project_scale) {
          this.formItem["project_scale"] = 1;
        }

        if (!this.formItem.max_purchase_count) {
          this.formItem["max_purchase_count"] = 1;
        }

        this.formItem["tree_num"] = this.checkTreeId;

        this.formItem["publish_date"] = Date.parse(new Date());

        this.fundingDeadlineDate &&
          (this.formItem["funding_deadline"] = Date.parse(
            new Date(this.fundingDeadlineDate)
          ));

        this.maintainDeadlineDate &&
          (this.formItem["maintain_deadline"] = Date.parse(
            new Date(this.maintainDeadlineDate)
          ));

        // 删除不需要传的属性
        const form = {};
        for (let k in this.formItem) {
          if (
            !~[
              "name",
              "tree_name",
              "rzryzs",
              "sales",
              "yhzs",
              "yrzs",
              "zdrys",
              "_index",
              "_rowKey",
            ].indexOf(k)
          ) {
            form[k] = this.formItem[k];
          }
        }
        this.formItem = form;

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
      }
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
      this.formItem = {};
    },
    //搜索重置
    searchInit() {
      this.page.nowPage = 1;
      this.init();
    },
    //图片选择
    chooseUpdate(arr) {
      this.uploadShow = false;
      this.formItem.project_cover = "/" + arr[0].path;
    },
    closeImageModal(val) {
      this.uploadShow = val;
    },

    // 地图功能
    initMap(option) {
      const self = this;
      return new Promise((resolve, reject) => {
        loadModules(
          [
            "esri/Map",
            "esri/views/MapView",
            "esri/layers/VectorTileLayer",
            "esri/layers/GraphicsLayer",
            "esri/Graphic",
          ],
          OPTION
        ).then(([Map, MapView, VectorTileLayer, GraphicsLayer, Graphic]) => {
          self.map = new Map();
          self.view = new MapView({
            container: "arcgisMap",
            map: self.map,
            center: [120.6635, 27.9997],
            zoom: 13,
          });
          const layer = new VectorTileLayer({
            url:
              "https://services.wzmap.gov.cn/server/rest/services/Hosted/YL/VectorTileServer",
          });
          self.map.add(layer);

          const graphicsLayer = new GraphicsLayer();
          self.map.add(graphicsLayer);

          const markerSymbol = {
            type: "simple-marker",
            color: [255, 255, 255],
            size: "13px",
            outline: {
              color: [41, 68, 222],
              width: 3,
            },
          };

          // 编辑
          if (option && option.center) {
            self.view.goTo({
              center: option.center,
            });
            graphicsLayer.removeAll();

            const pointGraphic = new Graphic({
              geometry: {
                type: "point",
                x: option.center[0],
                y: option.center[1],
              },
              symbol: markerSymbol,
            });

            graphicsLayer.add(pointGraphic);
          }

          // 点击选点
          self.view.on("click", (evt) => {
            graphicsLayer.removeAll();

            self.checkPoint = {
              x: evt.mapPoint.x,
              y: evt.mapPoint.y,
            };

            const point = {
              type: "point",
              x: evt.mapPoint.x,
              y: evt.mapPoint.y,
            };

            const pointGraphic = new Graphic({
              geometry: point,
              symbol: markerSymbol,
            });

            graphicsLayer.add(pointGraphic);
          });
        });
      });
    },

    initMap2(option) {
      const self = this;
      return new Promise((resolve, reject) => {
        loadModules(
          [
            "esri/Map",
            "esri/views/MapView",
            "esri/layers/VectorTileLayer",
            "esri/layers/GraphicsLayer",
            "esri/Graphic",
          ],
          OPTION
        ).then(([Map, MapView, VectorTileLayer, GraphicsLayer, Graphic]) => {
          self.map = new Map();
          self.view = new MapView({
            container: "arcgisMap2",
            map: self.map,
            center: [120.6635, 27.9997],
            zoom: 13,
          });
          const layer = new VectorTileLayer({
            url:
              "https://services.wzmap.gov.cn/server/rest/services/Hosted/YL/VectorTileServer",
          });
          self.map.add(layer);

          const graphicsLayer = new GraphicsLayer();
          self.map.add(graphicsLayer);

          const markerSymbol = {
            type: "simple-marker",
            color: [255, 255, 255],
            size: "13px",
            outline: {
              color: [41, 68, 222],
              width: 3,
            },
          };

          // 编辑
          if (option && option.center) {
            self.view.goTo({
              center: option.center,
            });
            graphicsLayer.removeAll();

            const pointGraphic = new Graphic({
              geometry: {
                type: "point",
                x: option.center[0],
                y: option.center[1],
              },
              symbol: markerSymbol,
            });

            graphicsLayer.add(pointGraphic);
          }
        });
      });
    },

    // 初始化树木列表
    initTreeList() {
      const self = this;
      Util.ajax.post("/api/sys/yl/tree/getAll").then((response) => {
        if (response.data) {
          this.treeMap = {};
          this.treeIdMap = {};

          const list = response.data;
          list.map((item) => {
            !this.treeMap[item.tree_type] &&
              (this.treeMap[item.tree_type] = []);
            this.treeMap[item.tree_type].push({
              id: item.id,
              name: item.tree_name,
              value: item.tree_name,
              tree_price: item.tree_price,
            });

            this.treeIdMap[item.id] = {
              id: item.id,
              name: item.tree_name,
              value: item.tree_name,
              type: item.tree_type,
              tree_price: item.tree_price,
            };
          });

          this.treeTypeList = [];
          for (let k in this.treeMap) {
            this.treeTypeList.push({
              value: k,
              name: k,
            });
          }
          this.checkTreeType = this.treeTypeList[0].value;
        }
      });
    },
  },
  mounted() {
    this.init();
    this.initTreeList();
  },
  watch: {
    publishDate(val) {
      if (val) {
        this.saleState = false;
      }
    },
    checkTreeType(val) {
      this.treeList = this.treeMap[val];
      this.checkTree = this.treeList[0].name;
    },
    checkTree(val) {
      const self = this;
      this.treeList.map((item) => {
        if (item.name == val) {
          self.treePrice = item.tree_price;
          self.checkTreeId = item.id;
        }
      });
    },
  },
};
</script>

<style>
.esri-ui-top-left,
.esri-ui .esri-attribution {
  display: none;
}
</style>