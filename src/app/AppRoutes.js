import React, { Component,Suspense, lazy } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import Spinner from '../app/shared/Spinner';

const Dashboard = lazy(() => import('./dashboard/Dashboard'));

class AppRoutes extends Component {
  render () {

    return (
      <Suspense fallback={<Spinner/>}>
        <Switch>
          <Route exact path="/play" render={props => <Dashboard {...props} mainState={this.props.mainState} /> } />
          <Redirect to="/play" />
        </Switch>
      </Suspense>
    );
  }
}

export default AppRoutes;