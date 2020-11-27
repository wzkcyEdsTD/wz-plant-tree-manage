import {otherRouter, appRouter} from '@/router/router';
import Util from '@/libs/util';

const app = {
    state: {
        menuList: [],
		cachePage: [],
		openedSubmenuArr: [], // 要展开的菜单数组
        pageOpenedList: [{
            title: '首页',
            path: '',
            name: 'home_index'
        }],
        currentPageName: '',
        currentPath: [
            {
                title: '首页',
                path: '',
                name: 'home_index'
            }
        ], // 面包屑数组
		tagsList: [...otherRouter.children],
        routers: [
            otherRouter,
            ...appRouter
        ]
    },
    mutations: {
        appLogout (state){
            state.menuList = [];
        },
        updateMenulist (state,resourceList) {
            state.menuList = resourceList;
        },
        setCurrentPageName (state, name) {
            state.currentPageName = name;
        },
		setCurrentPath (state, pathArr) {
			state.currentPath = pathArr;
		},
        addOpenSubmenu (state, name) {
            let hasThisName = false;
            let isEmpty = false;
            if (name.length === 0) {
                isEmpty = true;
            }
            if (state.openedSubmenuArr.indexOf(name) > -1) {
                hasThisName = true;
            }
            if (!hasThisName && !isEmpty) {
                state.openedSubmenuArr.push(name);
            }
        },
		//标签
		removeTag (state, name) {
			state.pageOpenedList.map((item, index) => {
				if (item.name === name) {
					state.pageOpenedList.splice(index, 1);
				}
			});
		},
		pageOpenedList (state, get) {
			let openedPage = state.pageOpenedList[get.index];
			if (get.argu) {
				openedPage.argu = get.argu;
			}
			if (get.query) {
				openedPage.query = get.query;
			}
			state.pageOpenedList.splice(get.index, 1, openedPage);
			localStorage.pageOpenedList = JSON.stringify(state.pageOpenedList);
		},
		clearAllTags (state) {
			state.pageOpenedList.splice(1);
			state.cachePage.length = 0;
			localStorage.pageOpenedList = JSON.stringify(state.pageOpenedList);
		},
		clearOtherTags (state, vm) {
			let currentName = vm.$route.name;
			let currentIndex = 0;
			state.pageOpenedList.forEach((item, index) => {
				if (item.name === currentName) {
					currentIndex = index;
				}
			});
			if (currentIndex === 0) {
				state.pageOpenedList.splice(1);
			} else {
				state.pageOpenedList.splice(currentIndex + 1);
				state.pageOpenedList.splice(1, currentIndex - 1);
			}
			let newCachepage = state.cachePage.filter(item => {
				return item === currentName;
			});
			state.cachePage = newCachepage;
			localStorage.pageOpenedList = JSON.stringify(state.pageOpenedList);
		},
		setOpenedList (state) {
			state.pageOpenedList = localStorage.pageOpenedList ? JSON.parse(localStorage.pageOpenedList) : [otherRouter.children[0]];
		},
		increateTag (state, tagObj) {
			if (!Util.oneOf(tagObj.name, state.dontCache)) {
				state.cachePage.push(tagObj.name);
				localStorage.cachePage = JSON.stringify(state.cachePage);
			}
			state.pageOpenedList.push(tagObj);
			localStorage.pageOpenedList = JSON.stringify(state.pageOpenedList);
		}
    },
    actions:{
        updateMenuList({commit}){
            return new Promise((resolve,reject) => {
                Util.ajax.post("/api/sys/main/userResource").then(function (response) {
                	if(response && response.data.code=="100"){
						let tempList = JSON.parse(JSON.stringify(appRouter));
						commit('updateMenulist',routerFilter(tempList,response.data.resourceList?response.data.resourceList:[],""));
					}
                    resolve();
                });
            });
        }
    }
};

/**
 * 权限过滤
 * @param router
 * @param resource
 * @param parentPath 父组件路径
 * @returns {Array}
 */
function routerFilter(router,resource,parentPath) {
    //console.log(parentPath);
    let resList = [];
    router.forEach(function (router) {
        let state = false;
        let pPath = parentPath+"/"+router.path.replace(/\//,"");
        resource.forEach(function (resourceItem) {
            //resourceItem.path.replace(/.*\//gi,"")
            if(resourceItem.name==router.title && resourceItem.path==pPath){
                state = true;
                return;
            }
        });
        if(!state){
            if(router.children!=undefined && router.children.length>0){
                router.children = routerFilter(router.children,resource,pPath);
                if(router.children.length>0){
                    resList.push(router);
                    //console.log(router);
                }
            }
        }else{
            if(router.children!=undefined && router.children.length>0){
                router.children = routerFilter(router.children,resource,pPath);
            }
            resList.push(router);
        }
    });
    return resList;
}

export default app;