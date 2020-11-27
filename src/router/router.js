import Main from '@/views/Main.vue';

// 不作为Main组件的子页面展示的页面单独写，如下
export const loginRouter = {
    path: '/login',
    name: 'login',
    meta: {
        title: 'Login - 登录'
    },
    component: resolve => { require(['@/views/login.vue'], resolve); }
};

export const page404 = {
    path: '/*',
    name: 'error-404',
    meta: {
        title: '404-页面不存在'
    },
    component: resolve => { require(['@/views/error-page/404.vue'], resolve); }
};

export const page403 = {
    path: '/403',
    meta: {
        title: '403-权限不足'
    },
    name: 'error-403',
    component: resolve => { require(['@//views/error-page/403.vue'], resolve); }
};

export const page500 = {
    path: '/500',
    meta: {
        title: '500-服务端错误'
    },
    name: 'error-500',
    component: resolve => { require(['@/views/error-page/500.vue'], resolve); }
};

// 作为Main组件的子页面展示但是不在左侧菜单显示的路由写在otherRouter里
export const otherRouter = {
    path: '/',
    name: 'otherRouter',
    component: Main,
    children: [
        { path: 'home', title: {i18n: 'home'}, name: 'home_index', component: resolve => { require(['@/views/home/home.vue'], resolve); } }
    ]
};

// 作为Main组件的子页面展示并且在左侧菜单显示的路由写在appRouter里
export const appRouter = [
	{
		path: '/user',
		icon: 'ios-paper',
		title: '用户管理',
		name: 'user',
		component: Main,
		children: [
			{
				path: 'list',
				icon: 'ios-paper',
				name: 'userlist',
				title: '用户列表',
				component: resolve => { require(['@/views/yuanlin/user/userList.vue'], resolve); }
			}
		]
	},
	{
		path: '/mtc',
		icon: 'ios-paper',
		title: '养护管理',
		name: 'mtc',
		component: Main,
		children: [
			{
				path: 'mtcCompany',
				icon: 'ios-paper',
				name: 'mtcCompany',
				title: '养护公司',
				component: resolve => { require(['@/views/yuanlin/mtc/mtcCompany.vue'], resolve); }
			},
			{
				path: 'mtclist',
				icon: 'ios-paper',
				name: 'mtclist',
				title: '养护人员',
				component: resolve => { require(['@/views/yuanlin/mtc/mtcList.vue'], resolve); }
			},
			{
				path: 'mtcLog',
				icon: 'ios-paper',
				name: 'mtcLog',
				title: '养护记录',
				component: resolve => { require(['@/views/yuanlin/mtc/mtcLog.vue'], resolve); }
			},
			{
				path: 'mtcForm',
				icon: 'ios-paper',
				name: 'mtcForm',
				title: '问题留言',
				component: resolve => { require(['@/views/yuanlin/mtc/mtcForm.vue'], resolve); }
			}
		]
	},
	{
		path: '/park',
		icon: 'ios-paper',
		title: '公园管理',
		name: 'park',
		component: Main,
		children: [
			{
				path: 'parkList',
				icon: 'ios-paper',
				name: 'parkList',
				title: '公园列表',
				component: resolve => { require(['@/views/yuanlin/park/parkList.vue'], resolve); },
			},
			{
				path: 'areaList',
				icon: 'ios-paper',
				name: 'parkarea',
				title: '区域列表',
				component: resolve => { require(['@/views/yuanlin/park/parkarea.vue'], resolve); }
			},
			{
				path: 'vrlist',
				icon: 'ios-paper',
				name: 'parkvr',
				title: '公园VR',
				component: resolve => { require(['@/views/yuanlin/park/parkvr.vue'], resolve); }
			},
			{
				path: 'activitylist',
				icon: 'ios-paper',
				name: 'activitylist',
				title: '公园活动',
				component: resolve => { require(['@/views/yuanlin/park/parkactivity.vue'], resolve); }
			},
			{
				path: 'audiolist',
				icon: 'ios-paper',
				name: 'audiolist',
				title: '公园语音',
				component: resolve => { require(['@/views/yuanlin/park/parkaudio.vue'], resolve); }
			}
		]
	},
	{
		path: '/plant',
		icon: 'ios-paper',
		title: '植物管理',
		name: 'plant',
		component: Main,
		children: [
			{
				path: 'plantList',
				icon: 'ios-paper',
				name: 'plantList',
				title: '认识植物',
				component: resolve => { require(['@/views/yuanlin/plant/plantList.vue'], resolve); }
			},
			{
				path: 'plantApplyList',
				icon: 'ios-paper',
				name: 'plantApplyList',
				title: '认养植物',
				component: resolve => { require(['@/views/yuanlin/plant/plantApplyList.vue'], resolve); }
			},
			{
				path: 'plantApply',
				icon: 'ios-paper',
				name: 'plantApply',
				title: '认养申请',
				component: resolve => { require(['@/views/yuanlin/plant/plantApply.vue'], resolve); }
			}
		]
	},
	{
		path: '/report',
		icon: 'ios-paper',
		title: '举报管理',
		name: 'report',
		component: Main,
		children: [
			{
				path: 'reportList',
				icon: 'ios-paper',
				name: 'reportList',
				title: '举报列表',
				component: resolve => { require(['@/views/yuanlin/report/reportList.vue'], resolve); }
			}
		]
	},
	{
		path: '/disaster',
		icon: 'ios-paper',
		title: '灾害查询',
		name: 'disaster',
		component: Main,
		children: [
			{
				path: 'list',
				icon: 'ios-paper',
				name: 'disasterList',
				title: '灾害列表',
				component: resolve => { require(['@/views/yuanlin/disaster/list.vue'], resolve); }
			}
		]
	},
	{
		path: '/indexoption',
		icon: 'ios-paper',
		title: '首页设置',
		name: 'indexoption',
		component: Main,
		children: [
			{
				path: 'swiper',
				icon: 'ios-paper',
				name: 'indexswiper',
				title: '首页图片切换',
				component: resolve => { require(['@/views/yuanlin/indexoption/swiper.vue'], resolve); }
			}
		]
	},
	{
		path: '/attachment',
		icon: 'ios-paper',
		title: '图片附件',
		name: 'sys-attachment',
		component: Main,
		children: [
			{
				path: 'image',
				icon: 'image',
				name: 'sys-image',
				title: '图片管理',
				component: resolve => { require(['@/views/sys/attachment/image.vue'], resolve); }
			},
			{
				path: 'attach',
				icon: 'link',
				name: 'sys-attach',
				title: '附件管理',
				component: resolve => { require(['@/views/sys/attachment/attach.vue'], resolve); }
			}
		]
	},
    {
        path: '/sys',
        icon: 'settings',
        title: '系统管理',
        name: 'sys-idx',
        component: Main,
        children: [
            {
                path: 'user',
                icon: 'person',
                name: 'sys-user',
                title: '用户管理',
                component: resolve => { require(['@/views/sys/user/idx.vue'], resolve); }
            },
            {
                path: 'role',
                icon: 'person-stalker',
                name: 'sys-role',
                title: '角色管理',
                component: resolve => { require(['@/views/sys/role/idx.vue'], resolve); }
            },
            {
                path: 'resource',
                icon: 'ios-list-outline',
                name: 'sys-resource',
                title: '资源管理',
                component: resolve => { require(['@/views/sys/resource/idx.vue'], resolve); }
            },
            {
                path: 'permission',
                icon: 'locked',
                name: 'sys-permission',
                title: '权限管理',
                component: resolve => { require(['@/views/sys/permission/idx.vue'], resolve); }
            },
			{
				path: 'dic',
				icon: 'ios-book',
				name: 'sys-dic',
				title: '数据字典',
				component: resolve => { require(['@/views/sys/dic/idx.vue'], resolve); }
			},
			{
				path: 'sms',
				icon: 'ios-book',
				name: 'sys-sms',
				title: '短信日志',
				component: resolve => { require(['@/views/sys/sms.vue'], resolve); }
			}
        ]
    }
];

// 所有上面定义的路由都要写在下面的routers里
export const routers = [
    loginRouter,
    otherRouter,
    ...appRouter,
    page500,
    page403,
    page404
];