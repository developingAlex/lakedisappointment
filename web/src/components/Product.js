import React from 'react'

function Product({
  product
}) {
  return(
    <div className='mb-2'>
      {
        product ? (
          <fragment>
              <h3> {product.brandName} </h3>
              <h4> {product.name} </h4>
          </fragment>
        ) : (
          <div>Null product</div>
        )
      }
    </div>
  )
}

export default Product