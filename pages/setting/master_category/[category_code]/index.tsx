import {
    Button, Card, Col, Form, Input, Modal, notification, Radio, Row, Select, Space, Spin, Table,
    TableColumnsType
} from 'antd';
import Search from 'antd/lib/input/Search';
import TextArea from 'antd/lib/input/TextArea';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';

import { MasterData } from '../../../../interface/main_interface';
import { convertObjectIntoQueryParams } from '../../../../utils/function';

interface DataSourceInterface {
  no: number;
  category: MasterData;
  code: string;
  name: string;
  status: string;
  created_at: string;
  updated_at: string;
  action: MasterData;
}

const ApiURL = `${process.env.NEXT_PUBLIC_BASEAPIURL}/setting/master_data`;

const masterDataFetcher = async ([url, params]:any) => {
  const queryParam = convertObjectIntoQueryParams(params);
  const request = await axios.get(`${url}${queryParam}`);
  const { data, success }: { data: MasterData[]; success: boolean } =
    request.data;
  return data;
};

const MasterDataPage = () => {
  const { query, isReady } = useRouter();
  const { category_code } = query;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [row, setRow] = useState<MasterData | undefined>(undefined);
  const [queryParam, setQueryParam] = useState<{
    master_category_code?: string | undefined | string[];
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
    data: dataMasterData,
    error,
    isValidating,
    mutate: reloadMasterData,
  } = useSWR([`${ApiURL}`, queryParam], masterDataFetcher);

  useEffect(() => {
    if (isReady) {
      setQueryParam((prevState) => {
        return { ...prevState, master_category_code: category_code };
      });
    }

    return () => {};
  }, [category_code, isReady]);

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
        reloadMasterData();
      },
      onCancel: async () => {},
    });
  };

  const columns: TableColumnsType<DataSourceInterface> = [
    { key: "no", dataIndex: "no", title: "No" },
    {
      key: "category",
      dataIndex: "category",
      title: "Kategori",
      render: (val: MasterData) => val.master_category?.code,
    },
    { key: "code", dataIndex: "code", title: "Kode" },
    { key: "name", dataIndex: "name", title: "Nama" },
    { key: "status", dataIndex: "status", title: "Status" },
    { key: "created_at", dataIndex: "created_at", title: "Created At" },
    { key: "updated_at", dataIndex: "updated_at", title: "UpdatedA At" },
    {
      key: "action",
      dataIndex: "action",
      title: "Aksi",
      width: 150,
      render: (val: MasterData) => {
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
    dataMasterData?.map((val, index) => {
      return {
        no: index + 1,
        category: val,
        name: val.name,
        code: val.code,
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
          <h1 className="font-medium text-base mr-5 md:text-xl">
            Master Data {category_code ?? "?"}
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
              setQueryParam((prevValue) => {
                const result = { ...prevValue, status: e };
                if (e == "") delete result.status;
                return { ...result };
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
              if (needReload) reloadMasterData();
            }}
          />
        )}
      </div>
    </Card>
  );
};

const FormModal = (props: {
  open: boolean;
  row?: MasterData;
  onCloseModal: (needReload?: boolean) => void;
}) => {
  const { query } = useRouter();
  const { category_code } = query;

  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);

  const onFinish = async () => {
    try {
      setIsLoading(true);
      const values = await form.validateFields();
      let response;
      if (props.row) {
        response = await axios.put(`${ApiURL}/${props.row.id}`, {
          master_category_code: category_code,
          ...values,
        });
        /// Update
      } else {
        response = await axios.post(`${ApiURL}`, {
          master_category_code: category_code,
          ...values,
        });
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
      code: props.row?.code,
      name: props.row?.name,
      description: props.row?.description,
      status: props.row?.status ?? "active",
      parameter1_key: props.row?.parameter1_key,
      parameter2_key: props.row?.parameter2_key,
      parameter3_key: props.row?.parameter3_key,
      parameter1_value: props.row?.parameter1_value,
      parameter2_value: props.row?.parameter2_value,
      parameter3_value: props.row?.parameter3_value,
    });

    return () => {};
  }, [form, props.row]);

  return (
    <Modal
      title="Form Master Data"
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
          <Form.Item label="Kode" name="code">
            <Input placeholder="Input Kode" />
          </Form.Item>
          <Form.Item label="Nama" name="name">
            <Input placeholder="Input Nama" />
          </Form.Item>
          <Form.Item label="Deskripsi" name="description">
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item label="Status" name="status">
            <Radio.Group>
              <Radio value={"active"}>Aktif</Radio>
              <Radio value={"inactive"}>Tidak Aktif</Radio>
            </Radio.Group>
          </Form.Item>
          <Row gutter={24}>
            {[1, 2, 3].map((val) => {
              return (
                <>
                  <Col span={12}>
                    <Form.Item
                      label={`Key ${val}`}
                      name={`parameter${val}_key`}
                    >
                      <Input placeholder="Input Key" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label={`Value ${val}`}
                      name={`parameter${val}_value`}
                    >
                      <Input placeholder="Input Value" />
                    </Form.Item>
                  </Col>
                </>
              );
            })}
          </Row>
        </Form>
      </Spin>
    </Modal>
  );
};

export default MasterDataPage;
