import {
	Button, Checkbox, DatePicker, Form, Input, InputNumber, Modal, Radio, Select, Space, Table,
	TableColumnsType, Upload
} from 'antd';
import Card from 'antd/lib/card/Card';
import Search from 'antd/lib/input/Search';
import TextArea from 'antd/lib/input/TextArea';
import { useState } from 'react';

import {
	DeleteOutlined, EditOutlined, ExportOutlined, ImportOutlined, PlusOutlined, SearchOutlined,
	UploadOutlined
} from '@ant-design/icons';

import { sleep } from '../../../utils/function';

interface DataSourceInterface {
	no: number,
	name: string,
	code: string,
	job: string,
	birth_date: string,
	money: number,
	hobby: string,
	status: string,
	image?: string,
	file?: string,
	created_at: string,
	updated_at: string,
	action: string,
}

const ExamplePage = () => {
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

	/// Key & Index harus sama dengan [Interface property name]
	/// Jika tidak sama, text tidak akan muncul.
	/// Adding Comment
	const columns: TableColumnsType<any> = [
		{ key: "no", dataIndex: "no", title: "No" },
		{ key: "name", dataIndex: "name", title: "Name (Input Text)" },
		{ key: "code", dataIndex: "code", title: "Code (Input Text)" },
		{ key: "job", dataIndex: "job", title: "Job (Input Select)" },
		{ key: "birth_date", dataIndex: "birth_date", title: "Birth Date (Input Date)" },
		{ key: "money", dataIndex: "money", title: "Money (Input Number)" },
		{ key: "hobby", dataIndex: "hobby", title: "Hobby (Checkbox)" },
		{ key: "status", dataIndex: "status", title: "Status (Radio Button)" },
		{ key: "image", dataIndex: "image", title: "Image (Show Image)" },
		{ key: "file", dataIndex: "file", title: "File (Show File)" },
		{ key: "created_at", dataIndex: "created_at", title: "Created At (DateTime)" },
		{ key: "updated_at", dataIndex: "updated_at", title: "Updated At (DateTime)" },
		{
			key: "action", dataIndex: "action", title: "Action (Custom Button)", render: (val) => {
				return <Space>
					<Button icon={<EditOutlined />} className="bg-info	text-white" >Edit Halaman</Button>
					<Button icon={<EditOutlined />} className="bg-info text-white" onClick={() => setIsModalOpen(true)} >Edit Modal</Button>
					<Button icon={<DeleteOutlined />} className="bg-error text-white" onClick={deleteHandler} >Delete</Button>
					<Button icon={<SearchOutlined />} className="bg-white text-black" >Preview</Button>
				</Space>
			}
		},
	];

	let dataSource: DataSourceInterface[] = [];

	for (let i = 1; i <= 9999; i++) {
		dataSource.push({
			no: i + 1,
			name: `Name ${i}`,
			code: `Code ${i}`,
			job: `Job ${i}`,
			birth_date: `Birth Date ${i}`,
			money: i,
			hobby: `Hobby ${i}`,
			status: `Status ${i}`,
			image: `Image ${i}`,
			file: `File	 ${i}`,
			created_at: `Created At ${i}`,
			updated_at: `Updated At ${i}`,
			action: ""
		})
	}

	return <Card>
		<div className="flex flex-col">
			<div className="flex justify-between items-center mb-5">
				<h1 className="font-medium text-base mr-5 md:text-xl">Example</h1>
				<Space wrap>
					<Button icon={<ImportOutlined />} className="bg-accent text-white" >Import</Button>
					<Button icon={<ExportOutlined />} className="bg-info text-white" >Export</Button>
					<Button icon={<PlusOutlined />} className="bg-success text-white" >Halaman</Button>
					<Button icon={<PlusOutlined />} className="bg-success text-white" onClick={() => setIsModalOpen(true)} >Modal</Button>
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
					<Select.Option value='0'>Pilih</Select.Option>
					<Select.Option value="1">satu</Select.Option>
					<Select.Option value="2">dua</Select.Option>
					<Select.Option value="3">tiga</Select.Option>
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
	</Card>
}


const FormModal = (props: {
	open: boolean, onCloseModal: () => void
}) => {
	const [form] = Form.useForm();

	const onFinish = (values: any) => {
		console.log(values);
	};

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
				<Button title="Batal" onClick={props.onCloseModal} >Batal</Button>
				<Button htmlType='submit' form='form_validation' title="Simpan" className='bg-success text-white' >Simpan</Button>
			</Space>
		} >
		<Form
			form={form}
			name="form_validation"
			id='form_validation'
			layout="vertical"
			onFinish={onFinish}
		>
			<Form.Item label="Name" name="name"  >
				<Input name='name' placeholder="Input Name..." />
			</Form.Item>
			<Form.Item label="Code" name="code" >
				<Input name='code' placeholder="Input Code..." />
			</Form.Item>
			<Form.Item label="Job" name="job">
				<Select>
					<Select.Option value="web">Web Developer</Select.Option>
					<Select.Option value="backend">Backend Developer</Select.Option>
					<Select.Option value="frontend">Front End Developer</Select.Option>
					<Select.Option value="mobile">Mobile Developer</Select.Option>
					<Select.Option value="ui_ux">UI / UX Designer</Select.Option>
				</Select>
			</Form.Item>
			<Form.Item label="Birth Date" name="birth_date">
				<DatePicker name='birth_date' className='w-full' />
			</Form.Item>
			<Form.Item label="Money" name="money">
				<InputNumber className='w-full' />
			</Form.Item>
			<Form.Item label="Deskripsi" name="description">
				<TextArea rows={4} />
			</Form.Item>
			<Form.Item name="hobby" label="Hobby">
				<Checkbox.Group>
					<Checkbox value="a" style={{ lineHeight: '32px' }}>
						Main Dota
					</Checkbox>
					<Checkbox value="b" style={{ lineHeight: '32px' }}>
						Main Dota Lagi
					</Checkbox>
				</Checkbox.Group>
			</Form.Item>
			<Form.Item name="status" label="Status Pernikahan">
				<Radio.Group>
					<Radio value="belum_kawin">Belum Kawin</Radio>
					<Radio value="mau_kawin">Mau Kawin</Radio>
				</Radio.Group>
			</Form.Item>
			<Form.Item label="Image" name="image">
				<Upload
					action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
					listType="picture"
					maxCount={1}
				>
					<Button icon={<UploadOutlined />}>Upload Gambar</Button>
				</Upload>
			</Form.Item>
			<Form.Item label="File" name="file">
				<Upload
					action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
					listType="text"
					maxCount={1}
					className='w-full'
				>
					<Button icon={<UploadOutlined />}>Upload File</Button>
				</Upload>
			</Form.Item>
		</Form>
	</Modal>
}



export default ExamplePage;