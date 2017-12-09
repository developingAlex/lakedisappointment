import React from 'react'

function ProductForm({
  onSave, //keep this name generic, because this form will be used for both creating and updating
  title
}) {
  return (
    <fragment>
      <h2> {title} </h2>
      <form
      onSubmit = {(event)=>{
        //prevent old school form submission
        event.preventDefault()
        console.log('form-submitted', event.target)
        const form = event.target
        const elements = form.elements //the key value pairs
        const brandName = elements.brandName.value
        const name = elements.name.value
        onSave({brandName, name})
      }}>
        <label
          className='mb-2'
        >
          {'Brand Name: '}
          <input
            type='text'
            name='brandName'
          />
        </label>
        <label
          className='mb-2'
        >
          {'Name: '}
          <input
            type='text'
            name='name'
          />
        </label>

        <button>
          Save
        </button>
      </form>
    </fragment>
  )
}

export default ProductForm