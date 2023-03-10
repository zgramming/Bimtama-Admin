import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
  Row,
  Select,
  Space,
  Table,
  TableColumnsType,
} from "antd";
import Search from "antd/lib/input/Search";
import { useEffect, useState } from "react";

import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";

import { sleep } from "../../../utils/function";
import { useRouter } from "next/router";
import TextArea from "antd/lib/input/TextArea";

interface DataSourceInterface {
  no: number;
  code: string;
  name: string;
  value: string;
  status: string;
  created_at: string;
  updated_at: string;
  action: string;
}

const MasterDataPage = () => {
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const deleteHandler = async () => {
    Modal.confirm({
      title: "Are you sure delete this row ?",
      maskClosable: false,
      onOk: async () => {
        await sleep(5000);
      },
      onCancel: async () => {
        alert("cancel");
      },
    });
  };

  const columns: TableColumnsType<DataSourceInterface> = [
    { key: "no", dataIndex: "no", title: "No" },
    { key: "code", dataIndex: "code", title: "Kode" },
    { key: "name", dataIndex: "name", title: "Nama" },
    { key: "value", dataIndex: "value", title: "Nama" },
    { key: "status", dataIndex: "status", title: "Status" },
    { key: "created_at", dataIndex: "created_at", title: "Created At" },
    { key: "updated_at", dataIndex: "updated_at", title: "UpdatedA At" },
    {
      key: "action",
      dataIndex: "action",
      title: "Aksi",
      width: 100,
      render: (val) => {
        return (
          <Space align="center">
            <Button
              icon={<EditOutlined />}
              className="bg-info text-white"
              onClick={() => setIsModalOpen(true)}
            />
            <Button
              icon={<DeleteOutlined />}
              className="bg-error text-white"
              onClick={deleteHandler}
            />
          </Space>
        );
      },
    },
  ];

  let dataSource: DataSourceInterface[] = [];

  for (let i = 1; i <= 9999; i++) {
    dataSource.push({
      no: i,
      name: "Zeffry Reynando",
      code: "Code",
      value: "Value",
      status: "Aktif",
      created_at: new Date().toDateString(),
      updated_at: new Date().toDateString(),
      action: "",
    });
  }

  return (
    <Card>
      <div className="flex flex-col">
        <div className="flex justify-between items-center mb-5">
          <h1 className="font-medium text-base mr-5 md:text-xl">
            Master Data {router.query["category_code"] ?? "?"}
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
              value: 0,
              label: "Pilih",
            }}
            onChange={(e) => alert(e)}
            className="w-auto md:min-w-[10rem]"
          >
            <Select.Option value={0}>Pilih</Select.Option>
            <Select.Option value="active">Aktif</Select.Option>
            <Select.Option value="not_active">Tidak Aktif</Select.Option>
          </Select>
        </div>
        <Table
          loading={false}
          columns={columns}
          dataSource={dataSource}
          scroll={{ x: 2000 }}
          pagination={{
            total: dataSource.length,
            current: currentPage,
            pageSize: pageSize,
            showPrevNextJumpers: false,
            onChange: (page, size) => {
              setCurrentPage(page);
              alert(`onchagen ${page} ${size}`);
            },
            onShowSizeChange: (current, size) => {
              setPageSize(size);
              alert(`onchagen ${current} ${size}`);
            },
          }}
        />

        {isModalOpen && (
          <FormModal
            open={isModalOpen}
            onCloseModal={() => setIsModalOpen(false)}
          />
        )}
      </div>
    </Card>
  );
};

const FormModal = (props: { open: boolean; onCloseModal: () => void }) => {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log(values);
  };

  useEffect(() => {
    form.setFieldsValue({
      status: "active",
    });

    return () => {};
  }, [form]);

  return (
    <Modal
      title="Form Tambah"
      open={props.open}
      maskClosable={false}
      keyboard={false}
      closable={false}
      width="1000px"
      onCancel={props.onCloseModal}
      footer={
        <Space>
          <Button onClick={props.onCloseModal}>Batal</Button>
          <Button
            htmlType="submit"
            form="form_validation"
            className="bg-success text-white"
            onClick={() => alert("save!")}
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
        /// Make state input reset when modal is destroy
        preserve={false}
      >
        <Form.Item label="Kode" name="code">
          <Input placeholder="Input Kode" />
        </Form.Item>
        <Form.Item label="Nama" name="name">
          <Input placeholder="Input Nama" />
        </Form.Item>
        <Form.Item label="Deskripsi" name="description">
          <TextArea rows={4} />
        </Form.Item>
        <Form.Item label="Order" name="order">
          <InputNumber placeholder="Input Order" />
        </Form.Item>
        <Form.Item label="Status" name="status">
          <Radio.Group>
            <Radio value={"active"}>Aktif</Radio>
            <Radio value={"not_active"}>Tidak Aktif</Radio>
          </Radio.Group>
        </Form.Item>
        <Row gutter={24}>
          {[1, 2, 3, 4, 5].map((val) => {
            return (
              <>
                <Col span={12}>
                  <Form.Item label={`Key ${val}`} name={`key_${val}`}>
                    <Input placeholder="Input Key" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label={`Value ${val}`} name={`value_${val}`}>
                    <Input placeholder="Input Value" />
                  </Form.Item>
                </Col>
              </>
            );
          })}
        </Row>
      </Form>
    </Modal>
  );
};

export default MasterDataPage;
