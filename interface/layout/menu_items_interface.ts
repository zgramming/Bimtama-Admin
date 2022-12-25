import { MenuProps } from "antd";

type MenuItem = Required<MenuProps>["items"][number];
export const getItem = (
  key: React.Key,
  label: React.ReactNode,
  icon?: React.ReactNode,
  children?: MenuItem[]
) => {
  const x = {
    key,
    icon,
    children,
    label,
  } as MenuItem;
  return x;
};
