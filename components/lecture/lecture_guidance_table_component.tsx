import {
  Alert,
  Button,
  Divider,
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
  Tag,
  Upload,
} from "antd";
import axios from "axios";
import { saveAs } from "file-saver";
import { useContext, useEffect, useState } from "react";
import useSWR from "swr";

import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  EyeFilled,
  SyncOutlined,
  UploadOutlined,
} from "@ant-design/icons";

import { LectureGuidanceContext } from "../../context/lecture_guidance_context";
import useUserLogin from "../../hooks/use_userlogin";
import { LectureGuidanceDetailInterface } from "../../interface/dosen/lecture_guidance_detail_interface";
import { MasterData } from "../../interface/main_interface";
import { baseAPIURL, baseFileDirectoryURL } from "../../utils/constant";

const { Search } = Input;

const guidanceDetailFetcher = async ([url, params]: any) => {
  const request = await axios.get(`${url}`, { params });
  const {
    data,
    success,
  }: { data: LectureGuidanceDetailInterface[]; success: boolean } =
    request.data;
  return data;
};

const masterDataByCodeFetcher = async ([url]: any) => {
  const request = await axios.get(`${url}`);
  const { data, success }: { data: MasterData; success: boolean } =
    request.data;
  return data;
};

interface DataSourceInterface {
  no: number;
  name: string;
  title: string;
  status: string;
  file?: string;
  created_at: string;
  updated_at: string;
  action: LectureGuidanceDetailInterface;
}

const FormModal = (props: {
  title: string;
  open: boolean;
  row?: LectureGuidanceDetailInterface;
  onCloseModal: (needReload?: boolean, message?: string) => void;
}) => {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    form.setFieldsValue({
      title: props.row?.title,
      description: props.row?.description,
      lecture_note: props.row?.lecture_note,
      status: props.row?.status ?? "progress",
    });

    return () => {};
  }, [form, props.row]);

  const onFinish = async () => {
    try {
      const formData = new FormData();
      setIsLoading(true);
      const { lecture_note, status, file } = await form.validateFields();

      formData.set(`lecture_note`, lecture_note);
      formData.set(`status`, status);
      if (file?.file) {
        formData.set(`file`, file.file);
      }

      const { data: dataResponse } = await axios.put(
        `${baseAPIURL}/dosen/guidance/detail/submission/${props.row?.id}`,
        formData
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

      notification.error({
        message: "Error occured",
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      title={
        <div>
          Form Bimbingan {props.title} {props.row?.user.name}
        </div>
      }
      open={props.open}
      maskClosable={false}
      keyboard={false}
      closable={false}
      width="1000px"
      onCancel={(e) => props.onCloseModal()}
      footer={
        <Spin spinning={isLoading}>
          <Button onClick={(e) => props.onCloseModal()}>Batal</Button>
          {props.row?.status == "progress" && (
            <Button
              htmlType="submit"
              form="form_validation"
              className="bg-success text-white"
            >
              Simpan
            </Button>
          )}
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
          <Form.Item label="Judul" name="title" extra={"Readonly"}>
            <Input name="title" placeholder="Input title" readOnly />
          </Form.Item>
          <Form.Item label="Deskripsi" name="description" extra={"Readonly"}>
            <Input.TextArea
              name="description"
              placeholder="Input description"
              readOnly
            />
          </Form.Item>
          <Divider />
          <Form.Item
            label="Catatan"
            name="lecture_note"
            rules={[{ required: true }]}
          >
            <Input.TextArea
              name="lecture_note"
              placeholder="Berikan catatan jika ada yang perlu diperbaiki dari bimbingan ini"
            />
          </Form.Item>
          <Form.Item label="File Pendukung" name="file">
            <Upload beforeUpload={(file, filelist) => false} maxCount={1}>
              <Button icon={<UploadOutlined />}>Select File</Button>
            </Upload>
          </Form.Item>
          <Form.Item label="Status" name="status" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value="approved"> Approved </Radio>
              <Radio value="progress"> Progress </Radio>
              <Radio value="rejected"> Rejected </Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

const LectureGuidanceTableComponent = ({
  codeMasterOutlineComponent,
}: {
  codeMasterOutlineComponent: string;
}) => {
  const user = useUserLogin();
  const context = useContext(LectureGuidanceContext);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [row, setRow] = useState<LectureGuidanceDetailInterface | undefined>(
    undefined
  );
  const [queryParam, setQueryParam] = useState<{
    limit?: number;
    offset?: number;
    status: "approved" | "rejected" | "progress";
  }>({ status: "progress" });

  const {
    data: dataGuidanceDetail,
    isLoading: isLoadingGuidanceDetail,
    mutate: reloadGuidanceDetail,
  } = useSWR(
    [
      `${baseAPIURL}/dosen/guidance/detail/${user?.id}/code-master-outline-component/${codeMasterOutlineComponent}`,
      queryParam,
    ],
    guidanceDetailFetcher
  );

  const {
    data: dataMasterData,
    isLoading: isLoadingMasterData,
    mutate: reloadMasterData,
  } = useSWR(
    [`${baseAPIURL}/setting/master_data/by-code/${codeMasterOutlineComponent}`],
    masterDataByCodeFetcher
  );

  const columns: TableColumnsType<DataSourceInterface> = [
    { key: "no", dataIndex: "no", title: "No" },
    { key: "name", dataIndex: "name", title: "Nama" },
    { key: "title", dataIndex: "title", title: "Judul" },
    {
      key: "status",
      dataIndex: "status",
      title: "Status",
      render(value: string, record, index) {
        const nameStatus = value?.toUpperCase();
        if (value == "progress") {
          return (
            <Tag icon={<SyncOutlined spin />} color="processing">
              {nameStatus}
            </Tag>
          );
        }

        if (value == "rejected") {
          return (
            <Tag icon={<CloseCircleOutlined />} color="error">
              {nameStatus}
            </Tag>
          );
        }

        if (value == "approved") {
          return (
            <Tag icon={<CheckCircleOutlined />} color="success">
              success
            </Tag>
          );
        }

        return (
          <Tag icon={<ExclamationCircleOutlined />} color="warning">
            Unknown Status
          </Tag>
        );
      },
    },
    {
      key: "file",
      dataIndex: "file",
      title: "File",
      render(value, record, index) {
        if (!value) return null;
        return (
          <Button
            type="link"
            onClick={(e) => {
              try {
                saveAs(`${baseFileDirectoryURL}/${value}`, `${value}`);
                notification.success({
                  message: "Berhasil download file",
                });
              } catch (error) {
                notification.error({
                  message: "Error occured on download file",
                });
              }
            }}
          >
            Download File
          </Button>
        );
      },
    },
    { key: "created_at", dataIndex: "created_at", title: "Created At" },
    { key: "updated_at", dataIndex: "updated_at", title: "UpdatedA At" },
    {
      key: "action",
      dataIndex: "action",
      title: "Aksi",
      width: 100,
      render: (val: LectureGuidanceDetailInterface) => {
        const icon =
          val.status == "progress" ? <EditOutlined /> : <EyeFilled />;
        return (
          <Space align="center">
            <Button
              icon={icon}
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
    dataGuidanceDetail?.map((val, index) => {
      return {
        no: index + 1,
        name: val.user.name,
        title: val.title,
        status: val.status,
        file: val.file,
        created_at: new Date(val.created_at).toDateString(),
        updated_at: new Date(val.updated_at).toDateString(),
        action: val,
      };
    }) ?? [];

  return (
    <Spin spinning={isLoadingGuidanceDetail || isLoadingMasterData}>
      <div className="flex flex-col gap-5">
        <div className="flex justify-between items-center mb-5">
          <h1 className="font-medium text-base mr-5 md:text-xl">
            {dataMasterData?.name}
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
            onChange={(value: any) => {
              setQueryParam((val) => {
                return { ...val, status: value };
              });
            }}
            defaultValue={"progress"}
            placeholder="Pilih Status"
          >
            <Select.Option value="progress">Progress</Select.Option>
            <Select.Option value="approved">Approved</Select.Option>
            <Select.Option value="rejected">Rejected</Select.Option>
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
            title={dataMasterData?.name ?? ""}
            open={isModalOpen}
            row={row}
            onCloseModal={(needReload, message) => {
              setIsModalOpen(false);
              if (needReload) {
                reloadGuidanceDetail();
                context.reloadMasterOutlineComponent(undefined, true);
                notification.success({
                  message: "Success",
                  description: message,
                });
              }
            }}
          />
        )}
      </div>
    </Spin>
  );
};

export default LectureGuidanceTableComponent;
