import { Button, Menu } from "antd";
import { ItemType } from "antd/lib/menu/hooks/useItems";
import { useRouter } from "next/router";
import { destroyCookie } from "nookies";
import { useEffect, useState } from "react";

import { LogoutOutlined, PieChartOutlined } from "@ant-design/icons";

import { getItem } from "../../interface/layout/menu_items_interface";
import { keyLocalStorageLogin } from "../../utils/constant";

const currentPathHandler = (path: string): string => {
  const [first, second, third] = path
    .split("/")
    .filter((route) => route.length !== 0);

  /// We assume when `third` is undefined, this is sub menu
  return !third ? `/${first}/${second}` : `/${first}/${second}/${third}`;
};

const SiderMenu = (props: {}) => {
  const { pathname, push, replace, route } = useRouter();
  const [currentPath, setCurrentPath] = useState(currentPathHandler(pathname));
  const [items, setItems] = useState<ItemType[]>([]);

  /// Listen every change route path name
  useEffect(() => {
    const path = currentPathHandler(pathname);
    setCurrentPath(path);
    return () => {};
  }, [pathname]);

  useEffect(() => {
    setItems([
      getItem(
        "/setting/user_group",
        "Management Group User",
        <PieChartOutlined />
      ),
      getItem("/setting/user", "Management User", <PieChartOutlined />),
      getItem("/setting/modul", "Modul", <PieChartOutlined />),
      getItem("/setting/menu", "Menu", <PieChartOutlined />),
      getItem("/setting/access_modul", "Access Modul", <PieChartOutlined />),
      getItem("/setting/access_menu", "Access Menu", <PieChartOutlined />),
      getItem(
        "/setting/master_category",
        "Master Kategori",
        <PieChartOutlined />
      ),
      getItem("/setting/master_data", "Master Data", <PieChartOutlined />),
      getItem("/setting/example", "Dokumentasi", <PieChartOutlined />),
      getItem("/setting/parameter", "Parameter", <PieChartOutlined />),
      getItem("?/setting/parent", "Parent Menu", <PieChartOutlined />, [
        getItem("/setting/parent/child_first", "Child 1"),
        getItem("/setting/parent/child_second", "Child 2"),
      ]),
    ]);
    return () => {};
  }, []);

  return (
    <div className="flex flex-col ">
      <Menu
        theme="light"
        mode="inline"
        items={items}
        selectedKeys={[currentPath]}
        onClick={(e) => {
          /// Jangan lakukan push jika character pertama === "?"
          /// Ini dilakukan untuk meng-akomodir sub menu
          if (e.key[0] === "?") return false;

          const path = currentPathHandler(e.key);
          setCurrentPath(path);
          push(path);
        }}
      />
      <Button
        type="primary"
        htmlType="button"
        className="m-5"
        icon={<LogoutOutlined />}
        danger
        onClick={async (e) => {
          destroyCookie(null, keyLocalStorageLogin);
          replace("/login");
        }}
      >
        Logout
      </Button>
    </div>
  );
};

export default SiderMenu;
