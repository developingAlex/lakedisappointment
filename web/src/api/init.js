import axios from 'axios'
import decodeJWT from 'jwt-decode'
import { rememberToken, getValidToken } from './token'

const api = axios.create({
  baseURL: 'http://localhost:7000' //in reality this would be https
})

export function setToken(token){
  rememberToken(token) //call our saveToken function.
  if (token){ //then adjust our default headers based on whether the token was not null
    api.defaults.headers.common['Authorization']= `Bearer ${token}`
  }
  else { //or if the token was null (ie they want to sign OUT)
    delete api.defaults.headers.common['Authorization']
  }
  //validates the token and if its invalid, remove from local storage
}

setToken(getValidToken())


export default api