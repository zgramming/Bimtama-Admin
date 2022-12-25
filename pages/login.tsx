import { Button, Form, Input, notification, Spin } from "antd";
import Image from "next/image";
import { useRouter } from "next/router";
import { setCookie } from "nookies";
import { useState } from "react";
import Logo from "../public/images/logo_color.png";
import { keyLocalStorageLogin } from "../utils/constant";

const LoginPage = () => {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const { replace } = useRouter();
  const onFinish = async () => {
    try {
      setIsLoading(true);
      const values = await form.validateFields();
      const user = {};
      /// Save to localstorage
      localStorage.setItem(keyLocalStorageLogin, JSON.stringify(user));
      setCookie(null, keyLocalStorageLogin, JSON.stringify(user));
      replace("/setting/user");
    } catch (e: any) {
      console.log({
        errorLogin: e,
      });
      const { message, code, status } = e?.response?.data || {};
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
