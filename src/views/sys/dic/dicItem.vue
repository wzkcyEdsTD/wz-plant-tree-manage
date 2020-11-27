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
			<span  style="margin: 0 10px;"><Button type="primary" icon="search" @click="searchInit()">搜索</Button></span>
		</Row>
		<br>
		<!--表单-->
		<Table ref="table" stripe border :loading="loading"
			   :columns="columns1"
			   :data="data1" @on-selection-change="dochange"></Table>
		<br>
		<!--分页-->
		<div style="text-align: center">
			<Page :total="page.total" :page-size="page.pageSize" :current="page.nowPage" :page-size-opts="page.sizeopt"
				  @on-page-size-change="pageSizeChange" @on-change="pageOnChange" show-sizer show-elevator ></Page>
		</div>
		<!-- 自定义Modal -->
		<Modal v-model="modal.show" width="700" @keyup.esc="modal.show = false">
			<p slot="header" style="text-align:center">
				<span>数据字典</span>
			</p>
			<!--表单-->
			<div>
				<Form :model="formItem" :label-width="80">
					<Row>
						<Col :span=12>
						<FormItem label="名称">
							<Input v-model="formItem.name" placeholder="请输入名称"></Input>
						</FormItem>
						</Col>
						<Col :span=12>
						<FormItem label="代码">
							<Input v-model="formItem.code" placeholder="请输入值" ></Input>
						</FormItem>
						</Col>
					</Row>
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
		name:'sysagentRole',
		props:['dicId'],
		data () {
			return {
				//接口前缀
				apiUrlPrefix:"/api/sys/dic/",
				modal:{
					show:false,
					isadd:true
				},
				dicItem:{
					show:false,
					dicId:null
				},
				page:{
					pageSize:10,
					nowPage:1,
					total:100,
					sizeopt:[10,30,60,100],
					key:"",
					bean:{
						dicId:null
					}
				},
				formItem:{},
				registerAgent:{},
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
						title: '值',
						key: 'code',
						width: 145
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
									style: {
										marginRight: '10px'
									},
									on: {
										click: () => {
											this.delete(params)
										}
									}
								}, '删除')
							])
						}
					}
				],
				data1: [],//表格数据
				tableSelect:[],//表格选中项
				loading:true//表格加载
			}
		},
		watch:{
			dicId(val,oldVal){
				if(val){
					this.page.nowPage=1;
					this.init();
				}
			}
		},
		methods:{
			//初始化
			init(){
				const self = this;
				self.loading=true;
				Util.ajax.post(this.apiUrlPrefix+"itemList",this.page).then(function (response) {
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
				this.registerAgent={};
				const self = this;
				Util.ajax.post(this.apiUrlPrefix+"itemInfo",{id:params.row.id}).then(function (response) {
					if(response.data.code=="100"){
						self.clearFormItem();
						self.$set(self.$data,'formItem',response.data.sysDicItem);
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
				this.formItem.dicId = this.dicId;
				Util.ajax.post(this.apiUrlPrefix+"itemUpdate",this.formItem).then(function (response) {
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
						Util.ajax.post(self.apiUrlPrefix+"itemDelete",{id:params.row.id}).then(function (response) {
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
						Util.ajax.post(self.apiUrlPrefix+"delete",{id:ids.replace(",","")}).then(function (response) {
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
				this.formItem={};
			},
			//搜索重置
			searchInit(){
				this.page.nowPage=1;
				this.init();
			}
		},
		mounted:function () {
			if(this.dicId){
				this.page.bean.dicId = this.dicId;
			}
			this.init();
		}
	}
</script>