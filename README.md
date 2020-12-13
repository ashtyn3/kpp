# Simple Lambda (SL)

SL provides a way to write pure lambda and convert it to functional javascript. In the future the hope for SL is to be able to compile to more languages but at the moment only javascript is supported.

## Goals for the project

-   [ ] Support more languages to compile to (including executable binary).
-   [x] Make a REPL environment

## Syntax

### Variables

```
x -> 3 # x has the value of 3 and is a constant.
mut v -> 24 # v has the 24 and is a mutable variable (It can be redefined).
```
### If statement

```
? 8 == 9 : (print "true") ! (print "false")

```
### Functions

```
lam xy. x+y # This will return the value of x+y

add -> lam xy. x+y # Now calling the add will return x+y
```

#### Built-in Functions

```
(print "hello, world!") # Print prints the what you pass in to it to the screen.
```

### Calls

```
(add 2,2) # this will call the function add with the parameters 2 and 2.
```
