import api, {setToken} from './init'
// import decodeJWT from 'jwt-decode'
import { getDecodedToken } from './token'


export function signIn({ email,  password}){
  return api.post('/auth', {email, password}) //returning api.post because we want it accessible outside the function.
  /*the above is shorthand for {email: email, password: password}*/
  .then((res) => {
    const token = res.data.token
    setToken(token)
    return getDecodedToken()
    
    // return res.data
  })
}

export function signUp({firstName, lastName, email, password}){
return api.post('/auth/register', {firstName, lastName, email, password})
  .then((res) => {
    const token = res.data.token
    setToken(token)
    return getDecodedToken()
  })
}

export function signOutNow(){
  setToken(null)
}