<style lang="less">
    @import "attach.less";
</style>

<template>
    <div>
        <Row>
            <Upload ref="upload"
                    action="/api/sys/attachment/uploadAttach"
                    :headers="header"
                    :format="['doc','docx','xls','xlsx','ppt','pptx','zip','rar','pdf','txt']" :on-format-error="formatError"
                    max-siez="20480"
                    :on-success="uploadSuccess"
                    style="display:inline-block;"
                    :show-upload-list="false"
                    :on-progress="onProgress"
                    multiple>
                <i-button type="success" icon="ios-cloud-upload-outline">附件上传</i-button>
            </Upload>
            <Button-group>
                <i-button @click="uploadProgress.modalShow=true">上传进度</i-button>
                <i-button type="error" @click="deletes()">批量删除</i-button>
            </Button-group>
            <Input v-model="page.searchKey" placeholder="请输入关键字搜搜..." style="width: 200px" />
            <Button type="primary" icon="search" @click="init">搜索</Button>
        </Row>
        <br>
        <!--表单-->
        <Table ref="table" stripe border :loading="loading" :columns="columns1" :data="attachList" @on-selection-change="dochange"></Table>
        <br>
        <!--分页-->
        <div style="text-align: center">
            <Page :total="page.total" :page-size="page.pageSize" :current="page.pageNum" :page-size-opts="page.sizeopt"
                  @on-page-size-change="pageSizeChange" @on-change="pageOnChange" show-sizer show-elevator ></Page>
        </div>

        <!--自定义上传进度Modal-->
        <Modal v-model="uploadProgress.modalShow" width="700" @keyup.esc="uploadProgress.modalShow = false">
            <p slot="header" style="text-align:center">
                <span>上传进度(完成后移除)</span>
            </p>
            <div>
                <div v-if="JSON.stringify(uploadProgress.uploadList)=='{}'">
                    <h3 align="center" style="color:#bbb">文件已全部上传完毕，当前没有正在上传的文件</h3>
                </div>
                <template v-else v-for="(item,index) in uploadProgress.uploadList">
                    <Row class-name="zkl-upload-row-list" v-if="JSON.stringify(item)!='{}'">
                        <Col :xs="6">{{item.name}}</Col>
                        <Col :xs="18">
                        <Progress :percent="item.progress" status="active"></Progress>
                        </Col>
                    </Row>
                </template>
            </div>
            <Row slot="footer">
                <Button type="info" size="large" @click="clearUploadReady">清空已上传文件</Button>
                <Button type="ghost" size="large" @click="uploadProgress.modalShow = false">关闭</Button>
            </Row>
        </Modal>
    </div>
</template>


<script>
    import Util from '@/libs/util';
    export default {
        data(){
            return {
                //图片上传请求头
                header:{
                    'token':this.$store.getters.token
                },
                //上传进度
                uploadProgress:{
                    modalShow:false,
                    uploadList:{}
                },//上传进度
                uploadProgress:{
                    modalShow:false,
                    uploadList:{}
                },
                //列表数据
                attachList:[],
                //表格选中项
                tableSelect:[],
                //表格加载
                loading:true,
                //表格
                columns1: [
                    {
                        type: 'selection',
                        width: 60,
                        align: 'center'
                    },
                    {
                        title: '序号',
                        type:'index',
                        width:60,
                        align:'center'
                    },
                    {
                        title: '名称',
                        key: 'name'
                    },
                    {
                        title: '创建时间',
                        key: 'createTime',
                        render:(h,params) => {
                            return h('span',new Date(params.row.createTime).Format("yyyy-MM-dd hh:mm:ss"));
                        }
                    },
                    {
                        title: '文件大小',
                        key: 'size',
                        render:(h,params) => {
                            let size = params.row.size;
                            let resStr = "";
                            if(size<1000){
                                resStr =  (size)+"字节";
                            }else if(size<1000000){
                                resStr = (size/1000).toFixed(2)+"KB";
                            }else{
                                resStr = (size/1000000).toFixed(2)+"MB";
                            }
                            return h('span',resStr);
                        }
                    },
                    {
                        title: '操作',
                        key: 'action',
                        fixed: 'right',
                        render: (h, params) => {
                            return h('div', [
                                h('Button', {
                                    props: {
                                        type: 'primary',
                                        size: 'small'
                                    },
                                    style: {
                                        marginRight: '10px'
                                    },
                                    on: {
                                        click: () => {
                                            window.open("/api/sys/attachment/download?&token="+this.$store.getters.token+"&id="+params.row.id);
                                        }
                                    }
                                }, '下载'),
                                h('Button', {
                                    props: {
                                        type: 'error',
                                        size: 'small'
                                    },
                                    on: {
                                        click: () => {
                                            this.deletes(params.row.id)
                                        }
                                    }
                                }, '删除')
                            ]);
                        }
                    }
                ],
                //分页
                page:{
                    pageSize:12,
                    pageNum:1,
                    total:100,
                    sizeopt:[12,24],
                    type:"附件",
                    searchKey:""//搜索关键字
                },
                //上传完成的个数
                uploadfiles:0
            }
        },
        filters:{
            formatDate(val) {
                return new Date(val).Format("yyyy-MM-dd hh:mm:ss");
            }
        },
        methods:{
            init(){
                this.loading=true;
                this.$refs.upload.clearFiles();
                var self = this;
                Util.ajax.post("/api/sys/attachment/list",this.page).then(function (response) {
                    const data = response.data;
                    self.loading=false;
                    self.attachList = data.datas;
                    self.page.pageSize = data.pageSize;
                    self.page.pageNum = data.nowPage;
                    self.page.total = data.total;
                });
            },
            //分页
            pageOnChange(num){
                this.page.pageNum = num;
                this.init();
            },
            pageSizeChange(size){
                this.page.pageSize = size;
                this.init();
            },
            clearUploadReady(){
                const arr = Object.keys(this.uploadProgress.uploadList);
                const self=this;
                let tempList = {};
                arr.forEach(function (item) {
                   if(self.uploadProgress.uploadList[item].progress!=100){
                       //delete item;
                       tempList[item] = self.uploadProgress.uploadList[item];
                   }
                });
                self.uploadProgress.uploadList = tempList;
            },
            //文件上传时（自定义传输进度）
            onProgress(event,file,filelist){
                this.uploadProgress.modalShow=true;
                this.uploadProgress.uploadList[file.name] = {
                    "name":file.name,
                    "progress":(event.loaded/event.total).toFixed(2)*100
                };
            },
            //上传成功
            uploadSuccess(response,file,filelist){
                this.uploadfiles++;
                //全部上传完后刷新
                if(filelist.length === this.uploadfiles){
                    this.$Message.success({
                        content:'上传成功',
                        duration:3
                    });
                    this.uploadfiles = 0;
                    this.init();
                }
            },
            //后缀校验失败
            formatError(file,filelist){
                this.$Message.error({
                    content:file.name+'文件格式不正确',
                    duration:3
                });
            },
            //选中
            dochange(selection){
                this.tableSelect = selection;
            },
            //（批量）删除
            deletes(ids){
                var self = this;
                let idstr = "";
                if(typeof ids === "number"){
                    idstr = ids+"";
                }else if(!ids && self.tableSelect.length==0){
                    this.$Message.error({
                        content:'请至少选择一个',
                        duration:3
                    });
                    return;
                }else{
                    self.tableSelect.forEach(function (item) {
                        idstr = idstr+","+item.id;
                    });
                }
                this.$Modal.confirm({
                    onOk(){
                        //var ids = "";
                        Util.ajax.post("/api/sys/attachment/delete",{id:idstr.replace(",","")}).then(function (response) {
                            if(response.data.code=="100"){
                                self.init();
                            }else{
                                this.$Message.error({
                                    content:'删除失败',
                                    duration:3
                                });
                            }
                        });
                    },
                    content:"您确定要删除选中项吗？"
                });
            }
        },
        mounted(){
            this.init();
        }
    }
</script>