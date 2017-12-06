import React from 'react'

function SignInForm({

}) {
  return (
    <form
    onSubmit = {(event)=>{
      event.preventDefault()
      console.log('form-submitted', event.target)
      const form = event.target
      const elements = form.elements //the key value pairs
      const email = elements.email.value
      const password = elements.password.value
      console.log({email, password})
    }}>
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

      <button>
        Sign in
      </button>
    </form>
  )
}

export default SignInForm