<style scope>
    .layout{position: relative;}
    .ivu-page-options-sizer{width: 80px;}
</style>
<template>
    <div class="layout">
        <Row>
            <Button-group>
                <i-button type="info" @click="toadd()">添加</i-button>
                <i-button type="error" @click="batchDelete()">删除</i-button>
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
                <span>用户信息</span>
            </p>
            <!--表单-->
            <div>
                <Form :model="formItem" :label-width="80">
                    <FormItem label="姓名">
                        <Input v-model="formItem.name" placeholder="请输入姓名"></Input>
                    </FormItem>
                    <FormItem label="账号">
                        <Input v-model="formItem.account" placeholder="请输入账号"></Input>
                    </FormItem>
                    <FormItem label="密码">
                        <Input v-if="modal.isadd" type="password" v-model="formItem.password" placeholder="请输入密码"></Input>
                        <Input v-else type="password" v-model="formItem.password" placeholder="密码为空表示不修改"></Input>
                    </FormItem>
                    <FormItem label="重复密码">
                        <Input type="password" v-model="formItem.passwordCheck" placeholder="请再次输入密码"></Input>
                    </FormItem>
                    <FormItem label="性别">
                        <RadioGroup v-model="formItem.sex">
                            <Radio label="1">男</Radio>
                            <Radio label="2">女</Radio>
                        </RadioGroup>
                    </FormItem>
                    <FormItem label="手机">
                        <Input v-model="formItem.phone" placeholder="请输入手机"></Input>
                    </FormItem>
                    <FormItem label="邮箱">
                        <Input v-model="formItem.email" placeholder="请输入邮箱"></Input>
                    </FormItem>
                    <FormItem label="用户角色">
                        <CheckboxGroup v-model="formItem.sysRoleList">
                            <template v-for="(item,index) in roleList">
                                <span v-if="index>0">，</span><Checkbox :label="item.id">{{item.name}}</Checkbox>
                            </template>
                        </CheckboxGroup>
                    </FormItem>
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
    export default {
        name:'sysuser',
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
                formItem:{
                    name:"",
                    account:"",
                    password:"",
                    passwordCheck:"",
                    sex:"1",
                    phone:"",
                    email:"",
                    sysRoleList:[]
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
                        width:60,
                        align:'center'
                    },
                    {
                        title: '账号',
                        key: 'account'
                    },
                    {
                        title: '创建时间',
                        key: 'createTime',
                        render:(h,params) => {
                            return h('span',new Date(params.row.createTime).Format("yyyy-MM-dd hh:mm:ss"));
                        }
                    },
                    {
                        title: '操作',
                        key: 'action',
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
                roleList:[],//所有用户角色
                tableSelect:[],//表格选中项
                loading:true//表格加载
            }
        },
        methods:{
            //初始化
            init(){
                const self = this;
                self.loading=true;
                Util.ajax.post("/api/sys/user/list",this.page).then(function (response) {
                    self.loading=false;
                    const data = response.data
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
                Util.ajax.post("/api/sys/user/info?id="+params.row.id).then(function (response) {
                    if(response.data.code=="100"){
                        self.clearFormItem();
                        response.data.formItem.sex = response.data.formItem.sex+"";
                        self.formItem = response.data.formItem;
                        var tempArray = new Array();
                        self.formItem.sysRoleList.forEach(function (item) {
                            self.roleList.forEach(function (role) {
                               if(role.id==item.id){
                                   tempArray.push(role.id);
                                   return;
                               }
                            });
                        });
                        self.formItem.sysRoleList = tempArray;
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
                Util.ajax.post("/api/sys/user/updateuser",this.formItem).then(function (response) {
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
                        Util.ajax.post("/api/sys/user/delete",{id:params.row.id}).then(function (response) {
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
                        Util.ajax.post("/api/sys/user/delete",{id:ids.replace(",","")}).then(function (response) {
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
                this.formItem={
                    name:"",
                    account:"",
                    password:"",
                    passwordCheck:"",
                    sex:"1",
                    phone:"",
                    email:"",
                    sysRoleList:[]
                }
            },
			//搜索重置
			searchInit(){
				this.page.nowPage=1;
				this.init();
			}
        },
        mounted:function () {
            this.init();
            const self = this;
            Util.ajax.get("/api/sys/role/getAll").then(function (response) {
                response.data.code=="100"?self.roleList=response.data.roleList:alert(response.data.msg);
            });
        }
    }
</script>