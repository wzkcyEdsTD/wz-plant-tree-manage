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
				  @on-page-size-change="pageSizeChange" @on-change="pageOnChange" show-sizer show-elevator show-total></Page>
		</div>
		<!-- 自定义Modal -->
		<Modal v-model="modal.show" width="700" :mask-closable=false>
			<p slot="header" style="text-align:center">
				<span>详情</span>
			</p>
			<!--表单-->
			<div>
				<Form :model="formItem" :label-width="80">
					<FormItem label="所属养护公司">
						<Select v-model="formItem.mtcid" filterable>
							<Option v-for="item in companyList" :value="item.id" :key="item.name">{{ item.name }}</Option>
						</Select>
					</FormItem>
					<FormItem label="唯一码">
						<Input v-model="formItem.featuregui" placeholder="请输入"></Input>
					</FormItem>
					<FormItem label="公园名称">
						<Input v-model="formItem.name" placeholder="请输入"></Input>
					</FormItem>
					<FormItem label="别名">
						<Input v-model="formItem.othername" placeholder="请输入"></Input>
					</FormItem>
					<FormItem label="地址">
						<Input v-model="formItem.address" placeholder="请输入"></Input>
					</FormItem>
					<FormItem label="联系方式">
						<Input v-model="formItem.contact" placeholder="请输入"></Input>
					</FormItem>
					<FormItem label="开放时间">
						<Input v-model="formItem.opentime" placeholder="请输入"></Input>
					</FormItem>
					<FormItem label="各区（县）">
						<Input v-model="formItem.area" placeholder="请输入"></Input>
					</FormItem>
					<FormItem label="简介">
						<Input type="textarea" v-model="formItem.remark" :rows=8 placeholder="请输入"></Input>
					</FormItem>
					<!--<Row>
						<Col :span=12>
						<FormItem label="纬度x">
							<Input v-model="formItem.lng" placeholder="请输入"></Input>
						</FormItem>
						</Col>
						<Col :span=12>
							<FormItem label="经度y">
								<Input v-model="formItem.lat" placeholder="请输入"></Input>
							</FormItem>
						</Col>
					</Row>
					<FormItem label="图片">
						<Row>
							<Col :span=18>
							<Input v-model="formItem.pic" placeholder="输入图片链接地址">
								<Button slot="append" icon="upload" @click.native="uploadShow=true">选择或上传</Button>
							</Input>
							</Col>
							<Col :span=6>
								<img :src="formItem.pic"  style="max-width: 95%;max-height: 100px;background: transparent !important">
							</Col>
						</Row>
					</FormItem>-->
				</Form>
			</div>
			<Row slot="footer">
				<Button type="info" size="large" @click="update()">确定</Button>
				<Button type="ghost" size="large" @click="modal.show = false">取消</Button>
			</Row>
		</Modal>
		<!-- 图片上传 -->
		<uploader :modalShow="uploadShow"
				  @closemodal="closeImageModal"
				  @chooseUpdate="chooseUpdate"></uploader>
	</div>
</template>
<script>
	import Util from '@/libs/util';
	import Uploader from '@/views/mylib/imageUpload/imageUpload.vue';
	export default {
		components:{
			Uploader
		},
		data () {
			return {
				//接口前缀
				apiUrlPrefix:"/api/sys/yl/park/",
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
				formItem:{},
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
						title: '名称',
						key: 'name',
						width:150
					},
					{
						title:'地址',
						key:'address'
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
				Util.ajax.post(this.apiUrlPrefix+"info/"+params.row.id).then(function (response) {
					if(response.data.code=="100"){
						self.clearFormItem();
						self.formItem = response.data.formItem;
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
						//console.log(ids);
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
					status:0
				}
			},
			//搜索重置
			searchInit(){
				this.page.nowPage=1;
				this.init();
			},
			//图片选择
			chooseUpdate(arr){
				this.uploadShow = false;
				this.formItem.pic = '/'+arr[0].path;
			},
			closeImageModal(val){
				this.uploadShow = val;
			}
		},
		mounted:function () {
			this.init();
			const self = this;
			Util.allcompany().then(function (response) {
				if(response.data && response.data.length){
					self.companyList = response.data;
				}
			});
		}
	}
</script>