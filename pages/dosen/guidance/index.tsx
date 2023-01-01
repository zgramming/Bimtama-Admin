import { Card, Empty, Input, Skeleton, Space, Spin, Tabs } from "antd";
import axios from "axios";
import useSWR from "swr";

import { MonitorOutlined } from "@ant-design/icons";

import LectureGuidanceTableComponent from "../../../components/lecture/lecture_guidance_table_component";
import { MasterData } from "../../../interface/main_interface";
import { baseAPIURL } from "../../../utils/constant";

const masterOutlineComponentFetcher = async ([url]: any) => {
  const request = await axios.get(`${url}`);
  const { data, success }: { data: MasterData[]; success: boolean } =
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
  const {
    data: dataMasterOutlineComponent,
    isLoading: isLoadingMasterOutlineComponent,
    mutate: reloadMasterOutlineComponent,
  } = useSWR(
    [`${baseAPIURL}/dosen/guidance/master-outline-component`],
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
    <Spin spinning={isLoadingMasterOutlineComponent}>
      <Card>
        <Tabs
          onChange={(e) => {}}
          items={dataMasterOutlineComponent?.map((val, i) => {
            const label = `${val.name}`;
            return {
              key: val.code,
              label: (
                <Space align="center" wrap>
                  <MonitorOutlined />
                  <div>{label}</div>
                </Space>
              ),
              children: chooseOutline(val?.code ?? ""),
            };
          })}
        />
      </Card>
    </Spin>
  );
};

export default Page;
