import {
  Button,
  Card,
  Checkbox,
  Form,
  Input,
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

import { EditOutlined } from "@ant-design/icons";

import {
  AppAccessMenu,
  AppAccessModul,
  AppGroupUser,
} from "../../../interface/main_interface";
import { AVAILABLE_ACCESS_MENU } from "../../../utils/constant";
import { convertObjectIntoQueryParams } from "../../../utils/function";

interface DataSourceInterface {
  no: number;
  code: string;
  name: string;
  status: string;
  created_at: string;
  updated_at: string;
  action: AppGroupUser;
}

const userGroupFetcher = async ([url, params]: any) => {
  const queryParam = convertObjectIntoQueryParams(params);
  const request = await axios.get(`${url}${queryParam}`);
  const { data, success }: { data: AppGroupUser[]; success: boolean } =
    request.data;
  return data;
};

const accessibleModulFetcher = async ([url, params]: any) => {
  const queryParam = convertObjectIntoQueryParams(params);
  const request = await axios.get(`${url}${queryParam}`);
  const { data, success }: { data: AppAccessModul[]; success: boolean } =
    request.data;
  return data ?? [];
};

const accessMenuFetcher = async ([url, groupUserId]: any) => {
  const request = await axios.get(`${url}`);
  const { data, success }: { data: AppAccessMenu[]; success: boolean } =
    request.data;
  return data;
};

const ApiURL = `${process.env.NEXT_PUBLIC_BASEAPIURL}/setting/access_menu`;

const AccessMenuPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [row, setRow] = useState<AppGroupUser | undefined>(undefined);
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
    data: dataUserGroup,
    error,
    isValidating,
    mutate: reloadUserGroup,
  } = useSWR(
    [`${process.env.NEXT_PUBLIC_BASEAPIURL}/setting/user_group`, queryParam],
    userGroupFetcher
  );

  const columns: TableColumnsType<DataSourceInterface> = [
    { key: "no", dataIndex: "no", title: "No" },
    { key: "code", dataIndex: "code", title: "Kode" },
    { key: "name", dataIndex: "name", title: "Nama" },
    { key: "status", dataIndex: "status", title: "Status" },
    { key: "created_at", dataIndex: "created_at", title: "Created At" },
    { key: "updated_at", dataIndex: "updated_at", title: "UpdatedA At" },
    {
      key: "action",
      dataIndex: "action",
      title: "Aksi",
      width: 100,
      render: (val: AppGroupUser) => {
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
          </Space>
        );
      },
    },
  ];

  const dataSource: DataSourceInterface[] =
    dataUserGroup?.map((val, index) => {
      return {
        no: index + 1,
        code: val.code,
        name: val.name,
        status: val.status,
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
              Akses Menu
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
              defaultValue={{
                value: "",
                label: "Pilih",
              }}
              onChange={(value: any) => {
                setQueryParam((val) => {
                  return { ...val, status: value };
                });
              }}
            >
              <Select.Option value={""}>Pilih</Select.Option>
              <Select.Option value="active">Aktif</Select.Option>
              <Select.Option value="not_active">Tidak Aktif</Select.Option>
            </Select>
          </div>
          <Table
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
                if (needReload) reloadUserGroup();
              }}
            />
          )}
        </div>
      </Card>
    </Spin>
  );
};

const FormModal = (props: {
  open: boolean;
  row?: AppGroupUser;
  onCloseModal: (needReload?: boolean) => void;
}) => {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const { data: accessibleModul } = useSWR(
    [
      `${process.env.NEXT_PUBLIC_BASEAPIURL}/setting/access_modul/by_user_group/${props.row?.id}`,
    ],
    accessibleModulFetcher
  );
  const { data: dataAccessMenu } = useSWR(
    [`${ApiURL}/by_user_group/${props.row?.id}`],
    accessMenuFetcher
  );

  const onFinish = async () => {
    try {
      setIsLoading(true);
      const values = await form.validateFields();
      const accessMenuKeys = Object.keys(values).filter((val) =>
        val.includes("access_menu|")
      );

      /// Only get access menu not null or at least 1 access is checked
      const accessMenu = accessMenuKeys.map((val, index) => {
        const [name, modulId, menuId] = val.split("|");
        const allowedAccess = values[`${val}`];
        return {
          app_group_user_id: props.row?.id,
          app_menu_id: +menuId,
          app_modul_id: +modulId,
          allowed_access: allowedAccess,
        };
      });

      const response = await axios.post(`${ApiURL}`, {
        app_group_user_id: props.row?.id,
        access_menu: accessMenu,
      });
      const { data, message, success } = response.data;
      notification.success({
        message: "Success",
        description: message,
      });
      props.onCloseModal(true);
    } catch (e: any) {
      console.log({
        errorAccessMenu: e,
      });
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
      app_group_user_name: props.row?.name ?? "",
    });

    dataAccessMenu?.forEach((val, index) => {
      const name = `access_menu|${val.app_modul_id}|${val.app_menu_id}`;
      form.setFieldValue(name, val.allowed_access ?? []);
    });
    return () => {};
  }, [dataAccessMenu, form, props.row]);

  return (
    <Modal
      title="Form Access Menu"
      maskClosable={false}
      keyboard={false}
      closable={false}
      width="1000px"
      open={props.open}
      onCancel={(e) => props.onCloseModal()}
      footer={
        <Space>
          <Button onClick={(e) => props.onCloseModal()}>Batal</Button>
          <Button
            htmlType="submit"
            form="form_validation"
            className="bg-success text-white"
          >
            Simpan
          </Button>
        </Space>
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
          <Form.Item label="Group User" name="app_group_user_name">
            <Input placeholder="" disabled />
          </Form.Item>
          {accessibleModul?.map((accessModul) => (
            <Card
              key={accessModul.id}
              title={accessModul.app_modul?.name}
              className="mb-5"
              // extra={
              //   <Checkbox key={accessModul.id} value="all" style={{ lineHeight: "32px" }}></Checkbox>
              // }
            >
              {accessModul.app_modul?.menus.map((menu, index) => (
                <Card
                  key={menu.id}
                  title={menu.name}
                  className="mb-5"
                  extra={
                    <Checkbox
                      value="all"
                      style={{ lineHeight: "32px" }}
                    ></Checkbox>
                  }
                >
                  <Form.Item
                    label="Hak Akses Menu"
                    name={`access_menu|${accessModul.app_modul_id}|${menu.id}`}
                  >
                    <Checkbox.Group>
                      {AVAILABLE_ACCESS_MENU.map((access, index) => {
                        return (
                          <Checkbox
                            key={`${access}_${menu.id}`}
                            value={access}
                            style={{ lineHeight: "32px" }}
                          >
                            {(access[0]?.toUpperCase() ?? "") + access.slice(1)}
                          </Checkbox>
                        );
                      })}
                    </Checkbox.Group>
                  </Form.Item>
                </Card>
              ))}
            </Card>
          )) ?? <h1>LOADING...</h1>}
        </Form>
      </Spin>
    </Modal>
  );
};

export default AccessMenuPage;
