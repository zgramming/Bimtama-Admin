import { Button, Form, List, Modal, Spin } from "antd";
import { useEffect, useState } from "react";
import useSWR from "swr";

import { EditOutlined, PlusOutlined } from "@ant-design/icons";

import { AppGroupUser } from "../../interface/main_interface";
import axios from "axios";

const userGroupFetcher = async ([url, params]: any) => {
  const request = await axios.get(`${url}`);
  const { data, success }: { data: AppGroupUser[]; success: boolean } =
    request.data;
  return data;
};

const OutlineComponentBab1 = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [row, setRow] = useState<AppGroupUser | undefined>(undefined);
  const {
    data: dataUserGroup,
    error,
    isValidating,
    mutate: reloadUserGroup,
  } = useSWR([``], userGroupFetcher);

  return (
    <>
      <Spin spinning={false}>
        <div className="flex flex-col gap-5">
          <div className="flex flex-row  justify-end items-center">
            <Button
              icon={<PlusOutlined />}
              htmlType="submit"
              form="form_validation"
              className="bg-success text-white"
            >
              Ajukan BAB I
            </Button>
          </div>
          {/* <List
            itemLayout="horizontal"
            dataSource={data}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar src="https://joeschmoe.io/api/v1/random" />}
                  title={<a href="https://ant.design">{item.title}</a>}
                  description="Ant Design, a design language for background applications, is refined by Ant UED Team"
                />
              </List.Item>
            )}
          /> */}

          {isModalOpen && (
            <FormModal
              open={isModalOpen}
              row={row}
              onCloseModal={(needReload) => {
                setIsModalOpen(false);
                if (needReload) reloadUserGroup();
              }}
            />
          )}
        </div>
      </Spin>
    </>
  );
};

const FormModal = (props: {
  open: boolean;
  row?: AppGroupUser;
  onCloseModal: (needReload?: boolean) => void;
}) => {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);

  const onFinish = async () => {
    try {
      setIsLoading(true);
      const values = await form.validateFields();
    } catch (e: any) {
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
      title="Form Group User"
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
        ></Form>
      </Spin>
    </Modal>
  );
};

export default OutlineComponentBab1;
