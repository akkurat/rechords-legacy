import {Meteor} from 'meteor/meteor';
import {render} from 'react-dom';

import * as React from 'react';
import App from '../imports/ui/App';


Meteor.startup(() => {
  render((
    <App/>
  ), document.getElementById('body'));
});
