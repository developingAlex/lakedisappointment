import React from 'react'
import Product from './Product'

function isInWishlist(product, wishlist){
  if (!wishlist){
    return {showRemoveButton: false, showAddButton: false}
  }

  //the .find method returns either the element itself that was found, or else 'undefined'. Using double bang !! turns the 'undefined' into a false, and any other object into a true. The first bang flips those values and the second bang flips them again restoring them so that 'undefined' will resolve to false and any product object will resolve to true.
  const alreadyInWishlist = !!(wishlist.products.find((wishlistItem) => (
    product._id === wishlistItem._id
  )))
  
  //assume it isn't in the wishlist, then we'll need an add button, not a remove button
  let add = true
  let remove = false
  if (alreadyInWishlist){ //if it is in the wishlist then correct our assummption
    add = false
    remove = true
  }

  return {showRemoveButton: remove, showAddButton: add}
}

function ProductList({
  products,
  signedIn,
  wishlistProducts, 
  onAddProductToWishlist,
  onRemoveProductFromWishlist
}) {
  return(
    <div className='mb-3'>
      {
        products ? (
          <div>
            <h2 className='mb-2'> Available Products: </h2>
            {
              products.map((product) => {
                const {showRemoveButton, showAddButton} = isInWishlist(product, wishlistProducts)
                return(
                  <Product
                    product={product}
                    onAddToWishlist = { 
                      showAddButton ? () => {
                        //if we are to show an add-to-wishlist-button for this product then pass through a callable function as onAddToListing, otherwise pass through null
                        onAddProductToWishlist(product._id)
                      } : null
                    }
                    onRemoveFromWishlist = { 
                      showRemoveButton ? () => {
                        onRemoveProductFromWishlist(product._id)
                      } : null
                    }
                  />
                )
              })
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