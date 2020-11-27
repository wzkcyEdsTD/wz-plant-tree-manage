<style lang="less">
    @import './login.less';
</style>

<template>
    <div class="login" @keydown.enter="handleSubmit">
		<h1 class="login-title" style="
    text-align: center;
    position: absolute;
    font-size: 30px;
    width: 100%;
    top: 12%;
"><img src="@/images/logo2.png" alt="" style="
    width: 80px;
    vertical-align: middle;
    margin-top: -20px;
">温州市智慧园林公众服务系统后台管理</h1>
        <div class="login-con">
            <Card :bordered="false">
                <p slot="title">
                    <Icon type="log-in"></Icon>
                    欢迎登录
                </p>
                <div class="form-con">
                    <Form ref="loginForm" :model="form" :rules="rules">
                        <FormItem prop="userName">
                            <Input v-model="form.account" placeholder="请输入用户名">
                                <span slot="prepend">
                                    <Icon :size="16" type="person"></Icon>
                                </span>
                            </Input>
                        </FormItem>
                        <FormItem prop="password">
                            <Input type="password" v-model="form.password" placeholder="请输入密码">
                                <span slot="prepend">
                                    <Icon :size="14" type="locked"></Icon>
                                </span>
                            </Input>
                        </FormItem>
                        <FormItem>
                            <Button @click="handleSubmit" type="primary" long>登录</Button>
                        </FormItem>
                    </Form>
                </div>
            </Card>
        </div>
    </div>
</template>

<script>
import Util from '../libs/util';

export default {
    data () {
        return {
            form: {
                account: '',
                password: ''
            },
            rules: {
                account: [
                    { required: true, message: '账号不能为空', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '密码不能为空', trigger: 'blur' }
                ]
            }
        };
    },
    methods: {
        handleSubmit () {
            this.$refs.loginForm.validate((valid) => {
                if (valid) {
                    const self = this;
                    Util.ajax.post("/api/sys/main/doLogin",{account:this.form.account,password:this.rsa(this.form.password)})
                            .then(function (response) {
                                if(response.data.code=='100'){
                                    //登录成功返回token
                                    self.$store.commit('saveToken',response.data.msg);
                                    //跳转首页
                                    self.$router.push({name: 'home_index'});
                                }else{
                                    alert(response.data.msg);
                                }
                            })
                            .catch(function (error) {
                                console.log(error);
                            });
                }
            });
        },
		rsa (str) {
            let jse = new this.$jsEncrypt;
            jse.setPublicKey(`-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDTRQDXWH1HGeoHzyX8zaMw3tqY
Tc4N+2gDVEcZ0TvPft5k7PBfojpnlqi8DSuS7MGf4a/H28+GXDYZhKjL2jjtCtk4
wdBYpiwMyPx9sFtZRjhBk3QnhH9kRL6i5ILtxVxZPfxU4pAkmKPsU+w34Pvmh3Rf
3u1DnqV+ESZ2y5X2lQIDAQAB
-----END PUBLIC KEY-----`);
            return jse.encrypt(str);
		}
    }
};
</script>
