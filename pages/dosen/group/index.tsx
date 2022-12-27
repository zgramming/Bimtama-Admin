import {
  Alert,
  Avatar,
  Button,
  Card,
  Form,
  Input,
  List,
  message,
  Modal,
  Space,
  Spin,
  Tag,
} from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import useSWR from "swr";

import { CheckCircleOutlined, PlusOutlined } from "@ant-design/icons";

import useUserLogin from "../../../hooks/use_userlogin";
import {
  GroupInterface,
  GroupMemberInterface,
} from "../../../interface/dosen/group_interface";
import { baseFrontEndURL } from "../../../utils/constant";
import { stringToSlug } from "../../../utils/function";

const { Search } = Input;
const activeGroupFetcher = async ([url]: any) => {
  const request = await axios.get(`${url}`);
  const { data, success }: { data: GroupInterface; success: boolean } =
    request.data;
  return data;
};

const groupMemberFetcher = async ([url]: any) => {
  const request = await axios.get(`${url}`);
  const { data, success }: { data: GroupMemberInterface[]; success: boolean } =
    request.data;
  return data;
};

const ApiURL = `${process.env.NEXT_PUBLIC_BASEAPIURL}/dosen`;

const Page = () => {
  const user = useUserLogin();
  const [messageApi, contextHolder] = message.useMessage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [row, setRow] = useState<GroupMemberInterface | undefined>(undefined);
  const [queryParam, setQueryParam] = useState<{
    limit?: number;
    offset?: number;
  }>();

  const {
    data: activeGroup,
    isLoading: isLoadingActiveGroup,
    mutate: reloadActiveGroup,
  } = useSWR(
    [`${ApiURL}/active-group/${user?.id}`, queryParam],
    activeGroupFetcher
  );

  const {
    data: dataGroupMember,
    error,
    isLoading,
    mutate: reloadGroupMember,
  } = useSWR(
    [`${ApiURL}/group-member/by-group-code/${activeGroup?.code}`, queryParam],
    groupMemberFetcher
  );

  return (
    <>
      {contextHolder}
      <Spin spinning={isLoading}>
        <Card>
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-5">
              <h1 className="font-medium text-base mr-5 md:text-xl">
                Kelompok
              </h1>
              <Space wrap>
                <Button
                  icon={<PlusOutlined />}
                  className="bg-success text-white"
                  onClick={() => {
                    setIsModalOpen(true);
                    setRow(undefined);
                  }}
                >
                  Tambah
                </Button>
              </Space>
            </div>
            <div className="flex flex-wrap items-center space-x-2 mb-5">
              <Search
                placeholder="Cari sesuatu..."
                onSearch={(e) => ""}
                className="w-48"
                allowClear
              />
            </div>
            {activeGroup && (
              <Card>
                <div className="flex flex-col gap-3">
                  <div className="font-semibold text-lg">
                    Nama : {`${activeGroup?.name}`}
                  </div>
                  <div className="font-semibold text-lg">
                    Link : {`${baseFrontEndURL}/l/${activeGroup?.code}`}
                  </div>
                </div>
              </Card>
            )}
            <div className="my-3"></div>
            <Card>
              <List
                itemLayout="horizontal"
                dataSource={dataGroupMember}
                renderItem={(item, index) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar>{index + 1}</Avatar>}
                      title={<div>{item.user?.name}</div>}
                      description={
                        item.is_admin ? (
                          <Tag icon={<CheckCircleOutlined />} color="success">
                            Admin
                          </Tag>
                        ) : null
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>

            {isModalOpen && (
              <FormModal
                open={isModalOpen}
                row={row}
                onCloseModal={(needReload, message) => {
                  setIsModalOpen(false);
                  if (needReload) {
                    messageApi.success(message);
                    reloadGroupMember();
                    reloadActiveGroup();
                  }
                }}
              />
            )}
          </div>
        </Card>
      </Spin>
    </>
  );
};

const FormModal = (props: {
  open: boolean;
  row?: GroupMemberInterface;
  onCloseModal: (needReload?: boolean, message?: string) => void;
}) => {
  const [messageApi, contextHolder] = message.useMessage();

  const user = useUserLogin();
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);

  const onFinish = async () => {
    try {
      setIsLoading(true);
      const { name, description, code } = await form.validateFields();
      const { data: dataResponse, status } = await axios.post(
        `${ApiURL}/group`,
        {
          name,
          description,
          code,
          created_by: user?.id,
        }
      );

      const { data, message, success } = dataResponse;

      props.onCloseModal(true, message);
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
      id: props.row?.id,
    });

    return () => {};
  }, [form, props.row]);

  return (
    <>
      {contextHolder}
      <Modal
        title="Form Kelompok"
        open={props.open}
        maskClosable={false}
        keyboard={false}
        closable={false}
        width="1000px"
        onCancel={(e) => props.onCloseModal()}
        footer={
          <Spin spinning={isLoading}>
            <Button onClick={(e) => props.onCloseModal()}>Batal</Button>
            <Button
              htmlType="submit"
              form="form_validation"
              className="bg-success text-white"
            >
              Simpan
            </Button>
          </Spin>
        }
      >
        <Spin spinning={isLoading}>
          <Alert
            message="Informasi"
            description={
              <div className="">
                <ul className="p-0">
                  <li>
                    Saat membuat kelompok, maka kelompok yang baru terbuat
                    otomatis menjadi kelompok aktif kamu.
                  </li>
                  <li>
                    Jika sebelumnya kamu sudah ada kelompok, maka kelompok
                    sebelumnya menjadi tidak aktif.
                  </li>
                  <li>
                    Untuk mengubah kelompok aktif kamu, melalui menu{" "}
                    <b>{`Dosen > Setting > Kelompok`}</b>.
                  </li>
                </ul>
              </div>
            }
            type="info"
            className="mb-5"
            showIcon
          />
          <Form
            form={form}
            name="form_validation"
            id="form_validation"
            layout="vertical"
            onFinish={onFinish}
          >
            <Form.Item label="Nama" name="name" rules={[{ required: true }]}>
              <Input
                name="name"
                placeholder="Input Name"
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) {
                    form.setFieldValue("code", stringToSlug(val));
                  }
                }}
              />
            </Form.Item>
            <Form.Item label="Kode" name="code" rules={[{ required: true }]}>
              <Input name="code" placeholder="Input code" disabled />
            </Form.Item>
            <Form.Item
              label="Deskripsi"
              name="description"
              rules={[{ required: true }]}
            >
              <Input.TextArea
                name="description"
                placeholder="Input Deskripsi"
              />
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </>
  );
};

export default Page;
