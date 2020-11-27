<template>
	<div class="layout">
		<Row>
			<Select v-model="page.bean.parkfeature" clearable filterable placeholder="所属公园"
					@on-change="searchInit()" style="width:230px">
				<Option v-for="item in parkList" :value="item.featuregui" :key="item.name">{{ item.name }}</Option>
			</Select>
			<!--<Select v-if="page.bean.parkfeature" v-model="page.bean.areaid" placeholder="所属区域"
					clearable filterable @on-change="searchInit()" style="width:150px">
				<Option v-for="item in areaList" :value="item.id" :key="item.name">{{ item.name }}</Option>
			</Select>-->
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
		<Modal v-model="modal.show" width="1100" :mask-closable=false>
			<p slot="header" style="text-align:center">
				<span>详情</span>
			</p>
			<!--表单-->
			<div>
				<Form :model="formItem" :label-width="80">
					<Row>
						<Col :span=12>
							<FormItem label="植物名称">
								<Input v-model="formItem.name" placeholder="请输入"></Input>
							</FormItem>
						</Col>
						<Col :span=12>
							<FormItem label="认养价格">
								<Input v-model="formItem.money" placeholder="请输入"></Input>
							</FormItem>
						</Col>
						<Col :span=12>
							<FormItem label="所属公园">
								<Select v-model="formItem.parkfeature" filterable>
									<Option v-for="item in parkList" :value="item.featuregui" :key="item.name">{{ item.name }}</Option>
								</Select>
							</FormItem>
						</Col>
						<Col :span=12 v-if="formItem.id">
							<FormItem label="二维码">
								<qrcode :size=200 :value="'http://yuanlin.ruixing.cc/#/plant/applyCon?id='+formItem.id"></qrcode>
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
					</FormItem>
					<FormItem label="内容">
						<text-editor v-if="modal.show" v-model="formItem.content" :content="formItem.content"></text-editor>
					</FormItem>
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
	import TextEditor from '@/views/mylib/text-editor/text-editor.vue';
	import Uploader from '@/views/mylib/imageUpload/imageUpload.vue';
	import Qrcode from '@/views/mylib/qrcode/index.vue';
	export default {
		components:{
			Uploader,TextEditor,Qrcode
		},
		data () {
			return {
				//接口前缀
				apiUrlPrefix:"/api/sys/yl/plant/",
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
					key:"",
					bean:{}
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
						title: '植物名称',
						key: 'name',
						width:150
					},
					{
						title:'所属公园',
						minWidth:120,
						render:(h,params)=>{
							let val = "";
							this.parkList.forEach(function (item) {
								if(item.featuregui==params.row.parkfeature){
									val = item.name;
								}
							});
							return h('span',val);
						}
					},
					{
						title:'认养价格',
						width:120,
						key:'money'
					},
					{
						title:'状态',
						width:120,
						render:(h,params)=>{
							let val = '待认养';
							let props = {
								color: 'yellow'
							};
							if(params.row.status==1){
								val='已认养';
								props.color = 'green';
							}
							return h('Tag',{props:props},val);
						}
					},
					{
						title:'二维码',
						minWidth:120,
						render:(h,params)=>{
							return h(Qrcode,{props:{
								value:"http://yuanlin.ruixing.cc/#/plant/applyCon?id="+params.row.id,
								size:80
							}});
						}
					},
					{
						title:'添加时间',
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
				loading:true,//表格加载
				parkList:[]
				//areaList:[]
			}
		},
		/*watch:{
			"page.bean.parkfeature":function(val,oldVal){
				if(val && val!=oldVal){
					const self = this;
					Util.ajax.post('/pubApi/yuanlin/parkarea/'+val).then(function (response) {
						self.areaList = response.data;
					});
				}
			}
		},*/
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
					parkfeature:this.page.bean.parkfeature
					//areaid:this.page.bean.areaid
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
			Util.ajax.post('/pubApi/yuanlin/park').then(function (response) {
				self.parkList = response.data;
			});
		}
	}
</script>