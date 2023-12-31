'use client'

import { useState } from 'react'
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { twMerge } from 'tailwind-merge'
import LoadingPulse from '@/components/LoadingPulse'
import CustomButton from '@/components/buttons/CustomButton'

type PaymentIntentType = {
  status: 'succeeded' | 'processing' | 'requires_payment_method'
}

type Props = {
  bookingId: string
}

export default function CheckoutForm({ bookingId }: Props) {
  const stripe = useStripe()
  const elements = useElements()

  const [message, setMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // useEffect(() => {
  //   if (!stripe) {
  //     return
  //   }

  //   const clientSecret = new URLSearchParams(window.location.search).get(
  //     'payment_intent_client_secret'
  //   )

  //   console.log(clientSecret)
  //   console.log(clientSecret)

  //   if (!clientSecret) {
  //     return
  //   }

  //   stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
  //     console.log(paymentIntent)
  //     console.log(paymentIntent?.status)
  //     switch (paymentIntent?.status) {
  //       case 'succeeded':
  //         setMessage('Payment succeeded!')
  //         break
  //       case 'processing':
  //         setMessage('Your payment is processing...')
  //         break
  //       case 'requires_payment_method':
  //         setMessage('Your payment was not successful, please try again.')
  //         break
  //       default:
  //         setMessage('Something went wrong.')
  //         break
  //     }
  //   })
  // }, [stripe])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return
    }

    setIsLoading(true)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // NOTE: STRIPE WILL ADD THE PAYMENT_INTENT_ID TO THE QUERY STRING.
        // NOTE: this PAYMENT_INTENT_ID is DIFFERENT from the one we get at previous step at /api/stripe/create-intent.
        // here we just need to pass the bookingId to the land on success page and retrieve:
        // -the bookingId from {params}
        // -the stripe generated paymentIntentId from the query string.
        return_url: `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/stripe/success/${bookingId}`,
      },
    })

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    if (error.type === 'card_error' || error.type === 'validation_error') {
      setMessage(error.message || 'An unexpected error occurred.')
    } else {
      setMessage('An unexpected error occurred.')
    }

    setIsLoading(false)
  }

  return (
    <div
      className='flex flex-col gap-y-1 
      rounded-md 
      border-2 
      bg-transparent 
      p-4
      shadow-blue-200 dark:border
      '
    >
      {/* payment form */}
      <div
        className='rounded-md
         bg-transparent
          p-4 shadow-gray-100 ring ring-gray-200 dark:ring-1'
      >
        <form id='payment-form' onSubmit={handleSubmit}>
          <PaymentElement id='payment-element' options={{ layout: 'tabs' }} />

          <CustomButton
            btnType='submit'
            disabled={isLoading || !stripe || !elements}
            className={twMerge(
              'btn-medium btn-gradient mb-2 mt-4 w-full self-start text-light sm:w-1/3',
              'hover:scale-105'
            )}
          >
            {isLoading ? (
              <LoadingPulse />
            ) : (
              <span className='text-inherit opacity-80 dark:opacity-100'>
                Pay now
              </span>
            )}
          </CustomButton>

          {/* Show any error or success messages */}
          {message && <div id='payment-message'>{message}</div>}
        </form>
      </div>

      {/* fake card details */}
      <div
        className='mt-4 
        rounded-md bg-transparent p-4 italic
         shadow-gray-100 ring ring-gray-200 dark:ring-1'
      >
        <h4 className='text-lg opacity-90'>Test card details</h4>
        <ul>
          <li>
            <span className='opacity-80'>Card number: </span>
            <span className='opacity-70'>4242 4242 4242 4242</span>
          </li>
          <li>
            <span className='opacity-80'>Expiry: </span>
            <span className='opacity-70'>04/25</span>
          </li>
          <li>
            <span className='opacity-80'>CVC: </span>
            <span className='opacity-70'>424</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
