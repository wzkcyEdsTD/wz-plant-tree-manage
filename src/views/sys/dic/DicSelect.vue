<template>
	<Select v-model="dicData" @on-change="dicSelectChange">
		<Option v-for="item in dicItemList" :value="item.code" :key="item.code">{{item.name}}</Option>
	</Select>
</template>

<script>
	import Util from '@/libs/util';
	export default {
		name:"DicSelect",
		data(){
			return {
				dicItemList:[]
			}
		},
		props:['dicCode','dicData'],
		watch:{
			dicCode(val,oldVal){
				if(val!=oldVal && val){
					this.init();
				}
			}
		},
		methods:{
			init(){
				const self = this;
				Util.ajax.post('/pubApi/dic/dicItemList?dicCode='+this.dicCode).then(function (response) {
					if(response.data.list){
						self.$set(self.$data,'dicItemList',response.data.list);
					}
				})
			},
			dicSelectChange(val){
				this.$emit('on-change',val);
			}
		},
		mounted(){
			if(this.dicCode){
				this.init();
			}
		}
	}
</script>

<style>

</style>