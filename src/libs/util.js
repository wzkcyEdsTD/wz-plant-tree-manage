import axios from 'axios';
import env from '../../build/env';
//import semver from 'semver';
//import packjson from '../../package.json';
import store from '../store';

let util = {};

util.title = function (title) {
    title = title || '城市数林公众服务平台后台管理';
    window.document.title = title;
};

/*const ajaxUrl = env === 'development'
    ? 'http://127.0.0.1:8020'
    : env === 'production'
    ? 'https://www.url.com'
    : 'https://debug.url.com';*/
const ajaxUrl = '';

//全局默认
//axios.defaults.headers.common['token'] = store.state.user.token;
//axios.defaults.headers['Content-Type'] = 'application/x-www-form-urlencoded';
util.ajax = axios.create({
    baseURL: ajaxUrl,
    timeout: 30000,
    //withCredentials:true//跨域
});

//请求拦截器
util.ajax.interceptors.request.use(
    config => {
        if (store.getters.token) { // 判断是否存在token，如果存在的话加上
            config.headers.token = store.state.user.token;
        }
        return config;
    },
    err => {
        return Promise.reject(err);
    });

util.logout = function () {
    store.commit('logout');
    store.commit('appLogout');
    // 判断环境跳转
    location.href = (env === 'development') ? '/#/login' : '/dist/#/login';
    //location.reload();
};

//添加响应拦截器
util.ajax.interceptors.response.use(function (response) {
    if (response.data && response.data.code == -1) {
        //未登录
        util.logout();
    } else {
        return response;
    }
}, function (error) {
    return Promise.reject(error);
});

util.inOf = function (arr, targetArr) {
    let res = true;
    arr.map(item => {
        if (targetArr.indexOf(item) < 0) {
            res = false;
        }
    });
    return res;
};

util.oneOf = function (ele, targetArr) {
    if (targetArr.indexOf(ele) >= 0) {
        return true;
    } else {
        return false;
    }
};

util.showThisRoute = function (itAccess, currentAccess) {
    if (typeof itAccess === 'object' && itAccess.isArray()) {
        return util.oneOf(currentAccess, itAccess);
    } else {
        return itAccess === currentAccess;
    }
};

util.getRouterObjByName = function (routers, name) {
    let routerObj = undefined;
    routers.forEach(item => {
        if (item.name === 'otherRouter') {
            item.children.forEach((child, i) => {
                if (child.name === name) {
                    routerObj = item.children[i];
                }
            });
        } else if (item.children !== undefined) {
            if (item.children.length === 1) {
                if (item.children[0].name === name) {
                    routerObj = item.children[0];
                }
            } else {
                item.children.forEach((child, i) => {
                    if (child.name === name) {
                        routerObj = item.children[i];
                    }
                });
            }
        } else {
            if (item.name === name) {
                routerObj = item;
            }
        }
    });
    return routerObj;
};

util.handleTitle = function (vm, item) {
    return item.title;
};

util.setCurrentPath = function (vm, name) {
    let title = '';
    let isOtherRouter = false;
    vm.$store.state.app.routers.forEach(item => {
        if (item.children.length === 1) {
            if (item.children[0].name === name) {
                title = util.handleTitle(vm, item);
                if (item.name === 'otherRouter') {
                    isOtherRouter = true;
                }
            }
        } else {
            item.children.forEach(child => {
                if (child.name === name) {
                    title = util.handleTitle(vm, child);
                    if (item.name === 'otherRouter') {
                        isOtherRouter = true;
                    }
                }
            });
        }
    });
    let currentPathArr = [];
    if (name === 'home_index') {
        currentPathArr = [{
            title: util.handleTitle(vm, util.getRouterObjByName(vm.$store.state.app.routers, 'home_index')),
            path: '',
            name: 'home_index'
        }];
    } else if ((name.indexOf('_index') >= 0 || isOtherRouter) && name !== 'home_index') {
        currentPathArr = [{
                title: util.handleTitle(vm, util.getRouterObjByName(vm.$store.state.app.routers, 'home_index')),
                path: '/home',
                name: 'home_index'
            },
            {
                title: title,
                path: '',
                name: name
            }
        ];
    } else {
        let currentPathObj = vm.$store.state.app.routers.filter(item => {
            if (item.children.length <= 1) {
                return item.children[0].name === name;
            } else {
                let i = 0;
                let childArr = item.children;
                let len = childArr.length;
                while (i < len) {
                    if (childArr[i].name === name) {
                        return true;
                    }
                    i++;
                }
                return false;
            }
        })[0];
        if (currentPathObj.children.length <= 1 && currentPathObj.name === 'home') {
            currentPathArr = [{
                title: '首页',
                path: '',
                name: 'home_index'
            }];
        } else if (currentPathObj.children.length <= 1 && currentPathObj.name !== 'home') {
            currentPathArr = [{
                    title: '首页',
                    path: '/home',
                    name: 'home_index'
                },
                {
                    title: currentPathObj.title,
                    path: '',
                    name: name
                }
            ];
        } else {
            let childObj = currentPathObj.children.filter((child) => {
                return child.name === name;
            })[0];
            currentPathArr = [{
                    title: '首页',
                    path: '/home',
                    name: 'home_index'
                },
                {
                    title: currentPathObj.title,
                    path: '',
                    name: currentPathObj.name
                },
                {
                    title: childObj.title,
                    path: currentPathObj.path + '/' + childObj.path,
                    name: name
                }
            ];
        }
    }
    vm.$store.commit('setCurrentPath', currentPathArr);

    return currentPathArr;
};

util.openNewPage = function (vm, name, argu, query) {
    let pageOpenedList = vm.$store.state.app.pageOpenedList;
    let openedPageLen = pageOpenedList.length;
    let i = 0;
    let tagHasOpened = false;
    while (i < openedPageLen) {
        if (name === pageOpenedList[i].name) { // 页面已经打开
            vm.$store.commit('pageOpenedList', {
                index: i,
                argu: argu,
                query: query
            });
            tagHasOpened = true;
            break;
        }
        i++;
    }
    if (!tagHasOpened) {
        let tag = vm.$store.state.app.tagsList.filter((item) => {
            if (item.children) {
                return name === item.children[0].name;
            } else {
                return name === item.name;
            }
        });
        tag = tag[0];
        if (tag) {
            tag = tag.children ? tag.children[0] : tag;
            if (argu) {
                tag.argu = argu;
            }
            if (query) {
                tag.query = query;
            }
            vm.$store.commit('increateTag', tag);
        }
    }
    vm.$store.commit('setCurrentPageName', name);
};

util.toDefaultPage = function (routers, name, route, next) {
    let len = routers.length;
    let i = 0;
    let notHandle = true;
    while (i < len) {
        if (routers[i].name === name && routers[i].redirect === undefined) {
            route.replace({
                name: routers[i].children[0].name
            });
            notHandle = false;
            next();
            break;
        }
        i++;
    }
    if (notHandle) {
        next();
    }
};

util.fullscreenEvent = function (vm) {
    // 权限菜单过滤相关
    vm.$store.commit('updateMenulist');
};

//日期格式化
Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

/**
 * 今年的第几周
 * @param dateString
 * @returns {*}
 */
util.getYearWeek = function (dateString) {
    var da = dateString; //日期格式2015-12-30
    //当前日期
    var date1 = new Date(da.substring(0, 4), parseInt(da.substring(5, 7)) - 1, da.substring(8, 10));
    //1月1号
    var date2 = new Date(da.substring(0, 4), 0, 1);
    //获取1月1号星期（以周一为第一天，0周一~6周日）
    var dateWeekNum = date2.getDay() - 1;
    if (dateWeekNum < 0) {
        dateWeekNum = 6;
    }
    if (dateWeekNum < 4) {
        //前移日期
        date2.setDate(date2.getDate() - dateWeekNum);
    } else {
        //后移日期
        date2.setDate(date2.getDate() + 7 - dateWeekNum);
    }
    var d = Math.round((date1.valueOf() - date2.valueOf()) / 86400000);
    if (d < 0) {
        var date3 = (date1.getFullYear() - 1) + "-12-31";
        return getYearWeek(date3);
    } else {
        //得到年数周数
        var year = date1.getFullYear();
        var week = Math.ceil((d + 1) / 7);
        return week;
    }
}

/**
 * 计算季度
 * @param date 日期 Date类型
 * @returns {{date: *, section: number}}
 */
util.getSecion = function (date) {
    let dateMonth = date.getMonth();
    let section = 0;
    if (dateMonth >= 0 && dateMonth < 3) {
        section = 1;
        date.setMonth(0);
    } else if (dateMonth >= 3 && dateMonth < 6) {
        section = 2;
        date.setMonth(3);
    } else if (dateMonth >= 6 && dateMonth < 9) {
        section = 3;
        date.setMonth(6);
    } else if (dateMonth >= 9 && dateMonth < 12) {
        section = 4;
        date.setMonth(9);
    }
    date.setDate(1);
    return {
        date,
        section
    };
}


/**
 * 目录树查询
 * @param items 目录树，JSON对象
 * @param nameField 代表名称字段的字段名称
 * @param childField 代表子类数组的字段名称
 * @param key 查询关键字
 * @returns {*} 返回查询后的结果树，把原来的树替换掉就可以
 */
util.searchTree = function (items, nameField, childField, key) {
    //相当于克隆了一个对象
    const resultTemp = JSON.parse(JSON.stringify(items));
    const reg = RegExp(".*?" + key, "gi");
    util.forEachChild(resultTemp, reg, nameField, childField);
    return resultTemp;
}
/**
 * 递归目录树子类查询
 * @param items JSON对象
 * @param reg   正则对象
 * @param nameField 代表名称字段的字段名称
 * @param childField 代表子类数组的字段名称
 * @returns {boolean}   true就是找到了
 */
util.forEachChild = function (items, reg, nameField, childField) {
    var subsTem = [],
        childItems;
    items[childField].forEach(function (child) {
        childItems = child[childField];
        //设置从开头匹配
        reg.lastIndex = 0;
        if (reg.test(child[nameField])) {
            //还是要递归一下它的子类
            if (childItems != undefined && childItems.length > 0) {
                util.forEachChild(child, reg, nameField, childField);
            }
            subsTem.push(child);
        } else if (childItems != undefined && childItems.length > 0 && util.forEachChild(child, reg, nameField, childField).length > 0) {
            //当前不匹配，但是子类匹配到了，也保留
            subsTem.push(child);
        }
    });
    items[childField] = subsTem;
    return subsTem;
}

/**
 * json转成Iview Tree
 * @param json
 * @param selectId 选中的Id
 */
util.jsonToTree = function (json, firstTitle) {
    var treeData = {
        title: firstTitle ? firstTitle : '后台资源',
        id: 0,
        expand: true,
        children: []
    };
    json.forEach(function (item) {
        if (item.parentId == 0) {
            treeData.children.push({
                title: item.name,
                expand: true,
                id: item.id,
                parentId: 0
            })
        }
    });
    setTreeChild(treeData.children, json);
    return [treeData];
}
/**
 * 递归json转成Tree
 * @param treeChild
 * @param datas
 * @param selectId 要被选中的ID
 */
function setTreeChild(treeChild, datas) {
    treeChild.forEach(function (item) {
        datas.forEach(function (data) {
            if (data.parentId == item.id) {
                if (item.children == undefined) {
                    item.children = [];
                }
                item.children.push({
                    title: data.name,
                    expand: true,
                    id: data.id,
                    parentId: data.parentId
                });
            }
        });
        if (item.children != undefined && item.children.length > 0) {
            setTreeChild(item.children, datas);
        }
    });
}
/**
 * 遍历Tree勾选,禁用等操作
 * @param treeData
 * @param arr 勾选的ID数组
 * @returns {*}
 */
util.doEachTree = function (treeData, arr, isChecked, isDisable) {
    treeData.forEach(function (item) {
        arr.forEach(function (obj) {
            if (obj.id == item.id || obj == item.id) {
                if (isChecked) {
                    item.checked = true;
                }
                if (isDisable) {
                    item.disabled = true;
                }
                return;
            }
        });
        if (!item.checked && item.children != undefined && item.children.length > 0) {
            util.doEachTree(item.children, arr, isChecked, isDisable);
        }
    });
    return treeData;
};

/**
 * 遍历树
 * @param treeData 数组
 * @param 名称
 */
util.MenudoEachTree = function (treeData, toname) {
    let res = false;
    treeData.forEach(function (item) {
        if (res) {
            return;
        } else {
            res = item.name == toname ? true : false;
            if (!res && item.children != undefined && item.children.length > 0) {
                res = util.MenudoEachTree(item.children, toname);
            }
        }
    });
    return res;
};

/**
 * 数据字典
 * @param dicCode 字典代码
 * @returns {*|AxiosPromise}
 */
util.dic = function (dicCode) {
    return util.ajax.post('/pubApi/dic/dicItemList?dicCode=' + dicCode);
};

//===================
util.allcompany = function () {
    return util.ajax.post('/pubApi/yuanlin/mtccompany');
}

export default util;