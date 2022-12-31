import { PlusOutlined, SaveOutlined } from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Form,
  notification,
  Select,
  Skeleton,
  Space,
  Spin,
} from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import useSWR from "swr";

import useUserLogin from "../../../../hooks/use_userlogin";
import { GroupInterface } from "../../../../interface/dosen/group_interface";
import { baseAPIURL } from "../../../../utils/constant";
import { sleep } from "../../../../utils/function";

const activeGroupFetcher = async ([url]: any) => {
  const request = await axios.get(`${url}`);
  const { data, success }: { data: GroupInterface; success: boolean } =
    request.data;
  return data;
};

const myGroupFetcher = async ([url]: any) => {
  const request = await axios.get(`${url}`);
  const { data, success }: { data: GroupInterface[]; success: boolean } =
    request.data;
  return data;
};

const Page = () => {
  const user = useUserLogin();
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);

  const {
    data: activeGroup,
    isLoading: isLoadingActiveGroup,
    mutate: reloadActiveGroup,
  } = useSWR(
    [`${baseAPIURL}/dosen/my-group/active/${user?.id}`],
    activeGroupFetcher
  );

  const {
    data: myGroup,
    isLoading: isLoadingMyGroup,
    mutate: reloadMyGroup,
  } = useSWR([`${baseAPIURL}/dosen/my-group/${user?.id}`], myGroupFetcher);

  useEffect(() => {
    form.setFieldsValue({
      group_id: activeGroup?.id,
    });

    return () => {};
  }, [activeGroup?.id, form]);

  const onFinish = async () => {
    try {
      setIsLoading(true);
      await sleep(1000);
      const { group_id } = await form.validateFields();
      const body = { group_id };
      const { data: dataResponse, status } = await axios.put(
        `${baseAPIURL}/dosen/my-group/${user?.id}`,
        body
      );
      const { data, message, success } = dataResponse;

      notification.success({ message: "Success", description: message });
      reloadActiveGroup(undefined, true);
      reloadMyGroup(undefined, true);
    } catch (e: any) {
      let message = e?.message;

      if (axios.isAxiosError(e)) {
        const { message: msg } = e?.response?.data;

        message = Array.isArray(msg)
          ? msg.map((val) => val.message).join(`\n`)
          : msg;
      }

      notification.error({ message: "Error occured", description: message });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingActiveGroup || isLoadingMyGroup) {
    return (
      <Card>
        <Skeleton></Skeleton>
      </Card>
    );
  }

  if (!activeGroup) {
    return (
      <Card>
        <Alert
          message="Warning"
          description={
            <div>
              Kamu belum mempunyai kelompok. Mohon buat kelompok terlebih dahulu
              pada menu <b>{`Dosen > Kelompok`}</b>
            </div>
          }
          type="warning"
          showIcon
          closable
        />
      </Card>
    );
  }

  return (
    <Spin spinning={isLoading}>
      {activeGroup && (
        <Card>
          <div className="flex flex-col gap-5">
            <div className="flex justify-between items-center">
              <h1 className="font-medium text-base mr-5 md:text-xl">
                Kelompok Saya
              </h1>
              <Space wrap>
                <Button
                  icon={<SaveOutlined />}
                  className="bg-success text-white"
                  htmlType="submit"
                  form="form_validation"
                  onClick={() => {}}
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
              <Form.Item
                label="Kelompok Saya"
                name="group_id"
                rules={[{ required: true }]}
              >
                <Select
                  placeholder="Pilih Kelompok"
                  options={[
                    ...(myGroup?.map((val) => {
                      return { value: val.id, label: val.name };
                    }) ?? []),
                  ]}
                ></Select>
              </Form.Item>
            </Form>
          </div>
        </Card>
      )}
    </Spin>
  );
};

export default Page;
