import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  notification,
  Radio,
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

import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";

import { AppGroupUser } from "../../../interface/main_interface";
import { convertObjectIntoQueryParams } from "../../../utils/function";

const userGroupFetcher = async ([url, params]: any) => {
  const queryParam = convertObjectIntoQueryParams(params);
  const request = await axios.get(`${url}${queryParam}`);
  const { data, success }: { data: AppGroupUser[]; success: boolean } =
    request.data;
  return data;
};

interface DataSourceInterface {
  no: number;
  code: string;
  name: string;
  status: string;
  created_at: string;
  updated_at: string;
  action: AppGroupUser;
}

const ApiURL = `${process.env.NEXT_PUBLIC_BASEAPIURL}/setting/user_group`;

const GroupUserPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [row, setRow] = useState<AppGroupUser | undefined>(undefined);
  const [queryParam, setQueryParam] = useState<{
    limit?: number;
    offset?: number;
    code?: string;
    name?: string;
    status?: string;
  }>();

  const {
    data: dataUserGroup,
    error,
    isValidating,
    mutate: reloadUserGroup,
  } = useSWR([`${ApiURL}`, queryParam], userGroupFetcher);

  const deleteHandler = async (id: number) => {
    Modal.confirm({
      title: "Are you sure delete this row ?",
      maskClosable: false,
      onOk: async () => {
        const request = await axios.delete(`${ApiURL}/${id}`);
        const { success, message, data } = request.data;
        notification.success({
          message: "Success",
          description: message,
        });
        reloadUserGroup();
      },
      onCancel: async () => {},
    });
  };

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
            <Button
              icon={<DeleteOutlined />}
              className="bg-error text-white"
              onClick={(e) => deleteHandler(val.id)}
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
              User Group
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
              <Select.Option value="inactive">Tidak Aktif</Select.Option>
            </Select>
          </div>
          <Table
            columns={columns}
            dataSource={dataSource}
            scroll={{ x: 2000 }}
            pagination={{
              total: dataSource.length,
              pageSize: queryParam?.limit,
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

  const onFinish = async () => {
    try {
      setIsLoading(true);
      const values = await form.validateFields();
      let response;
      if (props.row) {
        response = await axios.put(`${ApiURL}/${props.row.id}`, values);
        /// Update
      } else {
        response = await axios.post(`${ApiURL}`, values);
        /// Insert
      }
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
      id: props.row?.id,
      code: props.row?.code,
      name: props.row?.name,
      status: props.row?.status ?? "active",
    });

    return () => {};
  }, [form, props.row]);

  return (
    <Modal
      title="Form Group User"
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
        <Form
          form={form}
          name="form_validation"
          id="form_validation"
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item label="ID" name="id" className="hidden">
            <Input name="id" placeholder="ID" />
          </Form.Item>
          <Form.Item label="Kode" name="code" rules={[{ required: true }]}>
            <Input name="code" placeholder="Input code" />
          </Form.Item>
          <Form.Item label="Nama" name="name" rules={[{ required: true }]}>
            <Input name="name" placeholder="Input Name" />
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value={"active"}>Aktif</Radio>
              <Radio value={"inactive"}>Tidak Aktif</Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default GroupUserPage;
