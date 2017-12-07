import api from './init'

export function signIn({ email,  password}){
  return api.post('/auth', {email, password}) //returning api.post because we want it accessible outside the function.
  /*the above is shorthand for {email: email, password: password}*/
  .then((res) => {
    return res.data
  })
}