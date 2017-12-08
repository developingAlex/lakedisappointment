import React from 'react'

function Wishlist({
  products
}) {
  if (products) {

    console.log('what is products when it crashes?')
    console.log(products)
  }
  return(
    <div>
      {
        products ? (
          
          <div>
            {
              products.map((product) => (
                <div>
                  <h3> {product.brandName} </h3>
                  <h4> {product.name} </h4>
                </div>
              ))
            }
          </div>
        ) : (
          <h3> no products </h3>
        )
      }
    </div>
  )
}

export default Wishlist