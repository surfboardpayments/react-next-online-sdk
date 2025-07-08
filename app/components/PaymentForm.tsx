'use client';

import React, { useEffect, useState, useRef } from 'react';
import Script from 'next/script';

declare global {
    interface Window {
        SurfboardOnlineSDK: any;
    }
}

const PaymentForm = () => {
    const [errorMessage, setErrorMessage] = useState<{ code: string; message: string } | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [paymentErrorMessage, setPaymentErrorMessage] = useState<string | null>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [isCustomerDetailsVisible, setIsCustomerDetailsVisible] = useState(false);

    const cardDetailsRef = useRef<HTMLDivElement>(null);
    const applePayRef = useRef<HTMLDivElement>(null);
    const googlePayRef = useRef<HTMLDivElement>(null);

    const [customerDetails, setCustomerDetails] = useState({
        email: '',
        phoneCountryCode: '',
        phoneNumber: '',
        addressCountryCode: '',
        addressLine1: '',
        city: '',
        postalCode: '',
    });

    const log = (...args: any[]) => {
        const message = `${new Date().toLocaleString()} ${args.join(' ')}`;
        setLogs(prevLogs => [...prevLogs, message]);
        console.log(...args);
    };

    useEffect(() => {
        const originalLog = console.log;
        console.log = (...args: any[]) => {
            const message = `${new Date().toLocaleString()} ${args.join(' ')}`;
            setLogs(prevLogs => [...prevLogs, message]);
            originalLog(...args);
        };

        return () => {
            console.log = originalLog;
        };
    }, []);

    const handleSDKReady = () => {
        log('Surfboard SDK is ready.');

        // Using hardcoded values for Order ID and Nonce for testing
        // TODO: Replace these with your actual test values
        const orderId = 'ORDER_ID';
        const nonce = 'NONCE';

        if (!orderId || !nonce) {
            setErrorMessage({ code: 'MISSING_VALUES', message: 'Please update the hardcoded Order ID and nonce in PaymentForm.tsx.' });
            return;
        }

        window.SurfboardOnlineSDK.errorCallback((code: string, message: string) => {
            log(`Error: ${code}`, message);
            setErrorMessage({ code, message });
            setTimeout(() => setErrorMessage(null), 5000);
        });

        window.SurfboardOnlineSDK.paymentStatusCallback(async (data: any) => {
            log('Payment status:', JSON.stringify(data));
            if (data.paymentStatus === 'PAYMENT_COMPLETED') {
                setSuccessMessage('Payment Successful!');
            } else if (data.paymentStatus === 'PAYMENT_FAILED') {
                setPaymentErrorMessage(data.errorMessage || 'Payment Failed');
            }
        });

        window.SurfboardOnlineSDK.initialiseOnlineSDK({
            publicKey: process.env.NEXT_PUBLIC_SURFBOARD_PUBLIC_KEY, 
            orderId: orderId,
            nonce: nonce,
        }).then(() => {
            log('Surfboard SDK initialized.');
            window.SurfboardOnlineSDK.mount({
                mountCardWidget: 'card-details',
                mountApplePayWidget: 'apple-pay',
                mountGooglePayWidget: 'google-pay',
            });
        });
    };

    const handlePayment = (method: 'CARD' | 'KLARNA') => {
        window.SurfboardOnlineSDK.order.initiatePayments(method);
    };

    const handleUpdateCustomerDetails = async (e: React.FormEvent) => {
        e.preventDefault();
        const addressInfo = {
            email: customerDetails.email,
            phone: {
                countryCode: customerDetails.phoneCountryCode,
                number: customerDetails.phoneNumber,
            },
            billingAddress: {
                city: customerDetails.city,
                postalCode: customerDetails.postalCode,
                countryCode: customerDetails.addressCountryCode,
                addressLine1: customerDetails.addressLine1,
            },
        };
        log('Updating customer info:', JSON.stringify(addressInfo));
        await window.SurfboardOnlineSDK.order.addCustomerInformation(addressInfo);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCustomerDetails(prev => ({ ...prev, [name]: value }));
    };

    const copyLogs = () => {
        navigator.clipboard.writeText(logs.join('\n')).then(() => alert('Logs copied!'));
    };

    return (
        <>
            <Script
                src={process.env.NEXT_PUBLIC_SURFBOARD_SDK_URL}
                strategy="lazyOnload"
                onReady={handleSDKReady}
                onError={(e) => setErrorMessage({ code: 'SDK_LOAD_ERROR', message: 'Failed to load Surfboard SDK.' })}
            />
            <div className="w-full max-w-2xl mx-auto p-4 md:p-6">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-50">Surfboard Payments</h1>
                    <p className="text-gray-400 mt-2">A secure and seamless payment experience.</p>
                </div>

                {errorMessage && (
                    <div className="bg-red-900/50 border border-red-500 text-red-300 p-4 rounded-lg mb-6 flex justify-between items-center">
                        <span>Error [{errorMessage.code}]: {errorMessage.message}</span>
                        <button onClick={() => setErrorMessage(null)} className="text-red-300 hover:text-red-100">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                )}

                {successMessage && (
                    <div className="bg-green-900/50 border border-green-500 text-green-300 p-4 rounded-lg mb-6">
                        <span>{successMessage}</span>
                    </div>
                )}
                {paymentErrorMessage && (
                     <div className="bg-red-900/50 border border-red-500 text-red-300 p-4 rounded-lg mb-6">
                        <span>{paymentErrorMessage}</span>
                    </div>
                )}

                <div className="space-y-6">
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg">
                        <button onClick={() => setIsCustomerDetailsVisible(!isCustomerDetailsVisible)} className="w-full text-left p-4 flex justify-between items-center hover:bg-gray-800/70 rounded-t-lg">
                            <h2 className="text-lg font-semibold text-gray-100">Customer Details</h2>
                            <svg className={`w-5 h-5 text-gray-400 transform transition-transform ${isCustomerDetailsVisible ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </button>
                        {isCustomerDetailsVisible && (
                            <form onSubmit={handleUpdateCustomerDetails} className="p-4 border-t border-gray-700 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <input type="email" name="email" value={customerDetails.email} onChange={handleInputChange} placeholder="Email" className="bg-gray-800 border border-gray-700 rounded-md p-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 md:col-span-2" />
                                    <div className="grid grid-cols-3 gap-4 md:col-span-2">
                                        <input type="text" name="phoneCountryCode" value={customerDetails.phoneCountryCode} onChange={handleInputChange} placeholder="IN" className="bg-gray-800 border border-gray-700 rounded-md p-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 col-span-1" />
                                        <input type="text" name="phoneNumber" value={customerDetails.phoneNumber} onChange={handleInputChange} placeholder="Phone Number" className="bg-gray-800 border border-gray-700 rounded-md p-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 col-span-2" />
                                    </div>
                                    <input type="text" name="addressLine1" value={customerDetails.addressLine1} onChange={handleInputChange} placeholder="Address Line 1" className="bg-gray-800 border border-gray-700 rounded-md p-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                                    <input type="text" name="city" value={customerDetails.city} onChange={handleInputChange} placeholder="City" className="bg-gray-800 border border-gray-700 rounded-md p-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                                    <input type="text" name="postalCode" value={customerDetails.postalCode} onChange={handleInputChange} placeholder="Postal Code" className="bg-gray-800 border border-gray-700 rounded-md p-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                                    <input type="text" name="addressCountryCode" value={customerDetails.addressCountryCode} onChange={handleInputChange} placeholder="SE" className="bg-gray-800 border border-gray-700 rounded-md p-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-2.5 px-4 transition-colors duration-200">Update Details</button>
                            </form>
                        )}
                    </div>

                    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                        <h2 className="text-xl font-semibold text-center text-white mb-4">Payment Selection</h2>
                        <div className="space-y-4">
                            <div ref={cardDetailsRef} id="card-details"></div>
                            <button onClick={() => handlePayment('CARD')} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg py-2.5 px-4 transition-colors">Pay with Card</button>
                            
                            <div ref={applePayRef} id="apple-pay"></div>
                            <div ref={googlePayRef} id="google-pay"></div>

                            <button onClick={() => handlePayment('KLARNA')} className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg py-2.5 px-4 transition-colors">Pay with Klarna</button>
                        </div>
                    </div>

                    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-lg font-semibold text-gray-100">Logs</h2>
                            <div className="flex space-x-2">
                                <button onClick={copyLogs} className="bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-md py-1 px-3 text-xs transition-colors">Copy</button>
                                <button onClick={() => setLogs([])} className="bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-md py-1 px-3 text-xs transition-colors">Clear</button>
                            </div>
                        </div>
                        <div className="bg-gray-800 rounded-md p-3 h-48 overflow-y-auto font-mono text-sm text-gray-400 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-900">
                            {logs.map((logMsg, index) => (
                                <div key={index}>{logMsg}</div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PaymentForm;
