<style>
.mce-floatpanel {
  z-index: 1200 !important;
}
</style>
<template>
  <div>
    <Card shadow>
      <textarea class="tinymce-textarea" :id="id"></textarea>
      <div id="object" style="display: none"></div>
    </Card>
    <image-upload
      :modalShow="isMyChoose"
      @closemodal="closeImageModal"
      @chooseUpdate="chooseUpdate"
      :isChooseOne="false"
    ></image-upload>
  </div>
</template>
<script>
import tinymce from "tinymce/tinymce";
import theme from "tinymce/themes/modern";
import "./tinymce/plugins/index";
import zh_CN from "./tinymce/langs/zh_CN.GB2312";
import "./tinymce/skins/lightgray/skin.min.css";
import "./tinymce/skins/lightgray/content.min.css";
import imageUpload from "@/views/mylib/imageUpload/imageUpload";
export default {
  name: "text-editor",
  components: {
    imageUpload,
  },
  data() {
    return {
      spinShow: true,
      isMyChoose: false,
      tinymceSrc: null,
      id: "",
    };
  },
  model: {
    prop: "content",
    event: "keydown",
  },
  props: ["content", "pid", "theight"],
  /*watch:{
			content(val,oldVal){
				console.log(111);
				tinymce.get(this.id).setContent(this.HTMLDecode(val));
			}
		},*/
  methods: {
    init() {
      this.$nextTick(() => {
        let vm = this;
        let height = vm.theight ? vm.theight : 400;
        tinymce.init({
          selector: "#" + vm.id,
          branding: false,
          elementpath: false,
          height: height,
          language: "zh_CN.GB2312",
          menubar: "edit insert view format table tools",
          plugins: [
            "advlist autolink lists link image charmap print preview hr anchor pagebreak imagetools",
            "searchreplace visualblocks visualchars code fullpage fullscreen",
            "insertdatetime media nonbreaking save table contextmenu directionality",
            "textcolor colorpicker textpattern imagetools codesample",
          ], //paste 复制粘贴去除样式
          toolbar1:
            " newnote print preview | undo redo | insert | styleselect | forecolor backcolor bold italic fontselect fontsizeselect | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image emoticons media codesample fullscreen",
          autosave_interval: "20s",
          //选择图片
          myChoose: function (evt) {
            const rootControl = evt.control.rootControl;
            vm.tinymceSrc = rootControl.find("#src");
            //rootControl.find('tabpanel')[0].activateTab(0);
            vm.isMyChoose = true;
          },
          //测试多选
          chooseMore: function () {
            vm.isMyChoose = true;
          },
          image_advtab: false,
          setup: function (editor) {
            //初始化
            editor.on("init", function (e) {
              vm.spinShow = false;
              tinymce.get(vm.id).setContent(vm.HTMLDecode(vm.content));
            });
            //输入后更新
            editor.on("focusout", function (e) {
              vm.$emit("keydown", tinymce.get(vm.id).getContent());
            });
          },
        });
      });
    },
    closeImageModal(val) {
      this.isMyChoose = val;
    },
    chooseUpdate(arr) {
      this.isMyChoose = false;
      //this.tinymceSrc.value(arr[0].path+"");
      let html = "";
      arr.forEach(function (item) {
        html += `<img src="${
          item.path.substr(0, 1) == "/" ? `${item.path}` : `/${item.path}`
        }" style="max-width:100%;height:auto;"><br/>`;
      });
      tinymce.execCommand("mceInsertContent", false, html);
      //this.tinymceSrc.fire('change');
    },
    //反转义
    HTMLDecode(text) {
      /*const temp = document.getElementById('object');
				 temp.innerHTML = text;
				 var output = temp.innerText || temp.textContent;
				 temp.innerHTML = "";
				 return output;*/
      return text;
    },
  },
  mounted() {
    if (!this.pid) {
      this.id = "i" + (Math.random() + "").replace("0.", "");
    } else {
      this.id = this.pid;
    }
    this.init();
  },
  destroyed() {
    tinymce.get(this.id).destroy();
  },
};
</script>