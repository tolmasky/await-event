
`await-event` lets you interact with event emitters using promises (or async-await).

## Usage
The basic usage pattern is:

```javascript
const event = require("@await/event");
const subprocess = spawn("node", ["subprocess.js"]);

const message = await event({ eventEmitter: subprocess, resolveOn: "message", rejectOn:["close", "error"] });
```

By default, if the event handler was only passed on argument, then it will be returned on success. If it is passed
multiple arguments, then an array with all the arguments will be returned instead. If you'd always like an array,
pass `forceArray` true as an option.

If any of the rejected events take place, an `EventError` will be thrown.

## Multiple success events

You can pass an array to resolveOn as well, in which case the return value with be an object with three fields: `name`, `value`, and `args`. Name is the name of the event that succeeded, `value` is simply the first argument passed to the event handler, and `args` is all the arguments. That way you can continue using "single return" style:

```
const { name, value } = await event({ ..., resolveOn: ["a", "b"] });
```

## Timeout

```javascript
await event({ eventEmitter, ..., timeout: 1000 });
```

If the appropriate event doesn't transpire before the timeout, a TimeoutError will fire.
