import Vue from 'vue';
import iView from 'iview';
import Util from '../libs/util';
import VueRouter from 'vue-router';
//import Cookies from 'js-cookie';
import {routers,otherRouter,appRouter,page403,page404,page500,loginRouter} from './router';
import store from '../store';

Vue.use(VueRouter);

// 路由配置
const RouterConfig = {
    // mode: 'history',
	base:'/dist/',
    routes: routers
};

export const router = new VueRouter(RouterConfig);

router.beforeEach((to, from, next) => {
    iView.LoadingBar.start();
    Util.title(to.meta.title);
    if(to.name=="otherRouter"){
        next({
            name: 'home_index'
        });
    }else if (store.getters.token=='' && to.name !== 'login') {  // 判断是否已经登录且前往的页面不是登录页
        next({
            name: 'login'
        });
    }else if (store.getters.token!='' && to.name === 'login') {  // 判断是否已经登录且前往的是登录页
        Util.title();
        next({
            name: 'home_index'
        });
    }else if (store.getters.token!='' && to.name !== 'login') {
        let menuList = store.state.app.menuList;
        //防止刷新后获取不到资源
        if(menuList && menuList.length>0){
            myFilterRoute(menuList,to.name);
			next();
        }else{
            store.dispatch('updateMenuList').then(function () {
                menuList = store.state.app.menuList;
                myFilterRoute(menuList,to.name);
				next();
            });
        }
        /*if (Util.getRouterObjByName(store.state.app.menuList, to.name).access !== undefined) {  // 判断用户是否有权限访问当前页
            if (Util.getRouterObjByName([otherRouter, ...appRouter], to.name).access === parseInt(Cookies.get('access'))) {
                Util.toDefaultPage([otherRouter, ...appRouter], to.name, router, next);  // 如果在地址栏输入的是一级菜单则默认打开其第一个二级菜单的页面
            } else {
                router.replace({
                    name: 'error-403'
                });
                next();
            }
        } else {
            Util.toDefaultPage([otherRouter, ...appRouter], to.name, router, next);
        }*/
    }else{
		next();
	}
});

router.afterEach((to) => {
    iView.LoadingBar.finish();
    window.scrollTo(0, 0);
});

/**
 * 过滤
 * @param menuList 资源树
 * @param toName
 */
function myFilterRoute(menuList,toName) {
    let res = Util.MenudoEachTree(menuList,toName);
    if(!res){
        if(Util.getRouterObjByName([otherRouter,page403,page404,page500,loginRouter],toName)==undefined){
            router.replace({
                name: 'error-403'
            });
            //next();
        }
    }
}