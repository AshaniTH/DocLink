import React from 'react'
import logo from '../assets/logo.png'

const Footer = () => {
  return (
    <div className='md:mx-10'>
      <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>
        {/* left section */}
        <div>
         <div className="flex items-center gap-1 cursor-pointer">
                 <img className="w-15 h-15" src={logo} alt="DocLink Logo" />
                 <span className="text-primary font-bold text-xl">DocLink</span>
               </div>
               
          <p>
            DocLink is your trusted platform for easy and reliable doctor channeling. 
           Book appointments anytime, anywhere, and get connected with the right healthcare professionals.
          </p>

        </div>
        {/* center section */}
        <div>
          <p className='text-xl font-medium mb-5'>
            Company
          </p>
          <ul className='flex flex-col gap-2 text-gray-600
          '>
            <li>About Us</li>
            <li>Home</li>
            <li>Contact</li>
            <li>Privacy Policy</li>
          </ul>

        </div>
        {/* right section */}
        <div>
          <p className='text-xl font-medium mb-5'>Get In Touch</p>
          <ul className='flex flex-col gap-2 text-gray-600'>
            <li>+1234567</li>
            <li>info@doclink.com</li>
          </ul>


        </div>

      </div>
      <div>
        {/* copyright text  */}
        <hr />
        <p className='py-5 text-sm text-center '> Copyright © 2023 DocLink. All rights reserved.</p>
      </div>
    </div>
  )
}

export default Footer