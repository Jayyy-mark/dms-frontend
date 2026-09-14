//<!--==================================
// AUTHENTICATION API HANDLER
//====================================-->

import api from "../../helpers/api";
import { SignInFormData } from "../../interfaces/auth/SignInFormData";
import { SignupFormData } from "../../interfaces/auth/SignUpFormData";

export const authApi = {
    async login(form : SignInFormData):Promise<any>{
        
        const res = await api.post("auth/login/",{
            email: form.email,
            password: form.password
        });

        return res.data;
    },
    async signUpUser(form: SignupFormData):Promise<any>{
        const res = await api.post("auth/register/",{
            username:form.username,
            email:form.email,
            password1:form.password,
            password2:form.password,
            role:"admin",
        });

        return res.data;
    }
};