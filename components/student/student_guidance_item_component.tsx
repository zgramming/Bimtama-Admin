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
  Upload,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { saveAs } from "file-saver";
import React, { useState } from "react";
import useSWR from "swr";

import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DownloadOutlined,
  EyeOutlined,
  PlusOutlined,
  SyncOutlined,
  UploadOutlined,
} from "@ant-design/icons";

import useUserLogin from "../../hooks/use_userlogin";
import { StudentGuidanceDetailInterface } from "../../interface/mahasiswa/student_guidance_detail_interface";
import { MasterData } from "../../interface/main_interface";
import { baseAPIURL, baseFileDirectoryURL } from "../../utils/constant";

const guidanceTitleFetcher = async ([url, params]: any) => {
  const request = await axios.get(`${url}`);

  const {
    data,
    success,
  }: { data: StudentGuidanceDetailInterface[]; success: boolean } =
    request.data;

  return data;
};

const masterDataByCodeFetcher = async ([url]: any) => {
  const request = await axios.get(`${url}`);
  const { data, success }: { data: MasterData; success: boolean } =
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
  codeMasterOutlineComponent: string;
  open: boolean;
  onCloseModal: (needReload?: boolean, message?: string) => void;
}) => {
  const user = useUserLogin();
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);

  const onFinish = async () => {
    try {
      setIsLoading(true);
      const formData = new FormData();

      const { title, description, file } = await form.validateFields();
      formData.set(`title`, title);
      formData.set(`description`, description);
      formData.set(`user_id`, `${user?.id}`);
      formData.set(
        `code_master_outline_component`,
        props.codeMasterOutlineComponent
      );
      if (file?.file) {
        formData.set(`file`, file.file);
      }

      const body = { title, description, user_id: user?.id };
      const { data: dataResponse, status } = await axios.post(
        `${baseAPIURL}/mahasiswa/guidance/submission`,
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
      notification.error({ message: "Error Occured", description: message });
    } finally {
      setIsLoading(false);
    }
  };

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
          <Form.Item label="File Pendukung" name="file" help={"Optional"}>
            <Upload beforeUpload={(file, filelist) => false} maxCount={1}>
              <Button icon={<UploadOutlined />}>Select File</Button>
            </Upload>
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
              <div className="flex flex-col gap-3">
                <div>{guidance.description}</div>
                <div className="">
                  Created At :{" "}
                  <b>
                    {dayjs(guidance.created_at).format(`DD MMMM YYYY HH:mm`)}
                  </b>
                </div>
                <Space direction="horizontal" size={10} wrap>
                  {guidance.file && (
                    <Button
                      icon={<DownloadOutlined />}
                      type="default"
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
                      File Saya
                    </Button>
                  )}
                  {guidance.lecture_note && (
                    <Button
                      icon={<EyeOutlined />}
                      type="primary"
                      onClick={(e) => setIsShowModalDetail(true)}
                    >
                      Catatan Dosen
                    </Button>
                  )}
                  {guidance.file_lecture && (
                    <Button
                      icon={<DownloadOutlined />}
                      onClick={(e) => {
                        try {
                          saveAs(
                            `${baseFileDirectoryURL}/${guidance.file_lecture}`,
                            `${guidance.file_lecture}`
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
                      File Dosen
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

const StudentGuidanceItemComponent = ({
  codeMasterOutlineComponent,
}: {
  codeMasterOutlineComponent: string;
}) => {
  const user = useUserLogin();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data: dataGuidanceDetail,
    isLoading: isLoadingGuidanceDetail,
    mutate: reloadGuidanceDetail,
  } = useSWR(
    [
      `${baseAPIURL}/mahasiswa/guidance/detail/${user?.id}/code/${codeMasterOutlineComponent}`,
    ],
    guidanceTitleFetcher
  );

  const {
    data: dataMasterData,
    isLoading: isLoadingMasterData,
    mutate: reloadMasterData,
  } = useSWR(
    [`${baseAPIURL}/setting/master_data/by-code/${codeMasterOutlineComponent}`],
    masterDataByCodeFetcher
  );

  return (
    <>
      <Spin spinning={isLoadingGuidanceDetail || isLoadingMasterData}>
        <div className="flex flex-col">
          <div className="flex flex-row justify-end items-center">
            <Button
              icon={<PlusOutlined />}
              className="bg-success text-white"
              onClick={(e) => {
                setIsModalOpen(true);
              }}
            >
              Pengajuan {dataMasterData?.name}
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
          codeMasterOutlineComponent={dataMasterData?.code ?? ""}
          onCloseModal={(needReload, message) => {
            setIsModalOpen(false);
            if (needReload) {
              notification.success({
                message: "Success",
                description: message,
              });
              reloadGuidanceDetail(undefined, true);
            }
          }}
        />
      )}
    </>
  );
};

export default StudentGuidanceItemComponent;
