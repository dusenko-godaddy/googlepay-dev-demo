import $ from 'jquery';
import { useAlert } from 'react-alert';
import Button from 'react-bootstrap-button-loader';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import constants from '../lib/common/constants';
import { availableCouponCodes } from '../lib/common/data';
import { createOrder, buildLineItems, buildTotal, getShippingMethods } from '../lib/helpers/wallet';

const parseMesasge = (data) => {
  ///http request error
  if (data?.developerMessage || data?.message) {
    return {
      message: event.data.developerMessage || event.data.message,
      type: 'ERROR',
    };
  }

  if (data?.error?.source === 'submit') {
    const message = data.error.message;

    if (data.error.type === 'card_on_file') {
      return {
        message: 'Unable to save card on file: ' + message,
        type: 'WARN',
      };
    }

    return {
      message,
      type: 'ERROR',
    };
  }
};

const PoyntCollect = ({setLoading, options, collectId, onNonce, cartItems, cartTotal, couponCode}) => {
  const alert = useAlert();
  const paymentForm = useRef();
  const wallets = useRef();
  const order = useRef();
  const [collect] = useState(new window.PoyntCollectSDK({
    businessId: constants.poyntCollect.businessId,
    applicationId: constants.poyntCollect.applicationId,
    merchantInfo: {
      name: constants.poyntCollect.merchantName,
      country: constants.poyntCollect.country,
      currency: constants.poyntCollect.currency,
      locale: "en_US",
    }
  }));

  const [orderLoaded, setOrderLoaded] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [savedCard, _setSavedCard] = useState("");

  const getNonce = async () => {
    setButtonLoading(true);

    if (savedCard) {
      await Promise.resolve(onNonce(savedCard));
      setButtonLoading(false);

      return;
    }
  
    paymentForm.current.getNonce({
      firstName: "Ethan",
      lastName: "Ledner",
      emailAddress: "test2@test.test",
      phone: "(978) 779-0200",
      zipCode: "01740",
      line1: "2566 Dow ST",
      line2: "Box 168",
      city: "Bolton",
      territory: "Maine",
      countryCode: "US",
    });
  };

  useEffect(() => {
    order.current = createOrder(cartItems, cartTotal, couponCode);
    setOrderLoaded(true);
  }, [cartItems, cartTotal, couponCode]);

  useLayoutEffect(() => {
    if (!orderLoaded) {
      return;
    }

    if (setLoading) {
      setLoading(true);
    }

    const walletOptions = {
      orderDetails: {
        lineItems: buildLineItems(order.current),
        total: buildTotal(order.current),
        couponCode: order.current.coupon,
      },
      preferences: {
        requireEmail: options.requireEmail,
        requirePhone: options.requirePhone,
        requireShippingAddress: options.requireShippingAddress,
        displayCouponCode: options.supportCouponCode,
        disableWallets: {
          applePay: !options.paymentMethods?.applePay,
          googlePay: !options.paymentMethods?.googlePay,
        },
      },
    };

    const handleError = (error) => {
      console.log("error", error);
  
      if (error) {
        if ($("#__react-alert__ span").text() === error.message) {
          return;
        }

        alert.error(error.message);
      }

      setLoading(false);
      setButtonLoading(false);
    };

    const onError = (error) => {
      handleError(parseMesasge(error));
    };

    const onCollectNonce = async (nonce) => {
      try {
        await Promise.resolve(onNonce(nonce));
      } catch(error) {
        handleError(error);
      }
    };

    console.log('current collect instance: ', collect.current);
    window.poyntCollect = collect;

    if (options.requireShippingAddress) {
      walletOptions.onShippingAddressChange = (event) => {
        console.log("shipping_address_change", event);
        order.current.shippingCountry = event.shippingAddress.countryCode;
      
        if (order.current.shippingCountry === "US") {
          order.current.taxRate = 0.1;
        } else {
          order.current.taxRate = 0.3;
        }
      
        const shippingMethods = getShippingMethods(order.current);

        if (!shippingMethods?.length) {
          return event.error({
            code: "unserviceable_address",
            contactField: "country",
            message: "No shipping methods available for selected shipping address",
          });
        }
      
        const selectedShippingMethod = shippingMethods[0];
        const total = buildTotal(order.current, selectedShippingMethod);
        const lineItems = buildLineItems(order.current, selectedShippingMethod);
  
        const options = {
          lineItems: lineItems,
          shippingMethods: shippingMethods,
          total: total,
        };

        event.update(options);

        // console.log("googlePayPaymentDataChangedHandler: wait 15 sec.");

        // setTimeout(() => {
        //   event.update(options);
        // }, 15000);
      };
      
      walletOptions.onShippingMethodChange = (event) => {
        console.log("shipping_method_change", event);
        const total = buildTotal(order.current, event.shippingMethod);
        const lineItems = buildLineItems(order.current, event.shippingMethod);
        
        const options = {
          lineItems: lineItems,
          total: total
        };
  
        event.update(options);
      };
    }

    if (options.supportCouponCode) {
      walletOptions.onCouponCodeChange = (event) => {
        console.log("coupon_code_change", event);
        if (!event.couponCode) {
          order.current.coupon = {
            code: "",
            label: "",
            amount: "0.00",
          }
        } else {
          const couponCode = availableCouponCodes.find(item => item.code === event.couponCode);
  
          if (!couponCode) {
            const error = {
              code: "invalid_coupon_code",
              message: "Coupon code " + event.couponCode + " does not exists", 
            }
      
            return event.error(error);
          }
      
          order.current.coupon = couponCode;
        }

        const shippingMethods = walletOptions.requireShippingAddress ? getShippingMethods(order.current) : null;
        const selectedShippingMethod = walletOptions.requireShippingAddress ? shippingMethods[0] : null;
        const total = buildTotal(order.current, selectedShippingMethod);
        const lineItems = buildLineItems(order.current, selectedShippingMethod);
          
        const options = {
          lineItems: lineItems,
          shippingMethods: shippingMethods,
          couponCode: { ...order.current.coupon },
          total: total,
        };
      
        event.update(options);
      };
    }

    walletOptions.onNonce = async (event) => {
      if (event.source === "google_pay") {
        console.log("GOOGLE PAY TOKEN RECEIVED", event);
      }

      if (event.source === "apple_pay") {
        console.log("APPLE PAY TOKEN RECEIVED", event);
      }

      if (event.source === "paze") {
        console.log("PAZE WALLET TOKEN RECEIVED", event);
      }

      try {
        const data = {
          nonce: event.nonce,
          emailAddress: event.billingAddress?.emailAddress,
        };

        await Promise.resolve(onNonce(data, walletOptions));
        // setLoading(false);
        event.complete();
      } catch(error) {
        if (setLoading) {
          setLoading(false);
        }

        if (event.source === "paze" && error?.message) {
          if ($("#__react-alert__ span").text() === error.message) {
            return;
          }
  
          alert.error(error.message);
        }

        event.complete({ error });
      }
    };

    async function init() {
      if (options.paymentMethods?.card) {
        paymentForm.current = collect.createPaymentForm({
          ...constants.poyntCollect,
          onError,
          onNonce: onCollectNonce,
        });
        console.log('paymentForm: ', paymentForm);

        await paymentForm.current.mount({elementId: collectId});
      }

      if (
        options.paymentMethods?.applePay ||
        options.paymentMethods?.googlePay ||
        options.paymentMethods?.paze
      ) {
        wallets.current = collect.createWallets(walletOptions);

        await wallets.current.mount({elementId: collectId});
      }

      setLoading(false);
    }

    init();

    // collect.current.on("wallet_button_click", (event) => {
    //   console.log("wallet_button_click", event);

    //   if (event.source === "paze") {
    //     setLoading(true);
    //   }
    // });

    // collect.current.on("close_wallet", (event) => {
    //   console.log('close_wallet', event);

    //   if (event.source === "paze") {
    //     setLoading(false);

    //     if (event.error?.message) {
    //       if ($("#__react-alert__ span").text() === event.error.message) {
    //         return;
    //       }
  
    //       alert.error(event.error.message);
    //     }
    //   }
    // });
    
    // collect.current.on("nonce", async (event) => {
    //   try {
    //     await Promise.resolve(onNonce(event.data, walletOptions));
    //     setButtonLoading(false);
    //   } catch(error) {
    //     setButtonLoading(false);
    //     console.log(error);
    //   }
    // });

    // collect.current.on("error", (event) => {
    //   console.log("error", event);

    //   const error = parseMesasge(event);

    //   if (error) {
    //     if (error.type === 'WARN') {
    //       return alert.info(error.message);
    //     }

    //     setButtonLoading(false);

    //     if ($("#__react-alert__ span").text() === error.message) {
    //       return;
    //     }

    //     alert.error(error.message);
    //   }
    // });

    return () => {
      paymentForm.current?.unmount();
      paymentForm.current = null;
      wallets.current?.unmount();
      wallets.current = null;
    };
  }, [
    orderLoaded,
    collectId,
    options.paymentMethods?.card,
    options.paymentMethods?.applePay,
    options.paymentMethods?.googlePay,
    options.requireEmail,
    options.requirePhone,
    options.requireShippingAddress,
    options.supportCouponCode,
    setLoading,
    alert,
    onNonce
  ]);

  const button = (
    <Button 
      className="bg-green-500 px-16 w-full py-2 rounded-md m-2 font-bold text-md order-2 sm:w-auto" 
      loading={buttonLoading} 
      onClick={() => getNonce()}
      id={collectId + "_button"}
    >
      Pay with card
    </Button>
  );

  return ( 
    <div id={collectId} className="poynt-collect flex flex-wrap justify-end max-w-90 collect-wallet:w-full sm:collect-wallet:w-auto">
      {options.paymentMethods?.card ? button : null}
    </div>
  );
};

export default PoyntCollect;
