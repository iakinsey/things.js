/*jslint browser: true*/

// Web worker actor.
// Single-threaded actor.

var actorBase;

function WebWorkerActorDetail() {
    'use strict';

    var self = this;

    if (WebWorkerActorDetail.prototype.singletonInstance) {
        return WebWorkerActorDetail.prototype.singletonInstance;
    }
    WebWorkerActorDetail.prototype.singletonInstance = self;

    self.put = function (scope, message) {};
    self.call = function (scope, message) {};
    self.broadcast = function (scope, message) {};
}

function NativeActorDetail() {
    'use strict';

    var self = this;

    if (NativeActorDetail.prototype.singletonInstance) {
        return NativeActorDetail.prototype.singletonInstance;
    }
    NativeActorDetail.prototype.singletonInstance = self;

    self.put = function (scope, message) {
        setTimeout(function () { scope.on_message(message); }, 0);
    };

    self.call = function (scope, message) {
        return scope.on_message(message);
    };

    self.broadcast = function (scope, message) {
        var subscribers = scope.subscribers,
            actor,
            i;

        for (i = scope.subscribers.length - 1; i >= 0; i -= 1) {
            actor = subscribers[i];
            self.put(actor, message);
        }
    };

}

// Singleton used to determine the actor implementation.
function ActorBase() {
    'use strict';

    var self = this;

    if (ActorBase.prototype.singletonInstance) {
        return ActorBase.prototype.singletonInstance;
    }
    ActorBase.prototype.singletonInstance = self;

    // TODO Node actors with process.nextTick and setTimeout actors.
    if (window.hasOwnProperty('Worker')) {
        self.actorDetail = new WebWorkerActorDetail();
    } else {
        self.actorDetail = new NativeActorDetail();
    }

    self.put = function (scope, message) {
        self.actorDetails.put(scope, message);
    };

    self.call = function (scope, message) {
        self.actorDetail.call(scope, message);
    };

    self.broadcast = function (scope, message) {
        self.actorDetail.broadcast(scope, message);
    };
}

function Actor(fn) {
    'use strict';

    // @constructor
    var self = this;
    (function init() {
        if (typeof (fn) === 'function') {
            self.on_message = fn;
        } else {
            self.on_message = function (message) {};
        }

        if (!actorBase) {
            actorBase = new ActorBase();
        }
    }());

    /**
     * Put a message in the actor's mailbox and forget about it.
     * @param {object} message - Data to be passed.
     */
    self.put = function (message) {
        actorBase.put(self, message);
    };

    /**
     * Actor call with expected return data.
     * @param {object} message - Data
     */
    self.call = function (message) {
        return actorBase.call(self, message);
    };

    /**
     * Broadcast to all subscribers.
     * @param {object} message - Data to be passed.
     */
    self.broadcast = function (message) {
        return actorBase.broadcast(self, message);
    };

    /**
     * Subscribe an actor to this actor.
     * @param {Actor} actor - An actor that will subscribe to this actor.
     */
    self.subscribe = function (actor) {
        if (self.subscribers.indexOf(actor) === -1) {
            self.subscribers.push(actor);
        }
    };

    /**
     * Subscribe this actor to another actor.
     * @param {Actor} actor - An actor that this actor will subscribe to.
     */
    self.listen = function (actor) {
        if (actor.subscribers.indexOf(actor) === -1) {
            actor.subscribers.push(self);
        }
    };
}
