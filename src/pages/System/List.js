import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Divider, Icon, Pagination, Alert, Button, Input, Modal, Form } from 'antd';
import { message, Popconfirm, Radio, Cascader, Select, TimePicker, DatePicker } from 'antd';
import StandardFormRow from '@/components/StandardFormRow';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import moment from 'moment';

const { MonthPicker, RangePicker, WeekPicker } = DatePicker;
const FormItem = Form.Item;
const { TextArea } = Input;
const Search = Input.Search;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const { Option } = Select;

let currentEntry;

@connect(({ system,loading }) => ({
  system,
  loading: loading.models.system,
}))

@Form.create()

export default class list extends Component {
  loadMembers() {
    this.props.dispatch({
      type: 'system/loadMembers',
      payload: this.state.page,
    });
  }

  componentDidMount() {
    this.loadMembers();
  }
  constructor(props) {
    super(props);
    this.state = {
      status: 'normal', //控制的状态
      entry:{},
      page:{
        pindex:1,
        psize:10,
        status:'',
        role:'',
      },
      role:'',
      selectedRowKeys: [],
      selectedRowValues: [],
    };
  }

  //删除
  onDelete = entry => {
    let arr = [];
    arr[0] = entry;    
    this.props.dispatch({
      type: 'system/removeMembers',
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
          type: 'system/removeMembers',
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
  //重置查询条件
  // reset=()=>{
  //   let data = Object.assign(this.state.page, {pindex:1,psize:10, base:'',status:'',role:''})
  //   this.setState({
  //     page:data
  //   });
  // }

  //筛选
//   filtersChange = (type,item,index,e) =>{
//     if(type==='base'){
//       let data = Object.assign(this.state.page, { base: item.id,pindex:1 });
//       this.setState({
//         page: data,
//       });
//       this.loadRolesAll();
//     }else if(type==='status'){
//       let data = Object.assign(this.state.page, { status: item.id,pindex:1 });
//       this.setState({
//         page: data,
//       });
//     }else if(type==='role'){
//       if(this.state.page.base===''){
//         message.error('请先选择基地')
//         return
//       }
//       let data = Object.assign(this.state.page, { role: item.id,pindex:1 });
//       this.setState({
//         page: data,
//       });
//     }else if(type==='basemodal'){
//       //重选基地的时候 权限 学校置空
//       this.props.form.setFieldsValue({
//         role:'',
//         role_id:'',
//       });
//       this.setState({
//         index: index,
//       });
//       this.props.dispatch({
//         type: 'member/loadRolesAll',
//         payload: {base:item.id},
//       });
//       this.loadUniversityAll();
//     }
//   }
//   //筛选按钮
//   filterSearch = ()=>{
//     this.loadMembers()
//   }
//     //筛选的基地
//   baseChange = (value) =>{
//     let data = Object.assign(this.state.page, { base: value,pindex:1 });
//     this.setState({
//       page: data
//     });
//    this.loadMembers()
//  }
//   //搜索
//   onSearch= value =>{
//     let data = Object.assign(this.state.page, { pindex:1,search: value });
//     this.setState({
//       page: data
//     });
//     this.loadMembers()
//   } 
  // filterSearch = ()=>{
  //   this.loadMembers()
  // }
  // //重置查询条件
  // reset=()=>{
  //   let data = Object.assign(this.state.page, { pindex:1, psize:10, base:'', status:'',role:''});
  //   this.setState({
  //     page:data
  //   });
  // }
  //弹框
  handleModal=(type, entry, event)=> {
    // if (JSON.stringify(entry)!='{}'){
    //   this.props.dispatch({
    //     type: 'member/loadRolesAll',
    //     payload: {base:entry.base},
    //   });
    //   currentEntry = entry;
    // }
    this.setState({
      status: type,
      entry: entry,
      role: entry.roleScope
    });
    currentEntry = entry;
    this.props.form.setFieldsValue({
      username: currentEntry ? currentEntry.username : '',
      roleTitle: currentEntry ? currentEntry.roleTitle : '',
      remark: currentEntry ? currentEntry.remark : '',
      status: currentEntry ? currentEntry.status : '',
      role: currentEntry ? currentEntry.role : '',
    });
  }
  //弹框上面的按钮
  handleCloseModal = (type, event) => {
    if (type === 'ok') {
    //确认
    this.props.form.validateFields((err, values) => {
      if (!err) {
        //如果是编辑的话
        if (currentEntry) {
          values.id = currentEntry.id;
          // values.base = currentEntry.base;
          // values.role_id = currentEntry.role_id;
        }
        this.props.dispatch({
          type: 'system/saveMembers',
          payload: values,
          callback: () => {
            this.setState({
              status: 'normal',
            });
            this.loadMembers()
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
  roleChange = ( item,e )=>{
    this.setState({
      role: item.scope
    })
  }

  render() {
    const { system: { members }, loading } = this.props;
    const { selectedRowKeys,status,page,role,entry,index } = this.state;
    const { getFieldDecorator } = this.props.form; 
    const dateFormat='YYYY-MM-DD'
    //table的数据加key
    let newList = [];
    let list = members.list;
    if(list) {
      list.forEach(function (value,i) {
        list[i].key=i+1
      });
      newList = list;
    }
    const statuss = [
      {
        title:'正常',
        id:'normal'
      },
      {
        title:'禁止',
        id:'disabled'
      }
    ]
   
    // let baseAll=[];
    // if(JSON.stringify(bases)!='{}'){
    //   let a=Array.isArray(bases.bases)
    //   if(a){
    //     baseAll=bases.bases
    //   }else{
    //     baseAll[0]=bases.bases
    //   }
    // }

    // let university_all=[];
    // if(JSON.stringify(universitys)!='{}'){
    //   university_all=universitys.bases[index].universities
    // }

    //table 的columns
    const columns = [
      {
        title: '登录名',
        dataIndex: 'username',
        key: 'username',
      },
      {
        title: '权限',
        dataIndex: 'roleTitle',
        key: 'roleTitle',
      },
      {
        title: '备注',
        dataIndex: 'remark',
        key: 'remark',
      },
      {
        title: '状态',
        dataIndex: 'statusTitle',
        key: 'statusTitle',
      },
      {
        title: '操作',
        key: 'action',
        render: (text, record, index) => {
          return members.list.length > 0 ? (
            <span>
              <a onClick={e => this.handleModal('modify', text, e)}>编辑</a>
              <Divider type="vertical" />
              <Popconfirm title="确认删除当前这一条吗?" onConfirm={() => this.onDelete(record)}>
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
      total: members.total,
      position: 'bottom',
      showQuickJumper: true,
      showSizeChanger: true,
      showTotal: (total, range) => {
        return `第 ${range[0]} - ${range[1]} 条，共 ${total} 条`;
      },
    };

    let that=this;
    //页码以及每页展示几条改变
    function pageChange(pages){
      let data = Object.assign(page, { pindex: pages.current,psize:pages.pageSize });
      that.setState({
        page: data,
      });
      that.loadMembers();
    }

    return (
      <PageHeaderWrapper title="用户列表">
        <div style={{ background: '#fff', padding: '30px' }}>
          <div style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              style={{ margin: '0 10px 0 0' }}
              onClick={e => this.handleModal('create', {}, e)}
            >
              <Icon type="plus" />新建
            </Button>
            {hasSelected ? <Button onClick={this.delAll}>批量删除</Button> : ''}
          </div>
           
          {hasSelected ? (
            <div style={{ color: '#1890ff', position: 'relative' }}>
              <Alert message={message} type="info" showIcon />
              <Button type="danger" size='small' style={{ position: 'absolute', top: '8px', left: '10%'}} onClick={this.delChoose}>
                取消
              </Button>
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
          title={ status === 'create'? '新增用户': status === 'modify' ? '编辑人员' : '' }
          visible={ status !== 'normal' }
          onOk={e => this.handleCloseModal('ok', e)}
          onCancel={e => this.handleCloseModal('cancel', e)}
          width='800px'
        >
          <Form className="login-form">
            <FormItem label="登录名" style={{width:"50%",display:'inline-block'}}>
              {getFieldDecorator('username', {
                rules: [
                  {
                    required: true,
                    message: '请输入登录名!',
                  },
                  { max:30,message: '最多可输入三十个字'}
                ],
              })(<Input type="text" placeholder="请输入登录名" style={{width:"90%"}}/>)}
            </FormItem>
            
            <FormItem label="权限" style={{width:"50%",display:'inline-block'}}>
              {getFieldDecorator('roleTitle', {
                rules: [
                  {
                    required: true,
                    message: '请输入用户权限!',
                  },
                  { max:30,message: '最多可输入三十个字'}
                ],
              })(<Input type="text" placeholder="请输入用户权限" style={{width:"90%"}}/>)}
            </FormItem>

              {status === 'create' ? (
                <FormItem label="密码" style={{width:"50%",display:'inline-block'}}>
                  {getFieldDecorator('password', {
                    rules: [
                      {
                        required: true,
                        message: '请输入密码!',
                      },
                      { max:30,message: '最多可输入三十个字'}
                    ],
                  })(<Input type="text" placeholder="请输入密码" style={{width:"90%"}}/>)}
               </FormItem>
              ) : status === 'modify' ? (
                <FormItem label="密码（需要修改密码的话请输入）" style={{width:"50%",display:'inline-block'}}>
                  {getFieldDecorator('password', {
                    rules: [
                      { max:30,message: '最多可输入三十个字'}
                    ],
                  })(<Input type="text" placeholder="请输入密码" style={{width:"90%"}}/>)}
                </FormItem>
              ) : (
                ''
              )}





            <FormItem label='用户状态' style={{width:"50%",display:'inline-block'}}>
                {getFieldDecorator('status', {
                    rules: [{ required: true, message: '请选择状态' }],
                    initialValue:'normal'
                })(
                <RadioGroup>
                  <Radio value='normal'>正常</Radio>
                  <Radio value='disabled'>禁用</Radio>
                </RadioGroup>
                )}
            </FormItem>

            {/* <FormItem label="角色权限" style={{width:"50%",display:'inline-block'}}>
              {getFieldDecorator('role', {
                rules: [
                  {
                    required: true,
                    message: '请选择角色!',
                  },
                ],
              })(
                <Select placeholder="请选择角色" style={{border:"none",width:'90%'}}>
                   {roles_all.map(item => <Option value={item.id} onClick={e => this.roleChange(item, e)}>{item.title}</Option>)}
                </Select>
              )}
            </FormItem>  */}

            
            



             <FormItem label="备注">
                {getFieldDecorator('remark', {
                  rules: [
                    {
                      required: true,
                      message: '请输入备注!',
                    },
                    { max:300,message: '最多可输入三百个字'}
                  ],
                })(<TextArea rows={4} />)}
              </FormItem>



              
          </Form>
        </Modal>

      </PageHeaderWrapper>
    );
  }
}
