import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  List,
  Modal,
  notification,
  Radio,
  Row,
  Select,
  Spin,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import useSWR from "swr";

import { PlusOutlined } from "@ant-design/icons";

import LectureMeetingScheduleItem from "../../../../components/reusable/lecture_meeting_schedule_item_component";
import useUserLogin from "../../../../hooks/use_userlogin";
import { GroupMemberInterface } from "../../../../interface/dosen/group_interface";
import { LectureMeetingScheduleInterface } from "../../../../interface/dosen/lecture_meeting_schedule_interface";
import { LectureMeetingSchedulePersonalInterface } from "../../../../interface/dosen/lecture_meeting_schedule_personal_interface";
import { baseAPIURL } from "../../../../utils/constant";

const meetingScheduleFetcher = async ([url]: any) => {
  const request = await axios.get(`${url}`);
  const {
    data,
    success,
  }: { data: LectureMeetingScheduleInterface[]; success: boolean } =
    request.data;
  return data;
};

const meetingSchedulePersonalFetcher = async ([url]: any) => {
  const request = await axios.get(`${url}`);
  const {
    data,
    success,
  }: { data: LectureMeetingSchedulePersonalInterface; success: boolean } =
    request.data;
  return data;
};

const groupMemberFetcher = async ([url]: any) => {
  const request = await axios.get(`${url}`);
  const { data, success }: { data: GroupMemberInterface[]; success: boolean } =
    request.data;
  return data;
};

const FormModal = (props: {
  open: boolean;
  row?: LectureMeetingScheduleInterface;
  onCloseModal: (needReload?: boolean, message?: string) => void;
}) => {
  const user = useUserLogin();
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [metode, setMetode] = useState<string | undefined>(
    props.row?.method ?? "luring"
  );

  const {
    data: dataGroupMember,
    isLoading: isLoadingGroupMember,
    mutate: reloadGroupMember,
  } = useSWR(
    [`${baseAPIURL}/dosen/my-group/active/member/${user?.id}`],
    groupMemberFetcher
  );

  const {
    data: dataMeetingPersonal,
    isLoading: isLoadingMeetingPersonal,
    mutate: reloadMeetingPersonal,
  } = useSWR(
    [
      `${baseAPIURL}/mahasiswa/meeting-schedule/personal/by-meeting-schedule-id/${props.row?.id}`,
    ],
    meetingSchedulePersonalFetcher
  );

  const onFinish = async () => {
    try {
      setIsLoading(true);
      const {
        student_id,
        title,
        description,
        method,
        start_date,
        end_date,
        link_maps,
        link_meeting,
      } = await form.validateFields();

      const codeType = "personal";
      const body = {
        user_id: user?.id,
        student_id,
        type: codeType,
        title,
        description,
        method,
        start_date,
        end_date,
        link_maps,
        link_meeting,
      };

      let message = undefined;
      if (!props.row?.id) {
        const { data: dataResponse, status } = await axios.post(
          `${baseAPIURL}/dosen/meeting-schedule/personal`,
          body
        );
        const { message: msg, success, data } = dataResponse;
        message = msg;
      } else {
        const { data: dataResponse, status } = await axios.put(
          `${baseAPIURL}/dosen/meeting-schedule/personal/${props.row?.id}`,
          body
        );
        const { message: msg, success, data } = dataResponse;
        message = msg;
      }

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

  useEffect(() => {
    form.setFieldsValue({
      student_id: dataMeetingPersonal?.user_id,
      title: props.row?.title,
      description: props.row?.description,
      method: props.row?.method ?? "luring",
      start_date: props.row?.start_date && dayjs(props.row?.start_date),
      end_date: props.row?.end_date && dayjs(props.row?.end_date),
      link_meeting: props.row?.link_meeting,
      link_maps: props.row?.link_maps,
    });

    return () => {};
  }, [dataMeetingPersonal?.user_id, form, props.row]);

  return (
    <Modal
      title="Form Meeting Schedule Personal"
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
      <Spin spinning={isLoading || isLoadingGroupMember}>
        <Form
          form={form}
          name="form_validation"
          id="form_validation"
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            label="Anggota"
            name="student_id"
            rules={[{ required: true }]}
          >
            <Select
              placeholder="Pilih Anggota Kelompok"
              options={[
                ...(dataGroupMember?.map((val) => {
                  return { value: val.user_id, label: val.user?.name };
                }) ?? []),
              ]}
            ></Select>
          </Form.Item>
          <Form.Item label="Judul" name="title" rules={[{ required: true }]}>
            <Input name="title" placeholder="Input title" />
          </Form.Item>
          <Form.Item
            label="Deskripsi"
            name="description"
            rules={[{ required: true }]}
          >
            <Input.TextArea
              name="description"
              placeholder="Input description"
            />
          </Form.Item>

          <Form.Item label="Metode" name="method" rules={[{ required: true }]}>
            <Radio.Group
              onChange={(e) => {
                setMetode(e.target.value);
              }}
            >
              <Radio value="luring"> Luring </Radio>
              <Radio value="daring"> Daring </Radio>
            </Radio.Group>
          </Form.Item>

          <Row gutter={24}>
            <Col span={24} md={24} lg={12} xl={12}>
              <Form.Item
                label="Mulai"
                name="start_date"
                rules={[{ required: true }]}
              >
                <DatePicker
                  showTime
                  format={"YYYY-MM-DD H:m:s"}
                  className="w-full"
                />
              </Form.Item>
            </Col>
            <Col span={24} md={24} lg={12} xl={12}>
              <Form.Item label="Selesai" name="end_date">
                <DatePicker
                  showTime
                  format={"YYYY-MM-DD H:m:s"}
                  className="w-full"
                />
              </Form.Item>
            </Col>
          </Row>

          {metode == "daring" && (
            <Form.Item
              label="Link Virtual Meeting"
              name="link_meeting"
              rules={[{ required: true }]}
            >
              <Input placeholder="Contoh : https://meet.google.com/yrp-quiv-fgg" />
            </Form.Item>
          )}

          {metode == "luring" && (
            <Form.Item
              label="Link Google Maps"
              name="link_maps"
              rules={[{ required: true }]}
            >
              <Input placeholder="Contoh : https://goo.gl/maps/dGdELX8ZzDoJ2cvb6" />
            </Form.Item>
          )}
        </Form>
      </Spin>
    </Modal>
  );
};

const Page = () => {
  const user = useUserLogin();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [row, setRow] = useState<undefined | LectureMeetingScheduleInterface>(
    undefined
  );

  const codePersonal = "personal";
  const {
    data: dataMeetingSchedule,
    isLoading: isLoadingMeetingSchedule,
    mutate: reloadMeetingSchedule,
  } = useSWR(
    [`${baseAPIURL}/dosen/meeting-schedule/${user?.id}/type/${codePersonal}`],
    meetingScheduleFetcher
  );

  return (
    <Spin spinning={isLoadingMeetingSchedule}>
      <Card>
        <div className="flex flex-col gap-5">
          <div className="flex flex-row justify-end items-center">
            <Button
              icon={<PlusOutlined />}
              className="bg-success text-white"
              onClick={(e) => {
                setIsModalOpen(true);
                setRow(undefined);
              }}
            >
              Tambah Meeting
            </Button>
          </div>

          <List
            itemLayout="horizontal"
            dataSource={dataMeetingSchedule}
            renderItem={(item, index) => {
              return (
                <LectureMeetingScheduleItem
                  key={item.id}
                  meeting={item}
                  index={index}
                  onEdit={(item) => {
                    setIsModalOpen(true);
                    setRow(item);
                  }}
                />
              );
            }}
          />
        </div>
      </Card>
      {isModalOpen && (
        <FormModal
          open={isModalOpen}
          row={row}
          onCloseModal={(needReload, message) => {
            setIsModalOpen(false);
            /// Force reload
            if (needReload) {
              reloadMeetingSchedule(undefined, true);
              notification.success({
                message: "Success",
                description: message,
              });
            }
          }}
        />
      )}
    </Spin>
  );
};

export default Page;
