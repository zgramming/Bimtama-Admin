import {
  Button,
  Form,
  Input,
  Modal,
  notification,
  Select,
  Space,
  Spin,
} from "antd";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/router";
import { setCookie } from "nookies";
import { useState } from "react";

import Logo from "../public/images/logo_color.png";
import { baseAPIURL, keyLocalStorageLogin } from "../utils/constant";

type FormModalRegisterType = {
  open: boolean;
  onCloseModal: () => void;
};
const FormModalRegister = (config: FormModalRegisterType) => {
  const { replace } = useRouter();
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const groups: Array<{ label: string; value: string }> = [
    { label: "Mahasiswa", value: "mahasiswa" },
    { label: "Dosen", value: "dosen" },
  ];

  const onFinish = async () => {
    try {
      setIsLoading(true);
      const { username, password, code_group } = await form.validateFields();
      const { data: dataResponse, status } = await axios.post(
        `${baseAPIURL}/beta/register`,
        {
          username,
          password,
          code_group,
        }
      );

      const { data, message, success, token } = dataResponse;
      /// Save to localstorage
      setCookie(null, keyLocalStorageLogin, token, { path: "/" });
      replace("/");
    } catch (e: any) {
      let message = e?.message;
      if (axios.isAxiosError(e)) {
        const { message: msg } = e?.response?.data;

        message = Array.isArray(msg) ? (
          <ul>
            {msg.map((val) => (
              <li key={val}>{val.message}</li>
            ))}
          </ul>
        ) : (
          msg ?? "Unknown Error"
        );
      }

      notification.error({
        message: "Error Occured",
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Modal
      title="Daftar Beta User"
      open={config.open}
      maskClosable={false}
      keyboard={false}
      closable={false}
      width="1000px"
      onCancel={(e) => config.onCloseModal()}
      footer={
        <Spin spinning={isLoading}>
          <Button onClick={(e) => config.onCloseModal()}>Batal</Button>
          <Button
            htmlType="submit"
            form="form_validation_register"
            className="bg-success text-white"
          >
            Register
          </Button>
        </Spin>
      }
    >
      <Spin spinning={isLoading}>
        <Form
          form={form}
          name="form_validation_register"
          id="form_validation_register"
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            label="User Group"
            name="code_group"
            rules={[{ required: true }]}
          >
            <Select placeholder="Pilih User Group" options={groups}></Select>
          </Form.Item>
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true }]}
          >
            <Input placeholder="Username" />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true }]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

const LoginPage = () => {
  const { replace } = useRouter();
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    <>
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
                  <Input.Password
                    name="password"
                    placeholder="Input password"
                  />
                </Form.Item>

                <Space direction="vertical" size={20} className="mb-10 w-full">
                  <Button
                    type="primary"
                    size="large"
                    htmlType="submit"
                    className="w-full"
                  >
                    Login
                  </Button>
                  <Button
                    type="default"
                    size="large"
                    className="w-full"
                    onClick={(e) => setIsModalOpen(true)}
                  >
                    Daftar
                  </Button>
                </Space>
              </Form>
            </div>
            <div className="hidden lg:flex flex-col justify-center items-center rounded-tr-lg rounded-br-lg bg-primary lg:basis-1/2">
              <h1>DISINI BACKGROUND IMAGE</h1>
            </div>
          </div>
        </section>
      </Spin>
      {isModalOpen && (
        <FormModalRegister
          open={isModalOpen}
          onCloseModal={() => {
            setIsModalOpen(false);
          }}
        />
      )}
    </>
  );
};

LoginPage.getLayout = (page: any) => page;

export default LoginPage;
