import $ from 'jquery';
import { useAlert } from 'react-alert';
import Button from 'react-bootstrap-button-loader';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import constants from '../lib/common/constants';
import { availableCouponCodes } from '../lib/common/data';
import { createOrder, buildLineItems, buildTotal, getShippingMethods } from '../lib/helpers/wallet';

const parseMesasge = (event) => {
  ///http request error
  if (event?.data?.developerMessage || event?.data?.message) {
    return {
      message: event.data.developerMessage || event.data.message,
      type: 'ERROR',
    };
  }

  if (event?.data?.error?.source === 'submit') {
    const message = event.data.error.message;

    if (event.data.error.type === 'card_on_file') {
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
  const collect = useRef();
  const order = useRef();

  const [orderLoaded, setOrderLoaded] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [savedCard, setSavedCard] = useState("");

  const getNonce = async () => {
    setButtonLoading(true);

    if (savedCard) {
      await Promise.resolve(onNonce(savedCard));
      setButtonLoading(false);

      return;
    }
  
    collect.current.getNonce({
      // firstName: "Ethan",
      // lastName: "Ledner",
      // emailAddress: "test2@test.test",
      // phone: "(978) 779-0200",
      // zipCode: "01740",
      // line1: "2566 Dow ST",
      // line2: "Box 168",
      // city: "Bolton",
      // territory: "Maine",
      // countryCode: "US",
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

    const walletRequest = {
      merchantName: "GoDaddy Merchant",
      country: constants.poyntCollect.country,
      currency: constants.poyntCollect.currency,
      lineItems: buildLineItems(order.current),
      total: buildTotal(order.current),
      requireEmail: options.requireEmail,
      requirePhone: options.requirePhone,
      requireShippingAddress: options.requireShippingAddress,
      supportCouponCode: options.supportCouponCode,
      couponCode: order.current.coupon,
      disableWallets: {
        applePay: !options.paymentMethods?.applePay,
        googlePay: !options.paymentMethods?.googlePay,
      },
    };

    collect.current = new window.TokenizeJs(
      constants.poyntCollect.businessId,
      constants.poyntCollect.applicationId,
      walletRequest
    );

    console.log('current collect instance: ', collect.current);
    window.poyntCollect = collect.current;

    (async () => {
      try {
        // const t0 = performance.now();

        const result = await collect.current.supportWalletPayments({
          // emailAddress: "pazesmangal@godaddy.com",
          // emailAddress: "dusenko@godaddy.com",
        });

        // const t1 = performance.now();
        // console.log(`supportWalletPayments execution took ${t1 - t0} milliseconds.`);

        if (!collect.current) {
          return;
        }

        const paymentMethods = [];

        if (options.paymentMethods?.card) {
          paymentMethods.push("card");
        }

        if (options.paymentMethods?.ach) {
          paymentMethods.push("ach");
        }

        if (options.paymentMethods?.paze && result.paze) {
          paymentMethods.push("paze");
        }
        
        if (options.paymentMethods?.applePay && result.applePay) {
          paymentMethods.push("apple_pay");
        }
        
        if (options.paymentMethods?.googlePay && result.googlePay) {
          paymentMethods.push("google_pay");
        }

        if (!paymentMethods.length) {
          return setLoading(false);
        }

        collect.current.mount(collectId, document, {
          ...constants.poyntCollect,
          paymentMethods: paymentMethods,
          buttonOptions: {
            color: "black",
            onClick: (event) => {
              console.log("ORDER", order.current);

              const update = {
                total: buildTotal(order.current),
                lineItems: buildLineItems(order.current),
                couponCode: { ...order.current.coupon },
              };

              if (event.source === "paze") {
                collect.current.startPazeSession(update);
              } else if (event.source === "apple_pay") {
                collect.current.startApplePaySession(update);
              } else {
                collect.current.startGooglePaySession(update);
              }
            },
          },
          pazeButtonOptions: {
            color: 'default',
          },
        });
      } catch(error) {
        console.log(error);
        setLoading(false);
      }
    })();

    collect.current.on("iframe_ready", () => {
      if (setLoading) {
        setLoading(false);
      }
    });

    collect.current.on("iframe_height_change", (event) => {
      console.log("iframe_height_change", event.data.height);
  
      if (event?.data?.height) {
        const iFrame = document.getElementById("poynt-collect-v2-iframe");
        iFrame.style.setProperty("height", event.data.height + 10 + "px");
      }
    });

    collect.current.on("card_on_file_card_select", (event) => {
      console.log("card_on_file_card_select", event.data.cardId);

      setTimeout(() => {
        document.getElementById(collectId + "_button")?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

      setSavedCard(event.data.cardId);
    });

    if (options.requireShippingAddress) {
      collect.current.on("shipping_address_change", (event) => {
        console.log("shipping_address_change", event);
        order.current.shippingCountry = event.shippingAddress.countryCode;
      
        if (order.current.shippingCountry === "US") {
          order.current.taxRate = 0.1;
        } else {
          order.current.taxRate = 0.3;
        }
      
        const shippingMethods = getShippingMethods(order.current);

        if (!shippingMethods?.length) {
          return event.updateWith({
            error: {
              code: "unserviceable_address",
              contactField: "country",
              message: "No shipping methods available for selected shipping address",
            }
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

        event.updateWith(options);

        // console.log("googlePayPaymentDataChangedHandler: wait 15 sec.");

        // setTimeout(() => {
        //   event.updateWith(options);
        // }, 15000);
      });
      
      collect.current.on("shipping_method_change", (event) => {
        console.log("shipping_method_change", event);
        const total = buildTotal(order.current, event.shippingMethod);
        const lineItems = buildLineItems(order.current, event.shippingMethod);
        
        const options = {
          lineItems: lineItems,
          total: total
        };
  
        event.updateWith(options);
      });
    }

    if (options.supportCouponCode) {
      collect.current.on("coupon_code_change", (event) => {
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
            const options = {
              error: {
                code: "invalid_coupon_code",
                message: "Coupon code " + event.couponCode + " does not exists", 
              }
            };
      
            return event.updateWith(options);
          }
      
          order.current.coupon = couponCode;
        }

        const shippingMethods = walletRequest.requireShippingAddress ? getShippingMethods(order.current) : null;
        const selectedShippingMethod = walletRequest.requireShippingAddress ? shippingMethods[0] : null;
        const total = buildTotal(order.current, selectedShippingMethod);
        const lineItems = buildLineItems(order.current, selectedShippingMethod);
          
        const options = {
          lineItems: lineItems,
          shippingMethods: shippingMethods,
          couponCode: { ...order.current.coupon },
          total: total,
        };
      
        event.updateWith(options);
      });
    }

    collect.current.on("wallet_button_click", (event) => {
      console.log("wallet_button_click", event);

      if (event.source === "paze") {
        setLoading(true);
      }
    });

    collect.current.on("close_wallet", (event) => {
      console.log('close_wallet', event);

      if (event.source === "paze") {
        setLoading(false);

        if (event.error?.message) {
          if ($("#__react-alert__ span").text() === event.error.message) {
            return;
          }
  
          alert.error(event.error.message);
        }
      }
    });

    collect.current.on("payment_method_selected", (event) => {
      console.log("payment_method_selected", event);
    });

    collect.current.on("payment_authorized", async (event) => {
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

        await Promise.resolve(onNonce(data, walletRequest));
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
    });
    
    collect.current.on("nonce", async (event) => {
      try {
        await Promise.resolve(onNonce(event.data, walletRequest));
        setButtonLoading(false);
      } catch(error) {
        setButtonLoading(false);
        console.log(error);
      }
    });

    collect.current.on("error", (event) => {
      console.log("error", event);

      const error = parseMesasge(event);

      if (error) {
        if (error.type === 'WARN') {
          return alert.info(error.message);
        }

        setButtonLoading(false);

        if ($("#__react-alert__ span").text() === error.message) {
          return;
        }

        alert.error(error.message);
      }
    });

    return () => {
      collect.current.unmount(collectId, document);
      collect.current = null;
    };
  }, [
    orderLoaded,
    collectId,
    options.paymentMethods?.card,
    options.paymentMethods?.ach,
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
      {(options.paymentMethods?.card || options.paymentMethods?.ach) ? button : null}
    </div>
  );
};

export default PoyntCollect;
