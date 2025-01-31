// const fonts = '"GD Sherpa", "objektiv-mk2", "Proxima Nova", "Myriad Pro", -apple-system, Helvetica';

const constants = {
  poyntCollect: {
    businessId: "01776564-e3e2-45ea-8f5d-db2440ed4ba8", //DEV
    // businessId: "f5c16fe7-be6e-4fac-98fa-6174fa518491", // DEV (DENYS USENKO BUSINESS)
    // businessId: "f36d3d71-5249-45c5-9104-38b07fe84f30", //TEST US
    // businessId: "ee606574-dcb8-4805-9461-f823081d2737", //TEST CA
    // businessId: "f36d3d71-5249-45c5-9104-38b07fe84f30", //OTE
    applicationId: "urn:aid:9c2cc0f7-e2ed-4617-b57c-88dd0b36c3d8", //DEV
    // applicationId: "urn:aid:0568c0f5-aaef-4114-8d9e-7d4abe4eac40", // DEV (DENYS USENKO BUSINESS)
    // applicationId: "urn:aid:8f0096f7-fd60-4fb4-8eae-51ec75739866", //TEST
    // applicationId: "urn:aid:b666c3a2-ccc3-4acb-a166-eb905258f42b", //OTE
    // applicationId: "urn:aid:postman-runner",
    // applicationId: "urn:aid:poynt.net",
    merchantName: "GD Test Merchant",
    country: "US",
    currency: "USD",
    locale: "en-CA",
    enableReCaptcha: true,
    reCaptchaOptions: {
      type: "TEXT",
    },
    inlineErrors: true,
    enableCardOnFile: true,
    forceSaveCardOnFile: false,
    cardAgreementOptions: {
      // templateType: "INSTANT_PAYOUT",
      businessName: "GoDaddy",
      businessWebsite: "https://www.godaddy.com/",
      businessPhone: "(555) 555-5555",
      style: {
        agreementContainer: {
          "color": '#111111',
          "font-family": '"GD Sherpa", "objektiv-mk2", "Proxima Nova", "Myriad Pro", -apple-system, Helvetica',
        },
        businessPhoneText: {
          'font-weight': '600',
        },
      },
    },
    // savedCards: [
    //   {
    //     id: "1",
    //     type: "VISA",
    //     numberLast4: "4412",
    //     expirationMonth: "01",
    //     expirationYear: "2023",
    //     cardHolderFirstName: "Harry",
    //     cardHolderLastName: "Potter",
    //   },
    //   {
    //     id: "2",
    //     type: "MAESTRO",
    //     numberLast4: "0044",
    //     expirationMonth: 12,
    //     expirationYear: 2024,
    //     cardHolderFirstName: "Ron",
    //     cardHolderLastName: "Weasley",
    //   },
    //   {
    //     id: "3",
    //     type: "UNIONPAY",
    //     numberLast4: "0000",
    //     expirationMonth: 12,
    //     expirationYear: 2024,
    //     cardHolderFirstName: "Hermione",
    //     cardHolderLastName: "Granger",
    //   },
    //   {
    //     id: "4",
    //     type: "MASTERCARD",
    //     numberLast4: "5456",
    //     expirationMonth: 12,
    //     expirationYear: 2024,
    //     cardHolderFirstName: "Lord",
    //     cardHolderLastName: "Voldemort",
    //   },
    // ],
    displayComponents: {
      paymentLabel: true,
      labels: true,
      // firstName: true,
      // lastName: true,
      // emailAddress: true,
      // phone: true,
      zipCode: true,
      line1: true,
      line2: true,
      city: true,
      territory: true,
      countryCode: true,
      ecommerceFirstName: true,
      ecommerceLastName: true,
      ecommerceEmailAddress: true,
      // submitTokenButton: true,
      // collectShippingAddress: true,
      // shippingLine1: true,
      // shippingLine2: true,
      // shippingCity: true,
      // shippingTerritory: true,
      // shippingZip: true,
      securePaymentNote: true,
    },
    additionalFieldsToValidate: [
      // "zipCode",
      "firstName",
      "lastName",
      "emailAddress",
      "line1",
      // "line2",
      "city",
      "territory",
      "countryCode",
      "phone",
      // "shippingLine1",
      // "shippingLine2",
      // "shippingCity",
      // "shippingTerritory",
      // "shippingZip"
    ],
    fields: {
      firstName: "Susie",
      lastName: "Hickle",
      emailAddress: "test@test.test",
      phone: "(514) 842-1336",
      zipCode: "H2L 2G8",
      line1: "1171 Rue Sainte-Catherine Est",
      city: "Montréal",
      territory: "Quebec",
      countryCode: "CA",
    },
    style: {
      theme: "paylink",
    },
    iFrame: {
      width: "100%",
      height: "425px",
      border: "0px",
    },
    customCss: {
      container: `
        color: #111111;
        font-family: "GD Sherpa", "objektiv-mk2", "Proxima Nova", "Myriad Pro", -apple-system, Helvetica;
        height: auto;
        flex-flow: row wrap;
        justify-content: normal;
        align-content: center;
        gap: 2%;
        width: 520px;
        margin: 0 auto;
      `,
    },
    // customCss: {
    //   container: {
    //     color: "#111",
    //     "font-family": "Roboto, sans-serif",
    //     "height": "auto",
    //     "flex-flow": "row wrap",
    //     "justify-content": "normal",
    //     "align-content": "center",
    //     "margin": "0 auto",
    //   },
    //   inputLabel: {
    //     "color": "#111",
    //     "display": "block",
    //     "font-size": "15px",
    //     "font-weight": "700",
    //     "line-height": "20px",
    //     "margin-bottom": "7.5px",
    //     "margin-top": "5px",
    //     "text-transform": "capitalize",
    //     "letter-spacing": "0px",
    //   },
    //   inputDefault: {
    //     "color": "#111",
    //     "font-family": "Roboto, sans-serif",
    //     "font-size": "15px",
    //     "line-height": "20px",
    //   },
    //   inputErrored: {
    //     "border": "1px solid #b61717"
    //   },
    //   sectionLabel: {
    //     "font-size": "13px",
    //     "line-height": "18px",
    //     "font-weight": "500",
    //     "letter-spacing": "0.5px",
    //     "color": "#767676",
    //     "text-transform": "uppercase",
    //     "margin-top": "15px",
    //     "margin-bottom": "10px",
    //     "padding-left": "0px",
    //     "padding-right": "0px",
    //   },
    //   requiredMark: {
    //     "color": "#ae1302",
    //     "font-size": "15px",
    //     "line-height": "20px",
    //     "margin-left": "3px",
    //   },
    //   rowFirstName: {
    //     "width": "50%",
    //     "padding-left": "0px",
    //     // "order": "1",
    //   },
    //   rowLastName: {
    //     "width": "50%",
    //     "padding-right": "0px",
    //     // "order": "1",
    //   },
    //   rowCardNumber: {
    //     "width": "75%",
    //     "padding-left": "0px",
    //     // "order": "1",
    //   },
    //   rowCVV: {
    //     "width": "35%",
    //     "padding-left": "0px",
    //     // "order": "1",
    //   },
    //   rowExpiration: {
    //     "width": "25%",
    //     "padding-right": "0px",
    //     // "order": "1",
    //   },
    //   rowZip: {
    //     "width": "65%",
    //     "padding-right": "0px",
    //     // "order": "1",
    //   },
    //   rowEmailAddress: {
    //     "width": "100%",
    //     "padding-left": "0px",
    //     "padding-right": "0px",
    //     // "order": "1",
    //   },
    //   rowAddress: {
    //     "width": "100%",
    //     "padding-left": "0px",
    //     "padding-right": "0px",
    //   },
    //   rowCity: {
    //     "width": "50%",
    //     "padding-left": "0px",
    //   },
    //   rowTerritory: {
    //     "width": "50%",
    //     "padding-right": "0px",
    //   },
    //   rowCountry: {
    //     "width": "50%",
    //     "padding-left": "0px",
    //   },
    //   rowPhone: {
    //     "width": "50%",
    //     "padding-left": "0px",
    //     "padding-right": "0px",
    //   },
    //   rowShippingZip: {
    //     "width": "100%",
    //     "padding-left": "0px",
    //     "padding-right": "0px",
    //   },
    //   rowSameAsBillingCheckbox: {
    //     "width": "100%",
    //     "padding-left": "0px",
    //     "padding-right": "0px",
    //   },
    //   cardOnFile: {
    //     container: {
    //       "width": "100%",
    //       "padding-left": "0px",
    //       "padding-right": "0px",
    //       "margin-left": "4px",
    //     },
    //     checkbox: {
    //       "width": "13px",
    //       "height": "13px",
    //     },
    //     label: {
    //       "font-size": "14px",
    //       "letter-spacing": "0.71px",
    //     },
    //     savedCards: {
    //       container: {},
    //       containerCard: {},
    //       containerNewCard: {},
    //       cardBox: {},
    //       cardBoxActive: {},
    //       cardBoxCheck: {},
    //       cardBoxCheckmark: {},
    //       cardBoxLogo: {},
    //       cardBoxContent: {},
    //       cardBoxTitle: {},
    //       cardBoxText: {},
    //       cardLogo: {},
    //       addNewCardBox: {},
    //       addNewCardBoxIcon: {},
    //       addNewCardBoxText: {},
    //     }
    //   },
    //   // reCaptcha: {
    //   //   text: {
    //   //     "font-size": "20px",
    //   //   }
    //   // },
    // },
  },
};

export default constants;
