import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import './App.scss';
import AppRoutes from './AppRoutes';
import Sidebar from './shared/Sidebar';
import Footer from './shared/Footer';

import { ethers } from 'ethers'

import { shortenAddress } from '../utils';
import { Button, Modal } from 'react-bootstrap';

import GameStats from "./GameStats"
import Settings from "./Settings"

import abi from "./ContractABI"

const provider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed1.defibit.io/")
// const provider = new ethers.providers.JsonRpcProvider("https://data-seed-prebsc-1-s1.binance.org:8545/")

const addy = '0xad9653f63b6c5F3F68839027f98b16E632689E82'
const pot = '0x68561ef4c33Fa481037b28C208EAA8FE8B121FA2'



function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


function parse(item) {
  return item ? parseInt(item._hex, 16) : undefined
}

function toFixed(x) {
  if (Math.abs(x) < 1.0) {
    var e = parseInt(x.toString().split('e-')[1]);
    if (e) {
        x *= Math.pow(10,e-1);
        x = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
    }
  } else {
    var e = parseInt(x.toString().split('+')[1]);
    if (e > 20) {
        e -= 20;
        x /= Math.pow(10,e);
        x += (new Array(e+1)).join('0');
    }
  }
  return x;
}


class App extends Component {
  
  setMdShow = newMdShow => {
    this.setState({ mdShow: newMdShow })
  }

  getMetamaskWallet = async () => {
    let metamask
    try {
      metamask = new ethers.providers.Web3Provider(window.ethereum, 56);
    } catch (e) {
      console.log('wrong chain')
      return null
    }
    // Prompt user for account connections
    await metamask.send("eth_requestAccounts", []);
    const wallet = metamask.getSigner();
    const address = await wallet.getAddress()

    let loaded = true

    if (this.state.username != address){
      loaded = false
    }

    this.setState({
      loaded: loaded,
      wallet: wallet,
      username: address,
      contract: new ethers.Contract(addy, abi, wallet)
    })
  }

  getRoundPotWinnersBreakdown = (stats, settings) => {

  	const activeSettings = settings.activeSettings

  	const nthPlaceWords = ["Top", "Second Highest", "Third Highest"]
  	const nthPlaceColors = ["#FEAE65", "#E6F69D", "#AADEA7"]

  	const array = []


  	const add = (name, percent, color, amount, bonus, tokens) => {
  		// array.push([name, amount ? <span className={`${bonus == 0 ? 'text-danger' : 'text-success'}`}><span className="text-light">{amount}</span> BNB<br/>{(bonus).toFixed(1)}% payout bonus for holding {numberWithCommas(tokens)} tokens</span> : <span>0</span>, percent, color])

  		array.push([name, amount ? <><span style={{color: 'yellow'}}>{amount.toPrecision(6)}</span><span style={{fontSize: '0.7rem'}}> BNB</span></> : <span>0</span>, percent, color])
  	}

    if (stats.lastBuyer != '0x0000000000000000000000000000000000000000') {
      add(shortenAddress(stats.lastBuyer) + ' - Last Buyer', activeSettings.lastBuyerPayoutPercent, "#F66D44", stats.lastBuyerPayout, stats.lastBuyerBonus, stats.lastBuyerBalance)
    } else {
      add('Last Buyer', activeSettings.lastBuyerPayoutPercent, "#F66D44", stats.lastBuyerPayout, stats.lastBuyerBonus, stats.lastBuyerBalance)
    }


  	if (stats.topBuyers[0] === undefined) {
      for(let i = 0; i < activeSettings.placePayoutPercents.length; i++) {
  		  add(nthPlaceWords[i] + " Ticketholder", activeSettings.placePayoutPercents[i], nthPlaceColors[i], stats.topBuyers[i] ? stats.topBuyers[i].payout : 0, stats.topBuyers[i] ? stats.topBuyers[i].bonus : 0, stats.topBuyers[i] ? stats.topBuyers[i].balance : 0)
  	  }
    } else {
      for(let i = 0; i < activeSettings.placePayoutPercents.length; i++) {
        add(stats.topBuyers[i] ? shortenAddress(stats.topBuyers[i].address) + ' - ' + nthPlaceWords[i] + ' Buyer' : 
            nthPlaceWords[i] + ' Buyer', activeSettings.placePayoutPercents[i], nthPlaceColors[i], stats.topBuyers[i] ? stats.topBuyers[i].payout : 0, stats.topBuyers[i] ? stats.topBuyers[i].bonus : 0, stats.topBuyers[i] ? stats.topBuyers[i].balance : 0)
      }
    }

  	const hugeCount = activeSettings.hugeHolderLotteryPayoutCount
  	const largeCount = activeSettings.largeHolderLotteryPayoutCount
  	const smallCount = activeSettings.smallHolderLotteryPayoutCount

  	const addLotteryPayout = (count, percent, name, color) => {
  		if(count === 0) {
  			return
  		}

  		add(count.toString() + " " + name + " Holder" + (count > 1 ? "s" : ""), percent, color, stats.currentRoundPot/10) 
  	}

  	addLotteryPayout(hugeCount, activeSettings.hugeHolderLotteryPayoutPercent, "Huge", "64C2A6")
  	addLotteryPayout(largeCount, activeSettings.largeHolderLotteryPayoutPercent, "Large", "2D87BB")
  	addLotteryPayout(smallCount, activeSettings.smallHolderLotteryPayoutPercent, "Small", "7982B9")

  	if(activeSettings.marketingPayoutPercent > 0) {
  		add("Marketing Fund", activeSettings.marketingPayoutPercent, "#A9A9A9", stats.currentRoundPot*0.05)
  	}

  	return array
  }

  parse(item) {
    return parseInt(item)
  }

  nanCheck = (item) => {
    if (isNaN(item)) {
      return 0
    }
    return item
  }


  roundState = (stats, settings, timeLeft, cooldownTimeLeft) => {

    // if (stats.roundNumber == 0) {
    //   // "Game Has Not Yet Begun"
    //   return 4
    // }
    // if (stats.blocksLeft >= 0 && timeLeft > 10) {
    //   // Round running - new Date(timeLeft*1000).toISOString().substr(11, 8)
    //   return 1
    // }
    // if (stats.blocksLeft > -2 && (timeLeft <= 10)) {
    //   // "Checking For Last-Second Entries..."
    //   return 2
    // }
    // if ((stats.blocksLeft <= -2) && stats.endTimestamp == 0) {
    //   // "Round Complete - Awaiting Payouts..."
    //   return 3
    // }
    // if (stats.endTimestamp != 0 && cooldownTimeLeft >= 0) {
    //   // "Rounded Has Ended - On Cooldown"
    //   return 0
    // }
    // if (stats.endTimestamp != 0 && cooldownTimeLeft < 0) {
    //   // "Buy a Ticket To Start the Round!"
    //   return 5
    // }




    if (stats.roundNumber == 0) {
      // "Game Has Not Yet Begun"
      return 4
    }
    if (stats.blocksLeft > 0 && timeLeft > 0) {
      // Round running - new Date(timeLeft*1000).toISOString().substr(11, 8)
      return 1
    }
    if (stats.blocksLeft >= 0 && (timeLeft <= 0)) {
      // "Checking For Last-Second Entries..."
      return 2
    }
    if ((stats.blocksLeft < 0) && stats.endTimestamp == 0) {
      // "Round Complete - Awaiting Payouts..."
      return 3
    }
    if (stats.endTimestamp != 0 && cooldownTimeLeft >= 0) {
      // "Rounded Has Ended - On Cooldown"
      return 0
    }
    if (stats.endTimestamp != 0 && cooldownTimeLeft < 0) {
      // "Buy a Ticket To Start the Round!"
      return 5
    }
  }


  timer


  poll = () => {
    this.state.contract.gameStats(this.state.username ? this.state.username : '0x0000000000000000000000000000000000000007').then(stats => {
      this.state.contract.settings().then(settings => {

        if(stats.roundStats.length === 0) {
          window.clearTimeout(this.timer);
          this.timer = window.setTimeout(this.poll, 3000);
        }

        settings = new Settings(settings)

        stats = new GameStats(stats, this.state.username ? this.state.username : null, settings)

        const timeLeft = stats.calculateTimeLeft()

        const cooldownTimeLeft = stats.calculateCooldownTimeLeft(settings.currentRoundSettings.gameCooldownBlocks)

        let holder = ''

        if (stats.userBalance > 100000) {
          holder = 'Small Holder'
        }

        if (stats.userBalance > 1000000) {
          holder = 'Large Holder'
        }

        if (stats.userBalance > 5000000) {
          holder = 'Huge Holder'
        }

        this.setState({
          loaded: true,
          stats,
          settings,
          holderType: holder,
          roundState: this.roundState(stats, settings, timeLeft, cooldownTimeLeft),
          // buysDisabled: false, 
          buysDisabled: this.roundState(stats, settings, timeLeft, cooldownTimeLeft) == 3 || this.roundState(stats, settings, timeLeft, cooldownTimeLeft) == 0 || this.roundState(stats, settings, timeLeft, cooldownTimeLeft) == 4, 
          // priceForTicketAhead: settings.calculateCurrentTicketPriceAfterNBlocks(stats, 30),
          priceForTicketAhead: settings.calculateCurrentTicketPrice(stats)*1.05,
          priceForTicketCurrent: settings.calculateCurrentTicketPrice(stats),
          timeLeft: timeLeft,
          cooldownTimeLeft: cooldownTimeLeft,
          currentRoundNumber: stats.roundNumber,
          lastBuyer: stats.lastBuyer,
          currentRoundPot: stats.currentRoundPot ? stats.currentRoundPot.toFixed(6) : stats.currentRoundPot,
          // realRoundPot: stats.realRoundPot ? stats.realRoundPot.toFixed(6) : stats.realRoundPot,
          currentBlocksLeftAtLastBuy: stats.currentBlocksLeftAtLastBuy,
          currentLastBuyBlock: stats.lastBuyBlock,
          topBuyerAddress: stats.topBuyerAddress,
          topBuyerData: stats.topBuyerData
        })

        window.clearTimeout(this.timer);
        this.timer = window.setTimeout(this.poll, 3000);

      })
    })
  }

  updateUI = () => {
    this.getMetamaskWallet()
    
  	if(this.state.stats) {
  		const obj = {timeLeft: this.state.stats.calculateTimeLeft(), cooldownTimeLeft: this.state.stats.calculateCooldownTimeLeft(this.state.settings.currentRoundSettings.gameCooldownBlocks)}

  		if(this.state.settings) {
  			// obj.priceForTicket = this.state.settings.contractSettings.initialTicketPrice
  			obj.priceForTicket = this.state.settings.calculateCurrentTicketPrice(this.state.stats)
  			obj.priceForTicketAhead = this.state.settings.calculateCurrentTicketPrice(this.state.stats)*1.05
  			obj.priceForTicketCurrent = this.state.settings.calculateCurrentTicketPrice(this.state.stats)

  			obj.roundPotWinnersBreakdown = this.getRoundPotWinnersBreakdown(this.state.stats, this.state.settings)
  		}

  		this.setState(obj)
  	}
  }


  state = {
    //////////////////////
    // Start Base Setup //
    //////////////////////
    loaded: false,
    wallet: null,
    contract: null,
    /////////////////////////
    // Start Game Settings //
    /////////////////////////
    contractRoundSettings: null,
    currentRoundRoundSettings: null,
    // struct RoundSettings {
    //   bool contractsDisabled; //Whether contracts are banned from buying tickets
    //   uint256 tokensNeededToBuyTickets; //Number of tokens a user needs to buy tickets
    //   uint256 gameFeePotPercent; //Percent of game fees going towards the pot
    //   uint256 gameFeesBuyTokensForPotPercent; //Percent of game fees going towards buying tokens for the pot
    //   uint256 gameFeeDividendsPercent; //Percent of game fees going towards dividends of ticket holders
    //   uint256 roundLengthBlocks; //The length of a round (not including added time), in blocks
    //   uint256 blocksAddedPer100TicketsBought; //How many blocks are added to length of round for every 100 tickets bought. Minimum is always 1 block.
    //   uint256 initialTicketPrice; //How much one ticket costs at the start of the round, in Wei
    //   uint256 ticketPriceIncreasePerBlock; //How much the price increases per block, in Wei
    //   uint256 ticketPriceIncreasePerTicketBought; //How much the price increases per ticket bought, in Wei
    //   uint256 gameCooldownBlocks; //Number of blocks after the round ends before the next round starts
    // }
    contractPayoutSettings: null,
    currentRoundPayoutSettings: null,
    // struct PayoutSettings {
    //   uint256 roundPotPercent; //Percent of main pot that is paid out to the round pot
    //   uint256 lastBuyerPayoutPercent; //Percent of round pot that is paid to the last ticket buyer
    //   uint256[7] placePayoutPercents; //Percent of round pot that is paid to first place in tickets bought
    //   uint256 smallHolderBonusPercent; //Percent bonus a small holder gets for being last buyer or a top buyer
    //   uint256 largeHolderBonusPercent; //Percent bonus a large holder gets for being last buyer or a top buyer
    //   uint256 hugeHolderBonusPercent; //Percent bonus a huge holder gets for being last buyer or a top buyer
    //   uint256 smallHolderLotteryPayoutPercent; //Percent of round that is paid to 'smallHolderLotteryPayoutCount' small holders
    //   uint256 largeHolderLotteryPayoutPercent; //Percent of round that is paid to 'largeHolderLotteryPayoutCount' large holders
    //   uint256 hugeHolderLotteryPayoutPercent; //Percent of round that is paid to 'hugeHolderLotteryPayoutCount' huge holders
    //   uint256 smallHolderLotteryPayoutCount; //Number of small holders randomly chosen to split 'smallHolderLotteryPayoutPercent'
    //   uint256 largeHolderLotteryPayoutCount; //Number of large holders randomly chosen to split 'largeHolderLotteryPayoutPercent'
    //   uint256 hugeHolderLotteryPayoutCount; //Number of huge holders randomly chosen to split 'hugeHolderLotteryPayoutPercent'
    //   uint256 marketingPayoutPercent; //Percent of round pot that is paid to the marketing wallet, for marketing
    // }
    //////////////////////
    // Start Game Stats //
    //////////////////////
    roundStats: null,
    // roundStats[0] = _storage.roundNumber;
    // roundStats[1] = _storage.endTimestamp;
    // roundStats[2] = _storage.endBlock;
    // roundStats[3] = currentRoundPot;
    // roundStats[4] = _storage.blocksLeftAtLastBuy;
    // roundStats[5] = _storage.lastBuyBlock;
    // roundStats[6] = block.timestamp;
    // roundStats[7] = block.number;
    userStats: null,
    // userStats[0] = _storage.buyers.list[user].ticketsBought;
    // userStats[1] = _storage.buyers.list[user].lastBuyBlock;
    // userStats[2] = _storage.roundToken.accumulativeDividendOf(user);
    // userStats[3] = _storage.roundToken.withdrawableDividendOf(user);
    currentBlocksLeft: null,
    lastBuyer: null,
    topBuyerAddress: null,
    topBuyerData: null,
    timeLeft: null,
    //////////////
    // Start UI //
    //////////////
    tokensHeld: 0,
    holderType: '',
    username: null,
    // Recipient, Percent, Color
    roundPotBreakdown: [
      ["Last Buyer", 30, '#F66D44'],
      ["Top Ticketholder", 30, '#FEAE65'],
      ["Second Ticketholder", 15, '#E6F69D'],
      ["Third Highest Ticketholder", 5, '#AADEA7'],
      ["1 Random Huge Holder", 5, '#64C2A6'],
      ["2 Random Large Holders", 5, '#2D87BB'],
      ["5 Random Small Holders", 5, '#7982B9'],
      ["Marketing Fund", 5, '#A9A9A9']
    ],
    roundPotWinnersBreakdown: [
      ["-", 30, '#F66D44'],
      ["-", 30, '#FEAE65'],
      ["-", 15, '#E6F69D'],
      ["-", 5, '#AADEA7'],
      ["-", 5, '#64C2A6'],
      ["-", 5, '#2D87BB'],
      ["-", 5, '#7982B9'],
      ["-", 5, '#A9A9A9']
    ],
  }

  componentDidMount() {
    this.onRouteChanged();

    this.setState({
      mdShow: true
    })

    const c = new ethers.Contract(addy, abi, provider)
    c.gameStats('0x0000000000000000000000000000000000000007').then(stats => {
      c.settings().then(settings => {

      	settings = new Settings(settings)
      	stats = new GameStats(stats, null, settings)

      	// console.log("priceForTicket", priceForTicket)

        const timeLeft = stats.calculateTimeLeft()

        const cooldownTimeLeft = stats.calculateCooldownTimeLeft(settings.currentRoundSettings.gameCooldownBlocks)

        this.getMetamaskWallet().then(_ => {

          this.setState({
            ca: addy,
            pot: pot,
            stats,
            settings,
            timeLeft: timeLeft,
            cooldownTimeLeft: cooldownTimeLeft,
            // buysDisabled: false,
            roundState: this.roundState(stats, settings, timeLeft, cooldownTimeLeft),
            buysDisabled: this.roundState(stats, settings, timeLeft, cooldownTimeLeft) == 3 || this.roundState(stats, settings, timeLeft, cooldownTimeLeft) == 0 || this.roundState(stats, settings, timeLeft, cooldownTimeLeft) == 4,
            priceForTicketAhead: settings.calculateCurrentTicketPrice(stats)*1.05,
            priceForTicketCurrent: settings.calculateCurrentTicketPrice(stats),
            loaded: true,
            contract: c,
            priceForTicket: settings.calculateCurrentTicketPrice(stats),
            //ticketPriceIncreasePerBlock: this.nanCheck(parseInt(settings.contractRoundSettings.ticketPriceIncreasePerBlock._hex, 16)/1e18),
            currentRoundNumber: stats.roundNumber,
            lastBuyer: stats.lastBuyer,
            currentRoundPot: stats.currentRoundPot ? stats.currentRoundPot.toFixed(6) : stats.currentRoundPot,
            // realRoundPot: stats.realRoundPot ? stats.realRoundPot.toFixed(6) : stats.realRoundPot,
            topBuyerAddress: stats.topBuyerAddress,
            topBuyerData: stats.topBuyerData,
          })
          this.poll()

        })

      })
    })

    setInterval(this.updateUI.bind(this), 100)
  }

  render () {
    const mdShow = this.state.mdShow
    const setMdShow = this.setMdShow
    let sidebarComponent = !this.state.isFullPageLayout ? <Sidebar mainState={this.state}/> : '';
    let footerComponent = !this.state.isFullPageLayout ? <Footer/> : '';
    return (
      <div className="container-scroller">
        { sidebarComponent }
        <div className="container-fluid page-body-wrapper">
          <div className="main-panel">
                    <Modal
                      size="lg"
                      show={mdShow}
                      onHide={() => setMdShow(false)}
                      aria-labelledby="example-modal-sizes-title-lg"
                    >
                      <Modal.Header closeButton>
                        <Modal.Title>READ: Game Information</Modal.Title>
                      </Modal.Header>

                      <Modal.Body>
                        <p className="text-success font-weight-bold">BASICS:</p>
                        <p className="text-warning">- Tickets are CHEAP early, and go up in price as the pot grows</p>
                        <p className="text-warning">- All tickets EARN DIVIDENDS on future ticket buys</p>
                        <p className="text-warning">- The MORE TICKETS you have, and the EARLIER (cheaper) you buy them, the MORE dividends you earn</p>
                        <p className="text-warning">- To CLAIM your PENDING DIVIDENDS, you need to BUY one or more tickets</p>
                        <p className="text-success font-weight-bold">WINNING BY TICKETS:</p>
                        <p className="text-warning">- The person with the MOST tickets at the end wins top BUYER PRIZE</p>
                        <p className="text-warning">- The person with the SECOND MOST tickets wins second highest BUYER PRIZE</p>
                        <p className="text-warning">- The person with the THIRD MOST tickets wins third highest BUYER PRIZE</p>
                        <p className="text-warning">- The person who buys the LAST ticket wins LAST BUYER PRIZE</p>
                        <p className="text-success font-weight-bold">WINNING BY TOKENS:</p>
                        <p className="text-warning">- 10 SMALL HOLDERS (50k+ tokens) are randomly selected and share 10% of the pot at the end (1% each)</p>
                        <p className="text-warning">- 5 LARGE HOLDERS (500k+ tokens) are randomly selected and share another 10% of the pot at the end (2% each)</p>
                        <p className="text-warning">- 2 HUGE HOLDERS (5m+ tokens) are randomly selected and paid another 10% of the pot at the end (5% each)</p>
                        <p className="text-warning">- Each holder level automatically counts as the lower levels (e.g. HUGE HOLDERS automatically enter all 3 lotteries, and can win more than one)</p>
                        <p className="text-success font-weight-bold">BONUSES:</p>
                        <p className="text-warning">- The MORE TOKENS you hold, the CHEAPER your tickets are (holder discount)</p>
                        <p className="text-warning">- The MORE TOKENS you hold, the MORE you win from the pot (holder bonus)</p>
                      </Modal.Body>

                      <Modal.Footer className="fleex-wrap">
                        <Button variant="light m-2" onClick={() => setMdShow(false)}>Close</Button>
                      </Modal.Footer>
                    </Modal>
            <div className="content-wrapper">
              <AppRoutes mainState={this.state}/>
            </div>
            { footerComponent }
          </div>
        </div>
      </div>
    );
  }

  componentDidUpdate(prevProps) {
    if (this.props.location !== prevProps.location) {
      this.onRouteChanged();
    }
  }

  onRouteChanged() {
    console.log("ROUTE CHANGED");
    const body = document.querySelector('body');
    window.scrollTo(0, 0);
    const fullPageLayoutRoutes = ['/user-pages/login-1', '/user-pages/login-2', '/user-pages/register-1', '/user-pages/register-2', '/user-pages/lockscreen', '/error-pages/error-404', '/error-pages/error-500', '/general-pages/landing-page'];
    for ( let i = 0; i < fullPageLayoutRoutes.length; i++ ) {
      if (this.props.location.pathname === fullPageLayoutRoutes[i]) {
        this.setState({
          isFullPageLayout: true
        })
        document.querySelector('.page-body-wrapper').classList.add('full-page-wrapper');
        break;
      } else {
        this.setState({
          isFullPageLayout: false
        })
        document.querySelector('.page-body-wrapper').classList.remove('full-page-wrapper');
      }
    }
  }

}

export default withRouter(App);
