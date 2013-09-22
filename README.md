# Things.js
## An implementation of Things for Javascript

### Introduction

Things is an actor framework that emphasizes readability. The Javascript
implementation is currently incomplete and missing a large number of features.

### Setting up an environment
Download Google Closure and place compiler.jar in the root path. Then run make.

    make

Include the library in your browser. Things currently does not support node.js.

    <script type="text/javascript" src="things.min.js"></script>

### Usage

#### Actor
Setting up an actor is relatively simple. However, a lot of features are
currently missing to make it a true Actor model. You must include self as an
argument for the actor, this allows you to access the actor's public methods.

    actor = new Actor(function (self, message) {
        return message;
    });

To put a message in the actor's mailbox, call the .put() method.

    actor.put(10)


If you would like to receive a return value from an actor, use the .call()
method.

    stuff = actor.call(10)
    console.log(stuff)
