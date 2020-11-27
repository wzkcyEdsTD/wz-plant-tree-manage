<template>
  <Modal
    v-model="modalShow"
    width="700"
    class="upload-modal"
    @on-visible-change="change"
  >
    <p slot="header" style="text-align: center">
      <span>选择图片</span>
    </p>
    <div>
      <images-default
        @checkupdate="checkupdate"
        :propPageSize="8"
        v-if="modalShow"
      ></images-default>
    </div>
    <Row slot="footer">
      <Button type="info" size="large" @click="choose">确定</Button>
      <Button type="ghost" size="large" @click="modalShow = false">取消</Button>
    </Row>
  </Modal>
</template>

<script>
import imagesDefault from "@/views/sys/attachment/image";
export default {
  components: {
    imagesDefault,
  },
  props: {
    modalShow: {
      type: Boolean,
      default: false,
    },
    isChooseOne: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      chooseArr: [],
    };
  },
  methods: {
    //选择后
    choose() {
      if (this.isChooseOne) {
        if (this.chooseArr.length == 1) {
          this.$emit("chooseUpdate", this.chooseArr);
        } else {
          this.$Message.error({
            content: "只能选择一张图片",
            duration: 3,
          });
        }
      } else {
        this.$emit("chooseUpdate", this.chooseArr);
      }
    },
    //状态改变
    change(val) {
      this.$emit("closemodal", val);
    },
    //选择了一张图
    checkupdate(arr) {
      this.chooseArr = arr;
    },
  },
};
</script>

<style lang="less">
.upload-modal .ivu-modal-wrap {
  z-index: 2000 !important;
}
</style>