import { Alert, Avatar, Card, List, Space, Spin } from "antd";
import axios from "axios";
import useSWR from "swr";

import useUserLogin from "../../../hooks/use_userlogin";
import { GroupInterface } from "../../../interface/dosen/group_interface";
import { StudentMentorInterface } from "../../../interface/mahasiswa/student_mentor_interface";
import { baseAPIURL } from "../../../utils/constant";

const myMentorFetcher = async ([url]: any) => {
  const request = await axios.get(`${url}`);
  const { data, success }: { data: StudentMentorInterface; success: boolean } =
    request.data;
  return data;
};

const Page = () => {
  const user = useUserLogin();
  const {
    data: studentMentor,
    isLoading: isLoadingstudentMentor,
    mutate: reloadstudentMentor,
  } = useSWR(
    [`${baseAPIURL}/mahasiswa/my-mentor/${user?.id}`],
    myMentorFetcher
  );
  return (
    <Spin spinning={isLoadingstudentMentor}>
      <Card>
        {!studentMentor && (
          <Alert
            message="Warning"
            description={
              <div>
                Kamu belum mempunyai kelompok, silahkan masuk kelompok pada menu{" "}
                <b>{`Mahasiswa > Kelompok`}</b>
              </div>
            }
            type="warning"
            showIcon
            closable
          />
        )}
        {studentMentor && (
          <Space direction="vertical" size={10}>
            <div className="font-semibold text-lg">Daftar Dosen Pembimbing</div>
            <List
              itemLayout="horizontal"
              dataSource={studentMentor.group_member}
              renderItem={(item, index) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar>{index + 1}</Avatar>}
                    title={<a href="https://ant.design">{item.user.name}</a>}
                    description={
                      <div className="flex flex-col">
                        <div>{item.user.phone}</div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Space>
        )}
      </Card>
    </Spin>
  );
};

export default Page;
