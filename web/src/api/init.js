import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:7000' //in reality this would be https
})

export default api