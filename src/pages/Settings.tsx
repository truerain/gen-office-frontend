
import { Form, Input, Button, Switch } from 'antd';

const Settings = () => {
    return (
        <div style={{ maxWidth: 600, padding: 24 }}>
            <h2>System Settings</h2>
            <Form
                name="basic"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                initialValues={{ remember: true }}
                autoComplete="off"
            >
                <Form.Item
                    label="Username"
                    name="username"
                    rules={[{ required: true, message: 'Please input your username!' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Enable Notifications"
                    name="notifications"
                    valuePropName="checked"
                >
                    <Switch />
                </Form.Item>

                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                    <Button type="primary" htmlType="submit">
                        Save Changes
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default Settings;
