import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Divider, Icon, Pagination, Alert, Button } from 'antd';
import { Popconfirm, Input, Modal, Form, message } from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import moment from 'moment';

const FormItem = Form.Item;

let currentEntry;

@connect(({ system, loading }) => ({
  system,
  loading: loading.models.system,
}))
@Form.create()

export default class role extends Component {
  loadRoles() {
    this.props.dispatch({
      type: 'system/loadRoles',
      payload: this.state.page,
    });
  }

  componentDidMount() {
    this.loadRoles();
  }

  constructor(props) {
    super(props);
    this.state = {
      status: 'normal', 
      entry:{},
      page:{
        pindex:1,
        psize:10,
      },
      selectedRowValues: [],
      selectedRowKeys: []
    };
  }

  onDelete = entry => {
    let arr = [];
    arr[0] = entry;    
    this.props.dispatch({
      type: 'system/removeRoles',
      payload: arr,
    });
  };
  //多选删除
  delAll = () => {
    Modal.confirm({
      title: '确认删除',
      content: '确认要删除当前所有的选中项吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        this.props.dispatch({
          type: 'system/removeRoles',
          payload: this.state.selectedRowValues,
          callback:()=>{
            this.setState({ selectedRowKeys: [] });
          }
        });
      },
    });
  };
  //清空选中项
  delChoose = () => {
    this.setState({ selectedRowKeys: [] });
  };
  //多选 选中项
  onSelectChange = (selectedRowKeys, selectedRows) => {
    this.setState({
      selectedRowKeys,
      selectedRowValues: selectedRows,
    });
  };
  //筛选
  // filtersChange = ( type, item, e ) =>{
  //   if ( type==='base' ) {
  //     let data = Object.assign(this.state.page, { base: item.id, pindex:1 });
  //     this.setState({
  //       page: data,
  //       classes: item.classes
  //     });
  //   } else if ( type==='root'){
  //     let data = Object.assign(this.state.page, { root: item.id, pindex:1 });
  //     this.setState({
  //       page: data,
  //     });
  //   }
  // }
  // //筛选按钮
  // filterSearch = ()=>{
  //   this.loadRoles()
  // }
//     //筛选的基地
//   baseChange = (value) =>{
//     let data = Object.assign(this.state.page, { base: value,pindex:1 });
//     this.setState({
//       page: data
//     });
//    this.loadRoles()
//  }
  //搜索
  // onSearch= value =>{
  //   let data = Object.assign(this.state.page, { pindex:1, search: value });
  //   this.setState({
  //     page: data
  //   });
  //   this.loadRoles()
  // } 
  //弹框
  handleModal=( type, entry, event )=> {
    this.setState({
      status: type,
      entry: entry,
    });
    currentEntry = entry;

    this.props.form.setFieldsValue({
      title: currentEntry ? currentEntry.title : '',
      base: currentEntry ? currentEntry.base : '',
      scope: currentEntry ? currentEntry.scope : '',
    });
  }
  //弹框上面的按钮
  handleCloseModal = ( type, event ) => {
    if ( type === 'ok' ) {
    //确认
    this.props.form.validateFields(( err, values ) => {
      if (!err) {
        //如果是编辑的话
        if ( JSON.stringify(currentEntry) != '{}' ) {
          values.id = currentEntry.id;
          values.base = currentEntry.base;
        }
        this.props.dispatch({
          type: 'system/saveRoles',
          payload: values,
          callback: () => {
            this.setState({
              status: 'normal',
            });
            this.loadRoles()
          },
        });          
      }
    });
    } else {
      //取消
      this.setState({
        status: 'normal',
      });
    }
  }
  startChange = (date, dateString)=>{
    this.setState({
      time: dateString
    })
  }

  render() {
    const { system: { roles }, loading } = this.props;
    const { selectedRowKeys, status, page, classes, entry } = this.state;
    const { getFieldDecorator } = this.props.form; 
    const dateFormat='YYYY-MM-DD'
    //table的数据加key
    let newList = [];
    let list = roles.list;
    if (list){
      list.forEach( function (value,i) {
        list[i].key = i+1
      });
      newList = list;
    }
    //table 的columns
    const columns = [
      {
        title: '类型',
        dataIndex: 'scope',
        key: 'scope',
      },
      {
        title: '权限',
        dataIndex: 'title',
        key: 'title',
      },
      {
        title: '操作',
        key: 'action',
        render: ( text, record, index ) => {
          return roles.list.length > 0 ? (
            <span>
              <a onClick={ e => this.handleModal( 'modify', text, e ) }>编辑</a>
              <Divider type="vertical" />
              <Popconfirm title="确认删除当前这一条吗?" onConfirm={ () => this.onDelete(record) }>
                <a href="javascript:;">删除</a>
              </Popconfirm>
            </span>
          ) : null;
        },
      },
     
    ];

    //列表选择
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
    
    const hasSelected = selectedRowKeys.length > 0;
    const message = `已经选择 ${selectedRowKeys.length} 项`;
    const pagination = {
      total: roles.total,
      position: 'bottom',
      showQuickJumper: true,
      showSizeChanger: true,
      showTotal: (total, range) => {
        return `第 ${range[0]} - ${range[1]} 条，共 ${total} 条`;
      },
    };

    let that = this;
    //页码以及每页展示几条改变
    function pageChange(pages){
      let data = Object.assign(page, { pindex: pages.current,psize:pages.pageSize });
      that.setState({
        page: data,
      });
      that.loadRoles();
    }

    return (
      <PageHeaderWrapper title="用户类型">
        <div style={{ background: '#fff', padding: '30px' }}>
          <div style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              style={{ margin: '0 10px 0 0' }}
              onClick={e => this.handleModal('create', {}, e)}
            >
              <Icon type="plus" />新建
            </Button>
            { hasSelected ? <Button onClick={this.delAll}>批量删除</Button> : '' }
          </div>

          {hasSelected ? (
            <div style={{ color: '#1890ff', position: 'relative' }}>
              <Alert message={message} type="info" showIcon />
              <Button type="danger" size='small' style={{ position: 'absolute', top: '8px', left: '10%'}} onClick={this.delChoose}
              >取消</Button>
            </div> ) : (
            ''
          )}

          <Table
            columns={columns}
            dataSource={newList}
            style={{ background: '#fff' }}
            rowSelection={rowSelection}
            pagination={pagination}
            onChange={pageChange}
            loading={loading}    
          />
        </div>

        <Modal
          title={ status === 'create'? '新增用户': status === 'modify' ? '编辑用户' : '' }
          visible={ status !== 'normal' }
          onOk={ e => this.handleCloseModal('ok', e) }
          onCancel={ e => this.handleCloseModal('cancel', e) }
          width='800px'
        >
          <Form className="login-form">
            <FormItem label="用户类型">
              {getFieldDecorator('scope', {
                rules: [
                  {
                    required: true,
                    message: '请输入用户类型!',
                  },
                  { max:30,message: '最多可输入三十个字'}
                ],
              })(<Input type="text" placeholder="请输入用户类型" />)}
            </FormItem>

            <FormItem label='用户权限'>
              {getFieldDecorator('title', {
                rules: [
                  {
                    required: true,
                    message: '请输入用户权限!',
                  },
                  { max:30,message: '最多可输入三十个字'}
                ],
              })(<Input type="text" placeholder="请输入用户权限" />)}
            </FormItem>
          </Form>
        </Modal>
      </PageHeaderWrapper>
    );
  }
}
