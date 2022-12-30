import {
  Avatar,
  Button,
  Form,
  Input,
  List,
  Modal,
  notification,
  Space,
  Spin,
  Tag,
} from "antd";
import axios from "axios";
import { saveAs } from "file-saver";
import React, { createContext, useContext, useEffect, useState } from "react";
import useSWR from "swr";

import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DownloadOutlined,
  EyeOutlined,
  PlusOutlined,
  SyncOutlined,
} from "@ant-design/icons";

import useUserLogin from "../../hooks/use_userlogin";
import { StudentGuidanceDetailInterface } from "../../interface/mahasiswa/student_guidance_detail_interface";
import { baseAPIURL, baseFileDirectoryURL } from "../../utils/constant";

type PageContextType = {
  reloadGuidanceDetail: any;
};
const defaultContextValue: PageContextType = {
  reloadGuidanceDetail: undefined,
};
const PageContext = createContext<PageContextType>(defaultContextValue);
const PageProvider = PageContext.Provider;

const guidanceTitleFetcher = async ([url, params]: any) => {
  const request = await axios.get(`${url}`);
  const {
    data,
    success,
  }: { data: StudentGuidanceDetailInterface[]; success: boolean } =
    request.data;
  return data;
};

const GuidanceStatusComponent = ({ status }: { status: string }) => {
  const nameStatus = status.toUpperCase();
  if (status == "approved") {
    return (
      <Tag icon={<CheckCircleOutlined />} color="success">
        {nameStatus}
      </Tag>
    );
  }

  if (status == "progress") {
    return (
      <Tag icon={<SyncOutlined spin />} color="processing">
        {nameStatus}
      </Tag>
    );
  }

  return (
    <Tag icon={<CloseCircleOutlined />} color="error">
      {nameStatus}
    </Tag>
  );
};

const FormModal = (props: {
  open: boolean;
  row?: StudentGuidanceDetailInterface;
  onCloseModal: (needReload?: boolean, message?: string) => void;
}) => {
  const user = useUserLogin();
  const ctx = useContext(PageContext);
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);

  const onFinish = async () => {
    try {
      setIsLoading(true);
      const { title, description } = await form.validateFields();
      const body = { title, description, user_id: user?.id };
      const { data: dataResponse, status } = await axios.post(
        `${baseAPIURL}/mahasiswa/guidance/submission/proposal-title`,
        body
      );
      const { data, message, success } = dataResponse;

      ctx.reloadGuidanceDetail();
      props.onCloseModal(true, message);
    } catch (e: any) {
      let message = e?.message;
      if (axios.isAxiosError(e)) {
        const { message: msg } = e?.response?.data;

        message = Array.isArray(msg)
          ? msg.map((val) => val.message).join(`\n`)
          : msg;
      }
      notification.error({ message: "Error Occured", description: message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    form.setFieldsValue({});

    return () => {};
  }, [form, props.row]);

  return (
    <Modal
      title="Form Pengajuan Judul"
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
          <Form.Item label="Judul" name="title" rules={[{ required: true }]}>
            <Input name="title" placeholder="Input title" />
          </Form.Item>
          <Form.Item label="Deskripsi" name="description">
            <Input.TextArea
              name="description"
              placeholder="Input description"
            />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

const OutlineComponentItem = ({
  guidance,
  index,
}: {
  guidance: StudentGuidanceDetailInterface;
  index: number;
}) => {
  const [isShowModalDetail, setIsShowModalDetail] = useState(false);
  const [isShowModalForm, setIsShowModalForm] = useState(false);
  return (
    <>
      <List.Item>
        <List.Item.Meta
          avatar={<Avatar>{index + 1}</Avatar>}
          title={<div>{guidance.title}</div>}
          description={
            <div className="flex flex-row items-center justify-between">
              <div className="flex flex-col gap-5">
                <div>{guidance.description}</div>
                <Space direction="horizontal" size={10} wrap>
                  {guidance.lecture_note && (
                    <Button
                      icon={<EyeOutlined />}
                      type="primary"
                      onClick={(e) => setIsShowModalDetail(true)}
                    >
                      Lihat Catatan
                    </Button>
                  )}
                  {guidance.file && (
                    <Button
                      icon={<DownloadOutlined />}
                      onClick={(e) => {
                        try {
                          saveAs(
                            `${baseFileDirectoryURL}/${guidance.file}`,
                            `${guidance.file}`
                          );
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
                  )}
                </Space>
              </div>
              <GuidanceStatusComponent status={guidance.status} />
            </div>
          }
        />
      </List.Item>
      {isShowModalDetail && (
        <Modal
          title="Detail Catatan"
          open={isShowModalDetail}
          onCancel={(e) => setIsShowModalDetail(false)}
          footer={
            <Button onClick={(e) => setIsShowModalDetail(false)}>Tutup</Button>
          }
        >
          <div className="text-justify">{guidance.lecture_note}</div>
        </Modal>
      )}
    </>
  );
};

const OutlineComponentJudul = () => {
  const user = useUserLogin();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data: dataGuidanceDetail,
    isLoading: isLoadingGuidanceDetail,
    mutate: reloadGuidanceDetail,
  } = useSWR(
    [
      `${baseAPIURL}/mahasiswa/guidance/detail/${user?.id}/code/OUTLINE_COMPONENT_JUDUL`,
    ],
    guidanceTitleFetcher
  );

  return (
    <PageProvider value={{ reloadGuidanceDetail: reloadGuidanceDetail }}>
      <Spin spinning={isLoadingGuidanceDetail}>
        <div className="flex flex-col">
          <div className="flex flex-row justify-end items-center">
            <Button
              icon={<PlusOutlined />}
              className="bg-success text-white"
              onClick={(e) => {
                setIsModalOpen(true);
              }}
            >
              Pengajuan Judul
            </Button>
          </div>
          <List
            itemLayout="horizontal"
            dataSource={dataGuidanceDetail}
            renderItem={(item, index) => (
              <OutlineComponentItem
                key={item.id}
                guidance={item}
                index={index}
              />
            )}
          />
        </div>
      </Spin>
      {isModalOpen && (
        <FormModal
          open={isModalOpen}
          row={undefined}
          onCloseModal={(needReload, message) => {
            setIsModalOpen(false);
            if (needReload) {
              notification.success({
                message: "Success",
                description: message,
              });
            }
          }}
        />
      )}
    </PageProvider>
  );
};

export default OutlineComponentJudul;
