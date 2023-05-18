import React, { Component } from 'react';
import { Doughnut } from 'react-chartjs-2';
import Rating from 'react-rating';
import { Form, Button } from 'react-bootstrap'

import { ethers } from 'ethers'

import BreakdownBar from './BreakdownBar'
import { Contract } from '@ethersproject/contracts';

import { shortenAddress } from '../../utils';

import Spinner from '../shared/Spinner';



function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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

const barEmptyStyle = {
  display: 'inline-block',
  width: '24px',
  height: '28px',
  backgroundColor: 'rgba(166, 166, 166, 0.6)',
  margin: '2px'
}

const barFullStyle = {
  display: 'inline-block',
  width: '24px',
  height: '28px',
  backgroundColor: 'rgba(50, 205, 50, 1)',
  margin: '2px'
}

function formatAMPM(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}

export class Dashboard extends Component {

  state = {
    timerText: '',
    ticketsToBuy: 123,
    firstUpdate: false
  }

  componentDidMount() {
    this.timer = setInterval(()=> this.setTimerText(), 250);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {

    if (this.state.firstUpate === false) {
      if (nextProps.mainState.stats && nextProps.mainState.stats.topBuyers[0] && (nextProps.mainState.stats.topBuyers[0].ticketsBought !== 0)) {

        this.setState({
          ticketsToBuy: nextProps.mainState.stats ? nextProps.mainState.stats.topBuyers[0] ? nextProps.mainState.stats.topBuyers[0].ticketsBought+1-nextProps.mainState.stats.userTicketsBought : 123 : 123,
          firstUpdate: true
        })
      }
    }
  }
  
  componentWillUnmount() {
    clearInterval(this.timer)
    this.timer = null;
  }

  setTimerText = () => {
    if (this.props.mainState.loaded) {

      let value = ''

      switch (this.props.mainState.roundState) {
        case 0:
          value = this.props.mainState.cooldownTimeLeft === 0 ? new Date(0).toISOString().substr(11, 8) : new Date(this.props.mainState.cooldownTimeLeft*1000).toISOString().substr(11, 8) + ' Till Next Round'
          break
        case 1:
          value = this.props.mainState.timeLeft === 0 ? new Date(0).toISOString().substr(11, 8) : new Date(this.props.mainState.timeLeft*1000).toISOString().substr(11, 8)
          break
        case 2:
          value = "Checking For Last-Second Entries..."
          break
        case 3:
          value = "Round Complete - Awaiting Payouts..."
          break
        case 4:
          value = "Game Has Not Yet Begun"
          break
        case 5:
          value = "Buy a Ticket To Start the Round!"
          break
        default:
          value = "Loading..."
          break
      }

      this.setState({
        timerText: value
      })
    }
  }

  naWrapper = (item) => {
    return item ? item : 'N/A'
  }

  addressCheck = (address) => {
    return address ? address === "You" ? "You" : shortenAddress(address) : 'No Buyer'
  }

  leadCalc = (num, topBuyerData) => {
    let totalTickets = 0
    for (let i = 0; i < 3; i++) {
      totalTickets += this.parse(topBuyerData[i*6])
    }
    return (this.parse(topBuyerData[num*6])/totalTickets)*100
  }

  nanCheck = (item) => {
    if (isNaN(item)) {
      return 0
    }
    return item
  }

  buyTickets(wallet, contract, num, priceForTicket, getWallet, priceForTicketAhead, roundState, stats) {


    if (wallet && contract) {
      // contract.connect(wallet)

      const tickPrice = roundState == 5 ? priceForTicket*1.05 : priceForTicketAhead
      const gas = roundState == 5 ? 7000000 : 2000000

      // contract.buyExactTickets(num, {value: (Math.floor(num * tickPrice * 1e18)).toString()})

      const encodedABI = contract.interface.encodeFunctionData( 'buyExactTickets', [num])

      wallet.getTransactionCount().then(nonce => {
        const tx = {
          chainId: 56,
          nonce: ethers.utils.hexlify(nonce),
          gasPrice: ethers.utils.hexlify(11*1000000000),
          gasLimit: ethers.utils.hexlify(gas),
          to: contract.address,
          value: ethers.utils.parseEther((num*tickPrice).toPrecision(6)),
          data: encodedABI
        }

        wallet.sendTransaction(tx).then(confirmation => {
          // this.setState({ ticketsToBuy: num })
        })

      })
    } else {
      getWallet()
    }
  }

  completeRound(wallet, contract) {
    if (wallet && contract) {
      const encodedABI = contract.interface.encodeFunctionData( 'completeRound', [])

      wallet.getTransactionCount().then(nonce => {
        const tx = {
          chainId: 56,
          nonce: ethers.utils.hexlify(nonce),
          gasPrice: ethers.utils.hexlify(7*1000000000),
          gasLimit: ethers.utils.hexlify(2500000),
          to: contract.address,
          value: '0x00',
          data: encodedABI
        }

        wallet.sendTransaction(tx).then(confirmation => {
          // this.setState({ purchased: true })
        })

      })
    }
  }

  parse(item) {
    return item ? parseInt(item._hex, 16) : undefined
  }

  render () {

    const { stats, ca, pot, buysDisabled, roundState, priceForTicketCurrent, settings, loaded, getWallet, wallet, priceForTicketAhead, timeLeft, contract,  priceForTicket, priceForTicketsToTakeFirst, currentRoundNumber, lastBuyer, currentBlocksLeft, currentRoundPot, currentBlocksLeftAtLastBuy, currentLastBuyBlock, currentBlockTime, currentBlockNumber, topBuyerAddress, topBuyerData, username, tokensHeld, holderType, roundPotBreakdown, roundPotWinnersBreakdown, realRoundPot } = this.props.mainState

    if (loaded == false || !stats || !settings) {
      return (<Spinner/>)
    }


    const discountedPriceForTicket = priceForTicket*(1-stats.userBonus)
    const discountedPriceForTicketCurrent = priceForTicketCurrent*(1-stats.userBonus)
    const discountedPriceForTicketAhead = priceForTicketAhead*(1-stats.userBonus)


    const potBreakdownOptions = {
      responsive: true,
      maintainAspectRatio: true,
      segmentShowStroke: false,
      cutoutPercentage: 65,
      elements: {
        arc: {
            borderWidth: 0
        }
      },      
      legend: {
        display: false
      },
      tooltips: {
        enabled: true
      }
    }

    const winnerRecipients = [], winnerAmounts = [], winnerColors = []

    for (let i = 0; i < roundPotWinnersBreakdown.length; i++) {
      winnerRecipients.push(' ' + roundPotWinnersBreakdown[i][0])
      winnerAmounts.push(roundPotWinnersBreakdown[i][1])
      winnerColors.push(roundPotWinnersBreakdown[i][3])
    }
    
    const potWinnerBreakdownData =  {
      labels: winnerRecipients,
      datasets: [{ data: winnerAmounts, backgroundColor: winnerColors }]
    };

    const topBuyer = stats.topBuyers ? stats.topBuyers[0] : null
    const secondBuyer = stats.topBuyers ? stats.topBuyers[1] : null
    const thirdBuyer = stats.topBuyers ? stats.topBuyers[2] : null

    const getTopBuyer = (index) => {
      const topBuyer = index < stats.topBuyers.length ? stats.topBuyers[index] : null

      let address
      let ticketsBought
      let lastBuy

      if(topBuyer) {
        address = topBuyer.address
        ticketsBought = Number(topBuyer.ticketsBought)
        lastBuy = formatAMPM(new Date(topBuyer.lastBuyTimestamp * 1000))
      }

      let color = "#ffffff"

      // if (index == 0) {
      //   color = "#FEAE65"
      // }

      // if (index == 1) {
      //   color = "#E6F69D"
      // }
      // if (index == 2) {
      //   color = "#AADEA7"
      // }

      const top = (index == 0 || index == 1 || index == 2)
      
      return <tr key={index} style={top ? {background: '#026440', color: 'white'} : {background: '#8B0000', color: 'white'} }>
                <td> <div className={`badge badge-pill ${top ? 'badge-success' : 'badge-danger'}`}>{ index + 1 }</div> </td>
                <td> <a style={{color: `${color}`}} ref="noopener noreferrer" target="_blank" href={`https://bscscan.com/token/${ca}/?a=${address}`}>{this.addressCheck(roundState == 5 ? '' : address === username ? 'You' : address)}</a> </td>
                {/* <td>
                  <ProgressBar variant="success" now={this.leadCalc(index, topBuyerData)} />
                </td> */}
                <td> {roundState == 5 ? 'N/A' : this.naWrapper(ticketsBought)} </td>
                <td> {roundState == 5 ? 0 : top ? winnerAmounts[index+1] : 0}</td>
                <td> {roundState == 5 ? 'N/A' : this.naWrapper(lastBuy)} </td>
                {(ticketsBought && !isNaN(ticketsBought) && roundState != 5) ? <td> <Button disabled={address === username} className={`${top ? 'btn btn-primary' : 'btn btn-primary'}`} onClick={() => {
                  this.buyTickets(wallet, contract, ticketsBought+1-stats.userTicketsBought, discountedPriceForTicket, getWallet, discountedPriceForTicketAhead, roundState, stats)}
                  }>{address === username ? '---' : 'BUY ' + (ticketsBought+1-stats.userTicketsBought).toString()}</Button>
                </td> : <td> <Button className={`${top ? 'btn btn-primary' : 'btn btn-primary'}`} onClick={() => {
                  this.buyTickets(wallet, contract, 1, discountedPriceForTicket, getWallet, discountedPriceForTicketAhead, roundState, stats)}
                  }>BUY 1</Button>
                </td>}
              </tr>
    }

    const topBuyersContent = []

    for(let i = 0; i < 7; i++) {
      topBuyersContent.push(getTopBuyer(i))
    }

    const quickBuyValues = [1, 5, 10, 20, 50, 100, 200, 500]

    const quickBuys = quickBuyValues.map((number, index) => {
      return <div key={index} className={`col-xs-6 col-xl-6 mb-4 ${(index+1)%2 == 1 ? 'pr-2 pl-0' : 'pl-2 pr-0'}`}><Button className="btn btn-primary btn-fw wid w-100 pt-2 pb-2" onClick={() => {
        this.buyTickets(wallet, contract, number, discountedPriceForTicket, getWallet, discountedPriceForTicketAhead, roundState, stats)}
      }>Buy {number} {number == 1 ? 'Ticket' : 'Tickets'}</Button></div>
    })

    const inputBuy = <><div className="input-group-append col-xs-12 col-xl-12 mb-1"><Button onClick={() => this.setState({ticketsToBuy: Number(this.state.ticketsToBuy)-1 >= 1 ?this.state.ticketsToBuy-1 : 1})} className="btn btn-sm btn-primary">–</Button><input className="input-number text-center w-100" type="text" value={this.state.ticketsToBuy} min="1" max="1000000" onChange={e => (this.nanCheck(e.target.value) && e.target.value >= 1) ? this.setState({ticketsToBuy: Number(e.target.value)}) : this.state.ticketsToBuy} /><Button onClick={() => this.setState({ticketsToBuy: Number(this.state.ticketsToBuy)+1 >= 1 ?this.state.ticketsToBuy+1 : 1})} className="btn btn-sm btn-primary">+</Button></div><div className="input-group-append col-xs-12 col-xl-12 mb-4"><Button className="btn btn-primary btn-fw wid w-100 pt-2 pb-2" onClick={() => {
      this.buyTickets(wallet, contract, this.state.ticketsToBuy, discountedPriceForTicket, getWallet, discountedPriceForTicketAhead, roundState, stats)}
    }>Buy {this.state.ticketsToBuy} {this.state.ticketsToBuy == 1 ? 'Ticket' : 'Tickets'}</Button></div></>
    
    
    {/* <Form.Group>
                      <div className="input-group">
                      <Form.Control type="number" className="form-control" placeholder="Custom amount" aria-label="Custom amount" aria-describedby="basic-addon2" />
                        <div className="input-group-append">
                          <button className="btn btn-sm btn-primary" type="button" onClick={() => {
                          this.buyTickets(wallet, contract, this.state.ticketsToBuy, discountedPriceForTicket, getWallet, discountedPriceForTicketAhead, roundState, stats)}
                        }>BUY</button>
                        </div>
                      </div>
                    </Form.Group> */}
    // <Rating
                        
    //                     start={0}
    //                     stop={100}
    //                     step={1}
    //                     initialRating={this.state.ticketsToBuy}
    //                     emptySymbol={<span style={barEmptyStyle}></span>}
    //                     fullSymbol={<span style={barFullStyle}></span>}
    //                     onHover={rate => rate == this.state.ticketsToBuy ? null : this.setState({ticketsToBuy: rate})}
    //                 />

    return (
      <div>



        { wallet == null ? <div className="row">
          <div className="col-12 grid-margin stretch-card">
            <div className="card corona-gradient-card">
              <div className="card-body py-0 px-0 px-sm-3">
                <div className="row align-items-center">
                  <div className="col-4 col-sm-3 col-xl-2">
                    <img src={require('../../assets/images/dashboard/metamask.png')} className="gradient-corona-img img-fluid" alt="banner" />
                  </div>
                  <div className="col-5 col-sm-7 col-xl-8 p-0">
                    <h4 className="mb-1 mb-sm-0">Wallet Not Connected</h4>
                    <p className="mb-0 font-weight-normal d-none d-sm-block">Connect your browser wallet in order to participate in the V2 test!</p>
                  </div>
                  <div className="col-3 col-sm-2 col-xl-2 pl-0 text-center">
                    <button className="btn btn-outline-light btn-rounded get-started-btn" onClick={() => getWallet()}>Connect</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div> : null}
        <div className="row" style={{userSelect: 'none'}}>
          {lastBuyer == null ? <span style={{position: 'absolute', background: 'rgba(0,0,0,0.3)', top: 0, left: 0, width: '100%', height: '100%'}}>Game Has Not Begun</span> : null}
          <div className="col-12 grid-margin">
            <div className="card card-statistics">
              <div className="row">
                <div className={`card-col ${!buysDisabled ? 'col-xl-3 col-lg-6 col-md-6 col-6' : 'col-5'}`}>
                  <a style={{textDecoration: 'none'}} href={`https://bscscan.com/address/${pot}`} rel="noopener noreferrer" target="_blank">
                    <div className="card-body">
                      <div className="d-flex align-items-center justify-content-center flex-column flex-sm-row">
                        <i className="mdi text-primary pb-3 mr-0 mr-sm-3 icon-lg"> <img src={require('../../assets/images/dashboard/bnb.svg')} /></i>
                        <div className="wrapper text-center text-sm-left">
                          <p className="card-text mb-0 text-light">Round Pot Size</p>
                          <div className="fluid-container">
                            <h3 className="mb-2 font-weight-medium" style={{color: 'yellow'}}>{this.nanCheck(currentRoundPot)}<span style={{fontSize: '1.1rem'}}>BNB</span></h3>
                          </div>
                        </div>
                      </div>
                    </div>
                  </a>
                </div>
                <div className={`card-col ${!buysDisabled ? 'col-xl-3 col-lg-6 col-md-6 col-6' : 'col-7'}`}>
                  <div className="card-body">
                    <div className="d-flex align-items-center justify-content-center flex-column flex-sm-row">
                      <i className="mdi mdi-timer-sand text-primary mr-0 mr-sm-2 icon-lg text-info"></i>
                      <div className="wrapper text-center text-sm-left">
                        <p className="card-text mb-0 text-light">Time Left</p>
                        <div className="fluid-container">
                          <h3 className="mb-0 font-weight-medium text-light">{this.state.timerText}</h3>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {!buysDisabled ? <div className="card-col col-xl-3 col-lg-6 col-md-6 col-6">
                  <div className="card-body">
                    <div className="d-flex align-items-center justify-content-center flex-column flex-sm-row">
                      <i className="mdi mdi-receipt text-success mr-0 mr-sm-3 icon-lg"></i>
                      <div className="wrapper text-center text-sm-left">
                        <p className="card-text mb-0 text-light">Ticket Price</p>
                        <div className="fluid-container">
                          <h3 className="mb-0 font-weight-medium text-light"><del>{roundState == 5 ?priceForTicket ? Number(priceForTicket).toFixed(6) : 0 : priceForTicketCurrent ? Number(priceForTicketCurrent).toFixed(6) : 0}<span style={{fontSize: '1.1rem'}}>BNB</span></del></h3>
                          <h6 className="mb-0 font-weight-medium text-light">{`Your Holder Discounted Price: `}<span className="font-weight-bold text-success">{(roundState == 5 ? discountedPriceForTicket.toFixed(6) : discountedPriceForTicketCurrent.toFixed(6))}</span><span className="text-success" style={{fontSize: '0.6rem'}}>BNB</span> (-{((stats.userBonus)*100).toFixed(1)}%)</h6>
                        </div>
                      </div>
                    </div>
                  </div>
                </div> : null}
                {!buysDisabled ? <div className="card-col col-xl-3 col-lg-6 col-md-6 col-6">
                  <a style={{textDecoration: 'none'}} href={`https://bscscan.com/address/${settings.currentRoundAddress}`} rel="noopener noreferrer" target="_blank">
                  <div className="card-body">
                    <div className="d-flex align-items-center justify-content-center flex-column flex-sm-row">
                      <i className="mdi mdi-google-controller text-warning mr-0 mr-sm-2 icon-lg"></i>
                      <div className="wrapper text-center text-sm-left">
                        {/* <OverlayTrigger overlay={<Tooltip className="tooltip-info">Time Increases Ticket Price - With every passing minute the ticket price is doubled.</Tooltip>}> */}
                          <p className="card-text mb-0 text-light">Round Number</p>
                        {/* </OverlayTrigger> */}
                        <div className="fluid-container">
                          <h3 className="mb-0 font-weight-medium text-light">{roundState == 5 ? (currentRoundNumber+1).toString() : currentRoundNumber.toString()}</h3>
                        </div>
                      </div>
                    </div>
                  </div>
                  </a>
                </div> : null}
              </div>
            </div>
          </div>
        </div>
        
        {roundState != 4 && !buysDisabled && roundState != 0 ? <div className="row text-center">
          <div className="col-xs-12 col-xl-6 grid-margin stretch-card">
            <div className="card">
              
              <div className="card-body">
                
                {this.state.ticketsToBuy ?
                
                <h2 className="mt-2">Buy <span style={{color: 'rgba(50, 205, 50, 1)'}}>{this.state.ticketsToBuy}</span> {this.state.ticketsToBuy == 1 ? 'ticket' : 'tickets'} for <span style={{color: 'yellow'}}>{(this.state.ticketsToBuy * (roundState == 5 ? discountedPriceForTicket : discountedPriceForTicketCurrent)).toPrecision(6)} BNB</span></h2> : <h3>Buy Tickets</h3>}
                <br/>
                <div className="row">
                  <div className="col-xs-12 col-xl-12 my-auto font-weight-semibold">
                    <h4>Last Buyer Position 
                      
                    <Button className="mx-2" onClick={() => {
                  this.buyTickets(wallet, contract, 1, discountedPriceForTicket, getWallet, discountedPriceForTicketAhead, roundState, stats)}
                  }>1 Ticket</Button>
                      
                       Currently COSTS YOU: <span style={{color: 'yellow'}}>{(discountedPriceForTicketCurrent).toPrecision(6)}</span><span style={{fontSize: '0.7rem'}}>BNB</span></h4>
                    <h4 className="mb-4">Last Buyer Payout ({(settings.activeSettings.lastBuyerPayoutPercent)}% of pot) Currently WINS YOU: <span className="text-success">{((settings.activeSettings.lastBuyerPayoutPercent/100)*currentRoundPot*(1+stats.userBonus)).toPrecision(6)}</span><span style={{fontSize: '0.7rem'}}>BNB</span></h4>
                  </div>
                  <div className="col-xs-12 col-xl-12 my-auto">
                    {inputBuy}
                  </div>
                  <div className="col-xs-12 col-xl-12 my-auto">
                    <div className="container">
                  <div className="row w-100 m-0">
                    {quickBuys}
                  </div>
                  {topBuyer ? <div className="col-xs-12 col-xl-12 my-auto">
                    <h5>Top Buyer Position 
                      
                      <Button className="mx-2" onClick={() => {
                  this.buyTickets(wallet, contract, topBuyer.ticketsBought+1-stats.userTicketsBought, discountedPriceForTicket, getWallet, discountedPriceForTicketAhead, roundState, stats)}
                  }>{(topBuyer.ticketsBought+1-stats.userTicketsBought).toString()} Tickets</Button>
                  
                   Currently COSTS YOU: <span style={{color: 'yellow'}}>{((topBuyer.ticketsBought+1-stats.userTicketsBought)*discountedPriceForTicketCurrent).toPrecision(6)}</span><span style={{fontSize: '0.7rem'}}>BNB</span></h5>
                    <h5 className="mb-4">Top Buyer Payout ({(settings.activeSettings.placePayoutPercents[0])}% of pot) Currently WINS YOU: <span className="text-success">{((settings.activeSettings.placePayoutPercents[0]/100)*currentRoundPot*(1+stats.userBonus)).toPrecision(6)}</span><span style={{fontSize: '0.7rem'}}>BNB</span></h5>
                  </div> : null}
                  {secondBuyer ? <div className="col-xs-12 col-xl-12 my-auto">
                    <h5>Second Buyer Position 
                      
                      <Button className="mx-2" onClick={() => {
                  this.buyTickets(wallet, contract, secondBuyer.ticketsBought+1-stats.userTicketsBought, discountedPriceForTicket, getWallet, discountedPriceForTicketAhead, roundState, stats)}
                  }>{(secondBuyer.ticketsBought+1-stats.userTicketsBought).toString()} Tickets</Button>
                      
                       Currently COSTS YOU: <span style={{color: 'yellow'}}>{((secondBuyer.ticketsBought+1-stats.userTicketsBought)*discountedPriceForTicketCurrent).toPrecision(6)}</span><span style={{fontSize: '0.7rem'}}>BNB</span></h5>
                    <h5 className="mb-4">Second Buyer Payout ({(settings.activeSettings.placePayoutPercents[1])}% of pot) Currently WINS YOU: <span className="text-success">{((settings.activeSettings.placePayoutPercents[1]/100)*currentRoundPot*(1+stats.userBonus)).toPrecision(6)}</span><span style={{fontSize: '0.7rem'}}>BNB</span></h5>
                  </div> : null}
                  {thirdBuyer ? <div className="col-xs-12 col-xl-12 my-auto">
                    <h5>Third Buyer Position 
                      
                      <Button className="mx-2" onClick={() => {
                  this.buyTickets(wallet, contract, thirdBuyer.ticketsBought+1-stats.userTicketsBought, discountedPriceForTicket, getWallet, discountedPriceForTicketAhead, roundState, stats)}
                  }>{(thirdBuyer.ticketsBought+1-stats.userTicketsBought).toString()} Tickets</Button>
                    
                     Currently COSTS YOU: <span style={{color: 'yellow'}}>{((thirdBuyer.ticketsBought+1-stats.userTicketsBought)*discountedPriceForTicketCurrent).toPrecision(6)}</span><span style={{fontSize: '0.7rem'}}>BNB</span></h5>
                    <h5 className="mb-4">Third Buyer Payout ({(settings.activeSettings.placePayoutPercents[2])}% of pot) Currently WINS YOU: <span className="text-success">{((settings.activeSettings.placePayoutPercents[2]/100)*currentRoundPot*(1+stats.userBonus)).toPrecision(6)}</span><span style={{fontSize: '0.7rem'}}>BNB</span></h5>
                  </div> : null}
                  </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xs-12 col-xl-6 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h2 className="card-title">Current Top Buyers</h2>
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th> Rank </th>
                        <th> Address </th>
                        {/* <th> Lead </th> */}
                        <th> Tickets </th>
                        <th> TO WIN </th>
                        <th> Last Buy </th>
                        <th> OVERTAKE </th>
                      </tr>
                    </thead>
                    <tbody>
                      { topBuyersContent }
                    </tbody>
                  </table>
                  <br/>
                  <div className="col-xs-12 col-xl-12">
                    <h4>- <span className="text-success">{roundState != 5 ? stats.ticketsBought : 0} Tickets</span> bought this round</h4>
                    <h4>- <span className="text-success">{roundState != 5 ? Number(stats.totalSpentOnTickets).toPrecision(6) : 0} BNB</span> spent on tickets this round</h4>
                    <h4>- <span className="text-danger">{roundState != 5 ? numberWithCommas(Number(stats.tokensBurned).toFixed(0)) : 0} Burned</span> tokens this round (buyback)</h4>
                    {/* <button type="button" className="btn btn-info btn-lg btn-block" style={{fontSize: '16px'}}>Click to snipe first place INSTANTLY by buying <span style={{color: 'rgba(50, 205, 50, 1)'}}>{(this.state.ticketsToBuy/priceForTicket).toFixed(0)}</span> tickets for <span style={{color: 'yellow'}}>{(200).toFixed(4)} BNB</span> */}
                    {/* </button> */}
                  </div>
                </div>
                <br/>
              </div>
            </div>
          </div>
        </div> : null
        }
        {roundState != 5 ? <div className="row">
          {roundState != 4 ? buysDisabled ?
          
          <div className={`col-xs-12 col-xl-12 grid-margin stretch-card`}>
            <div className="card">
              <div className="card-body stretch-card">
                <div className="col-xs-12 col-xl-12">
                  <h3>Round Payouts:</h3>
                  {roundPotWinnersBreakdown.map((breakdown, index) => <BreakdownBar key={breakdown[0] + index} title={breakdown[0]} number={ breakdown[1] } percent={breakdown[2]} color={breakdown[3]} />)}
                </div>
              </div>
            </div>
          </div>
          
          : 
          
          <div className={`col-xs-12 col-xl-12 grid-margin stretch-card`}>
            <div className="card">
              <div className="card-body">
                <div className="aligner-wrapper mt-4">
                  <div className="absolute center-content w-100">
                    <div className="d-flex flex-row justify-content-between">
                      <h3 className="card-title text-center">Winners When Round Ends</h3>
                    </div>
                  </div>
                </div><br/>
                <div className="col-xs-12">
                  {roundPotWinnersBreakdown.map((breakdown, index) => <BreakdownBar key={breakdown[0] + index} title={breakdown[0]} number={breakdown[1]} percent={breakdown[2]} color={breakdown[3]} />)}
                </div>
              </div>
            </div>
          </div>

          :

          null
          
          }
        </div> : null}
      </div> 
    );
  }
}

export default Dashboard;