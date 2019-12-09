import React from 'react'
import { Layout } from 'antd'
import Navigator from './Navigator'
import ContentMain from './ContentMain'
import HeaderBar from './HeaderBar'
import CssBaseline from '@material-ui/core/CssBaseline';


const { Sider, Header, Content, Footer } = Layout

class SystemEntry extends React.Component {
    state = {
        collapsed: false
    }

    toggle = () => {
        // console.log(this)  状态提升后，到底是谁调用的它
        this.setState({
            collapsed: !this.state.collapsed
        })
    }

    render() {
        // 设置Sider的minHeight可以使左右自适应对齐
        return (
            <div id='page'>
                <CssBaseline />
                <Layout style={{ overflowX: 'auto' }}>
                    <Sider collapsible
                        trigger={null}
                        collapsed={this.state.collapsed}
                    >
                        <Navigator />
                    </Sider>
                    <Layout>
                        <Header style={{ background: '#fff', padding: '0 16px' }}>
                            <HeaderBar collapsed={this.state.collapsed} onToggle={this.toggle} />
                        </Header>
                        <Content>
                            <ContentMain />
                        </Content>
                        <Footer style={{ textAlign: 'center' }}>配置管理工具 ©2019 中国电科院 </Footer>
                    </Layout>
                </Layout>
            </div>
        );
    }
}

export default SystemEntry

