<template>
	<div class="layout">
		<Row>
			<Button-group>
				<i-button type="success" @click="toAudit(1)">审核通过</i-button>
				<i-button type="warning" @click="toAudit(2)">审核不通过</i-button>
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
				  @on-page-size-change="pageSizeChange" @on-change="pageOnChange" show-sizer show-elevator show-total></Page>
		</div>
		<!-- 自定义Modal -->
		<Modal v-model="modal.show" width="1100" :mask-closable=false>
			<p slot="header" style="text-align:center">
				<span>详情</span>
			</p>
			<!--表单-->
			<div>
				<Form :model="formItem" :label-width="80">
					<FormItem label="植物名称">
						<Input v-model="formItem.plant.name" placeholder="请输入" readonly></Input>
					</FormItem>
					<FormItem label="所属公园">
						<Input v-model="formItem.park.name" placeholder="请输入" readonly></Input>
					</FormItem>
					<FormItem label="申请人">
						<Input v-model="formItem.name" placeholder="请输入" readonly></Input>
					</FormItem>
					<FormItem label="手机">
						<Input v-model="formItem.phone" placeholder="请输入" readonly></Input>
					</FormItem>
					<FormItem label="个性签名">
						<Input :rows=4 type="textarea" v-model="formItem.signature" placeholder="请输入" readonly></Input>
					</FormItem>
					<FormItem label="不通过备注" v-if="formItem.auditstatus==2">
						<Input v-model="formItem.beizhu" placeholder="请输入" readonly></Input>
					</FormItem>
					<FormItem label="支付截图">
						<a :href="'/'+formItem.pic" target="_blank"><img :src="'/'+formItem.pic" alt=""></a>
					</FormItem>
				</Form>
			</div>
			<Row slot="footer">
				<Button type="ghost" size="large" @click="modal.show = false">关闭</Button>
			</Row>
		</Modal>
	</div>
</template>
<script>
	import Util from '@/libs/util';
	export default {
		data () {
			return {
				//接口前缀
				apiUrlPrefix:"/api/sys/yl/plantapply/",
				uploadShow:false,
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
					plant:{},
					park:{}
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
						title:'申请人',
						width:150,
						key:'name'
					},
					{
						title:'申请植物',
						width:150,
						render:(h,params)=>{
							return h('span',params.row.plant.name);
						}
					},
					{
						title: '审核状态',
						width:120,
						render:(h,params)=>{
							let val = '待审核';
							let props = {
								color: 'yellow'
							};
							if(params.row.auditstatus==1){
								val='审核通过';
								props.color = 'green';
							}else if(params.row.auditstatus==2){
								val='审核不通过';
								props.color = 'red';
							}
							return h('Tag',{props:props},val);
						}
					},
					{
						title:'申请时间',
						width:200,
						render:(h,params)=>{
							return h('span',new Date(params.row.createtime).Format("yyyy-MM-dd hh:mm:ss"));
						}
					},
					{
						title: '操作',
						fixed:'right',
						minWidth:150,
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
								}, '删除'),
								h('Button', {
									props: {
										type: 'success',
										size: 'small'
									},
									style: {
										marginRight: '10px'
									},
									on: {
										click: () => {
											this.audit(1,params)
										}
									}
								}, '通过'),
								h('Button', {
									props: {
										type: 'warning',
										size: 'small'
									},
									on: {
										click: () => {
											this.audit(2,params)
										}
									}
								}, '驳回')
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
				Util.ajax.post(this.apiUrlPrefix+"list",this.page).then(function (response) {
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
				self.clearFormItem();
				self.formItem = params.row;
				self.modal.show = true;
				self.modal.isadd = false;
				/*Util.ajax.post(this.apiUrlPrefix+"info/"+params.row.id).then(function (response) {
					if(response.data.code=="100"){
						self.clearFormItem();
						self.formItem = response.data.formItem;
						self.modal.show = true;
						self.modal.isadd = false;
					}else {
						alert(response.data.msg);
					}
				});*/
			},
			//保存
			update (){
				const self = this;
				Util.ajax.post(this.apiUrlPrefix+"update",this.formItem).then(function (response) {
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
						Util.ajax.post(self.apiUrlPrefix+"delete",{id:params.row.id}).then(function (response) {
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
				this.formItem={
					status:0,
					plant:{},
					park:{}
				}
			},
			//搜索重置
			searchInit(){
				this.page.nowPage=1;
				this.init();
			},
			audit(auditState,params){
				const self = this;
				if(auditState==params.row.auditstatus){
					if(auditState==1){
						this.$Message.error('您已经审核通过该项了');
					}else{
						this.$Message.error('您已经驳回该项了');
					}
					return;
				}
				let content = '您确定要审核通过选中项吗？该植物的其余申请将变为不通过';
				if(auditState==2){
					content = '您确定要审核不通过选中项吗?';
				}
				//审核不通过设置备注
				if(auditState==2){
					this.$Modal.confirm({
						render: (h) => {
							return [h('span','不通过备注：'),h('Input', {
								props: {
									value: self.formItem.beizhu
								},
								on:{
									input:(val)=>{
										self.formItem.beizhu = val;
									}
								}
							})]
						},
						onOk(){
							Util.ajax.post(self.apiUrlPrefix+"audit",{id:params.row.id,auditState:auditState,beizhu:self.formItem.beizhu}).then(function (response) {
								if(response.data.code=="100"){
									self.init();
								}else{
									self.$Message.error(response.data.msg);
								}
							});
						}
					})
				}else{
					this.$Modal.confirm({
						onOk(){
							Util.ajax.post(self.apiUrlPrefix+"audit",{id:params.row.id,auditState:auditState}).then(function (response) {
								if(response.data.code=="100"){
									self.init();
								}else{
									self.$Message.error(response.data.msg);
								}
							});
						},
						content:content
					});
				}
			},
			//审核
			toAudit(auditState){
				if(this.tableSelect.length<1){
					this.$Message.error('请至少选择一项');
					return false;
				}
				let content = '您确定要审核通过选中项吗？该植物的其余申请将变为不通过';
				if(auditState==2){
					content = '您确定要审核不通过选中项吗?';
				}
				const self = this;
				if(auditState==2){
					this.$Modal.confirm({
						render: (h) => {
							return [h('span','不通过备注：'),h('Input', {
								props: {
									value: self.formItem.beizhu
								},
								on:{
									input:(val)=>{
										self.formItem.beizhu = val;
									}
								}
							})]
						},
						onOk(){
							var ids = "";
							self.tableSelect.forEach(function (item) {
								if(item.state!=auditState){
									ids = ids+","+item.id;
								}
							});
							if(ids==""){
								this.$Message.error('请选择至少选择一个');
							}else{
								Util.ajax.post(self.apiUrlPrefix+"audit",{id:ids.replace(",",""),auditState:auditState,beizhu:self.formItem.beizhu}).then(function (response) {
									if(response.data.code=="100"){
										self.init();
									}else{
										self.$Message.error(response.data.msg);
									}
								});
							}
						}
					})
				}else{
					this.$Modal.confirm({
						onOk(){
							var ids = "";
							self.tableSelect.forEach(function (item) {
								if(item.state!=auditState){
									ids = ids+","+item.id;
								}
							});
							if(ids==""){
								this.$Message.error('请选择至少选择一个');
							}else{
								Util.ajax.post(self.apiUrlPrefix+"audit",{id:ids.replace(",",""),auditState:auditState}).then(function (response) {
									if(response.data.code=="100"){
										self.init();
									}else{
										self.$Message.error(response.data.msg);
									}
								});
							}
						},
						content:content
					});
				}
			}
		},
		mounted:function () {
			this.init();
		}
	}
</script>