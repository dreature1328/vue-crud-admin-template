import request from '@/utils/request'

export const reqDataCount = () => {
    return request({ url: `http://localhost:<port>/data/count-all`, method: 'get' });
}

export const reqDataList = (page, limit) =>{
    return request({ url: `http://localhost:<port>/data/select-by-page-num-size?num=${page}&size=${limit}`, method: 'get' });
}

export const reqAddData = (data) => {
    return request({ url: 'http://localhost:<port>/data/insert', method: 'post', data: data });
}

export const reqUpdateData = (data) => {
    return request({ url: 'http://localhost:<port>/data/update', method: 'post', data: data });
}

export const reqDeleteData = (id) => {
    return request({ url: `http://localhost:<port>/data/delete-by-ids?ids=${id}`, method: 'post', data: id});
}
