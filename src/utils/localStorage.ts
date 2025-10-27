import type { IUser } from "../types/IUser";
import { navigateTo } from "./navigate";


//Almacena los datos del usuario al LocalStorage
export const saveUser = (userData: IUser) => {
    const parse = JSON.stringify(userData);
    localStorage.setItem("userData", parse);
};

//Elimina los datos de SaveUser y redirige la pág. a inicio de sesión
export const logoutUser = () => {
    localStorage.removeItem("userData");
    navigateTo("/src/pages/auth/login/login.html");
}