import Main from '@/views/Main.vue';

// 不作为Main组件的子页面展示的页面单独写，如下
export const loginRouter = {
	path: '/login',
	name: 'login',
	meta: {
		title: 'Login - 登录'
	},
	component: resolve => {
		require(['@/views/login.vue'], resolve);
	}
};

export const page404 = {
	path: '/*',
	name: 'error-404',
	meta: {
		title: '404-页面不存在'
	},
	component: resolve => {
		require(['@/views/error-page/404.vue'], resolve);
	}
};

export const page403 = {
	path: '/403',
	meta: {
		title: '403-权限不足'
	},
	name: 'error-403',
	component: resolve => {
		require(['@//views/error-page/403.vue'], resolve);
	}
};

export const page500 = {
	path: '/500',
	meta: {
		title: '500-服务端错误'
	},
	name: 'error-500',
	component: resolve => {
		require(['@/views/error-page/500.vue'], resolve);
	}
};

// 作为Main组件的子页面展示但是不在左侧菜单显示的路由写在otherRouter里
export const otherRouter = {
	path: '/',
	name: 'otherRouter',
	component: Main,
	children: [{
		path: 'home',
		title: {
			i18n: 'home'
		},
		name: 'home_index',
		component: resolve => {
			require(['@/views/home/home.vue'], resolve);
		}
	}]
};

// 作为Main组件的子页面展示并且在左侧菜单显示的路由写在appRouter里
export const appRouter = [

	// 项目管理
	{
		path: '/project',
		icon: 'ios-paper',
		title: '项目管理',
		name: 'project',
		component: Main,
		children: [{
			path: 'projectList',
			icon: 'image',
			name: 'projectList',
			title: '项目列表',
			component: resolve => {
				require(['@/views/yuanlin/project/projectList.vue'], resolve);
			}
		}]
	},

	// 订单管理
	{
		path: '/order',
		icon: 'ios-paper',
		title: '订单管理',
		name: 'order',
		component: Main,
		children: [{
			path: 'orderList',
			icon: 'image',
			name: 'orderList',
			title: '订单列表',
			component: resolve => {
				require(['@/views/yuanlin/order/orderList.vue'], resolve);
			}
		}]
	},

	// 树木管理
	{
		path: '/tree',
		icon: 'ios-paper',
		title: '树木管理',
		name: 'tree',
		component: Main,
		children: [{
			path: 'treeList',
			icon: 'image',
			name: 'treeList',
			title: '树木列表',
			component: resolve => {
				require(['@/views/yuanlin/tree/treeList.vue'], resolve);
			}
		}]
	},

	// 用户管理
	{
		path: '/user',
		icon: 'ios-paper',
		title: '用户管理',
		name: 'user',
		component: Main,
		children: [{
			path: 'list',
			icon: 'ios-paper',
			name: 'userlist',
			title: '用户列表',
			component: resolve => {
				require(['@/views/yuanlin/user/userList.vue'], resolve);
			}
		}]
	},

	// 图片附件
	{
		path: '/attachment',
		icon: 'ios-paper',
		title: '图片附件',
		name: 'sys-attachment',
		component: Main,
		children: [{
				path: 'image',
				icon: 'image',
				name: 'sys-image',
				title: '图片管理',
				component: resolve => {
					require(['@/views/sys/attachment/image.vue'], resolve);
				}
			},
			{
				path: 'attach',
				icon: 'link',
				name: 'sys-attach',
				title: '附件管理',
				component: resolve => {
					require(['@/views/sys/attachment/attach.vue'], resolve);
				}
			}
		]
	},

	// 系统管理
	{
		path: '/sys',
		icon: 'settings',
		title: '系统管理',
		name: 'sys-idx',
		component: Main,
		children: [{
				path: 'user',
				icon: 'person',
				name: 'sys-user',
				title: '用户管理',
				component: resolve => {
					require(['@/views/sys/user/idx.vue'], resolve);
				}
			},
			{
				path: 'role',
				icon: 'person-stalker',
				name: 'sys-role',
				title: '角色管理',
				component: resolve => {
					require(['@/views/sys/role/idx.vue'], resolve);
				}
			},
			{
				path: 'resource',
				icon: 'ios-list-outline',
				name: 'sys-resource',
				title: '资源管理',
				component: resolve => {
					require(['@/views/sys/resource/idx.vue'], resolve);
				}
			},
			{
				path: 'permission',
				icon: 'locked',
				name: 'sys-permission',
				title: '权限管理',
				component: resolve => {
					require(['@/views/sys/permission/idx.vue'], resolve);
				}
			},
			{
				path: 'dic',
				icon: 'ios-book',
				name: 'sys-dic',
				title: '数据字典',
				component: resolve => {
					require(['@/views/sys/dic/idx.vue'], resolve);
				}
			},
			{
				path: 'sms',
				icon: 'ios-book',
				name: 'sys-sms',
				title: '短信日志',
				component: resolve => {
					require(['@/views/sys/sms.vue'], resolve);
				}
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