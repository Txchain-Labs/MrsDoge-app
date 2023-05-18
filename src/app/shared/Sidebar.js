import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { Collapse, Dropdown } from 'react-bootstrap';



import { shortenAddress } from '../../utils';

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

class Sidebar extends Component {

  state = {};

  toggleMenuState(menuState) {
    if (this.state[menuState]) {
      this.setState({[menuState] : false});
    } else if(Object.keys(this.state).length === 0) {
      this.setState({[menuState] : true});
    } else {
      Object.keys(this.state).forEach(i => {
        this.setState({[i]: false});
      });
      this.setState({[menuState] : true}); 
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.location !== prevProps.location) {
      this.onRouteChanged();
    }
  }

  onRouteChanged() {
    document.querySelector('#sidebar').classList.remove('active');
    Object.keys(this.state).forEach(i => {
      this.setState({[i]: false});
    });

    const dropdownPaths = [
      {path:'/apps', state: 'appsMenuOpen'},
      {path:'/basic-ui', state: 'basicUiMenuOpen'},
      {path:'/advanced-ui', state: 'advancedUiMenuOpen'},
      {path:'/form-elements', state: 'formElementsMenuOpen'},
      {path:'/tables', state: 'tablesMenuOpen'},
      {path:'/maps', state: 'mapsMenuOpen'},
      {path:'/icons', state: 'iconsMenuOpen'},
      {path:'/charts', state: 'chartsMenuOpen'},
      {path:'/user-pages', state: 'userPagesMenuOpen'},
      {path:'/error-pages', state: 'errorPagesMenuOpen'},
      {path:'/general-pages', state: 'generalPagesMenuOpen'},
      {path:'/ecommerce', state: 'ecommercePagesMenuOpen'},
      {path:'/editors', state: 'editorsMenuOpen'},
    ];

    dropdownPaths.forEach((obj => {
      if (this.isPathActive(obj.path)) {
        this.setState({[obj.state] : true})
      }
    }));
 
  }

  render () {

    const { username, holderType, wallet, getWallet, stats, ca, roundState } = this.props.mainState;



    return (
      <nav className="sidebar sidebar-offcanvas" id="sidebar">
        <div className="sidebar-brand-wrapper d-none d-lg-flex align-items-center justify-content-center fixed-top">
          {/* <a className="sidebar-brand brand-logo" href="index.html"><img src={require('../../assets/images/logo.svg')} alt="logo" /></a>
          <a className="sidebar-brand brand-logo-mini" href="index.html"><img src={require('../../assets/images/logo-mini.svg')} alt="logo" /></a> */}
          <a className="sidebar-brand brand-logo" href="index.html"><h1>$FOMO</h1></a>
          <a className="sidebar-brand brand-logo-mini" href="index.html"><h1>$FOMO</h1></a>
        </div>
        <ul className="nav">
          <li className="nav-item profile">
            <div className="profile-desc">
              <div className="profile-pic">
                <div className="count-indicator">
                  <img className="img-xs rounded-circle " src={require('../../assets/images/fomo.png')} alt="profile" />
                  <span className="count bg-success"></span>
                </div>
                <div className="profile-name">
                  <h5 onClick={() => wallet ? null : getWallet()} className={`${wallet ? '' : 'cursor-pointer '} mb-0 font-weight-normal`}>{username ? shortenAddress(username) : 'Connect Wallet'}</h5>
                  <span>Tokens: {stats ? isNaN(stats.userBalance) ? 0 : numberWithCommas((stats.userBalance).toFixed(0)) : 0}</span><br/>
                  <span>{holderType}</span>
                </div>
              </div>
            </div>
          </li>
          <li className="nav-item profile">
            <div className="profile-desc">
              <div className="profile-pic">
                <div className="count-indicator">
                  <img className="img-xs rounded-circle " src={require('../../assets/images/dashboard/bnb.svg')} alt="profile" />
                </div>
                <div className="profile-name">
                  <h5 className="mb-0 font-weight-normal">Holder Discount</h5>
                  <span className="text-success">{stats ? isNaN(stats.userBonus) ? '0' : (stats.userBonus*100).toFixed(1) : '0'}%</span><br/>
                </div>
              </div>
            </div>
          </li>
          <li className="nav-item profile">
            <div className="profile-desc">
              <div className="profile-pic">
                <div className="count-indicator">
                  <img className="img-xs rounded-circle " src={require('../../assets/images/dashboard/bnb.svg')} alt="profile" />
                </div>
                <div className="profile-name">
                  <h5 className="mb-0 font-weight-normal">Holder Bonus</h5>
                  <span className="text-success">{stats ? isNaN(stats.userBonus) ? '0' : (stats.userBonus*100).toFixed(1) : '0'}%</span><br/>
                </div>
              </div>
            </div>
          </li>
          <li className="nav-item profile">
            <div className="profile-desc">
              <div className="profile-pic">
                <div className="count-indicator">
                  <img className="img-xs rounded-circle " src={require('../../assets/images/dashboard/bnb.svg')} alt="profile" />
                </div>
                <div className="profile-name">
                  <h5 className="mb-0 font-weight-normal">Your Tickets</h5>
                  <span>{stats ? (isNaN(stats.userTicketsBought) || roundState == 5) ? '0 Tickets' : stats.userTicketsBought == 1 ? stats.userTicketsBought + " Ticket" : stats.userTicketsBought + " Tickets" : '0 Tickets'}</span><br/>
                </div>
              </div>
            </div>
          </li>
          <li className="nav-item profile">
            <div className="profile-desc">
              <div className="profile-pic">
                <div className="count-indicator">
                  <img className="img-xs rounded-circle " src={require('../../assets/images/dashboard/bnb.svg')} alt="profile" />
                </div>
                <div className="profile-name">
                  <h5 className="mb-0 font-weight-normal">Your BNB Spent</h5>
                  <span>{stats ? (isNaN(stats.userTotalSpentOnTickets) || roundState == 5) ? '0 BNB' : stats.userTotalSpentOnTickets.toPrecision(6) + " BNB" : '0 BNB'}</span><br/>
                </div>
              </div>
            </div>
          </li>
          <li className="nav-item profile">
            <div className="profile-desc">
              <div className="profile-pic">
                <div className="count-indicator">
                  <img className="img-xs rounded-circle " src={require('../../assets/images/dashboard/bnb.svg')} alt="profile" />
                </div>
                <div className="profile-name">
                  <h5 className="mb-0 font-weight-normal">Pending Dividends</h5>
                  <span>{stats ? stats.userWithdrawableDividend ? stats.userWithdrawableDividend.toPrecision(6) : '0' : '0'} BNB</span><br/>
                </div>
              </div>
            </div>
          </li>
          <br/>
          {/* <li className={ this.isPathActive('/play') ? 'nav-item menu-items active' : 'nav-item menu-items' }>
            <Link className="nav-link" to="/play">
              <span className="menu-icon"><i className="mdi mdi-currency-usd"></i></span>
              <span className="menu-title">Play</span>
            </Link>
          </li> */}
          <li className={ 'nav-item menu-items ' }>
            <a className="nav-link" href={`https://exchange.pancakeswap.finance/#/swap?outputCurrency=${ca}`} target="_blank" rel="noopepener noreferrer">
              <span className="menu-icon"><i className="mdi mdi-currency-usd"></i></span>
              <span className="menu-title">Buy Tokens!</span>
            </a>
          </li>
          <li className={ 'nav-item menu-items ' }>
            <a className="nav-link" href={`https://poocoin.app/tokens/${ca}`} target="_blank" rel="noopepener noreferrer">
              <span className="menu-icon"><i className="mdi mdi-currency-usd"></i></span>
              <span className="menu-title">View Chart!</span>
            </a>
          </li>
        </ul>
      </nav>
    );
  }

  isPathActive(path) {
    return this.props.location.pathname.startsWith(path);
  }

  componentDidMount() {
    this.onRouteChanged();
    // add class 'hover-open' to sidebar navitem while hover in sidebar-icon-only menu
    const body = document.querySelector('body');
    document.querySelectorAll('.sidebar .nav-item').forEach((el) => {
      
      el.addEventListener('mouseover', function() {
        if(body.classList.contains('sidebar-icon-only')) {
          el.classList.add('hover-open');
        }
      });
      el.addEventListener('mouseout', function() {
        if(body.classList.contains('sidebar-icon-only')) {
          el.classList.remove('hover-open');
        }
      });
    });
  }

}

export default withRouter(Sidebar);