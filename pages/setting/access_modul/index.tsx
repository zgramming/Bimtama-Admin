import {
  Button,
  Card,
  Checkbox,
  Form,
  Input,
  Modal,
  notification,
  Select,
  Space,
  Spin,
  Table,
  TableColumnsType,
} from "antd";
import Search from "antd/lib/input/Search";
import axios from "axios";
import { useEffect, useState } from "react";
import useSWR from "swr";

import { EditOutlined } from "@ant-design/icons";

import {
  AppAccessModul,
  AppGroupUser,
  AppModul,
} from "../../../interface/main_interface";
import { convertObjectIntoQueryParams } from "../../../utils/function";

interface DataSourceInterface {
  no: number;
  code: string;
  name: string;
  status: string;
  created_at: string;
  updated_at: string;
  action: AppGroupUser;
}

const userGroupFetcher = async ([url, params]: any) => {
  const queryParam = convertObjectIntoQueryParams(params);
  const request = await axios.get(`${url}${queryParam}`);
  const { data, success }: { data: AppGroupUser[]; success: boolean } =
    request.data;
  return data;
};

const modulFetcher = async ([url, params]: any) => {
  const queryParam = convertObjectIntoQueryParams(params);
  const request = await axios.get(`${url}${queryParam}`);
  const { data, success }: { data: AppModul[]; success: boolean } =
    request.data;
  return data;
};

const accessModulFetcher = async ([url, groupUserId]: any) => {
  const request = await axios.get(`${url}?app_group_user_id=${groupUserId}`);
  const { data, success }: { data: AppAccessModul[]; success: boolean } =
    request.data;
  return data;
};

const ApiURL = `${process.env.NEXT_PUBLIC_BASEAPIURL}/setting/access_modul`;

const AccessModulPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [row, setRow] = useState<AppGroupUser | undefined>(undefined);
  const [queryParam, setQueryParam] = useState<{
    limit: number;
    offset: number;
    code?: string;
    name?: string;
    status?: string;
  }>({
    limit: 10,
    offset: 0,
  });

  const {
    data: dataUserGroup,
    error,
    isValidating,
    mutate: reloadUserGroup,
  } = useSWR(
    [`${process.env.NEXT_PUBLIC_BASEAPIURL}/setting/user_group`, queryParam],
    userGroupFetcher
  );

  const columns: TableColumnsType<DataSourceInterface> = [
    { key: "no", dataIndex: "no", title: "No" },
    { key: "code", dataIndex: "code", title: "Kode" },
    { key: "name", dataIndex: "name", title: "Nama" },
    { key: "status", dataIndex: "status", title: "Status" },
    { key: "created_at", dataIndex: "created_at", title: "Created At" },
    { key: "updated_at", dataIndex: "updated_at", title: "UpdatedA At" },
    {
      key: "action",
      dataIndex: "action",
      title: "Aksi",
      width: 100,
      render: (val: AppGroupUser) => {
        return (
          <Space align="center">
            <Button
              icon={<EditOutlined />}
              className="bg-info text-white"
              onClick={() => {
                setIsModalOpen(true);
                setRow(val);
              }}
            />
          </Space>
        );
      },
    },
  ];

  const dataSource: DataSourceInterface[] =
    dataUserGroup?.map((val, index) => {
      return {
        no: index + 1,
        code: val.code,
        name: val.name,
        status: val.status,
        created_at: new Date(val.created_at).toDateString(),
        updated_at: new Date(val.updated_at).toDateString(),
        action: val,
      };
    }) ?? [];

  return (
    <Spin spinning={!dataUserGroup}>
      <Card>
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-5">
            <h1 className="font-medium text-base mr-5 md:text-xl">
              Akses Modul
            </h1>
          </div>
          <div className="flex flex-wrap items-center space-x-2 mb-5">
            <Search
              placeholder="Cari sesuatu..."
              onSearch={(e) => ""}
              className="w-48"
              allowClear
            />
            <Select
              className="w-auto md:min-w-[10rem]"
              defaultValue={{
                value: "",
                label: "Pilih",
              }}
              onChange={(value: any) => {
                setQueryParam((val) => {
                  return { ...val, status: value };
                });
              }}
            >
              <Select.Option value={""}>Pilih</Select.Option>
              <Select.Option value="active">Aktif</Select.Option>
              <Select.Option value="not_active">Tidak Aktif</Select.Option>
            </Select>
          </div>
          <Table
            columns={columns}
            dataSource={dataSource}
            scroll={{ x: 2000 }}
            pagination={{
              total: dataSource.length,
              pageSize: queryParam.limit,
              showSizeChanger: true,
              onShowSizeChange: (current, size) => {
                setQueryParam((val) => {
                  return { ...val, limit: size };
                });
              },
            }}
          />
          {isModalOpen && (
            <FormModal
              open={isModalOpen}
              row={row}
              onCloseModal={(needReload) => {
                setIsModalOpen(false);
                if (needReload) reloadUserGroup();
              }}
            />
          )}
        </div>
      </Card>
    </Spin>
  );
};

const FormModal = (props: {
  open: boolean;
  row?: AppGroupUser;
  onCloseModal: (needReload?: boolean) => void;
}) => {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const { data: dataModul } = useSWR(
    [`${process.env.NEXT_PUBLIC_BASEAPIURL}/setting/modul`],
    modulFetcher
  );
  const { data: dataAccessModul } = useSWR(
    [ApiURL, props.row?.id],
    accessModulFetcher
  );

  const onFinish = async () => {
    try {
      setIsLoading(true);
      const values = await form.validateFields();
      const response = await axios.post(`${ApiURL}`, {
        app_group_user_id: props.row?.id,
        access_modul: values.access_modul,
      });
      const { data, message, success } = response.data;
      notification.success({
        message: "Success",
        description: message,
      });
      props.onCloseModal(true);
    } catch (e: any) {
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

  useEffect(() => {
    form.setFieldsValue({
      app_group_user_id: props.row?.name,
      access_modul: dataAccessModul?.map((val) => val.app_modul_id),
    });

    return () => {};
  }, [dataAccessModul, form, props.row]);

  return (
    <Modal
      title="Form Access Modul"
      open={props.open}
      maskClosable={false}
      keyboard={false}
      closable={false}
      width="1000px"
      onCancel={(e) => props.onCloseModal()}
      footer={
        <Space>
          <Button onClick={(e) => props.onCloseModal()}>Batal</Button>
          <Button
            htmlType="submit"
            form="form_validation"
            className="bg-success text-white"
          >
            Simpan
          </Button>
        </Space>
      }
    >
      <Form
        form={form}
        name="form_validation"
        id="form_validation"
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item label="Group User" name="app_group_user_id">
          <Input placeholder="" disabled />
        </Form.Item>
        <Form.Item label="Akses Modul" name="access_modul">
          <Checkbox.Group>
            {dataModul?.map((val) => (
              <Checkbox
                key={val.id}
                value={val.id}
                style={{ lineHeight: "32px" }}
              >
                {val.name}
              </Checkbox>
            )) ?? []}
          </Checkbox.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AccessModulPage;
