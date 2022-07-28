import axios from 'axios';
import { BACKEND_URL } from "../util/config";
const baseUrl = `${BACKEND_URL}/todos`;

const getAll = async () => {
    const req = axios.get(baseUrl);
    return req.then(res => res.data);
};

const create = async newTodo => {
    const res = await axios.post(baseUrl, newTodo);
    return res.data;
};

const update = async todo => {
    const res = await axios.put(`${baseUrl}/${todo.id}`, todo);
    return res.data;
};

const exports = {
    getAll,
    create,
    update
};

export default exports;