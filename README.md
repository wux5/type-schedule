# Type Schedule
[![Build Status](https://travis-ci.org/wux5/type-schedule.svg?branch=master)](https://travis-ci.org/wux5/type-schedule)
[![Coverage Status](https://coveralls.io/repos/github/wux5/type-schedule/badge.svg?branch=master)](https://coveralls.io/github/wux5/type-schedule?branch=master)

Rewrite of the awesome [node-schedule](https://github.com/node-schedule/node-schedule) in TypeScript, with enhancements:
* Job name uniqueness is checked ([#370](https://github.com/node-schedule/node-schedule/issues/370))
* Canceling job by name will properly cancel all invocations ([#368](https://github.com/node-schedule/node-schedule/issues/369))
* Support run scheduled job NOW.
* Type checking by TypeScript.
* More tests.

The project still need some work to be really compatible with [node-schedule](https://github.com/node-schedule/node-schedule). More refactoring to come as this is my first TypeScript project.
