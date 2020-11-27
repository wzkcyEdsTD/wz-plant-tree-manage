<style scope>
    .layout{position: relative;}
    .leftmy{padding-left: 20px;border-right: 1px solid #eee}
</style>
<template>
    <div class="layout">
        <Content :style="{padding: '24px 0', minHeight: '280px', background: '#fff'}">
            <Layout>
                <!--左侧-->
                <Sider hide-trigger :style="{background: '#fff',padding:'24px 0 0 24px',borderRight:'1px solid #eee'}">
                    <ResourceTree ref="leftResourceTree"
								  :showCheckbox="leftResource.showCheckbox"
								  :multiple="leftResource.multiple"
								  @select="selectTree"></ResourceTree>
                </Sider>
                <!--右侧-->
                <Content :style="{padding: '24px', minHeight: '280px', background: '#fff'}">
                    <Row>
                        <Button-group>
                            <i-button type="info" @click="toadd()">添加</i-button>
                            <i-button type="ghost" @click="toMove()">转移</i-button>
                            <i-button type="error" @click="batchDelete()">删除</i-button>
                        </Button-group>
                        <Input v-model="page.searchKey" placeholder="请输入关键字搜搜..." style="width: 200px" />
                        <span  style="margin: 0 10px;"><Button type="primary" icon="search" @click="pageinit()">搜索</Button></span>
                    </Row>
                    <br>
                    <!--表单-->
                    <Table ref="table" stripe border :loading="loading" :columns="columns1" :data="data1" @on-selection-change="dochange"></Table>
                    <br><br>
                    <!--分页-->
                    <div style="text-align: center">
                        <Page :total="page.total" :page-size="page.pageSize" :current="page.nowPage" :page-size-opts="page.sizeopt"
                              @on-page-size-change="pageSizeChange" @on-change="pageOnChange" show-sizer show-elevator ></Page>
                    </div>
                </Content>
            </Layout>
        </Content>
        <!-- 自定义Modal -->
        <Modal v-model="modal.show" width="700" :mask-closable=false>
            <p slot="header" style="text-align:center">
                <span>资源信息</span>
            </p>
            <!--表单-->
            <div>
                <Form :model="formItem" :label-width="80">
                    <FormItem label="名称">
                        <Input v-model="formItem.name" placeholder="名称"></Input>
                    </FormItem>
					<FormItem label="访问路径">
						<Input v-model="formItem.path" placeholder="访问路径"></Input>
					</FormItem>
					<FormItem label="后台接口匹配路径">
						<Input v-model="formItem.urlPattern" placeholder="后台接口匹配路径"></Input>
					</FormItem>
                </Form>
            </div>
            <Row slot="footer">
                <Button type="info" size="large" @click="update()">确定</Button>
                <Button type="ghost" size="large" @click="modal.show = false">取消</Button>
            </Row>
        </Modal>
        <!--转移MODAL-->
        <Modal v-model="modal.moveshow" width="700" @keyup.esc="modal.moveshow = false">
            <p slot="header" style="text-align:center">
                <span>选择要转移的节点</span>
            </p>
            <div>
                <Tree :data="treeData" ref="movetree"></Tree>
            </div>
            <Row slot="footer">
                <Button type="info" size="large" @click="dotoMove()">确定</Button>
                <Button type="ghost" size="large" @click="modal.moveshow = false">取消</Button>
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
                leftResource:{
                    showCheckbox:false,
                    multiple:false
                },
                modal:{
                    show:false,
                    isadd:true,
                    moveshow:false
                },
                page:{
                    pageSize:10,
					nowPage:1,
                    total:100,
                    sizeopt:[10,30,60,100],
                    searchKey:""
                },
                //表单
                formItem:{
                    name:"",
                    id:"",
                    parentId:0
                },
                //移动
                moveItem:{
                    parentId:"",
                    ids:[]
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
                        title: '资源名称',
                        key: 'title'
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
                                        type: 'ghost',
                                        size: 'small'
                                    },
                                    style: {
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.toMove(params)
                                        }
                                    }
                                }, '转移'),
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
                loading:false,//表格加载
                treeData:[]
            }
        },
        methods:{
            //初始化
            init(){
                this.$refs.leftResourceTree.init();
                this.pageinit();
            },
            //分页初始化
            pageinit(){
                var tempData = [];
                if(this.page.searchKey!=""){
                    var reg = new RegExp(".*?"+this.page.searchKey,"gi");
                    this.$refs.leftResourceTree.childData.forEach(function (item) {
                        reg.lastIndex=0;
                        if(reg.test(item.title)){
                            tempData.push(item);
                        }
                    });
                }else{
                    const childate = this.$refs.leftResourceTree.childData;
                    tempData = childate?childate:[];
                }
                this.page.total=tempData.length;
                var endPage = this.page.toal==0?1:(parseInt(this.page.total/this.page.pageSize)+(this.page.total%this.page.pageSize==0?0:1));
                if(endPage<this.page.nowPage){
                    this.page.nowPage=endPage;
                }
                const start = (this.page.nowPage-1)*this.page.pageSize;
                this.data1 = tempData.slice(start,start+this.page.pageSize);
            },
            toadd(){
                this.clearFormItem();
                this.modal.show= true;
                this.modal.isadd= true;
            },
            //编辑
            edit(params){
                var self = this;
                this.clearFormItem();
                Util.ajax.post("/api/sys/resource/info?id="+params.row.id).then(function (res) {
					if(res.data.code=="100"){
                        self.modal.show = true;
                        self.modal.isadd = false;
					    self.formItem = res.data.formItem;
					}else{
                        self.$Message.error('出错了！');
					}
                });
                /*this.formItem.name = params.row.title;
                this.formItem.id = params.row.id;
                this.formItem.parentId = params.row.parentId;*/
            },
            //移动
            toMove(params){
                var self = this;
                if(params!=undefined){
                    this.moveItem.ids=[params.row.id];
                }else{
                    this.moveItem.ids=[];
                    self.tableSelect.forEach(function (item) {
                        self.moveItem.ids.push(item.id);
                    });
                }
                this.treeData =Util.doEachTree(JSON.parse(JSON.stringify(this.$refs.leftResourceTree.treeData)),this.moveItem.ids,false,true);
                console.log(JSON.stringify(this.treeData));
                this.modal.moveshow=true;
            },
            dotoMove(){
                var self = this;
                const select = this.$refs.movetree.getSelectedNodes();
                if(select.length==1){
                    Util.ajax.post("/api/sys/resource/move",{ids:this.moveItem.ids,parentId:select[0].id}).then(function (response) {
                        if(response.data.code=="100"){
                            self.init();
                            self.modal.moveshow=false;
                        }else{
                            self.$Message.error('出错了！');
                        }
                    });
                }else{
                    this.$Message.warning('请选择一个节点！');
                    return;
                }
            },
            //保存
            update (){
                const self = this;
                Util.ajax.post("/api/sys/resource/update",this.formItem).then(function (response) {
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
                        Util.ajax.post("/api/sys/resource/delete",{id:params.row.id}).then(function (response) {
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
                        Util.ajax.post("/api/sys/resource/delete",{id:ids.replace(",","")}).then(function (response) {
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
            },
            //左侧点击选中
            selectTree(){
                this.data1 = this.$refs.leftResourceTree.childData;
                this.page.nowPage = 1;
                this.pageinit();
            },
            //分页
            pageOnChange(num){
                this.page.nowPage = num;
                this.pageinit();
            },
            pageSizeChange(size){
                this.page.pageSize = size;
                this.pageinit();
            },
            //清空
            clearFormItem (){
                this.colIdx = 0;
                this.formItem={
                    name:"",
                    id:"",
                    parentId:this.$refs.leftResourceTree.selectId
                }
            },
			//搜索重置
			searchInit(){
				this.page.nowPage=1;
				this.init();
			}
        }
    }
</script>