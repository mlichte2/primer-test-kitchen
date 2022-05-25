const defaultValue = `requestParams = {
  // see full list of possible params below
  // https://apiref.primer.io/reference/create_client_side_token_client_session_post
  orderId: "order-" + Math.random(),
  currencyCode: "USD",
  // amount: 2222, 
  customer: {
    emailAddress: "john@primer.io",
    billingAddress: {
      firstName: "John",
      lastName: "Doe",
      addressLine1: "2222 W Dickens Ave",
      addressLine2: "Unit 2",
      city: "Chicago",
      state: "IL",
      postalCode: "60647",
      countryCode: "US",
    },
  },
  order: {
    countryCode: "US",
    lineItems: [
      {
        itemId: "shoes-123",
        description: "Some nice shoes!",
        amount: 2222, // Amount should be in minor units!
        quantity: 1,
      },
    ],
  },
}










`;

let built = false;

const editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
  mode: "javascript",
  lineNumbers: true,
  autoCloseBrackets: true,
  matchBrackets: true,
  foldCode: true,
  theme: "dracula",
});
editor.setSize("800px", "650px");

editor.setValue(defaultValue);

// grabbing elements from DOM

const submitButton = document.getElementById("submit-button");
const versionDropDown = document.getElementById("sdk-version-input");
const apiCSS = document.getElementById("primer-css");
const apiCDN = document.getElementById("primer-script");

const convertStringToObject = (str) => {
  const code = eval(str);
  return code;
};

const changeCheckoutContainerBackground = () => {
  document.getElementById("checkout-container").style.backgroundColor = "white";
};

submitButton.addEventListener("click", async function (e) {
  let version = versionDropDown.value;
  apiCSS.setAttribute(
    "href",
    `https://sdk.primer.io/web/${version}/Checkout.css`
  );
  apiCDN.setAttribute(
    "src",
    `https://sdk.primer.io/web/${version}/Primer.min.css`
  );
  console.log(apiCDN, apiCSS);
  e.preventDefault();
  if (built) {
    const checkoutContainer = document.getElementById("checkout-container");
    checkoutContainer.innerHTML = "";
  }
  const stringFromEditor = editor.getValue();
  const obj = convertStringToObject(stringFromEditor);
  const response = await fetch("/client-session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Version": "2021-10-19",
    },
    body: JSON.stringify(obj),
  }).then((data) => data.json());
  changeCheckoutContainerBackground();
  buildPrimer(response);
});

const buildPrimer = async (clientSession) => {
  console.log("Client Session:", clientSession);

  const { clientToken } = clientSession;

  console.log(clientToken);

  const universalCheckout = await Primer.showUniversalCheckout(clientToken, {
    container: "#checkout-container",
    onCheckoutComplete({ payment }) {
      console.log("Checkout Complete!", payment);
    },
    onCheckoutFail(error, { payment }, handler) {
      if (!handler) {
        return;
      }
      console.log(error);
      return handler.showErrorMessage(error);
    },
  });
  built = true;
};
