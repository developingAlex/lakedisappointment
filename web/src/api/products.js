import api from './init'

export function listProducts(){
  return api.get('/products')
  .then((res) => res.data)
}

export function listWishlistProducts(){
  return api.get('/wishlist')
  .then((res) => res.data)
}

export function createProduct(productData){
  return api.post('/products', productData)
  .then((res) => res.data)
}

export function addProductToWishlist(productId){
  return api.post(`/wishlist/products/${productId}`)
  .then((res) => res.data)
}
export function removeProductFromWishlist(productId){
  return api.delete(`/wishlist/products/${productId}`)
  .then((res) => res.data)
}