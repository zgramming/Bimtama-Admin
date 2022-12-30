import axios from "axios";
import { parseCookies } from "nookies";

import { keyLocalStorageLogin } from "./constant";

export const axiosSetHeaderToken = () => {
  const cookies = parseCookies();
  const token = cookies[keyLocalStorageLogin];
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};
