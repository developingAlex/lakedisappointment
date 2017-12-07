import decodeJWT from 'jwt-decode'

const key = 'userToken'

export function rememberToken(token) {
  if (token){ 
    localStorage.setItem(key, token)
  }
  else{ //if no token is supplied, take it as a sign out.
    localStorage.removeItem(key)
  }
}

export function getValidToken(){
  const token = localStorage.getItem(key)
  try{
    const decodedToken = decodeJWT(token)
    //valid token at this point otherwise would have moved to catch
    const now = Date.now() / 1000
    //check if token has expired
    if (now > decodedToken.exp) {
      return null
    }
    return token
    
  }
  catch (error) {
    return null
  }
}

export function getDecodedToken() {
  const validToken = getValidToken()
  if (validToken){
    return decodeJWT(validToken)
  }
  else{
    return null
  }
}