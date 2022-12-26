import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
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
import { ReactNode, useEffect, useState } from "react";

import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";

import { convertObjectIntoQueryParams, sleep } from "../../../utils/function";
import { AppMenu, AppModul } from "../../../interface/main_interface";
import axios from "axios";
import useSWR from "swr";

interface DataSourceInterface {
  no: number;
  menu_parent: AppMenu;
  code: string;
  modul: AppMenu;
  name: string;
  route: string;
  order: number;
  status: string;
  created_at: string;
  updated_at: string;
  action: AppMenu;
}

const modulFetcher = async ([url, params]: any) => {
  const queryParam = convertObjectIntoQueryParams(params);
  const request = await axios.get(`${url}${queryParam}`);
  const { data, success }: { data: AppModul[]; success: boolean } =
    request.data;
  return data;
};

const menuFetcher = async ([url, params]: any) => {
  const queryParam = convertObjectIntoQueryParams(params);
  const request = await axios.get(`${url}${queryParam}`);
  const { data, success }: { data: AppMenu[]; success: boolean } = request.data;
  return data;
};

const ApiURL = `${process.env.NEXT_PUBLIC_BASEAPIURL}/setting/menu`;

const MenuPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [row, setRow] = useState<AppMenu | undefined>(undefined);
  const [queryParam, setQueryParam] = useState<{
    limit?: number;
    offset?: number;
    app_modul_id?: number;
    code?: string;
    name?: string;
    status?: string;
  }>();

  const {
    data: dataMenu,
    error,
    isValidating,
    mutate: reloadMenu,
  } = useSWR([`${ApiURL}`, queryParam], menuFetcher);

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
        reloadMenu();
      },
      onCancel: async () => {},
    });
  };

  const columns: TableColumnsType<DataSourceInterface> = [
    { key: "no", dataIndex: "no", title: "No" },
    {
      key: "menu_parent",
      dataIndex: "menu_parent",
      title: "Induk",
      render: (val: AppMenu) => val.menu_parent?.name,
    },
    { key: "code", dataIndex: "code", title: "Kode" },
    {
      key: "modul",
      dataIndex: "modul",
      title: "Modul",
      render: (val: AppMenu) => val.app_modul?.name,
    },
    { key: "name", dataIndex: "name", title: "Nama" },
    { key: "route", dataIndex: "route", title: "Route" },
    { key: "order", dataIndex: "order", title: "Urutan" },
    { key: "status", dataIndex: "status", title: "Status" },
    { key: "created_at", dataIndex: "created_at", title: "Created At" },
    { key: "updated_at", dataIndex: "updated_at", title: "UpdatedA At" },
    {
      key: "action",
      dataIndex: "action",
      title: "Aksi",
      width: 100,
      render: (val: AppMenu) => {
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

  let dataSource: DataSourceInterface[] =
    dataMenu?.map((val, index) => {
      return {
        no: index + 1,
        name: val.name,
        code: val.code,
        menu_parent: val,
        modul: val,
        order: val.order,
        route: val.route,
        status: val.status,
        created_at: new Date(val.created_at).toDateString(),
        updated_at: new Date(val.updated_at).toDateString(),
        action: val,
      };
    }) ?? [];
  return (
    <Card>
      <div className="flex flex-col">
        <div className="flex justify-between items-center mb-5">
          <h1 className="font-medium text-base mr-5 md:text-xl">Menu</h1>
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
            defaultValue={{
              value: "",
              label: "Pilih",
            }}
            onChange={(e) => alert(e)}
            className="w-auto md:min-w-[10rem]"
          >
            <Select.Option value={""}>Pilih</Select.Option>
            <Select.Option value="active">Aktif</Select.Option>
            <Select.Option value="inactive">Tidak Aktif</Select.Option>
          </Select>
        </div>
        <Table
          loading={false}
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
              if (needReload) reloadMenu();
            }}
          />
        )}
      </div>
    </Card>
  );
};

const FormModal = (props: {
  open: boolean;
  row?: AppMenu;
  onCloseModal: (needReload?: boolean) => void;
}) => {
  const [form] = Form.useForm();
  const { data: dataModul } = useSWR(
    [`${process.env.NEXT_PUBLIC_BASEAPIURL}/setting/modul`],
    modulFetcher
  );
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
      console.log(message);
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
      app_modul_id: props.row?.app_modul_id,
      app_menu_id_parent: props.row?.app_menu_id_parent,
      code: props.row?.code,
      name: props.row?.name,
      route: props.row?.route,
      order: props.row?.order,
      status: props.row?.status ?? "active",
    });

    return () => {};
  }, [form, props.row]);

  return (
    <Modal
      title="Form Menu"
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
      <Spin spinning={isLoading}>
        <Form
          form={form}
          name="form_validation"
          id="form_validation"
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            label="Modul"
            name="app_modul_id"
            rules={[{ required: true }]}
          >
            <Select defaultValue={""}>
              <Select.Option value={""}>Pilih</Select.Option>
              {dataModul?.map((val) => (
                <Select.Option key={val.id} value={val.id}>
                  {val.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Menu Utama" name="app_menu_id_parent">
            <Select defaultValue={""}>
              <Select.Option value={""}>Pilih</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="Kode" name="code" rules={[{ required: true }]}>
            <Input placeholder="Input Kode" />
          </Form.Item>
          <Form.Item label="Nama" name="name" rules={[{ required: true }]}>
            <Input placeholder="Input Nama" />
          </Form.Item>
          <Form.Item label="Route" name="route" rules={[{ required: true }]}>
            <Input placeholder="Input Route" />
          </Form.Item>
          <Form.Item label="Urutan" name="order" rules={[{ required: true }]}>
            <InputNumber className="w-full" />
          </Form.Item>
          <Form.Item label="Status" name="status" rules={[{ required: true }]}>
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

export default MenuPage;
