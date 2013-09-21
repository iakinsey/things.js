/*jslint browser: true*/

// Web worker actor.
// Single-threaded actor.


var actorBase;


/**
 * Singleton. TODO
 * @class WebWorkerActorDetail
 * @classdesc A set of methods accessed by the actor that utilize web workers.
 */
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


/**
 * Singleton
 * @class NativeActorDetail
 * @classdesc A set of methods accessed by the actor to handle async behaviour.
 */
function NativeActorDetail() {
    'use strict';

    var self = this;

    if (NativeActorDetail.prototype.singletonInstance) {
        return NativeActorDetail.prototype.singletonInstance;
    }
    NativeActorDetail.prototype.singletonInstance = self;

    /**
     * Posts message with setTimeout, calling the actor's on_message function.
     * @param {Actor} scope - The Actor calling this method.
     * @param {object} message - The message passed into the actor.
     */
    self.put = function (scope, message) {
        setTimeout(function () { scope.on_message(message); }, 0);
    };

    /**
     * Synchronous calling of the actor's on_message function.
     * @param {Actor} scope - The Actor calling this method.
     * @param {object} message - The message passed into the actor.
     */

    self.call = function (scope, message) {
        return scope.on_message(message);
    };

    /**
     * Broadcasts message to every actor subscribed to the actor passed in.
     * @param {Actor} scope - The Actor calling this method.
     * @param {object} message - The message passed to the actor.
     */
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


/**
 * Singleton
 * @class ActorBase
 * @classdesc Singleton used to determine the actor implementation.
 */
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

    /**
     * Passes put request to actor detail.
     * @param {Actor} scope - The Actor calling this method.
     * @param {object} message - The message passed to the actor.
     */
    self.put = function (scope, message) {
        self.actorDetails.put(scope, message);
    };

    /**
     * Passes call request to actor detail.
     * @param {Actor} scope - The Actor calling this method.
     * @param {object} message - The message passed to the actor.
     */
    self.call = function (scope, message) {
        self.actorDetail.call(scope, message);
    };

    /**
     * Passes broadcast request to actor detail.
     * @param {Actor} scope - The Actor calling this method.
     * @param {object} message - The message being broadcast.
     */
    self.broadcast = function (scope, message) {
        self.actorDetail.broadcast(scope, message);
    };
}


/**
 * @class
 * @classdesc An actor.
 * @param {Function} fn - A function that will handle recieved messages.
 */
function Actor(fn) {
    'use strict';

    var self = this;

    // @constructor
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
