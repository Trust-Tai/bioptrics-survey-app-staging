declare module 'meteor/tmeasday:publish-counts' {
  namespace Counts {
    function publish(
      self: any,
      name: string,
      cursor: any,
      options?: {
        noReady?: boolean;
        nonReactive?: boolean;
        countFromField?: string;
        countFromFieldLength?: boolean;
      }
    ): any;

    function get(name: string): number;
    function has(name: string): boolean;
  }
  
  export { Counts };
}
