import { Button, Form, Input, notification, Spin } from "antd";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/router";
import { setCookie } from "nookies";
import { useState } from "react";

import Logo from "../public/images/logo_color.png";
import { baseAPIURL, keyLocalStorageLogin } from "../utils/constant";

const LoginPage = () => {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const { replace } = useRouter();
  const onFinish = async () => {
    try {
      setIsLoading(true);
      const { username, password } = await form.validateFields();
      const { data: dataResponse, status } = await axios.post(
        `${baseAPIURL}/login`,
        {
          username,
          password,
        }
      );

      const { data, token, message, success } = dataResponse;

      if (!success) {
        notification.error({
          message: "Error occured",
          description: message,
        });
        return;
      }

      /// Save to localstorage
      setCookie(null, keyLocalStorageLogin, token, { path: "/" });
      replace("/");
    } catch (e: any) {
      let message = e?.message;

      if (axios.isAxiosError(e)) {
        const dataResponse = e.response?.data;
        const { success, message: msg } = dataResponse;
        message = msg;
      }

      notification.error({
        duration: 0,
        message: "Error",
        description: message || "Unknown Error Message",
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Spin spinning={isLoading}>
      <section className="min-h-screen flex flex-col justify-center bg-gray-200">
        <div className="flex flex-col lg:flex-row px-10">
          <div className="bg-white px-10 lg:basis-1/2">
            <div className="text-center">
              <Image alt="Image logo" src={Logo} width={200} height={200} />
            </div>
            <Form
              form={form}
              name="form_validation"
              id="form_validation"
              layout="vertical"
              onFinish={onFinish}
            >
              <p className="mb-4 text-start">Please login to your account</p>
              <Form.Item
                label="Username"
                name="username"
                rules={[{ required: true }]}
              >
                <Input name="username" placeholder="Input username" />
              </Form.Item>
              <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true }]}
              >
                <Input.Password name="password" placeholder="Input password" />
              </Form.Item>
              <Form.Item
                name="btn_submit"
                className="flex flex-col text-center py-5 space-y-5"
              >
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  className="w-full"
                >
                  Login
                </Button>
              </Form.Item>
            </Form>
          </div>
          <div className="hidden lg:flex flex-col justify-center items-center rounded-tr-lg rounded-br-lg bg-primary lg:basis-1/2">
            <h1>DISINI BACKGROUND IMAGE</h1>
          </div>
        </div>
      </section>
    </Spin>
  );
};

LoginPage.getLayout = (page: any) => page;

export default LoginPage;
