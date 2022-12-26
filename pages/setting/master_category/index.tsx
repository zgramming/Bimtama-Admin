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
import { useEffect, useState } from "react";

import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";

import { convertObjectIntoQueryParams } from "../../../utils/function";
import Link from "next/link";
import TextArea from "antd/lib/input/TextArea";
import { MasterCategory } from "../../../interface/main_interface";
import axios from "axios";
import useSWR from "swr";

interface DataSourceInterface {
  no: number;
  parent: MasterCategory;
  code: string;
  name: string;
  total_master_data: MasterCategory;
  status: string;
  created_at: string;
  updated_at: string;
  action: MasterCategory;
}

const masterCategoryFetcher = async ([url, params]: any) => {
  const queryParam = convertObjectIntoQueryParams(params);
  const request = await axios.get(`${url}${queryParam}`);
  const { data, success }: { data: MasterCategory[]; success: boolean } =
    request.data;
  return data;
};

const ApiURL = `${process.env.NEXT_PUBLIC_BASEAPIURL}/setting/master_category`;

const MasterCategoryPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [row, setRow] = useState<MasterCategory | undefined>(undefined);
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
    data: dataMasterCategory,
    error,
    isValidating,
    mutate: reloadMasterCategory,
  } = useSWR([`${ApiURL}`, queryParam], masterCategoryFetcher);

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
        reloadMasterCategory();
      },
      onCancel: async () => {},
    });
  };

  const columns: TableColumnsType<DataSourceInterface> = [
    { key: "no", dataIndex: "no", title: "No" },
    {
      key: "parent",
      dataIndex: "parent",
      title: "Induk",
      render: (val: MasterCategory) => val.master_category_parent?.name,
    },
    { key: "code", dataIndex: "code", title: "Kode" },
    { key: "name", dataIndex: "name", title: "Nama" },
    {
      key: "total_master_data",
      dataIndex: "total_master_data",
      title: "Master Data",
      width: 150,
      align: "center",
      render: (val: MasterCategory) => {
        return (
          <Link
            href={{
              pathname: `/setting/master_category/${val.code}`,
            }}
            className="font-bold text-center"
            legacyBehavior
          >
            {val.master_datas?.length ?? 0}
          </Link>
        );
      },
    },
    { key: "status", dataIndex: "status", title: "Status" },
    { key: "created_at", dataIndex: "created_at", title: "Created At" },
    { key: "updated_at", dataIndex: "updated_at", title: "UpdatedA At" },
    {
      key: "action",
      dataIndex: "action",
      title: "Aksi",
      width: 100,
      render: (val: MasterCategory) => {
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
    dataMasterCategory?.map((val, index) => {
      return {
        no: index + 1,
        code: val.code,
        name: val.name,
        status: val.status,
        parent: val,
        total_master_data: val,
        created_at: new Date(val.created_at).toDateString(),
        updated_at: new Date(val.updated_at).toDateString(),
        action: val,
      };
    }) ?? [];

  return (
    <Card>
      <div className="flex flex-col">
        <div className="flex justify-between items-center mb-5">
          <h1 className="font-medium text-base mr-5 md:text-xl">
            Master Category
          </h1>
          <Space wrap>
            <Button
              icon={<PlusOutlined />}
              className="bg-success text-white"
              onClick={() => setIsModalOpen(true)}
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
            onChange={(e: any) =>
              setQueryParam((val) => {
                return { ...val, status: e };
              })
            }
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
              if (needReload) reloadMasterCategory();
            }}
          />
        )}
      </div>
    </Card>
  );
};

const FormModal = (props: {
  open: boolean;
  row?: MasterCategory;
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
      master_category_id: props.row?.master_category_id ?? "",
      code: props.row?.code,
      name: props.row?.name,
      description: props.row?.description,
      status: props.row?.status ?? "active",
    });

    return () => {};
  }, [form, props.row]);

  return (
    <Modal
      title="Form Master Kategori"
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
      <Form
        form={form}
        name="form_validation"
        id="form_validation"
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item label="Induk Kategori" name="master_category_id">
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
        <Form.Item label="Deskripsi" name="description">
          <TextArea rows={4} />
        </Form.Item>
        <Form.Item label="Status" name="status" rules={[{ required: true }]}>
          <Radio.Group>
            <Radio value={"active"}>Aktif</Radio>
            <Radio value={"inactive"}>Tidak Aktif</Radio>
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default MasterCategoryPage;
