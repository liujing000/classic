import { stringify } from 'qs';
import http from '@/utils/http';

export const system = {
  role:{
    async all(value){
      return http.post('/system/role/all',value);
    },
    async delete({ id }) {
      return http.post('/system/role/delete', { id: id });
    },
    async save(value) {
      return http.post('/system/role/save', value);
    },
  },
  user:{
    async all(value) {
      return http.post('/system/user/all',value);
    },
    async delete({ id }) {
      return http.post('/system/user/delete', { id: id });
    },
    async save(value) {
      return http.post('/system/user/save', value);
    },
  },
};

