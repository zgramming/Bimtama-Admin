import { CheckCircleOutlined, CalendarOutlined } from "@ant-design/icons";
import { Card, List, Avatar, Space, Tag } from "antd";
import { StudentMeetingScheduleInterface } from "../../interface/mahasiswa/student_meeting_schedule_interface";

const StudentMeetingScheduleComponent = ({
  items,
}: {
  items: StudentMeetingScheduleInterface[];
}) => {
  return (
    <Card>
      <List
        itemLayout="horizontal"
        dataSource={items}
        renderItem={(item, index) => {
          const startDate = new Date(item.start_date).toLocaleDateString(
            "id-ID",
            { dateStyle: "long" }
          );
          const startDateTime = new Date(item.start_date).toLocaleTimeString(
            "id-ID",
            { timeStyle: "short" }
          );

          const endDate = item.end_date
            ? new Date(item.end_date).toLocaleDateString("id-ID", {
                dateStyle: "long",
              })
            : undefined;
          const endDateTime = item.end_date
            ? new Date(item.end_date).toLocaleTimeString("id-ID", {
                timeStyle: "short",
              })
            : undefined;
          return (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar>{index + 1}</Avatar>}
                title={<div className="font-semibold">{item.title}</div>}
                description={
                  <div className="flex flex-col gap-2">
                    <div className="">{item.description}</div>
                    <Space direction="horizontal" size={5} wrap>
                      <Tag icon={<CheckCircleOutlined />} color="success">
                        {item.method.toUpperCase()}
                      </Tag>
                      <Tag icon={<CalendarOutlined />} color="processing">
                        <Space direction="horizontal">
                          <div>{`${startDate} - ${startDateTime}`}</div>
                          {endDate && (
                            <div>{`- ${endDate} - ${endDateTime}`}</div>
                          )}
                        </Space>
                      </Tag>
                    </Space>
                    {item.link_maps && (
                      <div className="font-semibold">
                        Link Google Maps :&nbsp;
                        <a
                          href={`${item.link_maps}`}
                          target={"_blank"}
                          rel="noreferrer"
                        >
                          {item.link_maps}
                        </a>
                      </div>
                    )}
                    {item.link_meeting && (
                      <div className="font-semibold">
                        Link Virtual Meeting :&nbsp;
                        <a
                          href={`${item.link_meeting}`}
                          target={"_blank"}
                          rel="noreferrer"
                        >
                          {item.link_meeting}
                        </a>
                      </div>
                    )}
                  </div>
                }
              />
            </List.Item>
          );
        }}
      />
    </Card>
  );
};

export default StudentMeetingScheduleComponent;
