import { Badge, Card, Empty, Skeleton, Space, Spin, Tabs } from "antd";
import axios from "axios";
import useSWR from "swr";

import { MonitorOutlined } from "@ant-design/icons";

import LectureGuidanceTableComponent from "../../../components/lecture/lecture_guidance_table_component";
import { LectureGuidanceProvider } from "../../../context/lecture_guidance_context";
import useUserLogin from "../../../hooks/use_userlogin";
import { LectureGuidanceMasterOutlineInterface } from "../../../interface/dosen/lecture_guidance_master_outline_interface";
import { baseAPIURL } from "../../../utils/constant";

const masterOutlineComponentFetcher = async ([url]: any) => {
  const request = await axios.get(`${url}`);
  const {
    data,
    success,
  }: { data: LectureGuidanceMasterOutlineInterface[]; success: boolean } =
    request.data;
  return data;
};

const chooseOutline = (codeOutlineComponent: string) => {
  switch (codeOutlineComponent) {
    case `OUTLINE_COMPONENT_JUDUL`:
    case `OUTLINE_COMPONENT_BAB1`:
    case `OUTLINE_COMPONENT_BAB2`:
    case `OUTLINE_COMPONENT_BAB3`:
    case `OUTLINE_COMPONENT_BAB4`:
    case `OUTLINE_COMPONENT_BAB5`:
      return (
        <LectureGuidanceTableComponent
          codeMasterOutlineComponent={codeOutlineComponent}
        />
      );
    default:
      return <Empty />;
  }
};

const Page = () => {
  const user = useUserLogin();
  const {
    data: dataMasterOutlineComponent,
    isLoading: isLoadingMasterOutlineComponent,
    mutate: reloadMasterOutlineComponent,
  } = useSWR(
    [`${baseAPIURL}/dosen/guidance/master-outline-component/${user?.id}`],
    masterOutlineComponentFetcher
  );

  if (isLoadingMasterOutlineComponent) {
    return (
      <Card>
        <Skeleton></Skeleton>
      </Card>
    );
  }

  return (
    <LectureGuidanceProvider
      value={{ reloadMasterOutlineComponent: reloadMasterOutlineComponent }}
    >
      <Spin spinning={isLoadingMasterOutlineComponent}>
        <Card>
          <Tabs
            onChange={(e) => {}}
            items={dataMasterOutlineComponent?.map((val, i) => {
              const label = `${val.name}`;
              const progressGuidance = val.guidance_detail;
              return {
                key: val.code,
                label: (
                  <Space align="center" wrap>
                    <MonitorOutlined />
                    <Badge count={progressGuidance.length} offset={[5, -5]}>
                      <span>{label}</span>
                    </Badge>
                  </Space>
                ),
                children: chooseOutline(val?.code ?? ""),
              };
            })}
          />
        </Card>
      </Spin>
    </LectureGuidanceProvider>
  );
};

export default Page;
