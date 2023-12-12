const routerContract = "0x09bD2A33c47746fF03b86BCe4E885D03C74a8E8C";
const EthToken = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
const MPEthToken = "0x60B42e0DE164d18fE6822C115DAf2e0F18867aE7";

State.init({ tokenSelected: 0, tokenTo: EthToken });

const routerAbi = fetch(
  "https://raw.githubusercontent.com/yaairnaavaa/Maverick/main/ArbitrumSushiSwapRouter.txt"
);

if (!routerAbi.ok) {
  return "Loading";
}

const getNetwork = () => {
  Ethers.provider()
    .getNetwork()
    .then((res) => {
      if (res.chainId == ArbitrumChainId) {
        State.update({ isArbitrum: true });
      } else {
        switchNetwork(ArbitrumChainId);
      }
    });

  // get mpEth price
  asyncFetch("https://eth-metapool.narwallets.com/metrics_json")
    .then(({ body }) => State.update({ mpethPrice: body.mpethPrice }))
    .catch((err) => console.error(err));

  // get fee arbitrum chain
  asyncFetch(
    "https://arb-mainnet.g.alchemy.com/v2/iL1gKyTK1xYrk0cCrSC3lrbGOCVHN2tm",
    {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({ id: 1, jsonrpc: "2.0", method: "eth_gasPrice" }),
    }
  )
    .then(({ body }) => State.update({ gasFee: parseInt(body.result, 16) }))
    .catch((err) => console.error(err));
};

const switchNetwork = (chainId) => {
  Ethers.provider().send("wallet_switchEthereumChain", [
    { chainId: `0x${chainId.toString(16)}` },
  ]);
};

const swap = () => {
  let route =
    "0x0301ffff020109bd2a33c47746ff03b86bce4e885d03c74a8e8c82af49447d8a07e3bd95bd0d56f35241523fbab10182af49447d8a07e3bd95bd0d56f35241523fbab101ffff019c657a4140ed352f86dc6d3a8825991431db2201" +
    state.sender.substring(0, 1) +
    "0" +
    state.sender.substring(2);

  const router = new ethers.Contract(
    routerContract,
    routerAbi.body,
    Ethers.provider().getSigner()
  );

  let amountIn = ethers.utils.parseUnits(state.strEther, 18);

  const overrides = {
    value: amountIn,
    gasLimit: 2303039,
  };

  try {
    router
      .processRoute(
        EthToken,
        amountIn,
        MPEthToken,
        0,
        state.sender,
        route,
        overrides
      )
      .then((res) => {});
  } catch (err) {
    console.error(err);
  }
};

const unswap = () => {
  alert("coming soon!");
};

if (state.sender === undefined) {
  const accounts = Ethers.send("eth_requestAccounts", []);
  if (accounts.length) {
    State.update({ sender: accounts[0] });
    getNetwork();
  }
}

if (state.balance === undefined && state.sender) {
  Ethers.provider()
    .getBalance(state.sender)
    .then((balance) => {
      State.update({ balance: Big(balance).div(Big(10).pow(18)).toFixed(5) });
    });
}

/// set selected token
function handleSelect(event) {
  State.update({
    tokenSelected: Number(event.target.value),
    tokenTo: event.target.value === 0 ? EthToken : MPEthToken,
  });
}

/// calculate price
function getEqualPrice(value) {
  if (!value || !state.mpethPrice) return !state.sender ? "0" : "...";

  let result;
  if (state.tokenSelected == 0) result = value / state.mpethPrice;
  else result = value * state.mpethPrice;

  return result.toFixed(5);
}

// FETCH CSS
const cssFont = fetch(
  "https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600;700;800"
).body;
const css = fetch(
  "https://raw.githubusercontent.com/yaairnaavaa/Maverick/main/cssLido.css"
).body;

if (!cssFont || !css) return "no css";

if (!state.theme) {
  State.update({
    theme: styled.div`
      font-family: Manrope, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
      ${cssFont}
      ${css}
    `,
  });
}
const Theme = state.theme;

// OUTPUT UI
const getSender = () => {
    return !state.sender
      ? ""
      : state.sender.substring(0, 6) +
          "..." +
          state.sender.substring(state.sender.length - 4, state.sender.length);
  },
  mpEthIcon = (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="12" fill="#8A92B2" />
      <rect
        x="10.2856"
        y="5.98071"
        width="2.68085"
        height="2.68085"
        transform="rotate(-45 10.2856 5.98071)"
        fill="#0C2246"
      />
      <rect
        x="7.02734"
        y="8.90186"
        width="2.55319"
        height="7.16564"
        transform="rotate(-45 7.02734 8.90186)"
        fill="#0C2246"
      />
      <rect
        x="10.3672"
        y="12.2185"
        width="6.8083"
        height="2.55319"
        transform="rotate(-45 10.3672 12.2185)"
        fill="#0C2246"
      />
      <rect
        x="4.08496"
        y="11.8223"
        width="2.55319"
        height="11.2918"
        transform="rotate(-45 4.08496 11.8223)"
        fill="#0C2246"
      />
      <rect
        x="10.3262"
        y="18.0298"
        width="11.0548"
        height="2.55319"
        transform="rotate(-45 10.3262 18.0298)"
        fill="#0C2246"
      />
    </svg>
  ),
  ethIcon = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path
        opacity="0.6"
        d="M11.999 3.75v6.098l5.248 2.303-5.248-8.401z"
      ></path>
      <path d="M11.999 3.75L6.75 12.151l5.249-2.303V3.75z"></path>
      <path
        opacity="0.6"
        d="M11.999 16.103v4.143l5.251-7.135L12 16.103z"
      ></path>
      <path d="M11.999 20.246v-4.144L6.75 13.111l5.249 7.135z"></path>
      <path
        opacity="0.2"
        d="M11.999 15.144l5.248-2.993-5.248-2.301v5.294z"
      ></path>
      <path opacity="0.6" d="M6.75 12.151l5.249 2.993V9.85l-5.249 2.3z"></path>
    </svg>
  ),
  arrowIcon = (
    <svg
      width="16"
      height="12"
      viewBox="0 0 16 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        y="2.90039"
        width="4.10175"
        height="11.5117"
        rx="1.60652"
        transform="rotate(-45 0 2.90039)"
        fill="#0C2246"
      />
      <rect
        x="5.36572"
        y="8.22876"
        width="10.9377"
        height="4.10175"
        rx="1.60652"
        transform="rotate(-45 5.36572 8.22876)"
        fill="#0C2246"
      />
    </svg>
  );

return (
  <Theme>
    <div class="LidoContainer" style={{ marginBottom: "20px" }}>
      <div class="Header">Stake ETH-mpETH</div>
      <div class="SubHeader" style={{ color: "black", fontWeight: "bold" }}>
        Powered by&nbsp;
        <a target="_blank" href="https://www.metapool.app/">
          Meta Pool
        </a>
        &nbsp;&&nbsp;
        <a target="_blank" href="https://www.sushi.com/">
          Sushi Swap
        </a>
      </div>
      <div class="LidoForm">
        {state.sender && (
          <>
            <p>
              The price indicated below is a reference, to know the price in
              time. Really check out
              <a
                href="https://www.sushi.com/pool/42161:0x9C657a4140Ed352f86Dc6D3A8825991431dB2201/positions/7636"
                target="_blank"
                style={{ color: "#6c721c" }}
              >
                <strong>Sushi Swap</strong>
              </a>
            </p>

            <div class="LidoFormTopContainer">
              <div
                class="LidoFormTopContainerLeft"
                style={{ maxWidth: "max-content" }}
              >
                <div class="LidoFormTopContainerLeftContent1">
                  <div class="LidoFormTopContainerLeftContent1Container">
                    <span>Available to swap</span>
                    <div class="LidoFormTopContainerLeftContent1Circle" />
                  </div>
                </div>
                <div class="LidoFormTopContainerLeftContent2">
                  <span>
                    {state.balance ?? (!state.sender ? "0" : "...")}&nbsp;{}
                    {state.tokenSelected == 0 ? "ETH" : "mpETH"}
                  </span>
                </div>

                <span style={{ float: "right" }}>
                  ~ {getEqualPrice(state.balance)}{" "}
                  {state.tokenSelected == 0 ? "mpETH" : "ETH"}
                </span>
              </div>

              <div class="LidoFormTopContainerRight">
                <div class="LidoFormTopContainerRightContent1">
                  <div class="LidoFormTopContainerRightContent1Text">
                    <span style={{ color: "black" }}>
                      <b>Account:</b> {getSender()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div class="LidoSplitter" />
          </>
        )}
      </div>

      <div
        class="LidoStakeForm"
        style={{
          "--lidoFormHeight": state.sender ? "150px" : "32px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div class="LidoStakeFormInputContainer">
          <div class="customSelect">
            <select
              name="select"
              id="token"
              class="selectCSS"
              onChange={handleSelect}
            >
              <option value="0">ETH</option>
              <option value="1">mpETH</option>
            </select>

            {arrowIcon}
          </div>

          <div class="LidoStakeFormInputContainerSpan2">
            <div style={{ paddingLeft: "4px", paddingRight: "2px" }}>
              {state.tokenSelected == 0 ? ethIcon : mpEthIcon}
            </div>

            <input
              required
              disabled={!state.sender}
              class="LidoStakeFormInputContainerSpan2Input"
              value={state.strEther}
              type="number"
              onChange={(e) => State.update({ strEther: e.target.value })}
              placeholder="Amount"
            />
          </div>

          <span
            class="LidoStakeFormInputContainerSpan3"
            onClick={() => {
              const balance = parseFloat(state.balance) - 0.0004;
              State.update({
                strEther: balance.toFixed(5).toString(),
              });
            }}
          >
            <button
              class="LidoStakeFormInputContainerSpan3Content"
              disabled={!state.sender}
            >
              <span class="LidoStakeFormInputContainerSpan3Max">MAX</span>
            </button>
          </span>
        </div>

        {!!state.sender ? (
          <>
            <span
              style={{
                marginTop: "8px",
              }}
            >
              Amount in {state.tokenSelected == 0 ? "mpETH" : "ETH"}
              {getEqualPrice(state.strEther)}
            </span>

            <span>Gas Fee {state.gasFee} wei</span>
          </>
        ) : null}

        {!!state.sender ? (
          <>
            {state.tokenSelected == 0 ? (
              /// Stake
              <button
                class="LidoStakeFormSubmitContainer"
                onClick={() => swap()}
              >
                <span>Stake</span>
              </button>
            ) : (
              /// Unstake
              <button
                class="LidoStakeFormSubmitContainer"
                style={{ backgroundColor: "#6c721c" }}
                onClick={() => unswap()}
              >
                <span>Unstake - Coming soon</span>
              </button>
            )}

            <div class="row">
              <div
                class="col-12"
                style={{
                  textAlign: "center",
                  color: "black",
                  marginTop: "5px",
                  fontWeight: "bold",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: "5px",
                  }}
                >
                  Running on &nbsp;
                  <a target="_blank" href="https://arbitrum.io/">
                    Arbitrum
                  </a>
                  &nbsp; for lower fees &nbsp;
                  <img
                    src="https://raw.githubusercontent.com/yaairnaavaa/Maverick/main/Arbitrum.png"
                    style={{ width: "20px" }}
                  ></img>
                </div>
              </div>
            </div>
          </>
        ) : (
          <Web3Connect
            className="LidoStakeFormSubmitContainer"
            connectLabel="CONNECT WITH WEB3"
          />
        )}
      </div>
    </div>

    {state.isArbitrum && state.sender && (
      <Widget
        src="owa-is-bos.near/widget/SwapETH-mpETH-Transactions"
        props={{
          state,
          handleReload: () => State.update({ reloadTransactions: false }),
        }}
      />
    )}
  </Theme>
);
