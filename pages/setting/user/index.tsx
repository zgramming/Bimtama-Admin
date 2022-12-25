import {
	Button, Card, Form, Input, Modal, Radio, Select, Space, Table, TableColumnsType
} from 'antd';
import Search from 'antd/lib/input/Search';
import { ReactNode, useEffect, useState } from 'react';

import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';

import { sleep } from '../../../utils/function';

interface DataSourceInterface {
	no: number,
	group_user: string,
	username: string,
	name: string,
	status: string,
	created_at: string,
	updated_at: string,
	action: string,
}

const UserPage = () => {

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);

	const deleteHandler = async () => {
		Modal.confirm({
			title: "Are you sure delete this row ?",
			maskClosable: false,
			onOk: async () => {
				await sleep(5000);
			},
			onCancel: async () => {
				alert('cancel');
			}
		});
	}

	const columns: TableColumnsType<DataSourceInterface> = [
		{ key: "no", dataIndex: "no", title: "No" },
		{ key: "group_user", dataIndex: "group_user", title: "Group User" },
		{ key: "username", dataIndex: "username", title: "Username" },
		{ key: "name", dataIndex: "name", title: "Nama" },
		{ key: "status", dataIndex: "status", title: "Status" },
		{ key: "created_at", dataIndex: "created_at", title: "Created At" },
		{ key: "updated_at", dataIndex: "updated_at", title: "UpdatedA At" },
		{
			key: "action",
			dataIndex: "action",
			title: "Aksi",
			width: 100,
			render: (val) => {
				return <Space align="center">
					<Button icon={<EditOutlined />} className="bg-info text-white" onClick={() => setIsModalOpen(true)} />
					<Button icon={<DeleteOutlined />} className="bg-error text-white" onClick={deleteHandler} />
				</Space>
			}
		},
	];

	let dataSource: DataSourceInterface[] = [];

	for (let i = 1; i <= 9999; i++) {
		dataSource.push({
			no: i,
			name: "Name" + i,
			group_user: "group user" + 1,
			status: "status" + i,
			username: "username" + i,
			created_at: new Date().toDateString(),
			updated_at: new Date().toDateString(),
			action: ""
		})
	}

	return <Card>
		<div className="flex flex-col">
			<div className="flex justify-between items-center mb-5">
				<h1 className="font-medium text-base mr-5 md:text-xl">User</h1>
				<Space wrap>
					<Button icon={<PlusOutlined />} className="bg-success text-white" onClick={() => setIsModalOpen(true)} >Tambah</Button>
				</Space>
			</div>
			<div className="flex flex-wrap items-center space-x-2 mb-5">
				<Search placeholder="Cari sesuatu..." onSearch={(e) => ''} className="w-48" allowClear />
				<Select
					defaultValue={{
						value: 0,
						label: "Pilih"
					}}
					onChange={(e) => alert(e)}
					className="w-auto md:min-w-[10rem]"  >
					<Select.Option value={0}>Pilih</Select.Option>
					<Select.Option value='active'>Aktif</Select.Option>
					<Select.Option value="not_active">Tidak Aktif</Select.Option>
				</Select>
			</div>
			<Table
				loading={false}
				columns={columns}
				dataSource={dataSource}
				scroll={{ x: 2000 }}
				pagination={{
					total: dataSource.length,
					current: currentPage,
					pageSize: pageSize,
					showPrevNextJumpers: false,
					onChange: (page, size) => {
						setCurrentPage(page);
						alert(`onchagen ${page} ${size}`)
					},
					onShowSizeChange: (current, size) => {
						setPageSize(size);
						alert(`onchagen ${current} ${size}`)
					}
				}}
			/>
			{isModalOpen && <FormModal open={isModalOpen} onCloseModal={() => setIsModalOpen(false)} />}
		</div>
	</Card >;
}

const FormModal = (props: {
	open: boolean, onCloseModal: () => void
}) => {
	const [form] = Form.useForm();

	const onFinish = (values: any) => {
		console.log(values);
	};

	useEffect(() => {
		form.setFieldsValue({
			group_user: 0,
			status: "active"
		})

		return () => {
		}
	}, [form])


	return <Modal
		title="Form Tambah"
		open={props.open}
		maskClosable={false}
		keyboard={false}
		closable={false}
		width="1000px"
		onCancel={props.onCloseModal}
		footer={
			<Space>
				<Button onClick={props.onCloseModal} >Batal</Button>
				<Button htmlType="submit" form="form_validation" className='bg-success text-white' onClick={() => alert('save!')} >Simpan</Button>
			</Space>
		}
	>
		<Form
			form={form}
			name="form_validation"
			id="form_validation"
			layout="vertical"
			onFinish={onFinish}
		>
			<Form.Item label="Group User" name="group_user">
				<Select>
					<Select.Option value={0}>Pilih</Select.Option>
					<Select.Option value="superadmin">Superadmin</Select.Option>
				</Select>
			</Form.Item>
			<Form.Item label="Nama" name="name" >
				<Input placeholder="Input Name" />
			</Form.Item>
			<Form.Item label="Email" name="email" >
				<Input placeholder="Input email" type='email' />
			</Form.Item>
			<Form.Item label="Username" name="username" >
				<Input placeholder="Input username" />
			</Form.Item>
			<Form.Item label="Password" name="password" >
				<Input placeholder="Input password" type='password' />
			</Form.Item>
			<Form.Item label="Status" name="status">
				<Radio.Group>
					<Radio value={'active'}>Aktif</Radio>
					<Radio value={'not_active'}>Tidak Aktif</Radio>
				</Radio.Group>
			</Form.Item>
		</Form>
	</Modal>;
}

export default UserPage;