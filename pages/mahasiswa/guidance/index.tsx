import { Alert, Card, Empty, Spin, Tabs } from "antd";
import axios from "axios";
import { useRouter } from "next/router";
import useSWR from "swr";

import OutlineComponentBab1 from "../../../components/outline_component/outline_component_bab1";
import OutlineComponentBab2 from "../../../components/outline_component/outline_component_bab2";
import OutlineComponentBab3 from "../../../components/outline_component/outline_component_bab3";
import OutlineComponentBab4 from "../../../components/outline_component/outline_component_bab4";
import OutlineComponentBab5 from "../../../components/outline_component/outline_component_bab5";
import useUserLogin from "../../../hooks/use_userlogin";
import { StudentGuidanceOutlineInterface } from "../../../interface/mahasiswa/student_guidance_outline";
import { baseAPIURL } from "../../../utils/constant";

const guidanceOutlineFetcher = async ([url]: any) => {
  const request = await axios.get(`${url}`);
  const {
    data,
    success,
  }: { data: StudentGuidanceOutlineInterface; success: boolean } = request.data;
  return data;
};

const HaventChooseOutlineComponent = () => {
  return (
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
  );
};

const Page = () => {
  const user = useUserLogin();
  const { push, isReady } = useRouter();

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

  const onChangeTab = (key: string) => {
    // Router.push(`/mahasiswa/guidance/?${key}`, undefined, { shallow: true });
  };

  const chooseOutline = (codeOutlineComponent: string) => {
    switch (codeOutlineComponent) {
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
      <Spin spinning={false} className="">
        <Card>
          {!guidanceOutline && <HaventChooseOutlineComponent />}
          {guidanceOutline && (
            <Tabs
              onChange={onChangeTab}
              items={guidanceOutline?.outline?.outline_component?.map(
                (val, i) => {
                  const label = `${val.master_outline_component?.name} - ${val.title}`;
                  return {
                    key: val.master_outline_component?.code ?? "",
                    label: <div>{label}</div>,
                    children: chooseOutline(
                      val.master_outline_component?.code ?? ""
                    ),
                  };
                }
              )}
            />
          )}
        </Card>
      </Spin>
    </>
  );
};

export default Page;
