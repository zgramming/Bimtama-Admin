import { Menu } from "antd";
import { Header } from "antd/lib/layout/layout";

import { PieChartOutlined } from "@ant-design/icons";

import { getItem } from "../../interface/layout/menu_items_interface";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ItemType } from "antd/lib/menu/hooks/useItems";

const currentPathHeaderHandler = (path: string): string => {
  const [first, second, third] = path
    .split("/")
    .filter((route) => route.length !== 0);

  return `/${first}`;
};

const HeaderMenu = () => {
  const { pathname } = useRouter();
  const [items, setItems] = useState<ItemType[]>([]);
  const [currentPath, setCurrentPath] = useState(
    currentPathHeaderHandler(pathname)
  );

  /// Listen every change route path name
  useEffect(() => {
    const path = currentPathHeaderHandler(pathname);
    setCurrentPath(path);
    return () => {};
  }, [pathname]);

  useEffect(() => {
    setItems((prevState) => {
      return [
        getItem("/setting", "Setting", <PieChartOutlined />),
        getItem("/profile", "Profile", <PieChartOutlined />),
      ];
    });
    return () => {};
  }, []);

  return (
    <Header className="!bg-white" >
      <Menu
        theme="light"
        mode="horizontal"
        items={items}
        className="flex justify-end"
        selectedKeys={[currentPath]}
        onClick={(info) => {
          console.log({ info });
        }}
      />
    </Header>
  );
};

export default HeaderMenu;
