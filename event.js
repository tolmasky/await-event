
module.exports = function awaitEvent({ eventEmitter, resolveOn = [], rejectOn = [], timeout = Infinity, forceArray = false })
{
    const events = [].concat(resolveOn);
    const errorEvents = [].concat(rejectOn)

    return new Promise(function(resolve, reject)
    {
        const timeoutID = +timeout < Infinity && setTimeout(errorOut(TimeoutError), +timeout);
        const eventFunctions = events.map(anEvent => on(eventEmitter, anEvent, fired(anEvent)));
        const errorFunctions = errorEvents.map(anEvent => on(eventEmitter, anEvent, errorOut(EventError, anEvent)));

        function errorOut(aFunction, ...args)
        {
            return function ()
            {
                unregister();
                reject(new aFunction(...args));
            }
        }

        function fired(anEvent)
        {
            return function ()
            {
                unregister();
                
                const value = arguments[0];
                const args = Array.prototype.slice.apply(arguments);
        
                if (events.length > 1)
                    return resolve({ name: anEvent, value, args });
                
                if (args.length > 1 || forceArray)
                    return resolve(args);
                
                resolve(value);
            }
        }

        function unregister()
        {
            if (timeoutID !== false)
                clearTimeout(timeoutID);

            events.forEach(anEvent => eventEmitter.removeListener(anEvent, fired));
            errorEvents.forEach((anEvent, anIndex) => 
                eventEmitter.removeListener(anEvent, errorFunctions[anIndex]));
        }
    });
}

function on(anEventEmitter, anEvent, aFunction)
{
    anEventEmitter.on(anEvent, aFunction);

    return aFunction;
}

function TimeoutError()
{
    const error = new Error("Operation timed out");

    Object.defineProperty(error, "name",
    {
        value: "TimeoutError",
        writable: true,
        enumerable: false,
        configurable: true
    });

    Object.setPrototypeOf(error, TimeoutError.prototype);

    return error;
}

TimeoutError.prototype = Object.create(Error.prototype);
TimeoutError.prototype.constructor = TimeoutError;


function EventError(anEventName)
{
    const error = new Error("Operation errored");

    Object.defineProperty(error, "name",
    {
        value: "EventError",
        writable: true,
        enumerable: false,
        configurable: true
    });

    error.eventName = anEventName;

    Object.setPrototypeOf(error, EventError.prototype);

    return error;
}

EventError.prototype = Object.create(Error.prototype);
EventError.prototype.constructor = EventError;

