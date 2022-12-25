import {
  Button,
  Checkbox,
  DatePicker,
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
  Upload,
} from "antd";
import Card from "antd/lib/card/Card";
import Search from "antd/lib/input/Search";
import TextArea from "antd/lib/input/TextArea";
import { useEffect, useState } from "react";

import {
  DeleteOutlined,
  EditOutlined,
  ExportOutlined,
  ImportOutlined,
  PlusOutlined,
  SearchOutlined,
  UploadOutlined,
} from "@ant-design/icons";

import { convertObjectIntoQueryParams, sleep } from "../../../utils/function";
import axios from "axios";
import { Documentation, MasterData } from "../../../interface/main_interface";
import useSWR from "swr";
import dayjs from "dayjs";

interface DataSourceInterface {
  no: number;
  name: string;
  code: string;
  job: string;
  birth_date: string;
  money: number;
  hobby?: string;
  status: string;
  image?: React.ReactNode;
  file?: React.ReactNode;
  created_at: string;
  updated_at: string;
  action: Documentation;
}

const documentationFetcher = async ([url, params]: any) => {
  const queryParam = convertObjectIntoQueryParams(params);
  const request = await axios.get(`${url}${queryParam}`);
  const { data, success }: { data: Documentation[]; success: boolean } =
    request.data;
  return data;
};

const masterDataJobFetcher = async ([url, code]: any) => {
  const request = await axios.get(`${url}?master_category_code=${code}`);
  const { data, success }: { data: MasterData[]; success: boolean } =
    request.data;
  return data;
};

const ApiURL = `${process.env.NEXT_PUBLIC_BASEAPIURL}/setting/documentation`;

const ExamplePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [row, setRow] = useState<Documentation | undefined>(undefined);
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
    data: dataDocumentation,
    error,
    isValidating,
    mutate: reloadDocumentation,
  } = useSWR([`${ApiURL}`, queryParam], documentationFetcher);

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
        reloadDocumentation();
      },
      onCancel: async () => {},
    });
  };

  /// Key & Index harus sama dengan [Interface property name]
  /// Jika tidak sama, text tidak akan muncul.
  /// Adding Comment
  const columns: TableColumnsType<any> = [
    { key: "no", dataIndex: "no", title: "No" },
    { key: "name", dataIndex: "name", title: "Name (Input Text)" },
    { key: "code", dataIndex: "code", title: "Code (Input Text)" },
    { key: "job", dataIndex: "job", title: "Job (Input Select)" },
    {
      key: "birth_date",
      dataIndex: "birth_date",
      title: "Birth Date (Input Date)",
    },
    { key: "money", dataIndex: "money", title: "Money (Input Number)" },
    { key: "hobby", dataIndex: "hobby", title: "Hobby (Checkbox)" },
    { key: "status", dataIndex: "status", title: "Status (Radio Button)" },
    { key: "image", dataIndex: "image", title: "Image (Show Image)" },
    { key: "file", dataIndex: "file", title: "File (Show File)" },
    {
      key: "created_at",
      dataIndex: "created_at",
      title: "Created At (DateTime)",
    },
    {
      key: "updated_at",
      dataIndex: "updated_at",
      title: "Updated At (DateTime)",
    },
    {
      key: "action",
      dataIndex: "action",
      title: "Action (Custom Button)",
      render: (val: Documentation) => {
        return (
          <Space>
            <Button icon={<EditOutlined />} className="bg-info	text-white">
              Edit Halaman
            </Button>
            <Button
              icon={<EditOutlined />}
              className="bg-info text-white"
              onClick={() => {
                setIsModalOpen(true);
                setRow(val);
              }}
            >
              Edit Modal
            </Button>
            <Button
              icon={<DeleteOutlined />}
              className="bg-error text-white"
              onClick={(e) => deleteHandler(val.id)}
            >
              Delete
            </Button>
            <Button icon={<SearchOutlined />} className="bg-white text-black">
              Preview
            </Button>
          </Space>
        );
      },
    },
  ];

  const dataSource: DataSourceInterface[] =
    dataDocumentation?.map((val, index) => {
      return {
        no: index + 1,
        code: val.code,
        name: val.name,
        job: val.job_id.toString(),
        birth_date: new Date(val.birth_date).toDateString(),
        hobby: val.hobbies,
        money: val.money,
        status: val.status ?? "",
        file: val.file,
        image: val.image,
        created_at: new Date(val.created_at).toDateString(),
        updated_at: new Date(val.updated_at).toDateString(),
        action: val,
      };
    }) ?? [];

  return (
    <Card>
      <div className="flex flex-col">
        <div className="flex justify-between items-center mb-5">
          <h1 className="font-medium text-base mr-5 md:text-xl">Example</h1>
          <Space wrap>
            <Button icon={<ImportOutlined />} className="bg-accent text-white">
              Import
            </Button>
            <Button icon={<ExportOutlined />} className="bg-info text-white">
              Export
            </Button>
            <Button icon={<PlusOutlined />} className="bg-success text-white">
              Halaman
            </Button>
            <Button
              icon={<PlusOutlined />}
              className="bg-success text-white"
              onClick={() => {
                setRow(undefined);
                setIsModalOpen(true);
              }}
            >
              Modal
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
              value: 0,
              label: "Pilih",
            }}
            onChange={(e) => alert(e)}
            className="w-auto md:min-w-[10rem]"
          >
            <Select.Option value="0">Pilih</Select.Option>
            <Select.Option value="1">satu</Select.Option>
            <Select.Option value="2">dua</Select.Option>
            <Select.Option value="3">tiga</Select.Option>
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
              if (needReload) reloadDocumentation();
            }}
          />
        )}
      </div>
    </Card>
  );
};

const FormModal = (props: {
  open: boolean;
  row?: Documentation;
  onCloseModal: (needReload?: boolean) => void;
}) => {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const { data: dataJob, error: errorJob } = useSWR(
    [`${process.env.NEXT_PUBLIC_BASEAPIURL}/setting/master_data`, "JOB"],
    masterDataJobFetcher
  );

  const onFinish = async () => {
    try {
      setIsLoading(true);
      const values = await form.validateFields();
      let response;
      if (props.row) {
        /// Update
        response = await axios.put(`${ApiURL}/${props.row.id}`, values);
      } else {
        /// Insert
        response = await axios.post(`${ApiURL}`, values);
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
      job_id: props.row?.job_id ?? "",
      name: props.row?.name ?? "",
      code: props.row?.code ?? "",
      birth_date:
        props.row?.birth_date && dayjs(new Date(props.row.birth_date)),
      money: props.row?.money ?? "",
      description: props.row?.description ?? "",
      hobbies: props.row?.hobbies ?? "",
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
      <Spin spinning={isLoading}>
        <Form
          form={form}
          name="form_validation"
          id="form_validation"
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item label="Name" name="name">
            <Input name="name" placeholder="Input Name..." />
          </Form.Item>
          <Form.Item label="Code" name="code">
            <Input name="code" placeholder="Input Code..." />
          </Form.Item>
          <Form.Item label="Job" name="job_id">
            <Select>
              <Select.Option value="">Pilih</Select.Option>
              {dataJob?.map((val, index) => {
                return (
                  <Select.Option key={val.id} value={val.id}>
                    {val.name}
                  </Select.Option>
                );
              }) ?? []}
            </Select>
          </Form.Item>
          <Form.Item label="Birth Date" name="birth_date">
            <DatePicker name="birth_date" className="w-full" />
          </Form.Item>
          <Form.Item label="Money" name="money">
            <InputNumber className="w-full" />
          </Form.Item>
          <Form.Item label="Deskripsi" name="description">
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item name="hobbies" label="hobbies">
            <Checkbox.Group>
              <Checkbox value="main_dota" style={{ lineHeight: "32px" }}>
                Main Dota
              </Checkbox>
              <Checkbox value="main_dota_lagi" style={{ lineHeight: "32px" }}>
                Main Dota Lagi
              </Checkbox>
            </Checkbox.Group>
          </Form.Item>
          <Form.Item name="status" label="Status">
            <Radio.Group>
              <Radio value="active">Aktif</Radio>
              <Radio value="inactive">Tidak Aktif</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="Image" name="image">
            <Upload maxCount={1}>
              <Button icon={<UploadOutlined />}>Upload Gambar</Button>
            </Upload>
          </Form.Item>
          <Form.Item label="File" name="file">
            <Upload maxCount={1} className="w-full">
              <Button icon={<UploadOutlined />}>Upload File</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default ExamplePage;
