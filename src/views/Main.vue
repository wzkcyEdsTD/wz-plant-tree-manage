<style>
	.easy-scrollbar,.easy-scrollbar__wrap,.el-scrollbar__view,.ivu-shrinkable-menu{height: 100%;}
	.easy-scrollbar__wrap{overflow:auto !important;}
	.esay-scrollbar__bar.is-vertical{visibility: hidden;}
</style>
<template>
    <div class="main" :class="{'main-hide-text': shrink}">
		<div class="sidebar-menu-con" :style="{width: shrink?'60px':'200px', overflow: shrink ? 'visible' : 'hidden'}" >
			<EasyScrollbar barColor="transparent">
				<shrinkable-menu
						:shrink="shrink"
						:menu-list="menuList">
					<div slot="top" class="logo-con" @click="goHome">
						<!--<img v-show="!shrink"  src="../images/logo.jpg" key="max-logo" />-->
						<h2 v-show="!shrink" style="color:#2d8cf0">后台管理</h2>
						<Icon type="briefcase" v-show="shrink" style="color:#2d8cf0" size="30"></Icon>
						<!--<Icon type="ios-cart" ></Icon>-->
						<!--<img v-show="shrink" src="../images/logo-min.jpg" key="min-logo" />-->
					</div>
				</shrinkable-menu>
			</EasyScrollbar>
		</div>
        <div class="main-header-con" :style="{paddingLeft: shrink?'60px':'200px'}">
            <div class="main-header">
                <!--顶部左侧-->
                <div class="navicon-con">
                    <Button :style="{transform: 'rotateZ(' + (this.shrink ? '-90' : '0') + 'deg)'}" type="text" @click="toggleClick">
                        <Icon type="navicon" size="32"></Icon>
                    </Button>
                </div>
                <!--面包屑导航-->
                <div class="header-middle-con">
                    <div class="main-breadcrumb">
                        <breadcrumb-nav :currentPath="currentPath"></breadcrumb-nav>
                    </div>
                </div>
                <!--右侧-->
                <div class="header-avator-con">
                    <div class="user-dropdown-menu-con">
                        <Row type="flex" justify="end" align="middle" class="user-dropdown-innercon">
                            <Dropdown transfer trigger="click" @on-click="handleClickUserDropdown">
                                <a href="javascript:void(0)">
                                    <span class="main-user-name">{{userName}}</span>
                                    <Icon type="arrow-down-b"></Icon>
                                </a>
                                <DropdownMenu slot="list">
                                    <!--<DropdownItem @click="userInfoModal.show=true" divided>个人资料</DropdownItem>-->
                                    <DropdownItem name="logout">退出登录</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                            <Avatar icon="person" style="background: #619fe7;margin-left:10px;"></Avatar>
                        </Row>
                    </div>
                </div>
            </div>
<!--			<div class="tags-con">
				<tags-page-opened :pageTagsList="pageTagsList"></tags-page-opened>
			</div>-->
        </div>
        <div class="single-page-con" :style="{left: shrink?'60px':'200px'}">
            <div class="single-page">
				<router-view></router-view>
            </div>
        </div>
    </div>
</template>
<script>
//import Cookies from 'js-cookie';
import shrinkableMenu from './main-components/shrinkable-menu/shrinkable-menu.vue';
import tagsPageOpened from './main-components/tags-page-opened.vue';
import breadcrumbNav from './main-components/breadcrumb-nav.vue';
import Util from '../libs/util';

export default {
    components: {
        shrinkableMenu,
        tagsPageOpened,
        breadcrumbNav
    },
    data () {
        return {
            shrink: false,
            userName:'',
            userInfo:{
                userName:""
            },
            userInfoModal:{
                show:false
            }
        };
    },
    computed: {
        menuList () {
            return this.$store.state.app.menuList;
        },
        currentPath () {
			let clone = {
				name:"home_index",
				title:"首页",
				path:"/",
				children:this.$store.state.app.menuList
			}
			let currentPath = [];
			let tree = Util.searchTree(clone,'name','children',this.$route.name);
			currentPath.push(clone);
			if(tree.children && tree.children.length>0){
				currentPath.push(tree.children[0]);
				if(tree.children[0].children && tree.children[0].children.length>0){
					currentPath.push(tree.children[0].children[0]);
					if(tree.children[0].children[0].children && tree.children[0].children[0].children.length>0){
						currentPath.push(tree.children[0].children[0].children[0]);
					}
				}
			}
            return currentPath; // 当前面包屑数组
        },
		pageTagsList () {
			return this.$store.state.app.pageOpenedList; // 打开的页面的页面对象
		}
    },
    methods: {
        init () {
            //初始化获取用户信息
            const self = this;
            Util.ajax.post("/api/sys/main/userInfo").then(function (response) {
                //console.log(response.data);
				self.userName = response.data.name;
            });
            //用户拥有资源
            //self.$store.dispatch("updateMenulist");
        },
        toggleClick () {
            this.shrink = !this.shrink;
        },
        editInfo(){

        },
		goHome(){
          this.$router.push({name: 'home_index'});
		},
        handleClickUserDropdown (name) {
            //退出登录
            if (name === 'logout') {
                Util.ajax.post("/api/sys/main/doLogout").then(function (response) {
                    Util.logout();
                    location.reload();
                });
                /*this.$store.commit("logout");
                this.$router.push({name: 'login'});*/
            }
        },
		checkTag (name) {
			let openpageHasTag = this.pageTagsList.some(item => {
				if (item.name === name) {
					return true;
				}
			});
			if (!openpageHasTag) { //  解决关闭当前标签后再点击回退按钮会退到当前页时没有标签的问题
				Util.openNewPage(this, name, this.$route.params || {}, this.$route.query || {});
			}
		}
    },
	watch:{
		'$route' (to) {
			this.$store.commit('setCurrentPageName', to.name);
			let pathArr = Util.setCurrentPath(this, to.name);
			if (pathArr.length > 2) {
				this.$store.commit('addOpenSubmenu', pathArr[1].name);
			}
			this.checkTag(to.name);
			localStorage.currentPageName = to.name;
		}
	},
    mounted () {
        this.init();
    }
};
</script>

<style lang="less">
	@import "../styles/common.less";
	@import "./main.less";
</style>