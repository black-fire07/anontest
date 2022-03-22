import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import {
  chainID,
  StakeAddress,
  abi,
  tokenabi,
  TokenAddress,
  busdabi,
  BusdAddress,
  pairAddress,
} from "./helper";
import Web3Modal from "web3modal";
import Web3 from "web3";
import WalletConnectProvider from "@walletconnect/web3-provider";
import logo from "./AT logo - Green.png";
import Stacked from "./components/stacked";
import "./styles/stacked.css";
import truncate from "./truncate";

const NULL = "0x0000000000000000000000000000000000000000";

function separator(numb) {
  var str = numb.toString().split(".");
  str[0] = str[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return str.join(".");
}

function App() {
  const [Hello, setHello] = useState({});
  const [address, setaddress] = useState(NULL);
  const [chainid, setchainId] = useState(0);
  const [Total_supply, setTotal_supply] = useState(0);
  const [Token, setToken] = useState({});
  const [Pool, setPool] = useState({});
  const [userInfo, setuserInfo] = useState({});
  const [claim, setclaim] = useState(0);
  const [active, setactive] = useState(false);
  const [stk, setstk] = useState(0);
  const [unstk, setunstk] = useState(0);
  const [contribution, setcontribution] = useState(0);
  const [depositfee, setdepositfee] = useState(0);
  const [withdrawfee, setwithdrawfee] = useState(0);
  const [Tvl, setTvl] = useState(0);
  const contain = useRef(null);
  const [busd, setbusd] = useState({});
  const [price, setprice] = useState(0);
  const [web3, setWeb3] = useState();
  const [provider, setProvider] = useState();
  const [status, setStatus] = useState({
    msg: "",
    link: "",
  });

  useEffect(() => {
    if (active) {
      connect();
    }
  }, [active]);

  const connect = async () => {
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          infuraId: "95168f0090b54934abd853d9fd8c22cc",
          rpc: {
            56: "https://bsc-dataseed.binance.org/",
          },
          chainId: 56,
        },
      },
    };
    const web3Modal = new Web3Modal({
      cacheProvider: false,
      providerOptions,
    });
    const provider_ = await web3Modal.connect();
    setProvider(provider_);
  };

  const fetchAccount = async () => {
    const accounts = await new web3.eth.getAccounts();
    setaddress(accounts[0]);
  };

  useEffect(() => {
    if (provider) setWeb3(new Web3(provider));
  }, [provider]);

  useEffect(() => {
    if (address && web3 && provider) {
      loadBlockdat();
    }
  }, [address, web3, provider]);

  useEffect(() => {
    if (web3 && provider) {
      fetchAccount();
    }
  }, [provider, web3]);

  const loadBlockdat = async () => {
    console.log(provider);
    console.log("Web3 instance is", web3);
    let chain;
    await web3.eth.getChainId().then((values) => {
      setchainId(values);
      chain = values;
    });

    if (chain === chainID) {
      console.log("yes");
      const Hell = new web3.eth.Contract(abi, StakeAddress);
      setHello(Hell);
      const token = new web3.eth.Contract(tokenabi, TokenAddress);
      setToken(token);
      const busd_ = new web3.eth.Contract(busdabi, BusdAddress);
      setbusd(busd_);
      const pool = await Hell.methods.poolInfo(0).call();
      setPool(pool);
      const userinfo = await Hell.methods.users(0, address).call();
      setuserInfo(userinfo);
      const can_claim = await Hell.methods._payout(0, address).call();
      setclaim(can_claim);

      const tvl = await token.methods.balanceOf(StakeAddress).call();
      setTvl(parseFloat(tvl / 1e9));

      const busdhold = await busd_.methods.balanceOf(pairAddress).call();
      const pairtokenbal = await token.methods.balanceOf(pairAddress).call();
      let busddec = parseFloat(busdhold / 1e18).toFixed(2);
      let pt = parseFloat(pairtokenbal / 1e9).toFixed(2);
      let price_ = parseFloat(busddec / pt).toFixed(3);
      let tvl_ = parseFloat(tvl / 1e9).toFixed(2);
      setprice(tvl_ * price_);

      const depFee = await Hell.methods.depositFee().call();
      setdepositfee(depFee);

      const withFee = await Hell.methods.withdrawFee().call();
      setwithdrawfee(withFee);

      setcontribution(parseFloat(pool.minContrib / 1e9).toFixed(0));
      const bal = await token.methods.balanceOf(address).call();
      setTotal_supply(parseFloat(bal / 1e9));

      setTimeout(async () => {
        const pool = await Hell.methods.poolInfo(0).call();
        setPool(pool);
        const userinfo = await Hell.methods.users(0, address).call();
        setuserInfo(userinfo);
        setcontribution(parseFloat(pool.minContrib / 1e9).toFixed(0));

        const bal = await token.methods.balanceOf(address).call();
        setTotal_supply(parseFloat(bal / 1e9));
      }, 25000);
    } else {
      setactive(false);
      alert("Connect to Bsc");
    }
    return;
  };

  setInterval(async () => {
    if (
      Hello.methods !== undefined &&
      busd.methods !== undefined &&
      Token.methods !== undefined &&
      address !== "0x0000000000000000000000000000000000000000"
    ) {
      const can_claim = await Hello.methods._payout(0, address).call();
      setclaim(can_claim);

      const tvl = await Token.methods.balanceOf(StakeAddress).call();
      setTvl(parseFloat(tvl / 1e9));

      const busdhold = await busd.methods.balanceOf(pairAddress).call();
      const pairtokenbal = await Token.methods.balanceOf(pairAddress).call();
      let busddec = parseFloat(busdhold / 1e18).toFixed(2);
      let pt = parseFloat(pairtokenbal / 1e9).toFixed(2);
      let price_ = parseFloat(busddec / pt).toFixed(3);
      let tvl_ = parseFloat(tvl / 1e9).toFixed(2);
      setprice(tvl_ * price_);
    }
  }, 10000);

  const unStake1 = async (amount) => {
    // amount = Math.floor(amount)
    console.log(amount);
    amount = amount * 10 ** 9;
    try {
      await Hello.methods
        .unStake(0, amount)
        .send({ from: address, gasLimit: 1000000 })
        .on("transactionHash", (hash) => {
          loadBlockdat();
        });
    } catch (err) {
      console.log("tx rejected");
    }
  };

  const Stake1 = async (amount) => {
    if (!web3 || !provider) return;
    let num = parseFloat(amount);
    amount = amount * 10 ** 9;

    let allow;
    let userallowance;
    let busdAllowance;
    if (num >= contribution) {
      allow = amount;
      console.log("clicked", amount);

      await Token.methods
        .allowance(address, StakeAddress)
        .call()
        .then((val) => {
          userallowance = val;
        });

      await busd.methods
        .allowance(address, StakeAddress)
        .call()
        .then((val) => {
          busdAllowance = val;
        });

      const maxApproval = Web3.utils.toBN(
        "115792089237316195423570985008687907853269984665640564039457584007913129639935"
      );

      try {
        if (allow > Number(busdAllowance) || allow > Number(userallowance)) {
          if (allow > Number(busdAllowance)) {
            await busd.methods
              .approve(StakeAddress, maxApproval)
              .send({ from: address })
              .on("transactionHash", (hash) => {
                setStatus({
                  msg: `Sending approval for BUSD. Click here to see the tx`,
                  link: `https://bscscan.com/tx/${hash}`,
                });
              });
          }

          if (allow > Number(userallowance)) {
            await Token.methods
              .approve(StakeAddress, maxApproval)
              .send({ from: address })
              .on("transactionHash", (hash) => {
                setStatus({
                  msg: `Sending approval for ANON Token. Click here to see the tx`,
                  link: `https://bscscan.com/tx/${hash}`,
                });
              });
          }
          allow = allow + "000000000000000000";
          await Hello.methods
            .stake(0, amount)
            .send({ from: address, gasLimit: 1000000 })
            .on("transactionHash", (hash) => {
              loadBlockdat();
              setStatus({
                msg: `Sending staking request. Click here to see the tx`,
                link: `https://bscscan.com/tx/${hash}`,
              });
            });
        } else {
          await Hello.methods
            .stake(0, amount)
            .send({ from: address, gasLimit: 1000000 })
            .on("transactionHash", (hash) => {
              loadBlockdat();
              setStatus({
                msg: `Sending staking request. Click here to see the tx`,
                link: `https://bscscan.com/tx/${hash}`,
              });
            });
        }
      } catch (err) {
        console.log(err);
      }
    } else {
      alert(`Minimum staking amount is ${contribution} ANON`);
    }
  };

  const claim_t = async () => {
    try {
      await Hello.methods
        .claim(0)
        .send({ from: address })
        .on("transactionHash", (hash) => {
          loadBlockdat();
        });
    } catch (err) {
      console.log("tx rejected");
      return;
    }
  };
  const [togle, setTogle] = useState(false);

  useEffect(() => {
    const canvas = contain.current;
    const ctx = canvas.getContext("2d");
    const w = (canvas.width = document.body.offsetWidth);
    const h = (canvas.height = document.body.offsetHeight);
    const cols = Math.floor(w / 20) + 1;
    const ypos = Array(cols).fill(0);

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);

    const matrix = () => {
      ctx.fillStyle = "#0001";
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = "#0f0";
      ctx.font = "16px courier";

      ypos.forEach((y, ind) => {
        // const text = String.fromCharCode(Math.random() * 128);
        const text = Math.round(Math.random()).toString();
        const x = ind * 20;
        ctx.fillText(text, x, y);
        if (y > 100 + Math.random() * 10000) ypos[ind] = 0;
        else ypos[ind] = y + 20;
      });
    };
    setInterval(matrix, 50);
  }, []);

  useEffect(() => {
    const open = document.getElementById("hamburger");
    let changeIcon = true;

    open.addEventListener("click", function () {
      const overlay = document.querySelector(".overlay");
      const nav = document.querySelector("nav");
      const icon = document.querySelector(".menu-toggle .icon");
      overlay.classList.toggle("menu-open");
      nav.classList.toggle("menu-open");

      if (changeIcon) {
        icon.classList.remove("fa-bars");
        icon.classList.add("fa-times");

        changeIcon = false;
      } else {
        changeIcon = true;
      }
    });
  }, []);

  const potentialEarnings =
    (userInfo.total_invested / 1e9) * (Pool.apy / 10 / 100);
  return (
    <>
      <div className="App" style={{ backgroundColor: "color" }}>
        <div className="hamb">
          <div className="hamb1">ANONTOKEN:$</div>
          <div classname="hamb2" onClick={() => setTogle(!togle)}>
            {togle == false ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                style={{ width: "100%", height: 24 }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            ) : (
              <span style={{ fontWeight: "bolder" }}>X</span>
            )}
          </div>
        </div>
        <header>
          <div className="menu-toggle hide" id="hamburger">
            {/* <div className="icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                style={{ width: "100%", height: 24 }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </div> */}
          </div>
          <div className="overlay"></div>
          <div className={`containers`}>
            <nav>
              <ul>
                <li>
                  <a target="_blank" href="https://anontoken.com">
                    ANONTOKEN:$
                  </a>
                </li>
                <li>
                  <a target="_blank" href="https://anontoken.com/#about">
                    /about
                  </a>
                </li>
                <li>
                  <a target="_blank" href="https://anontoken.com/#tokenomics">
                    /tokenomics
                  </a>
                </li>

                <li>
                  <a target="_blank" href="https://anontoken.com/#roadmap">
                    /roadmap
                  </a>
                </li>
                <li>
                  <a target="_blank" href="https://anontoken.com/catalog.html">
                    /nft-Catalog
                  </a>
                </li>
                <li>
                  <a target="_blank" href="https://t.me/AN0NTOKEN">
                    /telegram
                  </a>
                </li>
                <li>
                  <a
                    target="_blank"
                    href="https://www.instagram.com/anontoken/"
                  >
                    /instagram
                  </a>
                </li>
                <li>
                  <a target="_blank" href="https://twitter.com/anon_token">
                    /twitter
                  </a>
                </li>
                <li>
                  <a target="_blank" href="https://www.facebook.com/anonews.co">
                    /facebook
                  </a>
                </li>
                <li>
                  <a
                    target="_blank"
                    href="https://drive.google.com/file/d/1U3fxsCO61FuqVe5sk5oRF2HnBKD76QCa/view"
                  >
                    /greenpaper
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </header>
        <div className={`${togle == true ? "aswa" : "aswahide"}`}>
          <ul className="urls">
            {/* <li>
              <a target="_blank" href="https://anontoken.com">
                ANONTOKEN:$
                </a>
            </li> */}
            <li>
              <a target="_blank" href="https://anontoken.com/#about">
                /about
              </a>
            </li>
            <li>
              <a target="_blank" href="https://anontoken.com/#tokenomics">
                /tokenomics
              </a>
            </li>

            <li>
              <a target="_blank" href="https://anontoken.com/#roadmap">
                /roadmap
              </a>
            </li>
            <li>
              <a target="_blank" href="https://anontoken.com/catalog.html">
                /nft-Catalog
              </a>
            </li>
            <li>
              <a target="_blank" href="https://t.me/AN0NTOKEN">
                /telegram
              </a>
            </li>
            <li>
              <a target="_blank" href="https://www.instagram.com/anontoken/">
                /instagram
              </a>
            </li>
            <li>
              <a target="_blank" href="https://twitter.com/anon_token">
                /twitter
              </a>
            </li>
            <li>
              <a target="_blank" href="https://www.facebook.com/anonews.co">
                /facebook
              </a>
            </li>
            <li>
              <a
                target="_blank"
                href="https://drive.google.com/file/d/1U3fxsCO61FuqVe5sk5oRF2HnBKD76QCa/view"
              >
                /greenpaper
              </a>
            </li>
          </ul>
        </div>

        <section
          id="hero"
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            flexDirection: "column",
            paddingBottom: "0px",
          }}
        >
          <div className="top_bg" />
          <div className="top-section">
            <canvas
              id="canv"
              ref={contain}
              width="100%"
              height="100%"
              style={{ opacity: "0.7", marginTop: "-80px" }}
            />
            <div className="bot-bg" />
            <img
              className="back1"
              src={logo}
              alt="anontoken logo"
              style={{ marginTop: "5px", zIndex: 2, position: "inherit" }}
            />
            <div
              className="anon-logo"
              style={{
                marginBottom: "13px",
                zIndex: "1",
                // margin: "50px auto 100px auto",
                color: "#03ba03",
                fontWeight: "900",
                fontSize: "30px",
                fontFamily: "AnonToken",
              }}
            >
              ANONTOKEN STAKING PROTOCOL
            </div>
          </div>
          <div
            className="cover-matrix"
            style={{ backgroundColor: "#000", width: "100%" }}
          >
            <div id="app" />
          </div>
        </section>
        {togle == false ? (
          <>
            <div
              className="anon_mid"
              style={{
                marginTop: "-10px",
                position: "relative",
                color: "green",
                width: "auto",
              }}
            >
              <button onClick={() => setactive(true)} className="stacked_btn">
                {address !== NULL ? truncate(address) : "CONNECT"}
              </button>
            </div>
          </>
        ) : null}
      </div>
      {togle == false ? (
        <div className="stacked">
          <Stacked
            Stake1={Stake1}
            claim_t={claim_t}
            unStake1={unStake1}
            Pool={Pool}
            claim={claim}
            userInfo={userInfo}
            Total_supply={Total_supply}
          />
        </div>
      ) : null}

      {/* <div
        className="anon_mid"
        style={{
          display: "flex",
          marginTop: "-10px",
          position: "relative",
          color: "green",
          justifyContent: "center",
          marginBottom: "50px",
          width: "auto",
        }}
      >
        <div
          id="total-value-staked"
          style={{ display: "flex", background: "rgba(11, 12, 17, 0.7)" }}
        >
          Total Value Locked (TVL): {separator((Tvl || 0).toFixed(2))} AT/$
          {separator((price || 0).toFixed(2))}
        </div>
      </div> */}
      {/* <div
        className="anon_mid"
        style={{
          display: "flex",
          marginTop: "-10px",
          position: "relative",
          color: "green",

          justifyContent: "center",
          marginBottom: "50px",
        }}
      >
        <div className="anon_left">
          <p
            className="ja"
            style={{
              marginTop: "15px",
              fontWeight: "bold",
              fontSize: "20px",
              margin: "0px",
              paddingTop: "5px",
            }}
          >
            STAKING CALCULATOR
          </p>
          <div className="anon_leftin">
            <div className="inside">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  margin: "20px 28px",
                  width: "140px",
                }}
              >
                <span className="ima">STAKING AMOUNT</span>
                <span
                  style={{
                    border: "2px solid green",
                    padding: "1.5px",
                    borderRadius: "4px",
                  }}
                >
                  {parseFloat((userInfo.total_invested || 0) / 1e9).toFixed(2)}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  margin: "15px 28px",
                  width: "140px",
                }}
              >
                <span className="ima">STAKING FEES</span>
                <span
                  style={{
                    border: "2px solid green",
                    padding: "1.5px",
                    borderRadius: "4px",
                  }}
                >
                  {parseFloat(depositfee / 1e18).toFixed(2)} BUSD
                </span>
              </div>
            </div>
            <div className="inside">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  margin: "15px 28px",
                  width: "140px",
                  marginTop: "18px",
                }}
              >
                <span className="ima">STAKING TIME</span>
                <span
                  style={{
                    border: "2px solid green",
                    padding: "1.5px",
                    borderRadius: "4px",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  {Pool.lockPeriodInDays} DAY
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  margin: "15px 28px",
                  width: "140px",
                  marginTop: "22px",
                }}
              >
                <span className="ima">APY IN %</span>
                <span
                  style={{
                    border: "2px solid green",
                    padding: "1.5px",
                    borderRadius: "4px",
                  }}
                >
                  {(Pool.apy || 0) / 10}
                </span>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              // margin: "15px 28px",
              alignItems: "center",
            }}
          >
            <span className="ima">POTENTIAL EARNINGS</span>
            <span
              style={{
                border: "2px solid green",
                width: "45%",
                padding: "1.5px",
                borderRadius: "4px",
              }}
            >
              {parseFloat(potentialEarnings || 0).toFixed(2)}
            </span>
          </div>
        </div>
        <div className="anon_right">
          <p
            className="ka"
            style={{ marginTop: "15px", fontWeight: "bold", fontSize: "20px" }}
          >
            STAKING PROTOCOL
          </p>

          <div
            className="kwa"
            style={{
              display: "flex",
              flexDirection: "column",
              borderRadius: "2px",
              marginTop: "15px",
              marginBottom: "15px",
              paddingTop: "60px",
              // backgroundColor: "rgba(11, 12, 17, 0.7)",
            }}
          >
            {status.msg.length > 0 && (
              <p>
                <a href={status.link} target="_blank">
                  {status.msg}
                </a>
              </p>
            )}

            <span className="ima">STAKE ANONTOKEN</span>
            <div>
              <span
                style={{
                  border: "3px solid green",
                  borderRadius: "4px",
                  padding: "3px",
                }}
              >
                <input
                  className="anon_input"
                  type="number"
                  value={stk === 0 ? null : stk}
                  placeholder="Enter Amount"
                  onChange={(event) => {
                    setstk(event.target.value);
                  }}
                  style={{
                    outline: "none",
                    border: "none",
                  }}
                />
                <span
                  style={{
                    marginLeft: "-32px",
                    zIndex: "1",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setstk(Total_supply.toFixed(2));
                  }}
                >
                  MAX
                </span>
              </span>
              <button
                className="anon_button"
                onClick={() => {
                  Stake1(stk);
                }}
              >
                STAKE
              </button>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              borderRadius: "2px",
              marginTop: "15px",
              marginBottom: "15px",
              // backgroundColor: "rgba(11, 12, 17, 0.6)",
            }}
          >
            <span className="ima">UNSTAKE ANONTOKEN</span>
            <div>
              <span
                style={{
                  border: "3px solid green",
                  borderRadius: "4px",
                  padding: "3px",
                }}
              >
                <input
                  className="anon_input"
                  type="number"
                  value={unstk === 0 ? null : unstk}
                  placeholder="Enter Amount"
                  onChange={(event) => {
                    setunstk(event.target.value);
                  }}
                  style={{
                    outline: "none",
                    border: "none",
                  }}
                />
                <span
                  style={{
                    marginLeft: "-32px",
                    zIndex: "1",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setunstk(
                      parseFloat(userInfo.total_invested / 1e9).toFixed(2)
                    );
                  }}
                >
                  MAX
                </span>
              </span>
              <button
                className="anon_button"
                onClick={() => {
                  unStake1(unstk);
                  console.log(unstk);
                }}
              >
                UNSTAKE
              </button>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              borderRadius: "2px",
              marginTop: "15px",
              marginBottom: "15px",
              // backgroundColor: "rgba(11, 12, 17, 0.6)",
            }}
          >
            <span className="ima">CLAIM ANONTOKEN</span>
            <div>
              <span
                style={{
                  border: "3px solid green",
                  borderRadius: "4px",
                  padding: "3px",
                }}
              >
                <input
                  className="anon_input"
                  type="number"
                  value={parseFloat(claim / 1e9).toFixed(2)}
                  placeholder="Enter Amount"
                  disabled={true}
                  style={{
                    outline: "none",
                    border: "none",
                  }}
                />
              </span>
              <button
                className="anon_button"
                onClick={() => {
                  claim_t();
                }}
              >
                CLAIM
              </button>
            </div>
          </div>
        </div>
      </div> */}
      {/* <div
        className="anon_foot"
        style={{ color: "green", paddingBottom: "20px" }}
      >
        <span>|</span>
        <a
          target="_blank"
          href="https://drive.google.com/file/d/1M6fSga5Ozxb41vEI92exubKL8w8eVwcz/view"
        >
          HOW TO STAKE
        </a>
        <span>|</span>
      </div> */}
    </>
  );
}

export default App;
