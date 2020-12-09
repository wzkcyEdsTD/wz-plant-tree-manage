<style lang="less">
@import "./image.less";
</style>

<template>
  <div>
    <Row>
      <Upload
        ref="upload"
        action="/api/sys/attachment/uploadImg"
        :headers="header"
        :format="['jpg', 'jpeg', 'png', 'gif']"
        :on-format-error="formatError"
        accept="image/*"
        max-siez="10240"
        :on-success="uploadSuccess"
        style="display: inline-block"
        :show-upload-list="false"
        :on-progress="onProgress"
        multiple
      >
        <i-button type="success" icon="ios-cloud-upload-outline"
          >图片上传</i-button
        >
      </Upload>
      <Button-group>
        <i-button type="info" @click="checkAll()">全选</i-button>
        <i-button @click="uploadProgress.modalShow = true">上传进度</i-button>
        <i-button type="error" @click="deletes(checkids.ids)"
          >批量删除</i-button
        >
      </Button-group>
      <Input
        v-model="page.searchKey"
        placeholder="请输入关键字搜搜..."
        style="width: 200px"
      />
      <Button type="primary" icon="search" @click="searchInit()">搜索</Button>
    </Row>
    <br />
    <Row>
      <CheckboxGroup v-model="checkids.ids" @on-change="checkupdate">
        <template v-for="(item, index) in imglist">
          <Col :xs="12" :md="6">
            <div class="kl-imglist">
              <Card>
                <p slot="title">{{ item.name }}</p>
                <p slot="extra"><Checkbox :label="item.id">选择</Checkbox></p>
                <div class="kl-imglist-img">
                  <a
                    :href="
                      item.path.substr(0, 1) == '/'
                        ? `${item.path}`
                        : `/${item.path}`
                    "
                    target="_blank"
                    :title="item.name"
                  >
                    <img
                      :src="
                        item.path.substr(0, 1) == '/'
                          ? `${item.path}`
                          : `/${item.path}`
                      "
                    />
                    <!-- <img :src="'/api/sys/attachment/download?token='+$store.getters.token+'&id='+item.id" > -->
                  </a>
                  <!--<a :href="'/api/sys/attachment/download?token='+$store.getters.token+'&id='+item.id" target="_blank" :title="item.name">
                                    <img :src="'/api/sys/attachment/download?token='+$store.getters.token+'&id='+item.id" >
                                </a>-->
                </div>
                <div class="kl-imglist-btn">
                  <ButtonGroup>
                    <Button type="info" @click="detail(item)">详情</Button>
                    <Button type="error" @click="deletes(item.id)">删除</Button>
                  </ButtonGroup>
                </div>
              </Card>
            </div>
          </Col>
        </template>
      </CheckboxGroup>
    </Row>
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
        show-elevator
      ></Page>
    </div>
    <!--自定义modal-->
    <Modal v-model="modal.show" width="700" @keyup.esc="modal.show = false">
      <p slot="header" style="text-align: center">
        <span>图片详情</span>
      </p>
      <!--详情表单-->
      <div>
        <Row class-name="zkl-row-list">
          <Col :xs="8">名称</Col>
          <Col :xs="16">{{ modal.detailItem.name }}</Col>
        </Row>
        <Row class-name="zkl-row-list">
          <Col :xs="8">创建时间</Col>
          <Col :xs="16">{{ modal.detailItem.createTime | formatDate }}</Col>
        </Row>
        <Row class-name="zkl-row-list">
          <Col :xs="8">文件大小</Col>
          <Col :xs="16">{{ modal.detailItem.size | formatSize }}</Col>
        </Row>
      </div>
      <Row slot="footer">
        <Button type="info" size="large">确定</Button>
        <Button type="ghost" size="large" @click="modal.show = false"
          >取消</Button
        >
      </Row>
    </Modal>
    <!--自定义上传进度Modal-->
    <Modal
      v-model="uploadProgress.modalShow"
      width="700"
      @keyup.esc="uploadProgress.modalShow = false"
      class="upload-progress"
      :styles="{ top: '20px' }"
    >
      <p slot="header" style="text-align: center">
        <span>上传进度(完成后移除)</span>
      </p>
      <div>
        <div v-if="JSON.stringify(uploadProgress.uploadList) == '{}'">
          <h3 align="center" style="color: #bbb">
            文件已全部上传完毕，当前没有正在上传的文件
          </h3>
        </div>
        <template v-else v-for="(item, index) in uploadProgress.uploadList">
          <Row
            class-name="zkl-upload-row-list"
            v-if="JSON.stringify(item) != '{}'"
          >
            <Col :xs="6">{{ item.name }}</Col>
            <Col :xs="18">
              <Progress :percent="item.progress" status="active"></Progress>
            </Col>
          </Row>
        </template>
      </div>
      <Row slot="footer">
        <Button type="info" size="large" @click="clearUploadReady"
          >清空已上传文件</Button
        >
        <Button
          type="ghost"
          size="large"
          @click="uploadProgress.modalShow = false"
          >关闭</Button
        >
      </Row>
    </Modal>
  </div>
</template>


<script>
import Util from "@/libs/util";
export default {
  props: {
    propPageSize: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      //图片上传请求头
      header: {
        token: this.$store.getters.token,
      },
      //上传完成的个数
      uploadfiles: 0,
      //上传进度
      uploadProgress: {
        modalShow: false,
        uploadList: {},
      },
      //列表
      imglist: [],
      //分页
      page: {
        pageSize: 12,
        nowPage: 1,
        total: 100,
        sizeopt: [12, 24],
        type: "图片",
        searchKey: "", //搜索关键字
      },
      //全选
      checkids: {
        isAllCheck: false,
        ids: [],
      },
      //自定义modal
      modal: {
        show: false,
        detailItem: {},
      },
    };
  },
  filters: {
    formatDate(val) {
      return new Date(val).Format("yyyy-MM-dd hh:mm:ss");
    },
    formatSize(val) {
      if (val < 1000) {
        return val + "字节";
      } else if (val < 1000000) {
        return (val / 1000).toFixed(1) + "KB";
      } else {
        return (val / 1000000).toFixed(1) + "MB";
      }
    },
  },
  methods: {
    init() {
      this.checkids = {
        isAllCheck: false,
        ids: [],
      };
      this.$refs.upload.clearFiles();
      const self = this;
      Util.ajax
        .post("/api/sys/attachment/list", this.page)
        .then(function (response) {
          const data = response.data;
          self.imglist = data.datas;
          self.page.pageSize = data.pageSize;
          self.page.nowPage = data.nowPage;
          self.page.total = data.total;
        });
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
    clearUploadReady() {
      const arr = Object.keys(this.uploadProgress.uploadList);
      const self = this;
      let tempList = {};
      arr.forEach(function (item) {
        if (self.uploadProgress.uploadList[item].progress != 100) {
          //delete item;
          tempList[item] = self.uploadProgress.uploadList[item];
        }
      });
      self.uploadProgress.uploadList = tempList;
    },
    //文件上传时（自定义传输进度）
    onProgress(event, file, filelist) {
      this.uploadProgress.modalShow = true;
      this.uploadProgress.uploadList[file.name] = {
        name: file.name,
        progress: (event.loaded / event.total).toFixed(2) * 100,
      };
    },
    //上传成功
    uploadSuccess(response, file, filelist) {
      this.uploadfiles++;
      this.$Message.success({
        content: file.name + "上传成功",
        duration: 3,
      });
      //全部上传完后刷新
      if (filelist.length === this.uploadfiles) {
        this.uploadfiles = 0;
        this.init();
      }
    },
    //后缀校验失败
    formatError(file, filelist) {
      this.$Message.error({
        content: file.name + "文件格式不正确，请选择图片文件",
        duration: 3,
      });
    },
    //全选\反选
    checkAll() {
      const self = this;
      if (self.checkids.isAllCheck) {
        self.checkids = {
          isAllcheck: false,
          ids: [],
        };
      } else {
        this.imglist.forEach(function (item) {
          const itemId = item.id;
          let notHave = true;
          self.checkids.ids.forEach(function (id) {
            if (id === itemId) {
              notHave = false;
            }
          });
          if (notHave) {
            self.checkids.ids.push(itemId);
          }
        });
        self.checkids.isAllCheck = true;
      }
    },
    //图片（批量）删除
    deletes(ids) {
      let idstr = "";
      if (typeof ids === "number") {
        idstr = ids + "";
      } else if (!ids || ids.length == 0) {
        this.$Message.error({
          content: "请至少选择一个",
          duration: 3,
        });
        return;
      } else {
        ids.forEach(function (id) {
          idstr = idstr + "," + id;
        });
      }
      var self = this;
      //var ids = "";
      Util.ajax
        .post("/api/sys/attachment/delete", { id: idstr.replace(",", "") })
        .then(function (response) {
          if (response.data.code == "100") {
            self.$Message.info({
              content: "删除成功",
              duration: 3,
            });
            self.init();
          } else {
            self.$Message.error({
              content: "删除失败",
              duration: 3,
            });
          }
        });
    },
    //详情
    detail(item) {
      this.modal.show = true;
      this.modal.detailItem = item;
    },
    //选中的值更新了
    checkupdate(arr) {
      let tempArr = [];
      this.imglist.forEach(function (item) {
        arr.forEach(function (arrItem) {
          if (arrItem == item.id) {
            tempArr.push(item);
          }
        });
      });
      this.$emit("checkupdate", tempArr);
    },
    //搜索更新
    searchInit() {
      this.page.nowPage = 1;
      this.init();
    },
  },
  mounted() {
    this.checkids.ids = [];
    if (this.propPageSize > 0) {
      this.page.pageSize = this.propPageSize;
    }
    this.init();
  },
};
</script>