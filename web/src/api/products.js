import api from './init'

export function listProducts(){
  return api.get('/products')
  .then((res) => res.data)
}

export function listWishlistProducts(){
  return api.get('/wishlist')
  .then((res) => res.data)
}