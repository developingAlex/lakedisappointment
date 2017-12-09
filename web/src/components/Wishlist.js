import React from 'react'
import Product from './Product'

function Wishlist({
  products
}) {
  return(
    <div className='mb-3'>
      {
        products ? (
          
          <div>
            <h2 className='mb-2 wishlistheader'> 🎀 Your Wishlist 🎀 </h2>
            {
              products.map((product) => (
                <Product
                  product={product}
                />
              ))
            }
          </div>
        ) : (
          <h3> Nothing in your wishlist yet </h3>
        )
      }
    </div>
  )
}

export default Wishlist