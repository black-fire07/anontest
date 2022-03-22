import React, { useState } from "react";
import { Modal } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";

const Stacked = ({
  Stake1,
  claim_t,
  unStake1,
  Pool,
  claim,
  userInfo,
  Total_supply,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalVisible2, setIsModalVisible2] = useState(false);
  const [unstake, setunstake] = useState(0);
  const [stake, setstake] = useState(0);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const showModal2 = () => {
    setIsModalVisible2(true);
  };

  const handleOk2 = () => {
    setIsModalVisible2(false);
  };

  const handleCancel2 = () => {
    setIsModalVisible2(false);
  };

  const period = (sec) => {
    let time = new Date(sec).toLocaleString();
    let finaltime = time.split(",");
    return finaltime[0];
  };
  period(1628618888939);

  return (
    <div className="stacked_container">
      <div className="stacked_box">
        <div className="stacked_box1">
          <h3 className="at">AT Staked</h3>
          <h1 className="atnumber">
            {userInfo.total_invested > 0
              ? parseFloat(userInfo.total_invested / 1e9).toFixed(2)
              : "00.00"}{" "}
            AT
          </h1>
          {/* <p className="max">MAX</p> */}
          <div className="btnflex">
            <div className="btnflex1">
              <button onClick={showModal} className="stacked_btn">
                Stake
              </button>
            </div>
            <div className="btnflex2">
              <button onClick={() => showModal2()} className="stacked_btn">
                Unstake
              </button>
            </div>
          </div>
        </div>
        <div className="stacked_box2">
          <h3 className="at">Rewards Earned</h3>
          <h1 className="atnumber">{parseFloat(claim / 1e9).toFixed(2)} AT</h1>
          {/* <p className="max">MAX</p> */}
          <button className="stacked_btn" onClick={() => claim_t()}>
            Claim All
          </button>
        </div>
      </div>
      <div className="stacked_gra">
        <h4 className="pool">Pool</h4>
        <div className="stacked_poolgra">
          <div className="box1">
            <h4 className="title">Pool Name</h4>
            <p className="poolbody">ANONTOKEN STAKING PROTOCOL</p>
          </div>
          <div className="box2">
            <h4 className="title">Total Value Locked</h4>
            <p className="poolbody2">1925425245.2653 AT</p>
            <p className="poolbody2">$912524245.792</p>
          </div>
          <div className="box3">
            <h4 className="title">Fixed APY</h4>
            <p className="poolbody">
              {Pool.apy > 0 ? Pool.apy / 10 : "00.00"} %
            </p>
          </div>
        </div>
      </div>
      <div className="stacked_gra">
        <h4 className="pool">Deposits & Rewards</h4>
        <p className="paratitle">
          Your Staked AT tokens will be locked for 30 days. After lock period is
          finished, you can either unstake 100% of your initial tokens and
          return them to your wallet, or you can keep it staked for up to a year
          to earn the full 20% APY. On a daily basis, your staking rewards will
          be calculated and added for you to claim.
          <br /> <br />
          Stake and unstake fees of 10 BUSD are applied each time. BNB is used
          to pay regular BSC transaction fees.
        </p>
        <br />
        <div className="stacked_poolgra2">
          <div>
            <h4 className="title">Locked/Unlocked Date</h4>
            <p className="poolbody">
              {period(
                userInfo.depositTime > 0
                  ? userInfo.depositTime + 2000 * 24 * 60 * 60
                  : new Date().getTime()
              )}
            </p>
          </div>
          <div>
            <h4 className="title">Amount Staked</h4>
            <p className="poolbody">
              {userInfo.total_invested > 0
                ? parseFloat(userInfo.total_invested / 1e9).toFixed(2)
                : "00.00"}
            </p>
          </div>
          <div>
            <h4 className="title">Claimable Reward</h4>
            <p className="poolbody">{parseFloat(claim / 1e9).toFixed(2)}</p>
          </div>
          <div>
            <h4 className="title">Estimated Earning/Year</h4>
            <p className="poolbody">
              {userInfo.total_invested > 0
                ? parseFloat(((userInfo.total_invested / 1e9) * 20) / 100)
                : "00.00"}
            </p>
          </div>
        </div>
      </div>
      <Modal
        title="AnonToken Staking Protocol"
        footer={null}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <p className="lock">Lock for 30 days</p>
        <p className="lock2">Stacking ending date: 04.11.222</p>
        <div className="flexing">
          <div>
            <p className="lock">Lock Amount</p>
          </div>
          <div>
            <p className="lock2">Balance: {Total_supply}</p>
          </div>
        </div>
        <div className="flexing2">
          <div>
            <input
              value={stake}
              onChange={(e) => setstake(e.target.value)}
              className="maw"
              type="number"
            />
          </div>
          <div>
            <span className="span" onClick={() => setstake(Total_supply)}>
              MAX
            </span>
            <span className="span2">AT</span>
          </div>
        </div>
        <p className="lock2s">Fixed APY: 20%</p>
        <p className="locks">Reward Calaiming Period: Daily</p>
        <button className="staka" onClick={() => Stake1(stake)}>
          Stake
        </button>
        <p className="lock2ss">
          <InfoCircleOutlined />
          Be aware of the risks associated with staking contract. You assume all
          the responsibility.
        </p>
      </Modal>
      <Modal
        title="AnonToken Staking Protocol"
        footer={null}
        visible={isModalVisible2}
        onOk={handleOk2}
        onCancel={handleCancel2}
      >
        <p className="lock">
          Keep your tokens staked for a year to get the full 20% APY.
        </p>
        <div className="flexing">
          <div>
            <p className="lock">Unstake Amount</p>
          </div>
          <div>
            <p className="lock2">
              Available Balance:{" "}
              {userInfo.total_invested > 0
                ? parseFloat(userInfo.total_invested / 1e9).toFixed(2)
                : "0"}
            </p>
          </div>
        </div>
        <div className="flexing2">
          <div>
            <input
              value={unstake}
              onChange={(e) => setunstake(e.target.value)}
              className="maw"
              type="number"
            />
          </div>
          <div>
            <span
              className="span"
              onClick={() => setunstake(userInfo.total_invested / 1e9)}
            >
              MAX
            </span>
            <span className="span2">AT</span>
          </div>
        </div>
        <button
          style={{ marginTop: "20px" }}
          className="staka"
          onClick={() => unStake1(unstake)}
        >
          Unstake
        </button>
        <p className="lock2ss">
          <InfoCircleOutlined />
          Be aware of the risks associated with staking contract. You assume all
          the responsibility.
        </p>
      </Modal>
    </div>
  );
};

export default Stacked;
