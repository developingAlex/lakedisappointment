import React from 'react'

function Product({
  product,
  onRemoveFromWishlist, //onRemoveFromWishlist and onAddToListing will be null if they are not needed for this product so check that before making any buttons
  onAddToWishlist
}) {
  return(
    <div className='mb-2'>
      {
        product ? (
          <fragment>
              <h3> {product.brandName} </h3>
              <h4> {product.name} </h4>
              {
                onAddToWishlist && 
                <button onClick={onAddToWishlist}> Add to wishlist </button>
              }
              {
                onRemoveFromWishlist && 
                <button onClick={onRemoveFromWishlist}> Remove from wishlist </button>
             }
          </fragment>
        ) : (
          <div>Null product</div>
        )
      }
    </div>
  )
}

export default Product