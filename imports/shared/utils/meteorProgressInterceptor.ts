import { Meteor } from 'meteor/meteor';
import { EJSONable, EJSONableProperty } from 'meteor/ejson';
import progressBar from './nprogress';

/**
 * Patches Meteor.call and Meteor.apply to show progress bar during method calls
 */
export const patchMeteorMethods = () => {
  // Keep references to the original methods
  const originalCall = Meteor.call;
  const originalApply = Meteor.apply;
  
  // Active method calls counter
  let activeMethodCalls = 0;
  
  // Patch Meteor.call
  Meteor.call = function<Result extends EJSONable | EJSONable[] | EJSONableProperty | EJSONableProperty[]>(
    name: string, 
    ...args: any[]
  ) {
    // Extract callback if it exists
    const lastArg = args[args.length - 1];
    const hasCallback = typeof lastArg === 'function';
    const callback = hasCallback ? args.pop() : undefined;
    
    // Start progress
    activeMethodCalls++;
    progressBar.start();
    
    // Create new callback that completes progress when done
    const wrappedCallback = function(error: any, result: any) {
      activeMethodCalls--;
      if (activeMethodCalls <= 0) {
        activeMethodCalls = 0;
        progressBar.done();
      }
      
      // Call original callback if it exists
      if (callback) {
        callback(error, result);
      }
    };
    
    // Call original method with our wrapped callback
    if (hasCallback) {
      return originalCall.apply(this, [name, ...args, wrappedCallback]);
    } else {
      return originalCall.apply(this, [name, ...args]);
    }
  };
  
  // Create a type-safe wrapper around the original apply method
  const originalApplyTyped = originalApply as unknown as {
    <Result>(name: string, args: readonly (EJSONable | EJSONableProperty)[], options?: any, callback?: Function): any;
  };
  
  // Patch Meteor.apply with a simpler implementation that focuses on progress tracking
  const originalMeteorApply = Meteor.apply;
  Meteor.apply = function(name: string, args: any[], options?: any, callback?: Function) {
    // Handle different argument patterns
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    options = options || {};
    
    // Start progress
    activeMethodCalls++;
    progressBar.start();
    
    // Create new callback that completes progress when done
    const wrappedCallback = function(error: any, result: any) {
      activeMethodCalls--;
      if (activeMethodCalls <= 0) {
        activeMethodCalls = 0;
        progressBar.done();
      }
      
      // Call original callback if it exists
      if (callback) {
        callback(error, result);
      }
    };
    
    // Call original method with our wrapped callback
    return originalMeteorApply(name, args, options, wrappedCallback);
  };
};

/**
 * Patches Meteor.subscribe to show progress bar during subscriptions
 */
export const patchMeteorSubscriptions = () => {
  // Keep reference to the original subscribe method
  const originalSubscribe = Meteor.subscribe;
  
  // Active subscriptions counter
  let activeSubscriptions = 0;
  
  // Patch Meteor.subscribe
  Meteor.subscribe = function(name: string, ...args: any[]) {
    // Start progress
    activeSubscriptions++;
    progressBar.start();
    
    // Get the subscription handle
    const handle = originalSubscribe.apply(this, args);
    
    // Create a wrapper around the original handle
    const originalReady = handle.ready;
    
    // Override the ready method
    handle.ready = function() {
      const isReady = originalReady.apply(this);
      
      // If subscription is ready, complete progress
      if (isReady) {
        activeSubscriptions--;
        if (activeSubscriptions <= 0) {
          activeSubscriptions = 0;
          progressBar.done();
        }
      }
      
      return isReady;
    };
    
    return handle;
  };
};

/**
 * Initialize all Meteor interceptors
 */
export const initMeteorProgressInterceptors = () => {
  patchMeteorMethods();
  patchMeteorSubscriptions();
};

export default initMeteorProgressInterceptors;
