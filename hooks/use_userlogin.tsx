import { notification } from "antd";
import jwt, { JwtPayload } from "jsonwebtoken";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import { useEffect, useState } from "react";

import { Users } from "../interface/main_interface";
import { keyLocalStorageLogin } from "../utils/constant";

const useUserLogin = () => {
  const { replace } = useRouter();
  const [user, setUser] = useState<Users | undefined>();
  useEffect(() => {
    try {
      const cookies = parseCookies();
      const { payload } = jwt.decode(
        cookies[keyLocalStorageLogin]
      ) as JwtPayload;
      const { user } = payload;
      if (!user) {
        throw new Error("Unauthorized");
      }
      console.log({ user });
      setUser(user);
    } catch (error: any) {
      notification.error({
        message: error?.message ?? "User Unauthorized",
      });

      replace("/login");
    }
    return () => {};
  }, [replace]);

  return user;
};

export default useUserLogin;
