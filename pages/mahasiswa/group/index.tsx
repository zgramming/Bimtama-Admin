import { CheckCircleOutlined, CloseCircleFilled } from "@ant-design/icons";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Empty,
  Input,
  List,
  message,
  Spin,
  Tag,
} from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import useSWR from "swr";

import useUserLogin from "../../../hooks/use_userlogin";
import { GroupInterface } from "../../../interface/dosen/group_interface";
import { baseAPIURL } from "../../../utils/constant";

const { Search } = Input;

const myGroupFetcher = async ([url]: any) => {
  const request = await axios.get(`${url}`);
  const { data, success }: { data: GroupInterface; success: boolean } =
    request.data;
  return data;
};

const searchGroupByCodeFetcher = async ([url]: any) => {
  const request = await axios.get(`${url}`);
  const { data, success }: { data: GroupInterface; success: boolean } =
    request.data;
  return data;
};

const EmptyGroup = ({
  onJoinGroup,
}: {
  onJoinGroup: (needReload?: boolean, message?: string) => void;
}) => {
  const user = useUserLogin();

  const [searchQuery, setSearchQuery] = useState<string | undefined>();

  const [isLoadingJoinGroup, setIsLoadingJoinGroup] = useState(false);
  const {
    data: groupSearched,
    isLoading: isLoadingGroupSearched,
    mutate: reloadGroupSearched,
  } = useSWR(
    [`${baseAPIURL}/mahasiswa/group/search-by-code/${searchQuery}`],
    searchGroupByCodeFetcher
  );

  const joinGroup = async () => {
    try {
      setIsLoadingJoinGroup(true);
      const body = { user_id: user?.id, group_id: groupSearched?.id };
      const { data: dataResponse, status } = await axios.post(
        `${baseAPIURL}/mahasiswa/group/join`,
        body
      );

      const { data, message, success } = dataResponse;
      onJoinGroup(true, message);
    } catch (e: any) {
      let message = e?.message;

      if (axios.isAxiosError(e)) {
        const { message: msg } = e?.response?.data;
        message = Array.isArray(msg)
          ? msg.map((val) => val.message).join(`\n`)
          : msg;
      }
    } finally {
      setIsLoadingJoinGroup(false);
    }
  };
  return (
    <>
      <Card>
        <div className="flex flex-col gap-5">
          <Alert
            message="Informasi"
            description="Kamu belum mempunyai kelompok bimbingan, silahkan masukkan kode kelompok bimbingan kamu."
            type="info"
            showIcon
          />
          <div className="self-center">
            <Search
              placeholder="Masukkan kode kelompok"
              allowClear
              onSearch={(e) => {
                setSearchQuery(e);
              }}
            />
          </div>
          {!groupSearched ? (
            <Empty />
          ) : (
            <Spin spinning={isLoadingGroupSearched || isLoadingJoinGroup}>
              <Card>
                <div className="flex flex-col gap-3">
                  <div className="font-semibold text-lg">
                    {groupSearched.name}
                  </div>
                  <div className="text-sm">{groupSearched.description}</div>
                  <div className="text-xs">
                    Jumlah Anggota{" "}
                    <b>{groupSearched.group_member?.length ?? 0}</b>
                  </div>
                  <Button
                    type="primary"
                    className="self-start"
                    onClick={joinGroup}
                  >
                    Masuk Kelompok
                  </Button>
                </div>
              </Card>
            </Spin>
          )}
        </div>
      </Card>
    </>
  );
};

const Page = () => {
  const user = useUserLogin();

  const [messageApi, contextHolder] = message.useMessage();
  const [isLoadingExit, setIsLoadingExit] = useState(false);
  const {
    data: studentGroup,
    isLoading: isLoadingStudentGroup,
    mutate: reloadStudentGroup,
  } = useSWR([`${baseAPIURL}/mahasiswa/my-group/${user?.id}`], myGroupFetcher);

  useEffect(() => {
    console.log({ studentGroup });

    return () => {};
  }, [studentGroup]);

  const exit = async () => {
    try {
      setIsLoadingExit(true);
      const body = {
        user_id: user?.id,
        group_id: studentGroup?.id,
      };
      const { data: dataResponse, status } = await axios.post(
        `${baseAPIURL}/mahasiswa/group/exit`,
        body
      );
      const { data, message, success } = dataResponse;
      reloadStudentGroup(undefined, true);
      messageApi.success(message);
    } catch (e: any) {
      let message = e?.message;

      if (axios.isAxiosError(e)) {
        const { message: msg } = e?.response?.data;
        message = Array.isArray(msg)
          ? msg.map((val) => val.message).join(`\n`)
          : msg;
      }

      messageApi.error(message);
    } finally {
      setIsLoadingExit(false);
    }
  };
  return (
    <>
      {contextHolder}
      <Spin spinning={isLoadingStudentGroup}>
        {!studentGroup && (
          <EmptyGroup
            onJoinGroup={(needReload, message) => {
              if (needReload) {
                reloadStudentGroup();
                messageApi.success(message);
              }
            }}
          />
        )}
        {studentGroup && (
          <Card>
            <div className="flex flex-col">
              <div className="flex flex-row items-center justify-end">
                <Button
                  type="primary"
                  icon={<CloseCircleFilled />}
                  onClick={exit}
                  danger
                >
                  Keluar Kelompok
                </Button>
              </div>
              <List
                itemLayout="horizontal"
                dataSource={studentGroup.group_member}
                renderItem={(item, index) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar>{index + 1}</Avatar>}
                      title={<div>{item.user?.name}</div>}
                      description={
                        item.is_admin ? (
                          <Tag icon={<CheckCircleOutlined />} color="success">
                            Admin
                          </Tag>
                        ) : null
                      }
                    />
                  </List.Item>
                )}
              />
            </div>
          </Card>
        )}
      </Spin>
    </>
  );
};

export default Page;
