import nats , { Stan } from 'node-nats-streaming';

class NatsWrapper {
  // Inside of here, we want to create a NATS client.
  // We want to create that and assign it as a property to our class.
  // The ? tells typescript that this property might be undefined for certain periods of 
  // of time. We do not want to define this client property early. 
  // We want it to be defined only once some call is made from index.ts.
  private _client?: Stan;

  // Getter defines a client property on the instance.
  get client() {
    if(!this._client) {
      throw new Error('Cannot access NATS client before connecting');
    }
    return this._client;
  }

  // Inside of connect we are going to create an actual instance of a NATS client
  connect (clusterId: string, clientId: string, url: string) {
    // The url should be inside of an object.
    this._client = nats.connect(clusterId, clientId, { url});

    return new Promise<void> ((resolve, reject ) => {
      this.client.on('connect', () => {
        console.log('Connected to NATS');
        resolve();
      });
      this.client.on('error', (err) => {
        reject(err);
      })
    });
    
  }
}
export const natsWrapper = new NatsWrapper();