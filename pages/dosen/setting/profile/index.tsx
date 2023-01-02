import { Button, Card, Form, Input, message, Space, Spin } from "antd";
import axios from "axios";
import { setCookie } from "nookies";
import { useEffect, useState } from "react";
import useSWR from "swr";

import useUserLogin from "../../../../hooks/use_userlogin";
import { Users } from "../../../../interface/main_interface";
import { baseAPIURL, keyLocalStorageLogin } from "../../../../utils/constant";

const profileFetcher = async ([url]: any) => {
  const request = await axios.get(`${url}`);
  const { data, success }: { data: Users; success: boolean } = request.data;
  return data;
};

const Page = () => {
  const user = useUserLogin();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);

  const {
    data: profile,
    isLoading: isLoadingProfile,
    mutate: reloadProfile,
  } = useSWR([`${baseAPIURL}/dosen/profile/${user?.id}`], profileFetcher);

  const onFinish = async () => {
    try {
      setIsLoading(true);
      const { name, phone } = await form.validateFields();

      const body = {
        user_id: user?.id,
        name,
        phone,
      };
      const { data: dataResponse, status } = await axios.put(
        `${baseAPIURL}/dosen/profile`,
        body
      );

      const { data, message, success, token } = dataResponse;
      setCookie(null, keyLocalStorageLogin, token, { path: "/" });

      reloadProfile();
      messageApi.success(message);
    } catch (e: any) {
      let message = e?.message;

      if (axios.isAxiosError(e)) {
        const { message: msg } = e?.response?.data;

        message = Array.isArray(msg)
          ? msg.map((val) => val.message).join(`\n`)
          : msg;
      }

      messageApi.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    form.setFieldsValue({
      name: profile?.name,
      phone: profile?.phone,
    });
    return () => {};
  }, [form, profile]);

  return (
    <Spin spinning={isLoadingProfile || isLoading}>
      {contextHolder}
      <Card>
        <div className="flex flex-col gap-5">
          <div className="flex flex-row justify-between items-center">
            <div className="text-lg font-semibold">Form Profile</div>
            <Space wrap>
              <Button
                htmlType="submit"
                form="form_validation"
                className="bg-success text-white"
              >
                Simpan
              </Button>
            </Space>
          </div>
          <Form
            form={form}
            name="form_validation"
            id="form_validation"
            layout="vertical"
            onFinish={onFinish}
          >
            <Form.Item label="Nama" name="name">
              <Input name="name" placeholder="Input name" />
            </Form.Item>
            <Form.Item label="Telepon" name="phone">
              <Input
                name="phone"
                type="tel"
                placeholder="Input phone"
                className="w-full"
                maxLength={15}
              />
            </Form.Item>
          </Form>
        </div>
      </Card>
    </Spin>
  );
};

export default Page;
