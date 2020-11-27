import 'babel-polyfill';//兼容IE11
import Vue from 'vue';
import iView from 'iview';
import {router} from './router/index';
import store from './store';
import App from './app.vue';
import 'iview/dist/styles/iview.css';

//RSA前端加密
import JsEncrypt from 'jsencrypt/bin/jsencrypt';
Vue.prototype.$jsEncrypt = JsEncrypt;

//IVIEW
Vue.use(iView);

//地址选择
/*import iviewArea from 'iview-area';
Vue.use(iviewArea);*/

//滚动条美化
import EasyScroll from '@/views/main-components/easyscroll';
Vue.use(EasyScroll);

//全局过滤
Vue.filter('dateFormat', function (value) {
 if(value){
 	return new Date(value).Format("yyyy-MM-dd hh:mm:ss");
 }
 return "";
});
Vue.filter('wxDateFormat', function (value) {
	if(value && value.length==14){
		return value[0]+value[1]+value[2]+value[3]
				+"-"+value[4]+value[5]
				+"-"+value[6]+value[7]
				+" "+value[8]+value[9]
				+":"+value[10]+value[11]
				+":"+value[12]+value[13];
	}
	return "";
});

new Vue({
    el: '#app',
    router: router,
    store: store,
    render: h => h(App),
    mounted () {
        //this.$store.commit('updateMenulist');
    }
});

