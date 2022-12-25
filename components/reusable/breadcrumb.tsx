import { Breadcrumb } from "antd";
import { useRouter } from "next/router";
import { convertRoutePathToArray } from "../../utils/function";

const MyBreadcrum = () => {

	const router = useRouter();
	const arrPathname = convertRoutePathToArray(router.asPath);
	return <>
		<Breadcrumb separator=">" className="mb-5">
			{arrPathname.map(val => <Breadcrumb.Item key={val} >{(val[0]?.toUpperCase() ?? "default") + val.slice(1)}</Breadcrumb.Item>)}
		</Breadcrumb>
	</>
}

export default MyBreadcrum;