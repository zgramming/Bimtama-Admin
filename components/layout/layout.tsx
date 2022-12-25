import { Layout } from "antd";
import Image from "next/image";
import Link from "next/link";

import Logo from "../../public/images/logo_color.png";
import MyBreadcrum from "../reusable/breadcrumb";
import HeaderMenu from "./header_menu";
import SiderMenu from "./sider_menu";

const { Footer, Sider, Content } = Layout;

const AdminLayout = (props: { children?: React.ReactNode }) => {
  return (
    <Layout className="min-h-screen">
      <Sider
        theme="light"
        breakpoint="lg"
        collapsedWidth="0"
        onBreakpoint={(broken) => {
          // console.log(broken);
        }}
        onCollapse={(collapsed, type) => {
          // console.log(collapsed, type);
        }}
      >
        <div className="relative h-16 flex justify-center items-center">
          <Link href={"/"}>

            <Image
              alt="Failed load image..."
              src={Logo}
              height={100}
              width={100}
            />

          </Link>
        </div>
        <SiderMenu />
      </Sider>
      <Layout>
        <HeaderMenu />
        <Content className="py-12 p-2 md:p-5">
          <MyBreadcrum />
          <div className="min-h-screen">{props.children}</div>
        </Content>
        <Footer className="text-center text-white bg-primary">
          Built with Ant Design ©2018 Created by Ant UED
        </Footer>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
