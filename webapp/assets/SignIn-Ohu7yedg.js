import{_ as h,c as V,S,g as A,u as I,k}from"./index-BsrjhtPE.js";import{_ as g}from"./wallid-background-B16PIqfk.js";import{a3 as b,a8 as _,a9 as s,W as y,l as e,a5 as l,X as u,R as v,Z as m,ad as i}from"./vue-BAjJ74_5.js";import{aB as x,B as p,a as C,c as B,at as r,V as d,ap as D}from"./vuetify-B6yzhMeP.js";/* empty css                            */const L={name:"LocalAuthentication",data(){return{username:"guilherme",password:"arsenio",error:"",usernameRules:[t=>!!t||this.$t("signin.username_required")],passwordRules:[t=>!!t||this.$t("signin.password_required")]}},created(){this.$debug(`*** ${this.$options.name} ***`)},methods:{async signIn(){try{this.username=this.username.trim(),await V()[S]({username:this.username,password:this.password}),this.$router.push("/Dashboard")}catch(t){this.error=this.$te(`error.${t?.message}`)?this.$t(`error.${t?.message}`):this.$t("error.default")}}}},N={class:"error--text"};function R(t,o,f,w,a,c){return b(),_(x,{onSubmit:y(c.signIn,["prevent"])},{default:s(()=>[e(p,{modelValue:a.username,"onUpdate:modelValue":o[0]||(o[0]=n=>a.username=n),rules:a.usernameRules,label:t.$t("signin.username"),required:"",autocomplete:"username",color:"#0ea4b5"},null,8,["modelValue","rules","label"]),e(p,{modelValue:a.password,"onUpdate:modelValue":o[1]||(o[1]=n=>a.password=n),rules:a.passwordRules,label:t.$t("signin.password"),required:"",type:"password",autocomplete:"current-password",color:"#0ea4b5"},null,8,["modelValue","rules","label"]),l("p",N,u(a.error),1),e(C,{text:"",class:"advance-btn",type:"submit"},{default:s(()=>[v(u(t.$t("signin.button")),1)]),_:1})]),_:1},8,["onSubmit"])}const F=h(L,[["render",R],["__file","C:/Users/guilh/Documents/EIDCMP/web-app-v3/src/components/Authentication/Local.vue"]]),W={name:"SignIn",title:"pageTitle.signIn",components:{AppFooter:A,LocalAuthentication:F},data(){return{card:void 0,tab:"one",sideImage:g,error:void 0}},computed:{},mounted(){this.$debug(`*** ${this.$options.name} ***`),I().setLoading(!1)},methods:{}},q={class:"d-flex align-center"},T={class:"title_header"};function U(t,o,f,w,a,c){const n=m("LocalAuthentication"),$=m("AppFooter");return b(),_(B,{fluid:"",class:"signin pa-0"},{default:s(()=>[e(D,null,{default:s(()=>[e(r,{cols:"6",class:"pt-8 pb-8",style:{"padding-left":"6vw"}},{default:s(()=>[e(r,{cols:"12",class:"pt-8 pb-10 pl-9"},{default:s(()=>[l("div",q,[e(d,{alt:"WalliD Logo",class:"shrink mr-2",src:k,transition:"scale-transition","max-width":"160","max-height":"110"})])]),_:1}),e(r,{cols:"12",class:"pt-16 pb-5 pl-9"},{default:s(()=>[l("h1",T,[i(" {{ 'Select a sign in option' }} "),v(" "+u(t.$t("signin.title")),1)])]),_:1}),e(r,{cols:"6",class:"pt-1 pr-10 pl-9"},{default:s(()=>[i(` <v-tabs
            v-model="tab"
            color="#0ea4b5"
          >
            <v-tab key="one">
              {{ $t('pageTitle.signIn') }}
            </v-tab>
            <v-tab key="two">
              OAuth
            </v-tab>
            <v-tab key="three">
              Wallet
            </v-tab>
          </v-tabs> `),i(` <v-tabs-items v-model="tab">
            <v-tab-item key="one">
              <v-col cols="12" md="6" class="px-0"> `),e(n),i(` </v-col>
            </v-tab-item>

            <v-tab-item key="two">
              <OAuthAuthentication />
            </v-tab-item>

            <v-tab-item key="three">
              <WalletAuthentication />
            </v-tab-item>
          </v-tabs-items> `)]),_:1})]),_:1}),e(r,{cols:"6",class:"pt-0"},{default:s(()=>[e(d,{alt:"Wallid Background",class:"shrink mr-2",contain:"",src:g,transition:"scale-transition","min-width":"864","min-height":"100"})]),_:1})]),_:1}),e($)]),_:1})}const X=h(W,[["render",U],["__file","C:/Users/guilh/Documents/EIDCMP/web-app-v3/src/views/SignIn.vue"]]);export{X as default};
//# sourceMappingURL=SignIn-Ohu7yedg.js.map
