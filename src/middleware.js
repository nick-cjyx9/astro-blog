// export middleware functions that will be called before every request here...

export function onRequest(context, next) {
  return next()
};
