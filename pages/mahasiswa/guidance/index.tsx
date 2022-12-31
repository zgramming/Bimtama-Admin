import {
  Alert,
  Button,
  Card,
  Empty,
  message,
  notification,
  Spin,
  Tabs,
} from "antd";
import axios from "axios";
import { useState } from "react";
import useSWR from "swr";

import { StarTwoTone } from "@ant-design/icons";

import OutlineComponentBab1 from "../../../components/outline_component/outline_component_bab1";
import OutlineComponentBab2 from "../../../components/outline_component/outline_component_bab2";
import OutlineComponentBab3 from "../../../components/outline_component/outline_component_bab3";
import OutlineComponentBab4 from "../../../components/outline_component/outline_component_bab4";
import OutlineComponentBab5 from "../../../components/outline_component/outline_component_bab5";
import OutlineComponentJudul from "../../../components/outline_component/outline_component_judul";
import useUserLogin from "../../../hooks/use_userlogin";
import { StudentGuidanceInterface } from "../../../interface/mahasiswa/student_guidance";
import { StudentGuidanceOutlineInterface } from "../../../interface/mahasiswa/student_guidance_outline";
import { baseAPIURL } from "../../../utils/constant";

const myGuidanceFetcher = async ([url]: any) => {
  const request = await axios.get(`${url}`);
  const {
    data,
    success,
  }: { data: StudentGuidanceInterface; success: boolean } = request.data;
  return data;
};

const guidanceOutlineFetcher = async ([url]: any) => {
  const request = await axios.get(`${url}`);
  const {
    data,
    success,
  }: { data: StudentGuidanceOutlineInterface; success: boolean } = request.data;
  return data;
};

const StartGuidanceComponent = ({
  onSubmit,
}: {
  onSubmit: (needReload: boolean, message?: string) => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const user = useUserLogin();

  const startGuidance = async () => {
    try {
      setIsLoading(true);
      const body = {
        user_id: user?.id,
      };

      const { data: dataResponse, status } = await axios.post(
        `${baseAPIURL}/mahasiswa/guidance/submission/start`,
        body
      );

      const { data, message, success } = dataResponse;
      onSubmit(true, message);
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
    <Spin spinning={isLoading}>
      <div className="flex flex-col gap-5">
        <Alert
          message="Informasi"
          description="Sebelum melakukan bimbingan, silahkan tekan tombol mulai"
          type="info"
          showIcon
        />
        <div className="flex flex-row justify-center items-center">
          <Button
            type="primary"
            size="large"
            icon={<StarTwoTone />}
            onClick={startGuidance}
          >
            Mulai Bimbingan
          </Button>
        </div>
      </div>
    </Spin>
  );
};

const MyGuidanceOutline = () => {
  const user = useUserLogin();

  const {
    data: guidanceOutline,
    isLoading: isLoadingGuidanceOutline,
    mutate: reloadGuidanceOutline,
  } = useSWR(
    [`${baseAPIURL}/mahasiswa/guidance/outline/${user?.id}`],
    guidanceOutlineFetcher,
    {
      onSuccess(data, key, config) {
        console.log({ data });
      },
    }
  );

  const onChangeTab = (key: string) => {};

  const chooseOutline = (codeOutlineComponent: string) => {
    switch (codeOutlineComponent) {
      case `OUTLINE_COMPONENT_JUDUL`:
        return <OutlineComponentJudul />;
      case `OUTLINE_COMPONENT_BAB1`:
        return <OutlineComponentBab1 />;
      case `OUTLINE_COMPONENT_BAB2`:
        return <OutlineComponentBab2 />;
      case `OUTLINE_COMPONENT_BAB3`:
        return <OutlineComponentBab3 />;
      case `OUTLINE_COMPONENT_BAB4`:
        return <OutlineComponentBab4 />;
      case `OUTLINE_COMPONENT_BAB5`:
        return <OutlineComponentBab5 />;

      default:
        return <Empty />;
    }
  };

  return (
    <>
      {!guidanceOutline && (
        <Alert
          message="Warning"
          description={
            <div>
              Kamu belum memilih outline. Pilih outline kamu pada menu.
              <b>{`Mahasiswa > Setting > Outline`}</b>
            </div>
          }
          type="warning"
          showIcon
          closable
        />
      )}

      {guidanceOutline && (
        <Tabs
          onChange={onChangeTab}
          items={guidanceOutline?.outline?.outline_component?.map((val, i) => {
            const label = `${val.master_outline_component?.name} - ${val.title}`;
            return {
              key: val.master_outline_component?.code ?? "",
              label: <div>{label}</div>,
              children: chooseOutline(val.master_outline_component?.code ?? ""),
            };
          })}
        />
      )}
    </>
  );
};

const Page = () => {
  const user = useUserLogin();
  const [messageApi, contextHolder] = message.useMessage();

  const {
    data: myGuidance,
    isLoading: isLoadingMyGuidance,
    mutate: reloadMyGuidance,
  } = useSWR(
    [`${baseAPIURL}/mahasiswa/guidance/${user?.id}`],
    myGuidanceFetcher
  );

  return (
    <>
      {contextHolder}
      <Card>
        <Spin spinning={isLoadingMyGuidance}>
          {!myGuidance && (
            <StartGuidanceComponent
              onSubmit={(needReload, message) => {
                if (needReload) {
                  /// Force reload
                  reloadMyGuidance(undefined, true);
                  messageApi.success(message);
                }
              }}
            />
          )}
          {myGuidance && <MyGuidanceOutline />}
        </Spin>
      </Card>
    </>
  );
};

export default Page;
