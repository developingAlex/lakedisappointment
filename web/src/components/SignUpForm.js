import React from 'react'

function SignUpForm({
  onSignUp
}) {
  return (
    <form
    onSubmit = {(event)=>{
      //prevent old school form submission
      event.preventDefault()
      console.log('form-submitted', event.target)
      const form = event.target
      const elements = form.elements //the key value pairs
      const firstname = elements.firstname.value
      const lastname = elements.lastname.value
      const email = elements.email.value
      const password = elements.password.value
      const passwordconfirm = elements.passwordconfirm.value
      console.log({email, password, passwordconfirm})
      onSignUp({firstname, lastname, email, password})
    }}>
      <label
        className='mb-2'
      >
        {'First Name: '}
        <input
          type='text'
          name='firstname'
        />
      </label>
      <label
        className='mb-2'
      >
        {'Last Name: '}
        <input
          type='text'
          name='lastname'
        />
      </label>
      <label
        className='mb-2'
      >
        {'Email: '}
        <input
          type='email'
          name='email'
        />
      </label>
      <label
        className='mb-2'
      >
        {'Password: '}
        <input
          type='password'
          name='password'
        />
      </label>
      <label
        className='mb-2'
      >
        {'Confirm Password: '}
        <input
          type='password'
          name='passwordconfirm'
        />
      </label>

      <button>
        Yes I want to buy discounted quality products at the cheapest possible rate!!
      </button>
    </form>
  )
}

export default SignUpForm