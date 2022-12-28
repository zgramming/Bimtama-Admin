import {
  Alert,
  Avatar,
  Button,
  Card,
  Form,
  List,
  message,
  Select,
  Space,
  Spin,
} from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import useSWR from "swr";

import { SaveOutlined } from "@ant-design/icons";

import useUserLogin from "../../../../hooks/use_userlogin";
import { OutlineInterface } from "../../../../interface/admin/outline_interface";
import { StudentOutlineInterface } from "../../../../interface/mahasiswa/student_outline_interface";
import { baseAPIURL } from "../../../../utils/constant";

const outlineFetcher = async ([url]: any) => {
  const request = await axios.get(`${url}`);
  const { data, success }: { data: OutlineInterface[]; success: boolean } =
    request.data;
  return data;
};

const studentOutlineFetcher = async ([url]: any) => {
  const request = await axios.get(`${url}`);
  const { data, success }: { data: StudentOutlineInterface; success: boolean } =
    request.data;
  return data;
};

const Page = () => {
  const user = useUserLogin();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);

  const [selectedOutline, setSelectedOutline] = useState<number | undefined>(
    undefined
  );

  const {
    data: outline,
    isLoading: isLoadingOutline,
    mutate: reloadOutline,
  } = useSWR([`${baseAPIURL}/admin/outline`], outlineFetcher);

  const {
    data: studentOutline,
    isLoading: isLoadingStudentOutline,
    mutate: reloadStudentOutline,
  } = useSWR(
    [`${baseAPIURL}/mahasiswa/outline/by-user-id/${user?.id}`],
    studentOutlineFetcher
  );

  const onFinish = async () => {
    try {
      setIsLoading(true);
      const { outline_id } = await form.validateFields();
      const { data: dataResponse, status } = await axios.post(
        `${baseAPIURL}/mahasiswa/outline`,
        {
          outline_id,
          user_id: user?.id,
        }
      );

      const { data, message, success } = dataResponse;

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
    setSelectedOutline((prevState) => studentOutline?.outline_id);

    form.setFieldsValue({
      outline_id: studentOutline?.outline_id,
    });

    return () => {};
  }, [form, studentOutline?.outline_id]);

  return (
    <Spin spinning={isLoading}>
      {contextHolder}
      <Card>
        <div className="flex flex-col gap-5">
          <div className="flex flex-row items-center justify-between">
            <h1 className="font-medium text-base mr-5 md:text-xl">
              Pilih Outline Kamu
            </h1>
            <Space align="center" wrap>
              <Button
                icon={<SaveOutlined />}
                className="bg-success text-white"
                htmlType="submit"
                form="form_validation"
              >
                Simpan
              </Button>
            </Space>
          </div>

          {!studentOutline && (
            <Alert
              message="Informasi"
              description={
                <div>
                  Kamu harus memilih outline kamu terlebih dahulu sebelum bisa
                  melakukan bimbingan
                </div>
              }
              type="info"
              showIcon
            />
          )}

          <Form
            form={form}
            name="form_validation"
            id="form_validation"
            layout="vertical"
            onFinish={onFinish}
          >
            <Form.Item
              label="Outline"
              name={`outline_id`}
              rules={[{ required: true }]}
              required
            >
              <Select
                className="w-auto md:min-w-[10rem]"
                placeholder="Pilih Outline"
                options={outline?.map((val) => {
                  return {
                    value: val.id,
                    label: `${val.master_outline?.name} - ${val.title}`,
                  };
                })}
                onChange={(value) => {
                  if (!value) return;
                  setSelectedOutline(value);
                }}
              />
            </Form.Item>
            {selectedOutline && (
              <div className="flex flex-col gap-3">
                <div className="text-lg font-semibold">Outline Component</div>
                <Form.Item>
                  <List
                    itemLayout="horizontal"
                    dataSource={
                      outline?.find((val) => val.id == selectedOutline)
                        ?.outline_component
                    }
                    renderItem={(item, index) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar>{index + 1}</Avatar>}
                          title={
                            <div>{item.master_outline_component?.name}</div>
                          }
                          description={<div>{item.title}</div>}
                        />
                      </List.Item>
                    )}
                  />
                </Form.Item>
              </div>
            )}
          </Form>
        </div>
      </Card>
    </Spin>
  );
};

export default Page;
