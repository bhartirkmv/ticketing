
// Inside this file we are going to write some fake implementation
// We want to write some fake stuff in place of NatsWrapper class.

// We are exporting natsWrapper to fake out the functionality of the real natsWrapper file.
// We will have to tell jest to use this fake implementation.

// We can have a function inside the object as well.
// export const natsWrapper = {
//   client: {
//     // Here the syntax callback: () => void indicates that callback is a function.
//     publish : (subject : string, data: string, callback: () => void) =>{
//       callback();
//     }
//   }
// }


// Instead of using a fake function, we will be using a mock function, so that 
// we can create an expectation around it and test actually whether the events are 
// getting published or not.
export const natsWrapper = {
  client: {
    // This is going to return a new function. And assign it to the property of publish.
    // This function can be called from anything inside our application.
    // That function internally keeps track of whether or not it has been called 
    // what arguments it has been provided so, that we can call our expectations around it.
    // Just having this mock function is not sufficient. It needs to take the callback and call it.
    // We need both the things together. We need a mock function as well as we need the 
    // custom implementation of callback function.
    // The inner function is the actual function that will be invoked when someone tries to 
    // invoke publish.

    publish : jest.fn().mockImplementation((subject: string, data: string, callback: () => void) => {
      callback();
    })
  }
}