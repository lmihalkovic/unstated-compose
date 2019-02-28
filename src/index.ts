
/* IMPORT */

import {Container} from 'unstated';

/* CONTAINERS */

class ChildContainer<Context extends object, State extends object> extends Container<State> {
  ctx: Context;
}

class ParentContainer<Context extends object, State extends object> extends Container<State> {
  ctx: Context;
  [index:string]: Container<State>[keyof Container<State>] | Context[keyof Context] | Context; //FIXME: Should be `[key in keyof Children]: Children[keyof Children]` instead
}

/* COMPOSE */

interface StateObject {
  [name: string]: any;
  ctx: any;
  setState: (obj: any) => any
}
type StateObjectCtor = new () => StateObject;

type Types = {
  [name: string]: StateObjectCtor | StateObject;
}

function compose ( containers: Types ) {

  return function ( MainContainer ) {

    return class ComposedContainer extends MainContainer {

      constructor () {

        super ();

        this.state = {};
        this.ctx = {};

        for ( let name in containers ) {

          // find what we have
          const val = containers[name];
          const c = (typeof val == 'object') ? containers[name] : new (containers[name] as StateObjectCtor)();
          const container = c as StateObject;

          container.ctx = this;

          this[name] = container;
          this.state[name] = Object.assign ( {}, container.state );
          this.ctx[name] = container;

          const setState = container.setState;

          container.setState = async ( ...args ) => {

            await setState.apply ( container, args );

            const state = Object.assign ( {}, container.state );

            this.setState ({ [name]: state });

          };

        }

      }

    } as any;

  };

}

/* EXPORT */

const exp = Object.assign ( compose, { compose, ChildContainer, ParentContainer } );

export default exp;
