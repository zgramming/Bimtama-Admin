import {
  CheckCircleOutlined,
  CalendarOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { List, Avatar, Space, Tag, Button } from "antd";
import { LectureMeetingScheduleInterface } from "../../interface/dosen/lecture_meeting_schedule_interface";

const LectureMeetingScheduleItem = ({
  meeting,
  index,
  onEdit,
}: {
  meeting: LectureMeetingScheduleInterface;
  index: number;
  onEdit: (item: LectureMeetingScheduleInterface) => void;
}) => {
  const startDate = new Date(meeting.start_date).toLocaleDateString("id-ID", {
    dateStyle: "long",
  });
  const startDateTime = new Date(meeting.start_date).toLocaleTimeString(
    "id-ID",
    {
      timeStyle: "short",
    }
  );

  const endDate = meeting.end_date
    ? new Date(meeting.end_date).toLocaleDateString("id-ID", {
        dateStyle: "long",
      })
    : undefined;
  const endDateTime = meeting.end_date
    ? new Date(meeting.end_date).toLocaleTimeString("id-ID", {
        timeStyle: "short",
      })
    : undefined;
  return (
    <List.Item>
      <List.Item.Meta
        avatar={<Avatar>{index + 1}</Avatar>}
        title={<div className="font-semibold text-xl">{meeting.title}</div>}
        description={
          <div className="flex flex-col gap-2">
            <div className="">{meeting.description}</div>
            <>
              {meeting.link_meeting && (
                <div className="font-semibold">
                  Link Virtual Meeting :&nbsp;
                  <a
                    href={`${meeting.link_meeting}`}
                    target={"_blank"}
                    rel="noreferrer"
                  >
                    {meeting.link_meeting}
                  </a>
                </div>
              )}
              {meeting.link_maps && (
                <div className="font-semibold">
                  Link Google Maps :&nbsp;
                  <a
                    href={`${meeting.link_maps}`}
                    target={"_blank"}
                    rel="noreferrer"
                  >
                    {meeting.link_maps}
                  </a>
                </div>
              )}
            </>
            <Space direction="horizontal" size={5} wrap>
              <Tag icon={<CheckCircleOutlined />} color="success">
                {meeting.method.toUpperCase()}
              </Tag>
              <Tag icon={<CalendarOutlined />} color="processing">
                <Space direction="horizontal">
                  <div>{`${startDate} - ${startDateTime}`}</div>
                  {endDate && <div>{`- ${endDate} - ${endDateTime}`}</div>}
                </Space>
              </Tag>
            </Space>

            <Button
              type="primary"
              icon={<EditOutlined />}
              className="self-start"
              onClick={(e) => {
                onEdit(meeting);
              }}
            >
              Edit
            </Button>
          </div>
        }
      />
    </List.Item>
  );
};

export default LectureMeetingScheduleItem;
