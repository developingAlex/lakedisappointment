import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:7000' //in reality this would be https
})

export function setToken(token){
  api.defaults.headers.common['Authorization']= `Bearer ${token}`
}


export default api