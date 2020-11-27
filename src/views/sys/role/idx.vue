<style scope>
    .layout{position: relative;}
    .ivu-page-options-sizer{width: 80px;}
</style>
<template>
    <div class="layout">
        <Row>
            <Button-group>
                <i-button type="info" @click="toadd()">添加</i-button>
                <!--<i-button type="error" @click="batchDelete()">删除</i-button>-->
            </Button-group>
            <Input v-model="page.key" placeholder="请输入关键字搜搜..." style="width: 200px" />
            <span  style="margin: 0 10px;"><Button type="primary" icon="search" @click="searchInit">搜索</Button></span>
        </Row>
        <br>
        <!--表单-->
        <Table ref="table" stripe border :loading="loading" :columns="columns1" :data="data1" @on-selection-change="dochange"></Table>
        <br>
        <!--分页-->
        <div style="text-align: center">
            <Page :total="page.total" :page-size="page.pageSize" :current="page.nowPage" :page-size-opts="page.sizeopt"
                  @on-page-size-change="pageSizeChange" @on-change="pageOnChange" show-sizer show-elevator ></Page>
        </div>
        <!-- 自定义Modal -->
        <Modal v-model="modal.show" width="700" :mask-closable=false>
            <p slot="header" style="text-align:center">
                <span>角色信息</span>
            </p>
            <!--表单-->
            <div>
                <Form :model="formItem" :label-width="80">
                    <Tabs type="card">
                        <TabPane label="基本设置">
                            <FormItem label="名称">
                                <Input v-model="formItem.name" placeholder="名称"></Input>
                            </FormItem>
                        </TabPane>
                        <TabPane label="资源设置">
                            <ResourceTree ref="resourceTree"></ResourceTree>
                        </TabPane>
                    </Tabs>
                </Form>
            </div>
            <Row slot="footer">
                <Button type="info" size="large" @click="update()">确定</Button>
                <Button type="ghost" size="large" @click="modal.show = false">取消</Button>
            </Row>
        </Modal>
    </div>
</template>
<script>
    import Util from '@/libs/util';
    import ResourceTree from '@/views/mylib/resourceTree';
    export default {
        name:'sysrole',
        components:{
            ResourceTree
        },
        data () {
            return {
                modal:{
                    show:false,
                    isadd:true
                },
                page:{
                    pageSize:10,
					nowPage:1,
                    total:100,
                    sizeopt:[10,30,60,100],
                    key:""
                },
                //表单
                formItem:{
                    name:""
                },
                columns1: [
                    {
                        type: 'selection',
                        width: 60,
                        align: 'center'
                    },
                    {
                        title: '序号',
                        type:'index',
                        width:80,
                        align:'center'
                    },
                    {
                        title: '角色名称',
                        key: 'name'
                    },
                    {
                        title: '操作',
                        key: 'action',
                        render: (h, params) => {
                            return params.row.name=="超级管理员"?h('div','禁止修改'):h('div', [
                                h('Button', {
                                    props: {
                                        type: 'primary',
                                        size: 'small'
                                    },
                                    style: {
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.edit(params)
                                        }
                                    }
                                }, '编辑'),
                                h('Button', {
                                    props: {
                                        type: 'error',
                                        size: 'small'
                                    },
                                    on: {
                                        click: () => {
                                            this.delete(params)
                                        }
                                    }
                                }, '删除')
                            ]);
                        }
                    }
                ],
                data1: [],//表格数据
                tableSelect:[],//表格选中项
                loading:true//表格加载
            }
        },
        methods:{
            //初始化
            init(){
                const self = this;
                self.loading=true;
                Util.ajax.post("/api/sys/role/list",this.page).then(function (response) {
                    self.loading=false;
                    const data = response.data;
                    self.data1 = data.datas;
                    self.page.pageSize = data.pageSize;
                    self.page.nowPage = data.nowPage;
                    self.page.total = data.total;
                });
            },
            toadd(){
                this.clearFormItem();
                this.modal.show= true;
                this.modal.isadd= true;
            },
            //编辑
            edit(params){
                const self = this;
                Util.ajax.post("/api/sys/role/info?id="+params.row.id).then(function (response) {
                    if(response.data.code=="100"){
                        self.clearFormItem();
                        self.$refs.resourceTree.checkResource(response.data.formItem.resourcesList);
                        self.formItem = response.data.formItem;
                        self.colIdx = params.index;
                        self.modal.show = true;
                        self.modal.isadd = false;
                    }else {
                        alert(response.data.msg);
                    }
                });
            },
            //保存
            update (){
                const self = this;
                Util.ajax.post("/api/sys/role/update",{"sysRole":this.formItem,"resourceIds":this.$refs.resourceTree.getCheckedNodes()}).then(function (response) {
                    if(response.data.code=="100"){
                        self.init();
                        self.modal.show=false;
                    }else{
                        alert(response.data.msg);
                    }
                });
            },
            delete (params) {
                const self = this;
                this.$Modal.confirm({
                    onOk(){
                        Util.ajax.post("/api/sys/role/delete",{id:params.row.id}).then(function (response) {
                            if(response.data.code=="100"){
                                self.init();
                            }
                        });
                    },
                    content:"您确定要删除吗？"
                });
            },
            batchDelete(){
                const self = this;
                this.$Modal.confirm({
                    onOk(){
                        var ids = "";
                        self.tableSelect.forEach(function (item) {
                            ids = ids+","+item.id;
                        });
                        console.log(ids);
                        Util.ajax.post("/api/sys/role/delete",{id:ids.replace(",","")}).then(function (response) {
                            if(response.data.code=="100"){
                                self.init();
                            }
                        });
                    },
                    content:"您确定要删除选中项吗？"
                });
            },
            //表格选中项
            dochange(selection){
                this.tableSelect = selection;
                console.log(this.tableSelect)
            },
            //分页
            pageOnChange(num){
                this.page.nowPage = num;
                this.init();
            },
            pageSizeChange(size){
                this.page.pageSize = size;
                this.init();
            },
            //清空
            clearFormItem (){
                this.colIdx = 0;
                this.formItem={
                    name:""
                }
                this.$refs.resourceTree.clearCheck();
            },
			//搜索重置
			searchInit(){
				this.page.nowPage=1;
				this.init();
			}
        },
        mounted:function () {
            this.init();
        }
    }
</script>