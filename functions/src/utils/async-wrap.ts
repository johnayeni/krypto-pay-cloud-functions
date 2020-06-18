const asyncWrap = (promise: Promise<any>) =>
  promise.then((result: any) => [null, result]).catch((err: Error) => [err]);

export default asyncWrap;
