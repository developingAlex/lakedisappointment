import React from 'react'
import Product from './Product'

function ProductList({
  products
}) {
  return(
    <div className='mb-3'>
      {
        products ? (
          <div>
            <h2 className='mb-2'> Available Products: </h2>
            {
              products.map((product) => (
                <Product
                  product={product}
                />
              ))
            }
          </div>
        ) : (
          <fragment>
            <h2> We are currently stocking the shelves!</h2>
            <h3> Please visit again soon&hellip; </h3>
          </fragment>
        )
      }
    </div>
  )
}

export default ProductList