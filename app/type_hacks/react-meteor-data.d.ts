declare module 'meteor/react-meteor-data' {
    import * as React from 'react';
  
    type RMDComponentConstructor<P> = React.ComponentClass<P> | React.StatelessComponent<P>
  
    export function withTracker<InP, D, OutP extends (InP & D)>(
      options: (props: InP) => D | {getMeteorData: (props: InP) => D, pure?: boolean}):
      (reactComponent: RMDComponentConstructor<OutP>) => RMDComponentConstructor<InP>;
  }