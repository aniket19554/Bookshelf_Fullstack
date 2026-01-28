import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom';


const VerifyPaymentPage = () => {

  const [statusMsg, setStatusMsg] = useState('Verifying Payment...');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const session_id = searchParams.get('session_id');
  const token = localStorage.getItem('token');
  const apiBase = 'http://localhost:4000';

  useEffect(() => {
    if(!session_id) {
      setStatusMsg('Session id is missing.');
      return;
    }

    axios.get(`${apiBase}/api/order/confirm`, {
      params: {session_id},
      headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  .then(() => {
    setStatusMsg('Payment confirmed! Redirecting to your orders...');
    setTimeout(() => navigate('/orders', { replace: true }), 2000);
  })
  .catch((err) => {
    console.error('Confirmation error:', err);
    setStatusMsg(
      err.response?.data?.message || 
      'Error confirming payment. Please contact support'
    );
  });
}, [session_id, apiBase, navigate, token]);
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-900 text-white'>
      <p className='text-lg'>{statusMsg}</p>
    </div>
  )
}

export default VerifyPaymentPage