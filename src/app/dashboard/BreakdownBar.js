import React, { Component } from 'react'
import { ProgressBar } from 'react-bootstrap'

export default class BreakdownBar extends Component {
  render() {
    return (
      <div className="wrapper mt-4">
        <div className="d-flex justify-content-between mb-2">
          <div className="d-flex align-items-center">
            <img src={require('../../assets/images/dashboard/bnb.svg')} width="22" height="22" />
            <p className="mb-0 ml-1 font-weight-medium text-white">{this.props.number} <span style={{fontSize: '0.7rem'}}> ➣</span></p>
            <small style={{color: this.props.color}} className="ml-2">{this.props.title}</small>
          </div>
          <p style={{color: this.props.color}} className="mb-0 font-weight-medium">{this.props.percent}%</p>
        </div>
        <ProgressBar striped variant='success' now={this.props.percent}/>
      </div>
    )
  }
}
