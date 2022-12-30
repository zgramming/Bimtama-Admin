import {
  Button,
  Card,
  Checkbox,
  Form,
  Input,
  List,
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
import useSWRImmutable from "swr/immutable";

import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";

import { OutlineInterface } from "../../../interface/admin/outline_interface";
import { MasterData } from "../../../interface/main_interface";
import { baseAPIURL } from "../../../utils/constant";
import { convertObjectIntoQueryParams } from "../../../utils/function";

type DataSourceInterface = {
  no: number;
  master_outline: OutlineInterface;
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
  action: OutlineInterface;
};

const ApiURL = `${baseAPIURL}/admin/outline`;

const outlineFetcher = async ([url, params]: any) => {
  const queryParam = convertObjectIntoQueryParams(params);
  const request = await axios.get(`${url}${queryParam}`);
  const { data, success }: { data: OutlineInterface[]; success: boolean } =
    request.data;
  return data;
};

const outlineDetailFetcher = async ([url]: any) => {
  const request = await axios.get(`${url}`);
  const { data, success }: { data: OutlineInterface; success: boolean } =
    request.data;
  return data;
};

const masterOutlineFetcher = async ([url]: any) => {
  const { data: dataResponse, status } = await axios.get(url);
  const { data, message, success } = dataResponse;
  return data as MasterData[];
};

const masterOutlineComponentFetcher = async ([url]: any) => {
  const { data: dataResponse, status } = await axios.get(url);
  const { data, message, success } = dataResponse;
  return data as MasterData[];
};

const nameInputOutlineComponent = (
  mstOutlineComponentId: number,
  order: number
) => {
  return `${mstOutlineComponentId}|outline_component_title|${order}`;
};

const Page = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [row, setRow] = useState<OutlineInterface | undefined>(undefined);
  const [queryParam, setQueryParam] = useState<{
    limit?: number;
    offset?: number;
  }>();

  const {
    data: dataUserGroup,
    error,
    isValidating,
    mutate: reloadUserGroup,
  } = useSWR([`${ApiURL}`, queryParam], outlineFetcher);

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
    {
      key: "master_outline",
      dataIndex: "master_outline",
      title: "Master Outline",
      render(value: OutlineInterface, record, index) {
        return <div>{value.master_outline?.name}</div>;
      },
    },
    { key: "title", dataIndex: "title", title: "Title" },
    { key: "description", dataIndex: "description", title: "Deskripsi" },
    { key: "created_at", dataIndex: "created_at", title: "Created At" },
    { key: "updated_at", dataIndex: "updated_at", title: "UpdatedA At" },
    {
      key: "action",
      dataIndex: "action",
      title: "Aksi",
      width: 100,
      render: (val: OutlineInterface) => {
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
        description: val.description,
        master_outline: val,
        title: val.title,
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
              Outline Component
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
                /// Force reload
                if (needReload) reloadUserGroup(undefined, true);
              }}
            />
          )}
        </div>
      </Card>
    </Spin>
  );
};

type SelectedOutlineComponentType = {
  master_outline_component_id: number;
  order: number;
};

const FormModal = (props: {
  open: boolean;
  row?: OutlineInterface;
  onCloseModal: (needReload?: boolean) => void;
}) => {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOutlineComponent, setSelectedOutlineComponent] = useState<
    Array<SelectedOutlineComponentType>
  >([]);

  const { data: masterOutline, isLoading: isLoadingMasterOutline } =
    useSWRImmutable(
      [`${baseAPIURL}/setting/master_data/by-category-code/OUTLINE`],
      masterOutlineFetcher
    );

  const {
    data: masterOutlineComponent,
    isLoading: isLoadingMasterOutlineComponent,
  } = useSWRImmutable(
    [`${baseAPIURL}/setting/master_data/by-category-code/OUTLINE_COMPONENT`],
    masterOutlineComponentFetcher
  );

  const { data: outlineDetail, isLoading: isLoadingOutlineDetail } = useSWR(
    [`${baseAPIURL}/admin/outline/${props.row?.id}`],
    outlineDetailFetcher,
    {
      onSuccess(data, key, config) {
        /// Filling default value input
        setSelectedOutlineComponent((prevState) => {
          const mapping: SelectedOutlineComponentType[] = [];
          data.outline_component.forEach((val) => {
            /// Push array & Fill default title value
            mapping.push({
              master_outline_component_id: val.mst_outline_component_id,
              order: val.order,
            });

            const nameInput = nameInputOutlineComponent(
              val.mst_outline_component_id,
              val.order
            );
            form.setFieldValue(`${nameInput}`, val.title);
          });

          return [...mapping];
        });
      },
    }
  );

  useEffect(() => {
    form.setFieldsValue({
      id: outlineDetail?.id,
      mst_outline_id: outlineDetail?.mst_outline_id,
      title: outlineDetail?.title,
      description: outlineDetail?.description,
    });

    return () => {};
  }, [form, outlineDetail, props.row]);

  const onFinish = async () => {
    try {
      setIsLoading(true);
      const values = await form.validateFields();
      const mappingComponent = selectedOutlineComponent.map((val) => {
        const title =
          values[
            nameInputOutlineComponent(
              val.master_outline_component_id,
              val.order
            )
          ];

        return {
          mst_outline_component_id: val.master_outline_component_id,
          title: title,
          order: val.order,
        };
      });

      const data = {
        mst_outline_id: values.mst_outline_id,
        title: values.title,
        description: values.description,
        mst_outline_component: mappingComponent,
      };

      if (outlineDetail?.id) {
        const { data: dataResponse, status } = await axios.put(
          `${baseAPIURL}/admin/outline/${outlineDetail?.id}`,
          data
        );
        notification.success({ message: "Success Update" });
      } else {
        const { data: dataResponse, status } = await axios.post(
          `${baseAPIURL}/admin/outline`,
          data
        );

        notification.success({ message: "Success Create" });
      }
      props.onCloseModal(true);
    } catch (e: any) {
      let message = e?.message || "Unknown Error Message";
      if (axios.isAxiosError(e)) {
        message = e.message;
      }
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      title="Form Outline Component"
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
          <Form.Item
            label="Outline"
            name="mst_outline_id"
            rules={[{ required: true }]}
          >
            <Select
              placeholder="Pilih Master Outline"
              options={[
                ...(masterOutline?.map((val) => {
                  return { value: val.id, label: val.name };
                }) ?? []),
              ]}
            ></Select>
          </Form.Item>
          <Form.Item label="Title" name="title" rules={[{ required: true }]}>
            <Input placeholder="Perancangan Program Bisnis, Perancangan Sistem Informasi, Perancangan Games/IoT/Augmented Reality " />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input.TextArea placeholder="Input Description" />
          </Form.Item>
          <Form.Item label="Pilih Outline Component">
            <List
              itemLayout="horizontal"
              dataSource={masterOutlineComponent}
              renderItem={(item) => {
                const disabled =
                  selectedOutlineComponent.find(
                    (val) => val.master_outline_component_id == item.id
                  ) == null;

                return (
                  <>
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <Checkbox
                            checked={!disabled}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedOutlineComponent((prevState) => {
                                  return [
                                    ...prevState,
                                    {
                                      master_outline_component_id: item.id,
                                      order: item.order,
                                    },
                                  ];
                                });
                              } else {
                                /// Reset input text
                                form.resetFields([
                                  nameInputOutlineComponent(
                                    item.id,
                                    item.order
                                  ),
                                ]);
                                setSelectedOutlineComponent((prevState) => {
                                  return [
                                    ...prevState.filter(
                                      (val) =>
                                        val.master_outline_component_id !=
                                        item.id
                                    ),
                                  ];
                                });
                              }
                            }}
                          />
                        }
                        title={<div>{item?.name}</div>}
                        description={
                          <Form.Item
                            name={`${nameInputOutlineComponent(
                              item.id,
                              item.order
                            )}`}
                          >
                            <Input
                              placeholder="Contoh : Pendahuluan,Landasan Teori, Analisis Sistem Berjalan, Pembahasan, Penutup"
                              disabled={disabled}
                            />
                          </Form.Item>
                        }
                      />
                    </List.Item>
                  </>
                );
              }}
            />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default Page;
