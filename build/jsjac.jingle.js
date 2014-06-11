/**
 * jsjac-jingle [uncompressed]
 * @fileoverview JSJaC Jingle library, implementation of XEP-0166.
 *
 * @version 0.7.0
 * @date 2014-06-11
 * @author Valérian Saliou https://valeriansaliou.name/
 * @license MPL 2.0
 *
 * @url https://github.com/valeriansaliou/jsjac-jingle
 * @repository git+https://github.com/valeriansaliou/jsjac-jingle.git
 * @depends https://github.com/sstrigler/JSJaC
 */

//     Underscore.js 1.6.0
//     http://underscorejs.org
//     (c) 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    concat           = ArrayProto.concat,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.6.0';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return obj;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, length = obj.length; i < length; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      var keys = _.keys(obj);
      for (var i = 0, length = keys.length; i < length; i++) {
        if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
      }
    }
    return obj;
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results.push(iterator.call(context, value, index, list));
    });
    return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var length = obj.length;
    if (length !== +length) {
      var keys = _.keys(obj);
      length = keys.length;
    }
    each(obj, function(value, index, list) {
      index = keys ? keys[--length] : --length;
      if (!initial) {
        memo = obj[index];
        initial = true;
      } else {
        memo = iterator.call(context, memo, obj[index], index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var result;
    any(obj, function(value, index, list) {
      if (predicate.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(predicate, context);
    each(obj, function(value, index, list) {
      if (predicate.call(context, value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, function(value, index, list) {
      return !predicate.call(context, value, index, list);
    }, context);
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate || (predicate = _.identity);
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(predicate, context);
    each(obj, function(value, index, list) {
      if (!(result = result && predicate.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, predicate, context) {
    predicate || (predicate = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(predicate, context);
    each(obj, function(value, index, list) {
      if (result || (result = predicate.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    if (obj == null) return false;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    return any(obj, function(value) {
      return value === target;
    });
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      return (isFunc ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matches(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matches(attrs));
  };

  // Return the maximum element or (element-based computation).
  // Can't optimize arrays of integers longer than 65,535 elements.
  // See [WebKit Bug 80797](https://bugs.webkit.org/show_bug.cgi?id=80797)
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.max.apply(Math, obj);
    }
    var result = -Infinity, lastComputed = -Infinity;
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      if (computed > lastComputed) {
        result = value;
        lastComputed = computed;
      }
    });
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.min.apply(Math, obj);
    }
    var result = Infinity, lastComputed = Infinity;
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      if (computed < lastComputed) {
        result = value;
        lastComputed = computed;
      }
    });
    return result;
  };

  // Shuffle an array, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var rand;
    var index = 0;
    var shuffled = [];
    each(obj, function(value) {
      rand = _.random(index++);
      shuffled[index - 1] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (obj.length !== +obj.length) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // An internal function to generate lookup iterators.
  var lookupIterator = function(value) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return value;
    return _.property(value);
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, iterator, context) {
    iterator = lookupIterator(iterator);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iterator, context) {
      var result = {};
      iterator = lookupIterator(iterator);
      each(obj, function(value, index) {
        var key = iterator.call(context, value, index, obj);
        behavior(result, key, value);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, key, value) {
    _.has(result, key) ? result[key].push(value) : result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, key, value) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, key) {
    _.has(result, key) ? result[key]++ : result[key] = 1;
  });

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator, context) {
    iterator = lookupIterator(iterator);
    var value = iterator.call(context, obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >>> 1;
      iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (obj.length === +obj.length) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n == null) || guard) return array[0];
    if (n < 0) return [];
    return slice.call(array, 0, n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n == null) || guard) return array[array.length - 1];
    return slice.call(array, Math.max(array.length - n, 0));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, (n == null) || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, output) {
    if (shallow && _.every(input, _.isArray)) {
      return concat.apply(output, input);
    }
    each(input, function(value) {
      if (_.isArray(value) || _.isArguments(value)) {
        shallow ? push.apply(output, value) : flatten(value, shallow, output);
      } else {
        output.push(value);
      }
    });
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Split an array into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(array, predicate) {
    var pass = [], fail = [];
    each(array, function(elem) {
      (predicate(elem) ? pass : fail).push(elem);
    });
    return [pass, fail];
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator, context) {
    if (_.isFunction(isSorted)) {
      context = iterator;
      iterator = isSorted;
      isSorted = false;
    }
    var initial = iterator ? _.map(array, iterator, context) : array;
    var results = [];
    var seen = [];
    each(initial, function(value, index) {
      if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
        seen.push(value);
        results.push(array[index]);
      }
    });
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(_.flatten(arguments, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.contains(other, item);
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
    return _.filter(array, function(value){ return !_.contains(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var length = _.max(_.pluck(arguments, 'length').concat(0));
    var results = new Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(arguments, '' + i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, length = list.length; i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, length = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = (isSorted < 0 ? Math.max(0, length + isSorted) : isSorted);
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
    for (; i < length; i++) if (array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item, from) {
    if (array == null) return -1;
    var hasIndex = from != null;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
      return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
    }
    var i = (hasIndex ? from : array.length);
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(length);

    while(idx < length) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    var args, bound;
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      ctor.prototype = null;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    return function() {
      var position = 0;
      var args = boundArgs.slice();
      for (var i = 0, length = args.length; i < length; i++) {
        if (args[i] === _) args[i] = arguments[position++];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return func.apply(this, args);
    };
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length === 0) throw new Error('bindAll must be passed function names');
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    options || (options = {});
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
        context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;
      if (last < wait) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) {
        timeout = setTimeout(later, wait);
      }
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      memo = func.apply(this, arguments);
      func = null;
      return memo;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = new Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = new Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    each(keys, function(key) {
      if (key in obj) copy[key] = obj[key];
    });
    return copy;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    for (var key in obj) {
      if (!_.contains(keys, key)) copy[key] = obj[key];
    }
    return copy;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          if (obj[prop] === void 0) obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] == a) return bStack[length] == b;
    }
    // Objects with different constructors are not equivalent, but `Object`s
    // from different frames are.
    var aCtor = a.constructor, bCtor = b.constructor;
    if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
                             _.isFunction(bCtor) && (bCtor instanceof bCtor))
                        && ('constructor' in a && 'constructor' in b)) {
      return false;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) == '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Optimize `isFunction` if appropriate.
  if (typeof (/./) !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj === 'function';
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj != +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  _.constant = function(value) {
    return function () {
      return value;
    };
  };

  _.property = function(key) {
    return function(obj) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of `key:value` pairs.
  _.matches = function(attrs) {
    return function(obj) {
      if (obj === attrs) return true; //avoid comparing an object to itself.
      for (var key in attrs) {
        if (attrs[key] !== obj[key])
          return false;
      }
      return true;
    }
  };

  // Run a function **n** times.
  _.times = function(n, iterator, context) {
    var accum = Array(Math.max(0, n));
    for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() { return new Date().getTime(); };

  // List of HTML entities for escaping.
  var entityMap = {
    escape: {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;'
    }
  };
  entityMap.unescape = _.invert(entityMap.escape);

  // Regexes containing the keys and values listed immediately above.
  var entityRegexes = {
    escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
    unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
  };

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  _.each(['escape', 'unescape'], function(method) {
    _[method] = function(string) {
      if (string == null) return '';
      return ('' + string).replace(entityRegexes[method], function(match) {
        return entityMap[method][match];
      });
    };
  });

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return void 0;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\t':     't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    var render;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = new RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset)
        .replace(escaper, function(match) { return '\\' + escapes[match]; });

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      }
      if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      }
      if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }
      index = offset + match.length;
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + "return __p;\n";

    try {
      render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  _.extend(_.prototype, {

    // Start chaining a wrapped Underscore object.
    chain: function() {
      this._chain = true;
      return this;
    },

    // Extracts the result from a wrapped and chained object.
    value: function() {
      return this._wrapped;
    }

  });

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}).call(this);

/*
Ring.js

Copyright (c) 2013, Nicolas Vanhoren

Released under the MIT license

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN
AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

(function() {
/* jshint es3: true, proto: true */
"use strict";

if (typeof(exports) !== "undefined") { // nodejs
    var underscore = require("underscore");
    underscore.extend(exports, declare(underscore));
} else if (typeof(define) !== "undefined") { // amd
    define(["underscore"], declare);
} else { // define global variable
    window.ring = declare(_);
}


function declare(_) {
    var ring = {};

    function RingObject() {}
    /**
        ring.Object

        The base class of all other classes. It doesn't have much uses except
        testing testing if an object uses the Ring.js class system using
        ring.instance(x, ring.Object)
    */
    ring.Object = RingObject;
    _.extend(ring.Object, {
        __mro__: [ring.Object],
        __properties__: {__ringConstructor__: function() {}},
        __classId__: 1,
        __parents__: [],
        __classIndex__: {"1": ring.Object}
    });
    _.extend(ring.Object.prototype, {
        __ringConstructor__: ring.Object.__properties__.__ringConstructor__
    });

    // utility function to have Object.create on all browsers
    var objectCreate = function(o) {
        function CreatedObject(){}
        CreatedObject.prototype = o;
        var tmp = new CreatedObject();
        tmp.__proto__ = o;
        return tmp;
    };
    ring.__objectCreate = objectCreate;

    var classCounter = 3;
    var fnTest = /xyz/.test(function(){xyz();}) ? /\$super\b/ : /.*/;

    /**
        ring.create([parents,] properties)

        Creates a new class and returns it.

        properties is a dictionary of the methods and attributes that should
        be added to the new class' prototype.

        parents is a list of the classes this new class should extend. If not
        specified or an empty list is specified this class will inherit from one
        class: ring.Object.
    */
    ring.create = function() {
        // arguments parsing
        var args = _.toArray(arguments);
        args.reverse();
        var props = args[0];
        var parents = args.length >= 2 ? args[1] : [];
        if (! (parents instanceof Array))
            parents = [parents];
        _.each(parents, function(el) {
            toRingClass(el);
        });
        if (parents.length === 0)
            parents = [ring.Object];
        // constructor handling
        var cons = props.constructor !== Object ? props.constructor : undefined;
        props = _.clone(props);
        delete props.constructor;
        if (cons)
            props.__ringConstructor__ = cons;
        else { //retro compatibility
            cons = props.init;
            delete props.init;
            if (cons)
                props.__ringConstructor__ = cons;
        }
        // create real class
        var claz = function Instance() {
            this.$super = null;
            this.__ringConstructor__.apply(this, arguments);
        };
        claz.__properties__ = props;
        // mro creation
        var toMerge = _.pluck(parents, "__mro__");
        toMerge = toMerge.concat([parents]);
        var __mro__ = [claz].concat(mergeMro(toMerge));
        //generate prototype
        var prototype = Object.prototype;
        _.each(_.clone(__mro__).reverse(), function(claz) {
            var current = objectCreate(prototype);
            _.extend(current, claz.__properties__);
            _.each(_.keys(current), function(key) {
                var p = current[key];
                if (typeof p !== "function" || ! fnTest.test(p) ||
                    (key !== "__ringConstructor__" && claz.__ringConvertedObject__))
                    return;
                current[key] = (function(name, fct, supProto) {
                    return function() {
                        var tmp = this.$super;
                        this.$super = supProto[name];
                        try {
                            return fct.apply(this, arguments);
                        } finally {
                            this.$super = tmp;
                        }
                    };
                })(key, p, prototype);
            });
            current.constructor = claz;
            prototype = current;
        });
        // remaining operations
        var id = classCounter++;
        claz.__mro__ = __mro__;
        claz.__parents__ = parents;
        claz.prototype = prototype;
        claz.__classId__ = id;
        // construct classes index
        claz.__classIndex__ = {};
        _.each(claz.__mro__, function(c) {
            claz.__classIndex__[c.__classId__] = c;
        });
        // class init
        if (claz.prototype.classInit) {
            claz.__classInit__ = claz.prototype.classInit;
            delete claz.prototype.classInit;
        }
        _.each(_.chain(claz.__mro__).clone().reverse().value(), function(c) {
            if (c.__classInit__) {
                var ret = c.__classInit__(claz.prototype);
                if (ret !== undefined)
                    claz.prototype = ret;
            }
        });

        return claz;
    };

    var mergeMro = function(toMerge) {
        /* jshint loopfunc:true */
        // C3 merge() implementation
        var __mro__ = [];
        var current = _.clone(toMerge);
        while (true) {
            var found = false;
            for (var i=0; i < current.length; i++) {
                if (current[i].length === 0)
                    continue;
                var currentClass = current[i][0];
                var isInTail = _.find(current, function(lst) {
                    return _.contains(_.rest(lst), currentClass);
                });
                if (! isInTail) {
                    found = true;
                    __mro__.push(currentClass);
                    current = _.map(current, function(lst) {
                        if (_.head(lst) === currentClass)
                            return _.rest(lst);
                        else
                            return lst;
                    });
                    break;
                }
            }
            if (found)
                continue;
            if (_.all(current, function(i) { return i.length === 0; }))
                return __mro__;
            throw new ring.ValueError("Cannot create a consistent method resolution order (MRO)");
        }
    };

    /**
        Convert an existing class to be used with the ring.js class system.
    */
    var toRingClass = function(claz) {
        if (claz.__classId__)
            return;
        var proto = ! Object.getOwnPropertyNames ? claz.prototype : (function() {
            var keys = {};
            (function crawl(p) {
                if (p === Object.prototype)
                    return;
                _.extend(keys, _.chain(Object.getOwnPropertyNames(p))
                    .map(function(el) {return [el, true];})
                    .object().value());
                crawl(Object.getPrototypeOf(p));
            })(claz.prototype);
            return _.object(_.map(_.keys(keys), function(k) {return [k, claz.prototype[k]];}));
        })();
        proto = _.chain(proto).map(function(v, k) { return [k, v]; })
            .filter(function(el) {return el[0] !== "constructor" && el[0] !== "__proto__";})
            .object().value();
        var id = classCounter++;
        _.extend(claz, {
            __mro__: [claz, ring.Object],
            __properties__: _.extend({}, proto, {
                __ringConstructor__: function() {
                    this.$super.apply(this, arguments);
                    var tmp = this.$super;
                    this.$super = null;
                    try {
                        claz.apply(this, arguments);
                    } finally {
                        this.$super = tmp;
                    }
                }
            }),
            __classId__: id,
            __parents__: [ring.Object],
            __classIndex__: {"1": ring.Object},
            __ringConvertedObject__: true
        });
        claz.__classIndex__[id] = claz;
    };

    /**
        ring.instance(obj, type)

        Returns true if obj is an instance of type or an instance of a sub-class of type.

        It is necessary to use this method instead of instanceof when using the Ring.js class
        system because instanceof will not be able to detect sub-classes.

        If used with obj or type that do not use the Ring.js class system this method will
        use instanceof instead. So it should be safe to replace all usages of instanceof
        by ring.instance() in any program, whether or not it uses Ring.js.

        Additionaly this method allows to test the type of simple JavaScript types like strings.
        To do so, pass a string instead of a type as second argument. Examples:

            ring.instance("", "string") // returns true
            ring.instance(function() {}, "function") // returns true
            ring.instance({}, "object") // returns true
            ring.instance(1, "number") // returns true
    */
    ring.instance = function(obj, type) {
        if (typeof(obj) === "object" && obj.constructor && obj.constructor.__classIndex__ &&
            typeof(type) === "function" && typeof(type.__classId__) === "number") {
            return obj.constructor.__classIndex__[type.__classId__] !== undefined;
        }
        if (typeof(type) === "string")
            return typeof(obj) === type;
        return obj instanceof type;
    };

    /**
        A class to easily create new classes representing exceptions. This class is special
        because it is a sub-class of the standard Error class of JavaScript. Examples:

        ring.instance(e, Error)

        e instanceof Error

        This two expressions will always be true if e is an instance of ring.Error or any
        sub-class of ring.Error.

    */
    ring.Error = ring.create({
        /**
            The name attribute is used in the default implementation of the toString() method
            of the standard JavaScript Error class. According to the standard, all sub-classes
            of Error should define a new name.
        */
        name: "ring.Error",
        /**
            A default message to use in instances of this class if there is no arguments given
            to the constructor.
        */
        defaultMessage: "",
        /**
            Constructor arguments:

            message: The message to put in the instance. If there is no message specified, the
            message will be this.defaultMessage.
        */
        constructor: function(message) {
            this.message = message || this.defaultMessage;
        },
        classInit: function(prototype) {
            // some black magic to reconstitute a complete prototype chain
            // with Error at the end
            var protos = [];
            var gather = function(proto) {
                if (! proto)
                    return;
                protos.push(proto);
                gather(proto.__proto__);
            };
            gather(prototype);
            var current = new Error();
            _.each(_.clone(protos).reverse(), function(proto) {
                var tmp = objectCreate(current);
                // using _.each to avoid traversing prototypes
                _.each(proto, function(v, k) {
                    if (k !== "__proto__")
                        tmp[k] = v;
                });
                current = tmp;
            });
            return current;
        }
    });

    /**
        A type of exception to inform that a method received an argument with an incorrect value.
    */
    ring.ValueError = ring.create([ring.Error], {
        name: "ring.ValueError"
    });

    /**
        This method allows to find the super of a method when that method has been re-defined
        in a child class.

        Contrary to this.$super(), this function allows to find a super method in another method
        than the re-defining one. Example:

        var A = ring.create({
            fctA: function() {...};
        });

        var B = ring.create([A], {
            fctA: function() {...};
            fctB: function() {
                ring.getSuper(B, this, "fctA")(); // here we call the original fctA() method
                // as it was defined in the A class
            };
        });

        This method is much slower than this.$super(), so this.$super() should always be
        preferred when it is possible to use it.

        Arguments:

        * currentClass: The current class. It is necessary to specify it for this function
          to work properly.
        * obj: The current object (this in most cases).
        * attributeName: The name of the desired attribute as it appeared in the base class.

        Returns the attribute as it was defined in the base class. If that attribute is a function,
        it will be binded to obj.
    */
    ring.getSuper = function(currentClass, obj, attributeName) {
        var pos;
        var __mro__ = obj.constructor.__mro__;
        for (var i = 0; i < __mro__.length; i++) {
            if (__mro__[i] === currentClass) {
                pos = i;
                break;
            }
        }
        if (pos === undefined)
            throw new ring.ValueError("Class not found in instance's method resolution order.");
        var find = function(proto, counter) {
            if (counter === 0)
                return proto;
            return find(proto.__proto__, counter - 1);
        };
        var proto = find(obj.constructor.prototype, pos + 1);
        var att;
        if (attributeName !== "constructor" && attributeName !== "init") // retro compatibility
            att = proto[attributeName];
        else
            att = proto.__ringConstructor__;
        if (ring.instance(att, "function"))
            return _.bind(att, obj);
        else
            return att;
    };

    return ring;
}
})();

/**
 * @fileoverview JSJaC Jingle library - Header
 *
 * @url https://github.com/valeriansaliou/jsjac-jingle
 * @depends https://github.com/sstrigler/JSJaC
 * @author Valérian Saliou https://valeriansaliou.name/
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */


 /**
 * Implements:
 *
 * See the PROTOCOL.md file for a list of supported protocol extensions
 *
 *
 * Workflow:
 *
 * This negotiation example associates JSJaCJingle.js methods to a real workflow
 * We assume in this workflow example remote user accepts the call he gets
 *
 * 1.cmt Local user wants to start a WebRTC session with remote user
 * 1.snd Local user sends a session-initiate type='set'
 * 1.hdl Remote user sends back a type='result' to '1.snd' stanza (ack)
 *
 * 2.cmt Local user waits silently for remote user to send a session-accept
 * 2.hdl Remote user sends a session-accept type='set'
 * 2.snd Local user sends back a type='result' to '2.hdl' stanza (ack)
 *
 * 3.cmt WebRTC session starts
 * 3.cmt Users chat, and chat, and chat. Happy Jabbering to them!
 *
 * 4.cmt Local user wants to stop WebRTC session with remote user
 * 4.snd Local user sends a session-terminate type='set'
 * 4.hdl Remote user sends back a type='result' to '4.snd' stanza (ack)
 */

/**
 * @fileoverview JSJaC Jingle library - Constants map
 *
 * @url https://github.com/valeriansaliou/jsjac-jingle
 * @depends https://github.com/sstrigler/JSJaC
 * @author Valérian Saliou https://valeriansaliou.name/
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */


/**
 * JINGLE WEBRTC
 */

var WEBRTC_GET_MEDIA           = ( navigator.webkitGetUserMedia     ||
                                   navigator.mozGetUserMedia        ||
                                   navigator.msGetUserMedia         ||
                                   navigator.getUserMedia           );

var WEBRTC_PEER_CONNECTION     = ( window.webkitRTCPeerConnection   ||
                                   window.mozRTCPeerConnection      ||
                                   window.RTCPeerConnection         );

var WEBRTC_SESSION_DESCRIPTION = ( window.mozRTCSessionDescription  ||
                                   window.RTCSessionDescription     );

var WEBRTC_ICE_CANDIDATE       = ( window.mozRTCIceCandidate        ||
                                   window.RTCIceCandidate           );

var WEBRTC_CONFIGURATION = {
  peer_connection : {
    config        : {
      iceServers : [{
        url: 'stun:stun.jappix.com'
      }]
    },

    constraints   : {
      optional : [{
        'DtlsSrtpKeyAgreement': true
      }]
    }
  },

  create_offer    : {
    mandatory: {
      'OfferToReceiveAudio' : true,
      'OfferToReceiveVideo' : true
    }
  },

  create_answer   : {
    mandatory: {
      'OfferToReceiveAudio' : true,
      'OfferToReceiveVideo' : true
    }
  }
};

var WEBRTC_SDP_LINE_BREAK      = '\r\n';
var WEBRTC_SDP_TYPE_OFFER      = 'offer';
var WEBRTC_SDP_TYPE_ANSWER     = 'answer';

var R_WEBRTC_SDP_CANDIDATE     = /^a=candidate:(\w{1,32}) (\d{1,5}) (udp|tcp) (\d{1,10}) ([a-zA-Z0-9:\.]{1,45}) (\d{1,5}) (typ) (host|srflx|prflx|relay)( (raddr) ([a-zA-Z0-9:\.]{1,45}) (rport) (\d{1,5}))?( (generation) (\d))?/i;

var R_WEBRTC_SDP_ICE_PAYLOAD   = {
  rtpmap          : /^a=rtpmap:(\d+) (([^\s\/]+)\/(\d+)(\/([^\s\/]+))?)?/i,
  fmtp            : /^a=fmtp:(\d+) (.+)/i,
  group           : /^a=group:(\S+) (.+)/,
  rtcp_fb         : /^a=rtcp-fb:(\S+) (\S+)( (\S+))?/i,
  rtcp_fb_trr_int : /^a=rtcp-fb:(\d+) trr-int (\d+)/i,
  pwd             : /^a=ice-pwd:(\S+)/i,
  ufrag           : /^a=ice-ufrag:(\S+)/i,
  ptime           : /^a=ptime:(\d+)/i,
  maxptime        : /^a=maxptime:(\d+)/i,
  ssrc            : /^a=ssrc:(\d+) (\w+)(:(.+))?/i,
  ssrc_group      : /^a=ssrc-group:(\S+) ([\d ]+)/i,
  rtcp_mux        : /^a=rtcp-mux/i,
  crypto          : /^a=crypto:(\d{1,9}) (\S+) (\S+)( (\S+))?/i,
  zrtp_hash       : /^a=zrtp-hash:(\S+) (\S+)/i,
  fingerprint     : /^a=fingerprint:(\S+) (\S+)/i,
  setup           : /^a=setup:(\S+)/i,
  extmap          : /^a=extmap:([^\s\/]+)(\/([^\s\/]+))? (\S+)/i,
  bandwidth       : /^b=(\w+):(\d+)/i,
  media           : /^m=(audio|video|application|data) /i
};

var R_NETWORK_PROTOCOLS        = {
  stun: /^stun:/i
};

var R_NETWORK_IP               = {
  all: {
    v4: /((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])/,
    v6: /^((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\3)::|:\b|$))|(?!\2\3)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4})$/i
  },

  lan: {
    v4: /(^127\.0\.0\.1)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^192\.168\.)/,
    v6: /((::1)|(^fe80::))(.+)?/i
  }
};


/**
 * JINGLE NAMESPACES
 */

var NS_JINGLE                                       = 'urn:xmpp:jingle:1';
var NS_JINGLE_ERRORS                                = 'urn:xmpp:jingle:errors:1';

var NS_JINGLE_APPS_RTP                              = 'urn:xmpp:jingle:apps:rtp:1';
var NS_JINGLE_APPS_RTP_INFO                         = 'urn:xmpp:jingle:apps:rtp:info:1';
var NS_JINGLE_APPS_RTP_AUDIO                        = 'urn:xmpp:jingle:apps:rtp:audio';
var NS_JINGLE_APPS_RTP_VIDEO                        = 'urn:xmpp:jingle:apps:rtp:video';
var NS_JINGLE_APPS_RTP_RTP_HDREXT                   = 'urn:xmpp:jingle:apps:rtp:rtp-hdrext:0';
var NS_JINGLE_APPS_RTP_RTCP_FB                      = 'urn:xmpp:jingle:apps:rtp:rtcp-fb:0';
var NS_JINGLE_APPS_RTP_ZRTP                         = 'urn:xmpp:jingle:apps:rtp:zrtp:1';
var NS_JINGLE_APPS_RTP_SSMA                         = 'urn:xmpp:jingle:apps:rtp:ssma:0';
var NS_JINGLE_APPS_STUB                             = 'urn:xmpp:jingle:apps:stub:0';
var NS_JINGLE_APPS_DTLS                             = 'urn:xmpp:tmp:jingle:apps:dtls:0';
var NS_JINGLE_APPS_GROUPING                         = 'urn:xmpp:jingle:apps:grouping:0';

var NS_JINGLE_TRANSPORTS_RAWUDP                     = 'urn:xmpp:jingle:transports:raw-udp:1';
var NS_JINGLE_TRANSPORTS_ICEUDP                     = 'urn:xmpp:jingle:transports:ice-udp:1';
var NS_JINGLE_TRANSPORTS_STUB                       = 'urn:xmpp:jingle:transports:stub:0';

var NS_JINGLE_SECURITY_STUB                         = 'urn:xmpp:jingle:security:stub:0';

var NS_JABBER_JINGLENODES                           = 'http://jabber.org/protocol/jinglenodes';
var NS_JABBER_JINGLENODES_CHANNEL                   = 'http://jabber.org/protocol/jinglenodes#channel';
var NS_TELEPATHY_MUJI                               = 'http://telepathy.freedesktop.org/muji';

var NS_EXTDISCO                                     = 'urn:xmpp:extdisco:1';

var NS_IETF_RFC_3264                                = 'urn:ietf:rfc:3264';
var NS_IETF_RFC_5576                                = 'urn:ietf:rfc:5576';
var NS_IETF_RFC_5888                                = 'urn:ietf:rfc:5888';

var R_NS_JINGLE_APP                                 = /^urn:xmpp:jingle:app:(\w+)(:(\w+))?(:(\d+))?$/;
var R_NS_JINGLE_TRANSPORT                           = /^urn:xmpp:jingle:transport:(\w+)$/;

var MAP_DISCO_JINGLE                                = [
  /* http://xmpp.org/extensions/xep-0166.html#support */
  /* http://xmpp.org/extensions/xep-0167.html#support */
  NS_JINGLE,
  NS_JINGLE_APPS_RTP,
  NS_JINGLE_APPS_RTP_AUDIO,
  NS_JINGLE_APPS_RTP_VIDEO,

  /* http://xmpp.org/extensions/xep-0177.html */
  NS_JINGLE_TRANSPORTS_RAWUDP,

  /* http://xmpp.org/extensions/xep-0176.html#support */
  NS_JINGLE_TRANSPORTS_ICEUDP,
  NS_IETF_RFC_3264,

  /* http://xmpp.org/extensions/xep-0339.html#disco */
  NS_IETF_RFC_5576,

  /* http://xmpp.org/extensions/xep-0338.html#disco */
  NS_IETF_RFC_5888,

  /* http://xmpp.org/extensions/xep-0293.html#determining-support */
  NS_JINGLE_APPS_RTP_RTCP_FB,

  /* http://xmpp.org/extensions/xep-0294.html#determining-support */
  NS_JINGLE_APPS_RTP_RTP_HDREXT,

  /* http://xmpp.org/extensions/xep-0320.html#disco */
  NS_JINGLE_APPS_DTLS,

  /* http://xmpp.org/extensions/xep-0262.html */
  NS_JINGLE_APPS_RTP_ZRTP,

  /* http://xmpp.org/extensions/xep-0272.html */
  NS_TELEPATHY_MUJI,

  /* http://xmpp.org/extensions/xep-0278.html */
  NS_JABBER_JINGLENODES,

  /* http://xmpp.org/extensions/xep-0215.html */
  NS_EXTDISCO
];



/**
 * JSJAC JINGLE CONSTANTS
 */

var JSJAC_JINGLE_AVAILABLE                           = WEBRTC_GET_MEDIA ? true : false;

var JSJAC_JINGLE_PEER_TIMEOUT_DEFAULT                = 15;
var JSJAC_JINGLE_PEER_TIMEOUT_DISCONNECT             = 5;
var JSJAC_JINGLE_STANZA_TIMEOUT                      = 10;
var JSJAC_JINGLE_STANZA_ID_PRE                       = 'jj';

var JSJAC_JINGLE_NETWORK                             = '0';
var JSJAC_JINGLE_GENERATION                          = '0';

var JSJAC_JINGLE_BROWSER_FIREFOX                     = 'Firefox';
var JSJAC_JINGLE_BROWSER_CHROME                      = 'Chrome';
var JSJAC_JINGLE_BROWSER_SAFARI                      = 'Safari';
var JSJAC_JINGLE_BROWSER_OPERA                       = 'Opera';
var JSJAC_JINGLE_BROWSER_IE                          = 'IE';

var JSJAC_JINGLE_SENDERS_BOTH                        = { jingle: 'both',      sdp: 'sendrecv' };
var JSJAC_JINGLE_SENDERS_INITIATOR                   = { jingle: 'initiator', sdp: 'sendonly' };
var JSJAC_JINGLE_SENDERS_NONE                        = { jingle: 'none',      sdp: 'inactive' };
var JSJAC_JINGLE_SENDERS_RESPONDER                   = { jingle: 'responder', sdp: 'recvonly' };

var JSJAC_JINGLE_CREATOR_INITIATOR                   = 'initiator';
var JSJAC_JINGLE_CREATOR_RESPONDER                   = 'responder';

var JSJAC_JINGLE_STATUS_INACTIVE                     = 'inactive';
var JSJAC_JINGLE_STATUS_INITIATING                   = 'initiating';
var JSJAC_JINGLE_STATUS_INITIATED                    = 'initiated';
var JSJAC_JINGLE_STATUS_ACCEPTING                    = 'accepting';
var JSJAC_JINGLE_STATUS_ACCEPTED                     = 'accepted';
var JSJAC_JINGLE_STATUS_TERMINATING                  = 'terminating';
var JSJAC_JINGLE_STATUS_TERMINATED                   = 'terminated';

var JSJAC_JINGLE_ACTION_CONTENT_ACCEPT               = 'content-accept';
var JSJAC_JINGLE_ACTION_CONTENT_ADD                  = 'content-add';
var JSJAC_JINGLE_ACTION_CONTENT_MODIFY               = 'content-modify';
var JSJAC_JINGLE_ACTION_CONTENT_REJECT               = 'content-reject';
var JSJAC_JINGLE_ACTION_CONTENT_REMOVE               = 'content-remove';
var JSJAC_JINGLE_ACTION_DESCRIPTION_INFO             = 'description-info';
var JSJAC_JINGLE_ACTION_SECURITY_INFO                = 'security-info';
var JSJAC_JINGLE_ACTION_SESSION_ACCEPT               = 'session-accept';
var JSJAC_JINGLE_ACTION_SESSION_INFO                 = 'session-info';
var JSJAC_JINGLE_ACTION_SESSION_INITIATE             = 'session-initiate';
var JSJAC_JINGLE_ACTION_SESSION_TERMINATE            = 'session-terminate';
var JSJAC_JINGLE_ACTION_TRANSPORT_ACCEPT             = 'transport-accept';
var JSJAC_JINGLE_ACTION_TRANSPORT_INFO               = 'transport-info';
var JSJAC_JINGLE_ACTION_TRANSPORT_REJECT             = 'transport-reject';
var JSJAC_JINGLE_ACTION_TRANSPORT_REPLACE            = 'transport-replace';

var JSJAC_JINGLE_ERROR_OUT_OF_ORDER                  = { jingle: 'out-of-order',           xmpp: 'unexpected-request',         type: 'wait'   };
var JSJAC_JINGLE_ERROR_TIE_BREAK                     = { jingle: 'tie-break',              xmpp: 'conflict',                   type: 'cancel' };
var JSJAC_JINGLE_ERROR_UNKNOWN_SESSION               = { jingle: 'unknown-session',        xmpp: 'item-not-found',             type: 'cancel' };
var JSJAC_JINGLE_ERROR_UNSUPPORTED_INFO              = { jingle: 'unsupported-info',       xmpp: 'feature-not-implemented',    type: 'modify' };
var JSJAC_JINGLE_ERROR_SECURITY_REQUIRED             = { jingle: 'security-required',      xmpp: 'not-acceptable',             type: 'cancel' };

var XMPP_ERROR_UNEXPECTED_REQUEST                    = { xmpp: 'unexpected-request',       type: 'wait' };
var XMPP_ERROR_CONFLICT                              = { xmpp: 'conflict',                 type: 'cancel' };
var XMPP_ERROR_ITEM_NOT_FOUND                        = { xmpp: 'item-not-found',           type: 'cancel' };
var XMPP_ERROR_NOT_ACCEPTABLE                        = { xmpp: 'not-acceptable',           type: 'modify' };
var XMPP_ERROR_FEATURE_NOT_IMPLEMENTED               = { xmpp: 'feature-not-implemented',  type: 'cancel' };
var XMPP_ERROR_SERVICE_UNAVAILABLE                   = { xmpp: 'service-unavailable',      type: 'cancel' };
var XMPP_ERROR_REDIRECT                              = { xmpp: 'redirect',                 type: 'modify' };
var XMPP_ERROR_RESOURCE_CONSTRAINT                   = { xmpp: 'resource-constraint',      type: 'wait'   };
var XMPP_ERROR_BAD_REQUEST                           = { xmpp: 'bad-request',              type: 'cancel' };

var JSJAC_JINGLE_REASON_ALTERNATIVE_SESSION          = 'alternative-session';
var JSJAC_JINGLE_REASON_BUSY                         = 'busy';
var JSJAC_JINGLE_REASON_CANCEL                       = 'cancel';
var JSJAC_JINGLE_REASON_CONNECTIVITY_ERROR           = 'connectivity-error';
var JSJAC_JINGLE_REASON_DECLINE                      = 'decline';
var JSJAC_JINGLE_REASON_EXPIRED                      = 'expired';
var JSJAC_JINGLE_REASON_FAILED_APPLICATION           = 'failed-application';
var JSJAC_JINGLE_REASON_FAILED_TRANSPORT             = 'failed-transport';
var JSJAC_JINGLE_REASON_GENERAL_ERROR                = 'general-error';
var JSJAC_JINGLE_REASON_GONE                         = 'gone';
var JSJAC_JINGLE_REASON_INCOMPATIBLE_PARAMETERS      = 'incompatible-parameters';
var JSJAC_JINGLE_REASON_MEDIA_ERROR                  = 'media-error';
var JSJAC_JINGLE_REASON_SECURITY_ERROR               = 'security-error';
var JSJAC_JINGLE_REASON_SUCCESS                      = 'success';
var JSJAC_JINGLE_REASON_TIMEOUT                      = 'timeout';
var JSJAC_JINGLE_REASON_UNSUPPORTED_APPLICATIONS     = 'unsupported-applications';
var JSJAC_JINGLE_REASON_UNSUPPORTED_TRANSPORTS       = 'unsupported-transports';

var JSJAC_JINGLE_SESSION_INFO_ACTIVE                 = 'active';
var JSJAC_JINGLE_SESSION_INFO_HOLD                   = 'hold';
var JSJAC_JINGLE_SESSION_INFO_MUTE                   = 'mute';
var JSJAC_JINGLE_SESSION_INFO_RINGING                = 'ringing';
var JSJAC_JINGLE_SESSION_INFO_UNHOLD                 = 'unhold';
var JSJAC_JINGLE_SESSION_INFO_UNMUTE                 = 'unmute';

var JSJAC_JINGLE_MEDIA_AUDIO                         = 'audio';
var JSJAC_JINGLE_MEDIA_VIDEO                         = 'video';

var JSJAC_JINGLE_VIDEO_SOURCE_CAMERA                 = 'camera';
var JSJAC_JINGLE_VIDEO_SOURCE_SCREEN                 = 'screen';

var JSJAC_JINGLE_STANZA_TYPE_ALL                     = 'all';
var JSJAC_JINGLE_STANZA_TYPE_RESULT                  = 'result';
var JSJAC_JINGLE_STANZA_TYPE_SET                     = 'set';
var JSJAC_JINGLE_STANZA_TYPE_GET                     = 'get';

var JSJAC_JINGLE_SDP_CANDIDATE_TYPE_HOST             = 'host';
var JSJAC_JINGLE_SDP_CANDIDATE_TYPE_SRFLX            = 'srflx';
var JSJAC_JINGLE_SDP_CANDIDATE_TYPE_PRFLX            = 'prflx';
var JSJAC_JINGLE_SDP_CANDIDATE_TYPE_RELAY            = 'relay';

var JSJAC_JINGLE_SDP_CANDIDATE_METHOD_ICE            = 'ice';
var JSJAC_JINGLE_SDP_CANDIDATE_METHOD_RAW            = 'raw';

var JSJAC_JINGLE_SDP_CANDIDATE_MAP_ICEUDP            = [
  { n: 'component',  r: 1 },
  { n: 'foundation', r: 1 },
  { n: 'generation', r: 1 },
  { n: 'id',         r: 1 },
  { n: 'ip',         r: 1 },
  { n: 'network',    r: 1 },
  { n: 'port',       r: 1 },
  { n: 'priority',   r: 1 },
  { n: 'protocol',   r: 1 },
  { n: 'rel-addr',   r: 0 },
  { n: 'rel-port',   r: 0 },
  { n: 'type',       r: 1 }
];
var JSJAC_JINGLE_SDP_CANDIDATE_MAP_RAWUDP            = [
  { n: 'component',  r: 1 },
  { n: 'generation', r: 1 },
  { n: 'id',         r: 1 },
  { n: 'ip',         r: 1 },
  { n: 'port',       r: 1 },
  { n: 'type',       r: 1 }
];

var JSJAC_JINGLE_SDP_CANDIDATE_SCOPE_LOCAL           = 'IN';
var JSJAC_JINGLE_SDP_CANDIDATE_SCOPE_REMOTE          = 'IN';
var JSJAC_JINGLE_SDP_CANDIDATE_IPVERSION_V4          = 'IP4';
var JSJAC_JINGLE_SDP_CANDIDATE_IPVERSION_V6          = 'IP6';
var JSJAC_JINGLE_SDP_CANDIDATE_PROTOCOL_TCP          = 'tcp';
var JSJAC_JINGLE_SDP_CANDIDATE_PROTOCOL_UDP          = 'udp';

var JSJAC_JINGLE_SDP_CANDIDATE_IP_V4                 = '0.0.0.0';
var JSJAC_JINGLE_SDP_CANDIDATE_IP_V6                 = '::';

var JSJAC_JINGLE_SDP_CANDIDATE_IP_DEFAULT            = JSJAC_JINGLE_SDP_CANDIDATE_IP_V4;
var JSJAC_JINGLE_SDP_CANDIDATE_PORT_DEFAULT          = '1';
var JSJAC_JINGLE_SDP_CANDIDATE_SCOPE_DEFAULT         = JSJAC_JINGLE_SDP_CANDIDATE_SCOPE_REMOTE;
var JSJAC_JINGLE_SDP_CANDIDATE_IPVERSION_DEFAULT     = JSJAC_JINGLE_SDP_CANDIDATE_IPVERSION_V4;
var JSJAC_JINGLE_SDP_CANDIDATE_PROTOCOL_DEFAULT      = JSJAC_JINGLE_SDP_CANDIDATE_PROTOCOL_UDP;
var JSJAC_JINGLE_SDP_CANDIDATE_PRIORITY_DEFAULT      = '1';



/**
 * JSJSAC JINGLE CONSTANTS MAPPING
 */

var JSJAC_JINGLE_SDP_CANDIDATE_TYPES  = {};
JSJAC_JINGLE_SDP_CANDIDATE_TYPES[JSJAC_JINGLE_SDP_CANDIDATE_TYPE_HOST]   = JSJAC_JINGLE_SDP_CANDIDATE_METHOD_ICE;
JSJAC_JINGLE_SDP_CANDIDATE_TYPES[JSJAC_JINGLE_SDP_CANDIDATE_TYPE_SRFLX]  = JSJAC_JINGLE_SDP_CANDIDATE_METHOD_ICE;
JSJAC_JINGLE_SDP_CANDIDATE_TYPES[JSJAC_JINGLE_SDP_CANDIDATE_TYPE_PRFLX]  = JSJAC_JINGLE_SDP_CANDIDATE_METHOD_ICE;
JSJAC_JINGLE_SDP_CANDIDATE_TYPES[JSJAC_JINGLE_SDP_CANDIDATE_TYPE_RELAY]  = JSJAC_JINGLE_SDP_CANDIDATE_METHOD_RAW;

var JSJAC_JINGLE_BROWSERS             = {};
JSJAC_JINGLE_BROWSERS[JSJAC_JINGLE_BROWSER_FIREFOX]                      = 1;
JSJAC_JINGLE_BROWSERS[JSJAC_JINGLE_BROWSER_CHROME]                       = 1;
JSJAC_JINGLE_BROWSERS[JSJAC_JINGLE_BROWSER_SAFARI]                       = 1;
JSJAC_JINGLE_BROWSERS[JSJAC_JINGLE_BROWSER_OPERA]                        = 1;
JSJAC_JINGLE_BROWSERS[JSJAC_JINGLE_BROWSER_IE]                           = 1;

var JSJAC_JINGLE_SENDERS              = {};
JSJAC_JINGLE_SENDERS[JSJAC_JINGLE_SENDERS_BOTH.jingle]                   = JSJAC_JINGLE_SENDERS_BOTH.sdp;
JSJAC_JINGLE_SENDERS[JSJAC_JINGLE_SENDERS_INITIATOR.jingle]              = JSJAC_JINGLE_SENDERS_INITIATOR.sdp;
JSJAC_JINGLE_SENDERS[JSJAC_JINGLE_SENDERS_NONE.jingle]                   = JSJAC_JINGLE_SENDERS_NONE.sdp;
JSJAC_JINGLE_SENDERS[JSJAC_JINGLE_SENDERS_RESPONDER.jingle]              = JSJAC_JINGLE_SENDERS_RESPONDER.sdp;

var JSJAC_JINGLE_CREATORS             = {};
JSJAC_JINGLE_CREATORS[JSJAC_JINGLE_CREATOR_INITIATOR]                    = 1;
JSJAC_JINGLE_CREATORS[JSJAC_JINGLE_CREATOR_RESPONDER]                    = 1;

var JSJAC_JINGLE_STATUSES             = {};
JSJAC_JINGLE_STATUSES[JSJAC_JINGLE_STATUS_INACTIVE]                      = 1;
JSJAC_JINGLE_STATUSES[JSJAC_JINGLE_STATUS_INITIATING]                    = 1;
JSJAC_JINGLE_STATUSES[JSJAC_JINGLE_STATUS_INITIATED]                     = 1;
JSJAC_JINGLE_STATUSES[JSJAC_JINGLE_STATUS_ACCEPTING]                     = 1;
JSJAC_JINGLE_STATUSES[JSJAC_JINGLE_STATUS_ACCEPTED]                      = 1;
JSJAC_JINGLE_STATUSES[JSJAC_JINGLE_STATUS_TERMINATING]                   = 1;
JSJAC_JINGLE_STATUSES[JSJAC_JINGLE_STATUS_TERMINATED]                    = 1;

var JSJAC_JINGLE_ACTIONS              = {};
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_CONTENT_ACCEPT]                 = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_CONTENT_ADD]                    = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_CONTENT_MODIFY]                 = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_CONTENT_REJECT]                 = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_CONTENT_REMOVE]                 = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_DESCRIPTION_INFO]               = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_SECURITY_INFO]                  = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_SESSION_ACCEPT]                 = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_SESSION_INFO]                   = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_SESSION_INITIATE]               = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_SESSION_TERMINATE]              = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_TRANSPORT_ACCEPT]               = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_TRANSPORT_INFO]                 = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_TRANSPORT_REJECT]               = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_TRANSPORT_REPLACE]              = 1;

var JSJAC_JINGLE_ERRORS               = {};
JSJAC_JINGLE_ERRORS[JSJAC_JINGLE_ERROR_OUT_OF_ORDER.jingle]              = 1;
JSJAC_JINGLE_ERRORS[JSJAC_JINGLE_ERROR_TIE_BREAK.jingle]                 = 1;
JSJAC_JINGLE_ERRORS[JSJAC_JINGLE_ERROR_UNKNOWN_SESSION.jingle]           = 1;
JSJAC_JINGLE_ERRORS[JSJAC_JINGLE_ERROR_UNSUPPORTED_INFO.jingle]          = 1;
JSJAC_JINGLE_ERRORS[JSJAC_JINGLE_ERROR_SECURITY_REQUIRED.jingle]         = 1;

var XMPP_ERRORS                       = {};
XMPP_ERRORS[XMPP_ERROR_UNEXPECTED_REQUEST.xmpp]                          = 1;
XMPP_ERRORS[XMPP_ERROR_CONFLICT.xmpp]                                    = 1;
XMPP_ERRORS[XMPP_ERROR_ITEM_NOT_FOUND.xmpp]                              = 1;
XMPP_ERRORS[XMPP_ERROR_NOT_ACCEPTABLE.xmpp]                              = 1;
XMPP_ERRORS[XMPP_ERROR_FEATURE_NOT_IMPLEMENTED.xmpp]                     = 1;
XMPP_ERRORS[XMPP_ERROR_SERVICE_UNAVAILABLE.xmpp]                         = 1;
XMPP_ERRORS[XMPP_ERROR_REDIRECT.xmpp]                                    = 1;
XMPP_ERRORS[XMPP_ERROR_RESOURCE_CONSTRAINT.xmpp]                         = 1;
XMPP_ERRORS[XMPP_ERROR_BAD_REQUEST.xmpp]                                 = 1;

var JSJAC_JINGLE_REASONS              = {};
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_ALTERNATIVE_SESSION]            = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_BUSY]                           = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_CANCEL]                         = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_CONNECTIVITY_ERROR]             = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_DECLINE]                        = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_EXPIRED]                        = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_FAILED_APPLICATION]             = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_FAILED_TRANSPORT]               = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_GENERAL_ERROR]                  = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_GONE]                           = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_INCOMPATIBLE_PARAMETERS]        = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_MEDIA_ERROR]                    = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_SECURITY_ERROR]                 = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_SUCCESS]                        = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_TIMEOUT]                        = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_UNSUPPORTED_APPLICATIONS]       = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_UNSUPPORTED_TRANSPORTS]         = 1;

var JSJAC_JINGLE_SESSION_INFOS        = {};
JSJAC_JINGLE_SESSION_INFOS[JSJAC_JINGLE_SESSION_INFO_ACTIVE]             = 1;
JSJAC_JINGLE_SESSION_INFOS[JSJAC_JINGLE_SESSION_INFO_HOLD]               = 1;
JSJAC_JINGLE_SESSION_INFOS[JSJAC_JINGLE_SESSION_INFO_MUTE]               = 1;
JSJAC_JINGLE_SESSION_INFOS[JSJAC_JINGLE_SESSION_INFO_RINGING]            = 1;
JSJAC_JINGLE_SESSION_INFOS[JSJAC_JINGLE_SESSION_INFO_UNHOLD]             = 1;
JSJAC_JINGLE_SESSION_INFOS[JSJAC_JINGLE_SESSION_INFO_UNMUTE]             = 1;

var JSJAC_JINGLE_MEDIAS               = {};
JSJAC_JINGLE_MEDIAS[JSJAC_JINGLE_MEDIA_AUDIO]                            = { label: '0' };
JSJAC_JINGLE_MEDIAS[JSJAC_JINGLE_MEDIA_VIDEO]                            = { label: '1' };

var JSJAC_JINGLE_VIDEO_SOURCES        = {};
JSJAC_JINGLE_VIDEO_SOURCES[JSJAC_JINGLE_VIDEO_SOURCE_CAMERA]             = 1;
JSJAC_JINGLE_VIDEO_SOURCES[JSJAC_JINGLE_VIDEO_SOURCE_SCREEN]             = 1;

var JSJAC_JINGLE_STANZAS              = {};
JSJAC_JINGLE_STANZAS[JSJAC_JINGLE_STANZA_TYPE_ALL]                       = 1;
JSJAC_JINGLE_STANZAS[JSJAC_JINGLE_STANZA_TYPE_RESULT]                    = 1;
JSJAC_JINGLE_STANZAS[JSJAC_JINGLE_STANZA_TYPE_SET]                       = 1;
JSJAC_JINGLE_STANZAS[JSJAC_JINGLE_STANZA_TYPE_GET]                       = 1;



/**
 * JSJAC JINGLE STORAGE
 */

var JSJAC_JINGLE_STORE_CONNECTION = null;
var JSJAC_JINGLE_STORE_SESSIONS   = {};
var JSJAC_JINGLE_STORE_INITIATE   = function(stanza) {};

var JSJAC_JINGLE_STORE_DEBUG      = {
  log : function() {}
};

var JSJAC_JINGLE_STORE_EXTDISCO   = {
  stun : {},
  turn : {}
};

var JSJAC_JINGLE_STORE_FALLBACK   = {
  stun : {},
  turn : {}
};

var JSJAC_JINGLE_STORE_RELAYNODES = {
  stun  : {}
};

var JSJAC_JINGLE_STORE_DEFER      = {
  deferred : false,
  count    : 0,
  fn       : []
};

var R_JSJAC_JINGLE_SERVICE_URI    = /^(\w+):([^:\?]+)(?::(\d+))?(?:\?transport=(\w+))?/i;

/**
 * @fileoverview JSJaC Jingle library - Utilities
 *
 * @url https://github.com/valeriansaliou/jsjac-jingle
 * @depends https://github.com/sstrigler/JSJaC
 * @author Valérian Saliou https://valeriansaliou.name/
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */


var JSJaCJingleUtils = ring.create({
  /**
   * Constructor
   */
  constructor: function(parent) {
    this.parent = parent;
  },

  /**
   * Removes a given array value
   * @return new array
   * @type object
   */
  array_remove_value: function(array, value) {
    try {
      var i;

      for(i = 0; i < array.length; i++) {
        if(array[i] === value) {
          array.splice(i, 1); i--;
        }
      }
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] array_remove_value > ' + e, 1);
    }

    return array;
  },

  /**
   * Returns whether an object is empty or not
   * @return Empty value
   * @type boolean
   */
  object_length: function(object) {    
    var key;
    var l = 0;

    try {
      for(key in object) {
        if(object.hasOwnProperty(key))  l++;
      }
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] object_length > ' + e, 1);
    }

    return l;
  },

  /**
   * Collects given objects
   * @return Empty value
   * @type object
   */
  object_collect: function() {    
    var i, p;

    var collect_obj = {};
    var len = arguments.length;

    for(i = 0; i < len; i++) {
      for(p in arguments[i]) {
        if(arguments[i].hasOwnProperty(p))
          collect_obj[p] = arguments[i][p];
      }
    }

    return collect_obj;
  },

  /**
   * Clones a given object
   * @return Cloned object
   * @type object
   */
  object_clone: function(object) {    
    try {
      var copy, i, attr;

      // Assert
      if(object === null || typeof object !== 'object') return object;

      // Handle Date
      if(object instanceof Date) {
          copy = new Date();
          copy.setTime(object.getTime());

          return copy;
      }

      // Handle Array
      if(object instanceof Array) {
          copy = [];

          for(i = 0, len = object.length; i < len; i++)
            copy[i] = this.object_clone(object[i]);

          return copy;
      }

      // Handle Object
      if(object instanceof Object) {
          copy = {};

          for(attr in object) {
              if(object.hasOwnProperty(attr))
                copy[attr] = this.object_clone(object[attr]);
          }

          return copy;
      }
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] object_clone > ' + e, 1);
    }

    this.parent.get_debug().log('[JSJaCJingle:utils] object_clone > Cannot clone this object.', 1);
  },

  /**
   * Gets the browser info
   * @return browser info
   * @type object
   */
  browser: function() {    
    var browser_info = {
      name    : 'Generic'
    };

    try {
      var user_agent, detect_arr, cur_browser;

      detect_arr = {
        'firefox' : JSJAC_JINGLE_BROWSER_FIREFOX,
        'chrome'  : JSJAC_JINGLE_BROWSER_CHROME,
        'safari'  : JSJAC_JINGLE_BROWSER_SAFARI,
        'opera'   : JSJAC_JINGLE_BROWSER_OPERA,
        'msie'    : JSJAC_JINGLE_BROWSER_IE
      };

      user_agent = navigator.userAgent.toLowerCase();

      for(cur_browser in detect_arr) {
        if(user_agent.indexOf(cur_browser) > -1) {
          browser_info.name = detect_arr[cur_browser];
          break;
        }
      }
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] browser > ' + e, 1);
    }

    return browser_info;
  },

  /**
   * Gets the ICE config
   * @return ICE config
   * @type object
   */
  config_ice: function() {    
    try {
      // Collect data (user + server)
      var stun_config = this.object_collect(
        this.parent.get_stun(),
        JSJAC_JINGLE_STORE_EXTDISCO.stun,
        JSJAC_JINGLE_STORE_RELAYNODES.stun,
        JSJAC_JINGLE_STORE_FALLBACK.stun
      );

      var turn_config = this.object_collect(
        this.parent.get_turn(),
        JSJAC_JINGLE_STORE_EXTDISCO.turn,
        JSJAC_JINGLE_STORE_FALLBACK.turn
      );

      // Can proceed?
      if(stun_config && this.object_length(stun_config)  || 
         turn_config && this.object_length(turn_config)  ) {
        var config = {
          iceServers : []
        };

        // STUN servers
        var cur_stun_host, cur_stun_obj, cur_stun_config;

        for(cur_stun_host in stun_config) {
          if(cur_stun_host) {
            cur_stun_obj = stun_config[cur_stun_host];

            cur_stun_config = {};
            cur_stun_config.url = 'stun:' + cur_stun_host;

            if(cur_stun_obj.port)
              cur_stun_config.url += ':' + cur_stun_obj.port;

            if(cur_stun_obj.transport && this.browser().name != JSJAC_JINGLE_BROWSER_FIREFOX)
              cur_stun_config.url += '?transport=' + cur_stun_obj.transport;

            (config.iceServers).push(cur_stun_config);
          }
        }

        // TURN servers
        var cur_turn_host, cur_turn_obj, cur_turn_config;

        for(cur_turn_host in turn_config) {
          if(cur_turn_host) {
            cur_turn_obj = turn_config[cur_turn_host];

            cur_turn_config = {};
            cur_turn_config.url = 'turn:' + cur_turn_host;

            if(cur_turn_obj.port)
              cur_turn_config.url += ':' + cur_turn_obj.port;

            if(cur_turn_obj.transport)
              cur_turn_config.url += '?transport=' + cur_turn_obj.transport;

            if(cur_turn_obj.username)
              cur_turn_config.username = cur_turn_obj.username;

            if(cur_turn_obj.password)
              cur_turn_config.password = cur_turn_obj.password;

            (config.iceServers).push(cur_turn_config);
          }
        }

        // Check we have at least a STUN server (if user can traverse NAT)
        var i;
        var has_stun = false;

        for(i in config.iceServers) {
          if((config.iceServers[i].url).match(R_NETWORK_PROTOCOLS.stun)) {
            has_stun = true; break;
          }
        }

        if(!has_stun) {
          (config.iceServers).push({
            url: (WEBRTC_CONFIGURATION.peer_connection.config.iceServers)[0].url
          });
        }

        return config;
      }
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] config_ice > ' + e, 1);
    }

    return WEBRTC_CONFIGURATION.peer_connection.config;
  },

  /**
   * Gets the node value from a stanza element
   * @return Node value
   * @type string
   */
  stanza_get_value: function(stanza) {    
    try {
      return stanza.firstChild.nodeValue || null;
    } catch(e) {
      try {
        return (stanza[0]).firstChild.nodeValue || null;
      } catch(_e) {
        this.parent.get_debug().log('[JSJaCJingle:utils] stanza_get_value > ' + _e, 1);
      }
    }

    return null;
  },

  /**
   * Gets the attribute value from a stanza element
   * @return Attribute value
   * @type string
   */
  stanza_get_attribute: function(stanza, name) {    
    if(!name) return null;

    try {
      return stanza.getAttribute(name) || null;
    } catch(e) {
      try {
        return (stanza[0]).getAttribute(name) || null;
      } catch(_e) {
        this.parent.get_debug().log('[JSJaCJingle:utils] stanza_get_attribute > ' + _e, 1);
      }
    }

    return null;
  },

  /**
   * Sets the attribute value to a stanza element
   */
  stanza_set_attribute: function(stanza, name, value) {    
    if(!(name && value && stanza)) return;

    try {
      stanza.setAttribute(name, value);
    } catch(e) {
      try {
        (stanza[0]).setAttribute(name, value);
      } catch(_e) {
        this.parent.get_debug().log('[JSJaCJingle:utils] stanza_set_attribute > ' + _e, 1);
      }
    }
  },

  /**
   * Gets the Jingle node from a stanza
   * @return Jingle node
   * @type DOM
   */
  stanza_get_element: function(stanza, name, ns) {    
    var matches_result = [];

    // Assert
    if(!stanza)        return matches_result;
    if(stanza.length)  stanza = stanza[0];

    try {
      var i;

      // Get only in lower level (not all sub-levels)
      var matches = stanza.getElementsByTagNameNS(ns, name);

      if(matches && matches.length) {
        for(i = 0; i < matches.length; i++) {
          if(matches[i] && matches[i].parentNode == stanza)
            matches_result.push(matches[i]);
        }
      }

      return matches_result;
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] stanza_get_element > ' + e, 1);
    }

    return matches_result;
  },

  /**
   * Gets the Jingle node from a stanza
   * @return Jingle node
   * @type DOM
   */
  stanza_jingle: function(stanza) {    
    try {
      return stanza.getChild('jingle', NS_JINGLE);
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] stanza_jingle > ' + e, 1);
    }

    return null;
  },

  /**
   * Gets the from value from a stanza
   * @return from value
   * @type string
   */
  stanza_from: function(stanza) {    
    try {
      return stanza.getFrom() || null;
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] stanza_from > ' + e, 1);
    }

    return null;
  },

  /**
   * Gets the SID value from a stanza
   * @return SID value
   * @type string
   */
  stanza_sid: function(stanza) {    
    try {
      return this.stanza_get_attribute(
        this.stanza_jingle(stanza),
        'sid'
      );
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] stanza_sid > ' + e, 1);
    }
  },

  /**
   * Checks if a stanza is safe (known SID + sender)
   * @return safety state
   * @type boolean
   */
  stanza_safe: function(stanza) {    
    try {
      return !((stanza.getType() == JSJAC_JINGLE_STANZA_TYPE_SET && this.stanza_sid(stanza) != this.parent.get_sid()) || this.stanza_from(stanza) != this.parent.get_to());
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] stanza_safe > ' + e, 1);
    }

    return false;
  },

  /**
   * Gets a stanza terminate reason
   * @return reason code
   * @type string
   */
  stanza_terminate_reason: function(stanza) {    
    try {
      var jingle = this.stanza_jingle(stanza);

      if(jingle) {
        var reason = this.stanza_get_element(jingle, 'reason', NS_JINGLE);

        if(reason.length) {
          var cur_reason;

          for(cur_reason in JSJAC_JINGLE_REASONS) {
            if(this.stanza_get_element(reason[0], cur_reason, NS_JINGLE).length)
              return cur_reason;
          }
        }
      }
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] stanza_terminate_reason > ' + e, 1);
    }

    return null;
  },

  /**
   * Gets a stanza session info
   * @return info code
   * @type string
   */
  stanza_session_info: function(stanza) {    
    try {
      var jingle = this.stanza_jingle(stanza);

      if(jingle) {
        var cur_info;

        for(cur_info in JSJAC_JINGLE_SESSION_INFOS) {
          if(this.stanza_get_element(jingle, cur_info, NS_JINGLE_APPS_RTP_INFO).length)
            return cur_info;
        }
      }
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] stanza_session_info > ' + e, 1);
    }

    return null;
  },

  /**
   * Set a timeout limit to a stanza
   */
  stanza_timeout: function(t_type, t_id, handlers) {    
    try {
      t_type = t_type || JSJAC_JINGLE_STANZA_TYPE_ALL;

      var t_sid = this.parent.get_sid();
      var t_status = this.parent.get_status();

      this.parent.get_debug().log('[JSJaCJingle:utils] stanza_timeout > Registered (id: ' + t_id + ', status: ' + t_status + ').', 4);

      var _this = this;
      
      setTimeout(function() {
        _this.parent.get_debug().log('[JSJaCJingle:utils] stanza_timeout > Cheking (id: ' + t_id + ', status: ' + t_status + '-' + _this.parent.get_status() + ').', 4);

        // State did not change?
        if(_this.parent.get_sid() == t_sid && _this.parent.get_status() == t_status && !(t_id in _this.parent.get_received_id())) {
          _this.parent.get_debug().log('[JSJaCJingle:utils] stanza_timeout > Stanza timeout.', 2);

          _this.parent.unregister_handler(t_type, t_id);

          if(handlers.external)  (handlers.external)(_this);
          if(handlers.internal)  (handlers.internal)();
        } else {
          _this.parent.get_debug().log('[JSJaCJingle:utils] stanza_timeout > Stanza successful.', 4);
        }
      }, (JSJAC_JINGLE_STANZA_TIMEOUT * 1000));
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] stanza_timeout > ' + e, 1);
    }
  },

  /**
   * @private
   */
  stanza_parse_node: function(parent, name, ns, obj, attrs, value) {    
    try {
      var i, j,
          error, child, child_arr;
      var children = this.stanza_get_element(parent, name, ns);

      if(children.length) {
        for(i = 0; i < children.length; i++) {
          // Initialize
          error = 0;
          child = children[i];
          child_arr = {};

          // Parse attributes
          for(j in attrs) {
            child_arr[attrs[j].n] = this.stanza_get_attribute(child, attrs[j].n);

            if(attrs[j].r && !child_arr[attrs[j].n]) {
              error++; break;
            }
          }

          // Parse value
          if(value) {
            child_arr[value.n] = this.stanza_get_value(child);
            if(value.r && !child_arr[value.n])  error++;
          }

          if(error !== 0) continue;

          // Push current children
          obj.push(child_arr);
        }
      }
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] stanza_parse_node > ' + e, 1);
    }
  },

  /**
   * @private
   */
  stanza_parse_content: function(stanza) {    
    try {
      var i,
          jingle, content, cur_content,
          content_creator, content_name, content_senders,
          cur_candidates;

      // Parse initiate stanza
      jingle = this.stanza_jingle(stanza);

      if(jingle) {
        // Childs
        content = this.stanza_get_element(jingle, 'content', NS_JINGLE);

        if(content && content.length) {
          for(i = 0; i < content.length; i++) {
            cur_content = content[i];

            // Attrs (avoids senders & creators to be changed later in the flow)
            content_name    = this.stanza_get_attribute(cur_content, 'name');
            content_senders = this.parent.get_senders(content_name) || this.stanza_get_attribute(cur_content, 'senders');
            content_creator = this.parent.get_creator(content_name) || this.stanza_get_attribute(cur_content, 'creator');

            this.parent.set_name(content_name);
            this.parent.set_senders(content_name, content_senders);
            this.parent.set_creator(content_name, content_creator);

            // Payloads (non-destructive setters / cumulative)
            this.parent.set_payloads_remote_add(
              content_name,
              this.stanza_parse_payload(cur_content)
            );

            // Candidates (enqueue them for ICE processing, too)
            cur_candidate = this.stanza_parse_candidate(cur_content);

            this.parent.set_candidates_remote_add(
              content_name,
              cur_candidate
            );

            this.parent.set_candidates_queue_remote(
              content_name,
              cur_candidate
            );
          }

          return true;
        }
      }
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] stanza_parse_content > ' + e, 1);
    }

    return false;
  },

  /**
   * @private
   */
  stanza_parse_group: function(stanza) {    
    try {
      var i, j,
          jingle,
          group, cur_group,
          content, cur_content, group_content_names;

      // Parse initiate stanza
      jingle = this.stanza_jingle(stanza);

      if(jingle) {
        // Childs
        group = this.stanza_get_element(jingle, 'group', NS_JINGLE_APPS_GROUPING);

        if(group && group.length) {
          for(i = 0; i < group.length; i++) {
            cur_group = group[i];
            group_content_names = [];

            // Attrs
            group_semantics = this.stanza_get_attribute(cur_group, 'semantics');

            // Contents
            content = this.stanza_get_element(cur_group, 'content', NS_JINGLE_APPS_GROUPING);

            for(j = 0; j < content.length; j++) {
              cur_content = content[j];

              // Content attrs
              group_content_names.push(
                this.stanza_get_attribute(cur_content, 'name')
              );
            }

            // Payloads (non-destructive setters / cumulative)
            this.parent.set_group_remote(
              group_semantics,
              group_content_names
            );
          }
        }
      }

      return true;
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] stanza_parse_group > ' + e, 1);
    }

    return false;
  },

  /**
   * @private
   */
  stanza_parse_payload: function(stanza_content) {    
    var payload_obj = {
      descriptions : {},
      transports   : {}
    };

    try {
      // Common vars
      var j, k, l, error,
          cur_ssrc, cur_ssrc_id,
          cur_ssrc_group, cur_ssrc_group_semantics,
          cur_payload, cur_payload_arr, cur_payload_id;

      // Common functions
      var init_content = function() {
        var ic_key;
        var ic_arr = {
          'attrs'      : {},
          'rtcp-fb'    : [],
          'bandwidth'  : [],
          'payload'    : {},
          'rtp-hdrext' : [],
          'rtcp-mux'   : 0,

          'encryption' : {
            'attrs'     : {},
            'crypto'    : [],
            'zrtp-hash' : []
          },

          'ssrc': {},
          'ssrc-group': {}
        };

        for(ic_key in ic_arr)
          if(!(ic_key in payload_obj.descriptions))  payload_obj.descriptions[ic_key] = ic_arr[ic_key];
      };

      var init_payload = function(id) {
        var ip_key;
        var ip_arr = {
          'attrs'           : {},
          'parameter'       : [],
          'rtcp-fb'         : [],
          'rtcp-fb-trr-int' : []
        };

        if(!(id in payload_obj.descriptions.payload))  payload_obj.descriptions.payload[id] = {};

        for(ip_key in ip_arr)
          if(!(ip_key in payload_obj.descriptions.payload[id]))  payload_obj.descriptions.payload[id][ip_key] = ip_arr[ip_key];
      };

      var init_ssrc_group_semantics = function(semantics) {
        if(typeof payload_obj.descriptions['ssrc-group'][semantics] != 'object')
          payload_obj.descriptions['ssrc-group'][semantics] = [];
      };

      // Parse session description
      var description = this.stanza_get_element(stanza_content, 'description', NS_JINGLE_APPS_RTP);

      if(description.length) {
        description = description[0];

        var cd_media = this.stanza_get_attribute(description, 'media');
        var cd_ssrc  = this.stanza_get_attribute(description, 'ssrc');

        if(!cd_media)
          this.parent.get_debug().log('[JSJaCJingle:utils] stanza_parse_payload > No media attribute to ' + cc_name + ' stanza.', 1);

        // Initialize current description
        init_content();

        payload_obj.descriptions.attrs.media = cd_media;
        payload_obj.descriptions.attrs.ssrc  = cd_ssrc;

        // Loop on multiple payloads
        var payload = this.stanza_get_element(description, 'payload-type', NS_JINGLE_APPS_RTP);

        if(payload.length) {
          for(j = 0; j < payload.length; j++) {
            error           = 0;
            cur_payload     = payload[j];
            cur_payload_arr = {};

            cur_payload_arr.channels  = this.stanza_get_attribute(cur_payload, 'channels');
            cur_payload_arr.clockrate = this.stanza_get_attribute(cur_payload, 'clockrate');
            cur_payload_arr.id        = this.stanza_get_attribute(cur_payload, 'id') || error++;
            cur_payload_arr.name      = this.stanza_get_attribute(cur_payload, 'name');

            payload_obj.descriptions.attrs.ptime     = this.stanza_get_attribute(cur_payload, 'ptime');
            payload_obj.descriptions.attrs.maxptime  = this.stanza_get_attribute(cur_payload, 'maxptime');

            if(error !== 0) continue;

            // Initialize current payload
            cur_payload_id = cur_payload_arr.id;
            init_payload(cur_payload_id);

            // Push current payload
            payload_obj.descriptions.payload[cur_payload_id].attrs = cur_payload_arr;

            // Loop on multiple parameters
            this.stanza_parse_node(
              cur_payload,
              'parameter',
              NS_JINGLE_APPS_RTP,
              payload_obj.descriptions.payload[cur_payload_id].parameter,
              [ { n: 'name', r: 1 }, { n: 'value', r: 0 } ]
            );

            // Loop on multiple RTCP-FB
            this.stanza_parse_node(
              cur_payload,
              'rtcp-fb',
              NS_JINGLE_APPS_RTP_RTCP_FB,
              payload_obj.descriptions.payload[cur_payload_id]['rtcp-fb'],
              [ { n: 'type', r: 1 }, { n: 'subtype', r: 0 } ]
            );

            // Loop on multiple RTCP-FB-TRR-INT
            this.stanza_parse_node(
              cur_payload,
              'rtcp-fb-trr-int',
              NS_JINGLE_APPS_RTP_RTCP_FB,
              payload_obj.descriptions.payload[cur_payload_id]['rtcp-fb-trr-int'],
              [ { n: 'value', r: 1 } ]
            );
          }
        }

        // Parse the encryption element
        var encryption = this.stanza_get_element(description, 'encryption', NS_JINGLE_APPS_RTP);

        if(encryption.length) {
          encryption = encryption[0];

          payload_obj.descriptions.encryption.attrs.required = this.stanza_get_attribute(encryption, 'required') || '0';

          // Loop on multiple cryptos
          this.stanza_parse_node(
            encryption,
            'crypto',
            NS_JINGLE_APPS_RTP,
            payload_obj.descriptions.encryption.crypto,
            [ { n: 'crypto-suite', r: 1 }, { n: 'key-params', r: 1 }, { n: 'session-params', r: 0 }, { n: 'tag', r: 1 } ]
          );

          // Loop on multiple zrtp-hash
          this.stanza_parse_node(
            encryption,
            'zrtp-hash',
            NS_JINGLE_APPS_RTP_ZRTP,
            payload_obj.descriptions.encryption['zrtp-hash'],
            [ { n: 'version', r: 1 } ],
            { n: 'value', r: 1 }
          );
        }

        // Parse the SSRC-GROUP elements
        var ssrc_group = this.stanza_get_element(description, 'ssrc-group', NS_JINGLE_APPS_RTP_SSMA);

        if(ssrc_group && ssrc_group.length) {
          for(k = 0; k < ssrc_group.length; k++) {
            cur_ssrc_group = ssrc_group[k];
            cur_ssrc_group_semantics = this.stanza_get_attribute(cur_ssrc_group, 'semantics') || null;

            if(cur_ssrc_group_semantics !== null) {
              cur_ssrc_group_semantics_obj = {
                'sources': []
              };

              init_ssrc_group_semantics(cur_ssrc_group_semantics);

              this.stanza_parse_node(
                cur_ssrc_group,
                'source',
                NS_JINGLE_APPS_RTP_SSMA,
                cur_ssrc_group_semantics_obj.sources,
                [ { n: 'ssrc', r: 1 } ]
              );

              payload_obj.descriptions['ssrc-group'][cur_ssrc_group_semantics].push(cur_ssrc_group_semantics_obj);
            }
          }
        }

        // Parse the SSRC (source) elements
        var ssrc = this.stanza_get_element(description, 'source', NS_JINGLE_APPS_RTP_SSMA);

        if(ssrc && ssrc.length) {
          for(l = 0; l < ssrc.length; l++) {
            cur_ssrc = ssrc[l];
            cur_ssrc_id = this.stanza_get_attribute(cur_ssrc, 'ssrc') || null;

            if(cur_ssrc_id !== null) {
              payload_obj.descriptions.ssrc[cur_ssrc_id] = [];

              this.stanza_parse_node(
                cur_ssrc,
                'parameter',
                NS_JINGLE_APPS_RTP_SSMA,
                payload_obj.descriptions.ssrc[cur_ssrc_id],
                [ { n: 'name', r: 1 }, { n: 'value', r: 0 } ]
              );
            }
          }
        }

        // Loop on common RTCP-FB
        this.stanza_parse_node(
          description,
          'rtcp-fb',
          NS_JINGLE_APPS_RTP_RTCP_FB,
          payload_obj.descriptions['rtcp-fb'],
          [ { n: 'type', r: 1 }, { n: 'subtype', r: 0 } ]
        );

        // Loop on bandwidth
        this.stanza_parse_node(
          description,
          'bandwidth',
          NS_JINGLE_APPS_RTP,
          payload_obj.descriptions.bandwidth,
          [ { n: 'type', r: 1 } ],
          { n: 'value', r: 1 }
        );

        // Parse the RTP-HDREXT element
        this.stanza_parse_node(
          description,
          'rtp-hdrext',
          NS_JINGLE_APPS_RTP_RTP_HDREXT,
          payload_obj.descriptions['rtp-hdrext'],
          [ { n: 'id', r: 1 }, { n: 'uri', r: 1 }, { n: 'senders', r: 0 } ]
        );

        // Parse the RTCP-MUX element
        var rtcp_mux = this.stanza_get_element(description, 'rtcp-mux', NS_JINGLE_APPS_RTP);

        if(rtcp_mux.length) {
          payload_obj.descriptions['rtcp-mux'] = 1;
        }
      }

      // Parse transport (need to get 'ufrag' and 'pwd' there)
      var transport = this.stanza_get_element(stanza_content, 'transport', NS_JINGLE_TRANSPORTS_ICEUDP);

      if(transport.length) {
        payload_obj.transports.pwd          = this.stanza_get_attribute(transport, 'pwd');
        payload_obj.transports.ufrag        = this.stanza_get_attribute(transport, 'ufrag');

        var fingerprint = this.stanza_get_element(transport, 'fingerprint', NS_JINGLE_APPS_DTLS);

        if(fingerprint.length) {
          payload_obj.transports.fingerprint       = {};
          payload_obj.transports.fingerprint.setup = this.stanza_get_attribute(fingerprint, 'setup');
          payload_obj.transports.fingerprint.hash  = this.stanza_get_attribute(fingerprint, 'hash');
          payload_obj.transports.fingerprint.value = this.stanza_get_value(fingerprint);
        }
      }
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] stanza_parse_payload > ' + e, 1);
    }

    return payload_obj;
  },

  /**
   * @private
   */
  stanza_parse_candidate: function(stanza_content) {    
    var candidate_arr = [];

    try {
      var _this = this;

      var fn_parse_transport = function(namespace, parse_obj) {
        var transport = _this.stanza_get_element(stanza_content, 'transport', namespace);
        
        if(transport.length) {
          _this.stanza_parse_node(
            transport,
            'candidate',
            namespace,
            candidate_arr,
            parse_obj
          );
        }
      };

      // Parse ICE-UDP transport candidates
      fn_parse_transport(
        NS_JINGLE_TRANSPORTS_ICEUDP,
        JSJAC_JINGLE_SDP_CANDIDATE_MAP_ICEUDP
      );

      // Parse RAW-UDP transport candidates
      fn_parse_transport(
        NS_JINGLE_TRANSPORTS_RAWUDP,
        JSJAC_JINGLE_SDP_CANDIDATE_MAP_RAWUDP
      );
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] stanza_parse_candidate > ' + e, 1);
    }

    return candidate_arr;
  },

  /*
   * @private
   */
  stanza_build_node: function(doc, parent, children, name, ns, value) {    
    var node = null;

    try {
      var i, child, attr;

      if(children && children.length) {
        for(i in children) {
          child = children[i];

          if(!child) continue;

          node = parent.appendChild(doc.buildNode(
            name,
            { 'xmlns': ns },
            (value && child[value]) ? child[value] : null
          ));

          for(attr in child)
            if(attr != value)  this.stanza_set_attribute(node, attr, child[attr]);
        }
      }
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] stanza_build_node > name: ' + name + ' > ' + e, 1);
    }

    return node;
  },

  /**
   * @private
   */
  stanza_generate_jingle: function(stanza, attrs) {    
    var jingle = null;

    try {
      var cur_attr;

      jingle = stanza.getNode().appendChild(stanza.buildNode('jingle', { 'xmlns': NS_JINGLE }));

      if(!attrs.sid) attrs.sid = this.parent.get_sid();

      for(cur_attr in attrs) this.stanza_set_attribute(jingle, cur_attr, attrs[cur_attr]);
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] stanza_generate_jingle > ' + e, 1);
    }

    return jingle;
  },

  /**
   * @private
   */
  stanza_generate_session_info: function(stanza, jingle, args) {    
    try {
      var info = jingle.appendChild(stanza.buildNode(args.info, { 'xmlns': NS_JINGLE_APPS_RTP_INFO }));

      // Info attributes
      switch(args.info) {
        case JSJAC_JINGLE_SESSION_INFO_MUTE:
        case JSJAC_JINGLE_SESSION_INFO_UNMUTE:
          this.stanza_set_attribute(info, 'creator', this.parent.get_creator_this());
          this.stanza_set_attribute(info, 'name',    args.name);

          break;
      }
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] stanza_generate_session_info > ' + e, 1);
    }
  },

  /**
   * @private
   */
  stanza_generate_content_local: function(stanza, jingle, override_content) {    
    try {
      var cur_media;
      var content_local = override_content ? override_content : this.parent.get_content_local();

      var _this = this;

      var fn_build_transport = function(content, transport_obj, namespace) {
        var transport = _this.stanza_build_node(
          stanza,
          content,
          [transport_obj.attrs],
          'transport',
          namespace
        );

        // Fingerprint
        _this.stanza_build_node(
          stanza,
          transport,
          [transport_obj.fingerprint],
          'fingerprint',
          NS_JINGLE_APPS_DTLS,
          'value'
        );

        // Candidates
        _this.stanza_build_node(
          stanza,
          transport,
          transport_obj.candidate,
          'candidate',
          namespace
        );
      };

      for(cur_media in content_local) {
        var cur_content = content_local[cur_media];

        var content = jingle.appendChild(stanza.buildNode('content', { 'xmlns': NS_JINGLE }));

        this.stanza_set_attribute(content, 'creator', cur_content.creator);
        this.stanza_set_attribute(content, 'name',    cur_content.name);
        this.stanza_set_attribute(content, 'senders', cur_content.senders);

        // Build description (if action type allows that element)
        if(this.stanza_get_attribute(jingle, 'action') != JSJAC_JINGLE_ACTION_TRANSPORT_INFO) {
          var cs_description  = cur_content.description;
          var cs_d_attrs      = cs_description.attrs;
          var cs_d_rtcp_fb    = cs_description['rtcp-fb'];
          var cs_d_bandwidth  = cs_description.bandwidth;
          var cs_d_payload    = cs_description.payload;
          var cs_d_encryption = cs_description.encryption;
          var cs_d_ssrc       = cs_description.ssrc;
          var cs_d_ssrc_group = cs_description['ssrc-group'];
          var cs_d_rtp_hdrext = cs_description['rtp-hdrext'];
          var cs_d_rtcp_mux   = cs_description['rtcp-mux'];

          var description = this.stanza_build_node(
                              stanza, content,
                              [cs_d_attrs],
                              'description',
                              NS_JINGLE_APPS_RTP
                            );

          // Payload-type
          if(cs_d_payload) {
            var i, j,
                cur_ssrc_id, cur_cs_d_ssrc_group_semantics,
                cs_d_p, payload_type;

            for(i in cs_d_payload) {
              cs_d_p = cs_d_payload[i];

              payload_type = this.stanza_build_node(
                stanza,
                description,
                [cs_d_p.attrs],
                'payload-type',
                NS_JINGLE_APPS_RTP
              );

              // Parameter
              this.stanza_build_node(
                stanza,
                payload_type,
                cs_d_p.parameter,
                'parameter',
                NS_JINGLE_APPS_RTP
              );

              // RTCP-FB (sub)
              this.stanza_build_node(
                stanza,
                payload_type,
                cs_d_p['rtcp-fb'],
                'rtcp-fb',
                NS_JINGLE_APPS_RTP_RTCP_FB
              );

              // RTCP-FB-TRR-INT
              this.stanza_build_node(
                stanza,
                payload_type,
                cs_d_p['rtcp-fb-trr-int'],
                'rtcp-fb-trr-int',
                NS_JINGLE_APPS_RTP_RTCP_FB
              );
            }

            // SSRC-GROUP
            if(cs_d_ssrc_group) {
              for(cur_cs_d_ssrc_group_semantics in cs_d_ssrc_group) {
                for(j in cs_d_ssrc_group[cur_cs_d_ssrc_group_semantics]) {
                  var ssrc_group = description.appendChild(stanza.buildNode('ssrc-group', {
                    'semantics': cur_cs_d_ssrc_group_semantics,
                    'xmlns': NS_JINGLE_APPS_RTP_SSMA
                  }));

                  this.stanza_build_node(
                    stanza,
                    ssrc_group,
                    cs_d_ssrc_group[cur_cs_d_ssrc_group_semantics][j].sources,
                    'source',
                    NS_JINGLE_APPS_RTP_SSMA
                  );
                }
              }
            }

            // SSRC
            if(cs_d_ssrc) {
              for(cur_ssrc_id in cs_d_ssrc) {
                var ssrc = description.appendChild(stanza.buildNode('source', {
                  'ssrc': cur_ssrc_id,
                  'xmlns': NS_JINGLE_APPS_RTP_SSMA
                }));

                this.stanza_build_node(
                  stanza,
                  ssrc,
                  cs_d_ssrc[cur_ssrc_id],
                  'parameter',
                  NS_JINGLE_APPS_RTP_SSMA
                );
              }
            }

            // Encryption
            if(cs_d_encryption && 
               (cs_d_encryption.crypto && cs_d_encryption.crypto.length || 
                cs_d_encryption['zrtp-hash'] && cs_d_encryption['zrtp-hash'].length)) {
              var encryption = description.appendChild(stanza.buildNode('encryption', { 'xmlns': NS_JINGLE_APPS_RTP }));

              this.stanza_set_attribute(encryption, 'required', (cs_d_encryption.attrs.required || '0'));

              // Crypto
              this.stanza_build_node(
                stanza,
                encryption,
                cs_d_encryption.crypto,
                'crypto',
                NS_JINGLE_APPS_RTP
              );

              // ZRTP-HASH
              this.stanza_build_node(
                stanza,
                encryption,
                cs_d_encryption['zrtp-hash'],
                'zrtp-hash',
                NS_JINGLE_APPS_RTP_ZRTP,
                'value'
              );
            }

            // RTCP-FB (common)
            this.stanza_build_node(
              stanza,
              description,
              cs_d_rtcp_fb,
              'rtcp-fb',
              NS_JINGLE_APPS_RTP_RTCP_FB
            );

            // Bandwidth
            this.stanza_build_node(
              stanza,
              description,
              cs_d_bandwidth,
              'bandwidth',
              NS_JINGLE_APPS_RTP,
              'value'
            );

            // RTP-HDREXT
            this.stanza_build_node(
              stanza,
              description,
              cs_d_rtp_hdrext,
              'rtp-hdrext',
              NS_JINGLE_APPS_RTP_RTP_HDREXT
            );

            // RTCP-MUX
            if(cs_d_rtcp_mux)
              description.appendChild(stanza.buildNode('rtcp-mux', { 'xmlns': NS_JINGLE_APPS_RTP }));
          }
        }

        // Build transport
        var cs_transport = this.generate_transport(cur_content.transport);

        // Transport candidates: ICE-UDP
        if((cs_transport.ice.candidate).length > 0) {
          fn_build_transport(
            content,
            cs_transport.ice,
            NS_JINGLE_TRANSPORTS_ICEUDP
          );
        }

        // Transport candidates: RAW-UDP
        if((cs_transport.raw.candidate).length > 0) {
          fn_build_transport(
            content,
            cs_transport.raw,
            NS_JINGLE_TRANSPORTS_RAWUDP
          );
        }
      }
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] stanza_generate_content_local > ' + e, 1);
    }
  },

  /**
   * @private
   */
  stanza_generate_group_local: function(stanza, jingle) {    
    try {
      var i,
          cur_semantics, cur_group, cur_group_name,
          group;

      var group_local = this.parent.get_group_local();

      for(cur_semantics in group_local) {
        cur_group = group_local[cur_semantics];

        group = jingle.appendChild(stanza.buildNode('group', {
          'xmlns': NS_JINGLE_APPS_GROUPING,
          'semantics': cur_semantics
        }));

        for(i in cur_group) {
          cur_group_name = cur_group[i];

          group.appendChild(stanza.buildNode('content', {
            'xmlns': NS_JINGLE_APPS_GROUPING,
            'name': cur_group_name
          }));
        }
      }
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] stanza_generate_group_local > ' + e, 1);
    }
  },

  /**
   * @private
   */
  generate_content: function(creator, name, senders, payloads, transports) {    
    var content_obj = {};

    try {
      // Generation process
      content_obj.creator     = creator;
      content_obj.name        = name;
      content_obj.senders     = senders;
      content_obj.description = {};
      content_obj.transport   = {};

      // Generate description
      var i;
      var description_cpy      = this.object_clone(payloads.descriptions);
      var description_ptime    = description_cpy.attrs.ptime;
      var description_maxptime = description_cpy.attrs.maxptime;

      if(description_ptime)     delete description_cpy.attrs.ptime;
      if(description_maxptime)  delete description_cpy.attrs.maxptime;

      for(i in description_cpy.payload) {
        if(!('attrs' in description_cpy.payload[i]))
          description_cpy.payload[i].attrs           = {};

        description_cpy.payload[i].attrs.ptime    = description_ptime;
        description_cpy.payload[i].attrs.maxptime = description_maxptime;
      }

      content_obj.description = description_cpy;

      // Generate transport
      content_obj.transport.candidate      = transports;
      content_obj.transport.attrs          = {};
      content_obj.transport.attrs.pwd   = payloads.transports ? payloads.transports.pwd   : null;
      content_obj.transport.attrs.ufrag = payloads.transports ? payloads.transports.ufrag : null;

      if(payloads.transports && payloads.transports.fingerprint)
        content_obj.transport.fingerprint  = payloads.transports.fingerprint;
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] generate_content > ' + e, 1);
    }

    return content_obj;
  },

  /**
   * @private
   */
  generate_transport: function(transport_init_obj) {    
    var transport_obj = {
      'ice': {},
      'raw': {}
    };

    try {
      var i, j, k,
          cur_attr,
          cur_candidate, cur_transport;

      // Reduce RAW-UDP map object for simpler search
      var rawudp_map = {};
      for(i in JSJAC_JINGLE_SDP_CANDIDATE_MAP_RAWUDP) {
        rawudp_map[JSJAC_JINGLE_SDP_CANDIDATE_MAP_RAWUDP[i].n] = 1;
      }

      var fn_init_obj = function(transport_sub_obj) {
        transport_sub_obj.attrs = transport_init_obj.attrs;
        transport_sub_obj.fingerprint = transport_init_obj.fingerprint;
        transport_sub_obj.candidate = [];
      };

      for(j in transport_obj)
        fn_init_obj(transport_obj[j]);

      // Nest candidates in their category
      for(k = 0; k < (transport_init_obj.candidate).length; k++) {
        cur_candidate = this.object_clone(transport_init_obj.candidate[k]);

        if(cur_candidate.type in JSJAC_JINGLE_SDP_CANDIDATE_TYPES) {
          // Remove attributes that are not required by RAW-UDP (XEP-0177 compliance)
          if(JSJAC_JINGLE_SDP_CANDIDATE_TYPES[cur_candidate.type] === JSJAC_JINGLE_SDP_CANDIDATE_METHOD_RAW) {
            for(cur_attr in cur_candidate) {
              if(typeof rawudp_map[cur_attr] == 'undefined')
                delete cur_candidate[cur_attr];
            }
          }

          cur_transport = transport_obj[JSJAC_JINGLE_SDP_CANDIDATE_TYPES[cur_candidate.type]];
          cur_transport.candidate.push(cur_candidate);
        }
      }
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] generate_transport > ' + e, 1);
    }

    return transport_obj;
  },

  /**
   * @private
   */
  build_content_local: function() {    
    try {
      var cur_name;

      for(cur_name in this.parent.get_name()) {
        this.parent.set_content_local(
          cur_name,

          this.generate_content(
            JSJAC_JINGLE_SENDERS_INITIATOR.jingle,
            cur_name,
            this.parent.get_senders(cur_name),
            this.parent.get_payloads_local(cur_name),
            this.parent.get_candidates_local(cur_name)
          )
        );
      }
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] build_content_local > ' + e, 1);
    }
  },

  /**
   * @private
   */
  build_content_remote: function() {    
    try {
      var cur_name;

      for(cur_name in this.parent.get_name()) {
        this.parent.set_content_remote(
          cur_name,

          this.generate_content(
            this.parent.get_creator(cur_name),
            cur_name,
            this.parent.get_senders(cur_name),
            this.parent.get_payloads_remote(cur_name),
            this.parent.get_candidates_remote(cur_name)
          )
        );
      }
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] build_content_remote > ' + e, 1);
    }
  },

  /**
   * @private
   */
  name_generate: function(media) {    
    var name = null;

    try {
      var i, cur_name;

      var content_all = [
        this.parent.get_content_remote(),
        this.parent.get_content_local()
      ];

      for(i in content_all) {
        for(cur_name in content_all[i]) {
          try {
            if(content_all[i][cur_name].description.attrs.media == media) {
              name = cur_name; break;
            }
          } catch(e) {}
        }

        if(name) break;
      }

      if(!name) name = media;
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] name_generate > ' + e, 1);
    }

    return name;
  },

  /**
   * @private
   */
  media_generate: function(name) {    
    var cur_media;
    var media = null;

    try {
      if(typeof name == 'number') {
        for(cur_media in JSJAC_JINGLE_MEDIAS) {
          if(name == parseInt(JSJAC_JINGLE_MEDIAS[cur_media].label, 10)) {
            media = cur_media; break;
          }
        }
      } else {
        for(cur_media in JSJAC_JINGLE_MEDIAS) {
          if(name == this.name_generate(cur_media)) {
            media = cur_media; break;
          }
        }
      }

      if(!media)  media = name;
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] media_generate > ' + e, 1);
    }

    return media;
  },

  /**
   * Generates a random SID value
   * @return SID value
   * @type string
   */
  generate_sid: function() {
    return JSJaCUtils.cnonce(16);
  },

  /**
   * Generates a random ID value
   * @return ID value
   * @type string
   */
  generate_id: function() {
    return JSJaCUtils.cnonce(10);
  },

  /**
   * Generates the constraints object
   * @return constraints object
   * @type object
   */
  generate_constraints: function() {    
    var constraints = {
      audio : false,
      video : false
    };

    try {
      // Medias?
      constraints.audio = true;
      constraints.video = (this.parent.get_media() == JSJAC_JINGLE_MEDIA_VIDEO);

      // Video configuration
      if(constraints.video === true) {
        // Resolution?
        switch(this.parent.get_resolution()) {
          // 16:9
          case '720':
          case 'hd':
            constraints.video = {
              mandatory : {
                minWidth       : 1280,
                minHeight      : 720,
                minAspectRatio : 1.77
              }
            };
            break;

          case '360':
          case 'md':
            constraints.video = {
              mandatory : {
                minWidth       : 640,
                minHeight      : 360,
                minAspectRatio : 1.77
              }
            };
            break;

          case '180':
          case 'sd':
            constraints.video = {
              mandatory : {
                minWidth       : 320,
                minHeight      : 180,
                minAspectRatio : 1.77
              }
            };
            break;

          // 4:3
          case '960':
            constraints.video = {
              mandatory : {
                minWidth  : 960,
                minHeight : 720
              }
            };
            break;

          case '640':
          case 'vga':
            constraints.video = {
              mandatory : {
                maxWidth  : 640,
                maxHeight : 480
              }
            };
            break;

          case '320':
            constraints.video = {
              mandatory : {
                maxWidth  : 320,
                maxHeight : 240
              }
            };
            break;
        }

        // Bandwidth?
        if(this.parent.get_bandwidth())
          constraints.video.optional = [{ bandwidth: this.parent.get_bandwidth() }];

        // FPS?
        if(this.parent.get_fps())
          constraints.video.mandatory.minFrameRate = this.parent.get_fps();

        // Custom video source? (screenshare)
        if(this.parent.get_media()        == JSJAC_JINGLE_MEDIA_VIDEO         && 
           this.parent.get_video_source() != JSJAC_JINGLE_VIDEO_SOURCE_CAMERA ) {
          if(document.location.protocol !== 'https:')
            this.parent.get_debug().log('[JSJaCJingle:utils] generate_constraints > HTTPS might be required to share screen, otherwise you may get a permission denied error.', 0);

          // Unsupported browser? (for that feature)
          if(this.browser().name != JSJAC_JINGLE_BROWSER_CHROME) {
            this.parent.get_debug().log('[JSJaCJingle:utils] generate_constraints > Video source not supported by ' + this.browser().name + ' (source: ' + this.parent.get_video_source() + ').', 1);
            
            this.parent.terminate(JSJAC_JINGLE_REASON_MEDIA_ERROR);
            return;
          }

          constraints.audio           = false;
          constraints.video.mandatory = {
            'chromeMediaSource': this.parent.get_video_source()
          };
        }
      }
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] generate_constraints > ' + e, 1);
    }

    return constraints;
  },

  /**
   * @private
   */
  is_sdp_common_credentials: function(payloads) {    
    var is_same = true;

    try {
      var i,
          prev_credentials, cur_credentials;

      for(i in payloads) {
        cur_credentials = payloads[i].transports;

        if(typeof prev_credentials == 'object') {
          if((prev_credentials.ufrag !== cur_credentials.ufrag)  ||
             (prev_credentials.pwd !== cur_credentials.pwd  )    ||
             (JSON.stringify(prev_credentials.fingerprint) !== JSON.stringify(cur_credentials.fingerprint)
            )) {
            is_same = false;
            break;
          }
        }

        prev_credentials = cur_credentials;
      }
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] is_sdp_common_credentials > ' + e, 1);
    }

    return is_same;
  },

  /**
   * @private
   */
  network_extract_main: function(media, candidates) {    
    var network_obj = {
      'ip': JSJAC_JINGLE_SDP_CANDIDATE_IP_DEFAULT,
      'port': JSJAC_JINGLE_SDP_CANDIDATE_PORT_DEFAULT,
      'scope': JSJAC_JINGLE_SDP_CANDIDATE_SCOPE_DEFAULT,
      'protocol': JSJAC_JINGLE_SDP_CANDIDATE_IPVERSION_DEFAULT
    };

    var local_obj, remote_obj;

    try {
      var i,
          cur_candidate, cur_candidate_parse;

      var fn_proceed_parse = function(type, candidate_eval) {
        var r_lan, protocol;

        var parse_obj = {
          'ip': candidate_eval.ip,
          'port': candidate_eval.port
        };

        if(candidate_eval.ip.match(R_NETWORK_IP.all.v4)) {
          r_lan = R_NETWORK_IP.lan.v4;
          parse_obj.protocol = JSJAC_JINGLE_SDP_CANDIDATE_IPVERSION_V4;
        } else if(candidate_eval.ip.match(R_NETWORK_IP.all.v6)) {
          r_lan = R_NETWORK_IP.lan.v6;
          parse_obj.protocol = JSJAC_JINGLE_SDP_CANDIDATE_IPVERSION_V6;
        } else {
          return;
        }

        if((type === JSJAC_JINGLE_SDP_CANDIDATE_TYPE_HOST) &&
           candidate_eval.ip.match(r_lan)) {
          // Local
          parse_obj.scope = JSJAC_JINGLE_SDP_CANDIDATE_SCOPE_LOCAL;
        } else if(type === JSJAC_JINGLE_SDP_CANDIDATE_TYPE_SRFLX) {
          // Remote
          parse_obj.scope = JSJAC_JINGLE_SDP_CANDIDATE_SCOPE_REMOTE;
        } else {
          return;
        }

        return parse_obj;
      };

      for(i in candidates) {
        cur_candidate = candidates[i];

        if(cur_candidate.id == media || cur_candidate.label == media) {
          cur_candidate_parse = this.parent.sdp.parse_candidate(cur_candidate.candidate);

          if(cur_candidate_parse.type === JSJAC_JINGLE_SDP_CANDIDATE_TYPE_HOST) {
            // Only proceed if no local network yet
            if(typeof local_obj == 'undefined') {
              local_obj = fn_proceed_parse(JSJAC_JINGLE_SDP_CANDIDATE_TYPE_HOST, cur_candidate_parse);
            }
          } else if(cur_candidate_parse.type === JSJAC_JINGLE_SDP_CANDIDATE_TYPE_SRFLX) {
            // Only proceed if no remote network yet
            if(typeof remote_obj == 'undefined') {
              remote_obj = fn_proceed_parse(JSJAC_JINGLE_SDP_CANDIDATE_TYPE_SRFLX, cur_candidate_parse);
            }
          }
        }
      }

      if(typeof remote_obj != 'undefined') {
        network_obj = remote_obj;
      } else if(typeof local_obj != 'undefined') {
        network_obj = local_obj;
      }
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] network_extract_main > ' + e, 1);
    }

    return network_obj;
  },

  /**
   * Returns our negotiation status
   * @return Negotiation status
   * @type string
   */
  negotiation_status: function() {
    return (this.parent.get_initiator() == this.connection_jid()) ? JSJAC_JINGLE_SENDERS_INITIATOR.jingle : JSJAC_JINGLE_SENDERS_RESPONDER.jingle;
  },

  /**
   * Get my connection JID
   * @return JID value
   * @type string
   */
  connection_jid: function() {
    return JSJAC_JINGLE_STORE_CONNECTION.username + '@' + 
           JSJAC_JINGLE_STORE_CONNECTION.domain   + '/' + 
           JSJAC_JINGLE_STORE_CONNECTION.resource;
  },

  /**
   * @private
   */
  map_register_view: function(type) {    
    var fn = {
      type   : null,
      mute   : false,

      view   : {
        get : null,
        set : null
      },

      stream : {
        get : null,
        set : null
      }
    };

    try {
      switch(type) {
        case 'local':
          fn.type       = type;
          fn.mute       = true;
          fn.view.get   = this.parent.get_local_view;
          fn.view.set   = this.parent.set_local_view;
          fn.stream.get = this.parent.get_local_stream;
          fn.stream.set = this.parent.set_local_stream;
          break;

        case 'remote':
          fn.type       = type;
          fn.view.get   = this.parent.get_remote_view;
          fn.view.set   = this.parent.set_remote_view;
          fn.stream.get = this.parent.get_remote_stream;
          fn.stream.set = this.parent.set_remote_stream;
          break;
      }
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] map_register_view > ' + e, 1);
    }

    return fn;
  },

  /**
   * @private
   */
  map_unregister_view: function(type) {    
    return this.map_register_view(type);
  },
});

/**
 * @fileoverview JSJaC Jingle library - SDP tools
 *
 * @url https://github.com/valeriansaliou/jsjac-jingle
 * @depends https://github.com/sstrigler/JSJaC
 * @author Valérian Saliou https://valeriansaliou.name/
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */


var JSJaCJingleSDP = ring.create({
  /**
   * Constructor
   */
  constructor: function(parent) {
    this.parent = parent;
  },


  /**
   * @private
   */
  parse_payload: function(sdp_payload) {
    var payload = {};

    try {
      if(!sdp_payload || sdp_payload.indexOf('\n') == -1)  return payload;

      // Common vars
      var lines     = sdp_payload.split('\n');
      var cur_name  = null;
      var cur_media = null;

      var common_transports = {
        'fingerprint' : {},
        'pwd'         : null,
        'ufrag'       : null
      };

      var error, i, j, k,
          cur_line,
          cur_fmtp, cur_fmtp_id, cur_fmtp_values, cur_fmtp_attrs, cur_fmtp_key, cur_fmtp_value,
          cur_rtpmap, cur_rtcp_fb, cur_rtcp_fb_trr_int,
          cur_crypto, cur_zrtp_hash, cur_fingerprint, cur_ssrc,
          cur_ssrc_group, cur_ssrc_group_semantics, cur_ssrc_group_ids, cur_ssrc_group_id,
          cur_extmap, cur_rtpmap_id, cur_rtcp_fb_id, cur_bandwidth,
          m_rtpmap, m_fmtp, m_rtcp_fb, m_rtcp_fb_trr_int, m_crypto, m_zrtp_hash,
          m_fingerprint, m_pwd, m_ufrag, m_ptime, m_maxptime, m_bandwidth, m_media, m_candidate,
          cur_check_name, cur_transport_sub;

      // Common functions
      var init_content = function(name) {
        if(!(name in payload))  payload[name] = {};
      };

      var init_descriptions = function(name, sub, sub_default) {
        init_content(name);

        if(!('descriptions' in payload[name]))        payload[name].descriptions      = {};
        if(!(sub  in payload[name].descriptions))  payload[name].descriptions[sub] = sub_default;
      };

      var init_transports = function(name, sub, sub_default) {
        init_content(name);

        if(!('transports' in payload[name]))        payload[name].transports      = {};
        if(!(sub  in payload[name].transports))  payload[name].transports[sub] = sub_default;
      };

      var init_ssrc = function(name, id) {
        init_descriptions(name, 'ssrc', {});

        if(!(id in payload[name].descriptions.ssrc))
          payload[name].descriptions.ssrc[id] = [];
      };

      var init_ssrc_group = function(name, semantics) {
        init_descriptions(name, 'ssrc-group', {});

        if(!(semantics in payload[name].descriptions['ssrc-group']))
          payload[name].descriptions['ssrc-group'][semantics] = [];
      };

      var init_payload = function(name, id) {
        init_descriptions(name, 'payload', {});

        if(!(id in payload[name].descriptions.payload)) {
          payload[name].descriptions.payload[id] = {
            'attrs'           : {},
            'parameter'       : [],
            'rtcp-fb'         : [],
            'rtcp-fb-trr-int' : []
          };
        }
      };

      var init_encryption = function(name) {
        init_descriptions(name, 'encryption', {
          'attrs'     : {
            'required' : '1'
          },

          'crypto'    : [],
          'zrtp-hash' : []
        });
      };

      for(i in lines) {
        cur_line = lines[i];

        m_media = (R_WEBRTC_SDP_ICE_PAYLOAD.media).exec(cur_line);

        // 'audio/video' line?
        if(m_media) {
          cur_media = m_media[1];
          cur_name  = this.parent.utils.name_generate(cur_media);

          // Push it to parent array
          init_descriptions(cur_name, 'attrs', {});
          payload[cur_name].descriptions.attrs.media = cur_media;

          continue;
        }

        m_bandwidth = (R_WEBRTC_SDP_ICE_PAYLOAD.bandwidth).exec(cur_line);

        // 'bandwidth' line?
        if(m_bandwidth) {
          // Populate current object
          error = 0;
          cur_bandwidth = {};

          cur_bandwidth.type  = m_bandwidth[1]  || error++;
          cur_bandwidth.value = m_bandwidth[2]  || error++;

          // Incomplete?
          if(error !== 0) continue;

          // Push it to parent array
          init_descriptions(cur_name, 'bandwidth', []);
          payload[cur_name].descriptions.bandwidth.push(cur_bandwidth);

          continue;
        }

        m_rtpmap = (R_WEBRTC_SDP_ICE_PAYLOAD.rtpmap).exec(cur_line);

        // 'rtpmap' line?
        if(m_rtpmap) {
          // Populate current object
          error = 0;
          cur_rtpmap = {};

          cur_rtpmap.channels  = m_rtpmap[6];
          cur_rtpmap.clockrate = m_rtpmap[4];
          cur_rtpmap.id        = m_rtpmap[1] || error++;
          cur_rtpmap.name      = m_rtpmap[3];

          // Incomplete?
          if(error !== 0) continue;

          cur_rtpmap_id = cur_rtpmap.id;

          // Push it to parent array
          init_payload(cur_name, cur_rtpmap_id);
          payload[cur_name].descriptions.payload[cur_rtpmap_id].attrs = cur_rtpmap;

          continue;
        }

        m_fmtp = (R_WEBRTC_SDP_ICE_PAYLOAD.fmtp).exec(cur_line);

        // 'fmtp' line?
        if(m_fmtp) {
          cur_fmtp_id = m_fmtp[1];

          if(cur_fmtp_id) {
            cur_fmtp_values = m_fmtp[2] ? (m_fmtp[2]).split(';') : [];

            for(j in cur_fmtp_values) {
              // Parse current attribute
              if(cur_fmtp_values[j].indexOf('=') !== -1) {
                cur_fmtp_attrs = cur_fmtp_values[j].split('=');
                cur_fmtp_key   = cur_fmtp_attrs[0];
                cur_fmtp_value = cur_fmtp_attrs[1];

                while(cur_fmtp_key.length && !cur_fmtp_key[0])
                  cur_fmtp_key = cur_fmtp_key.substring(1);
              } else {
                cur_fmtp_key = cur_fmtp_values[j];
                cur_fmtp_value = null;
              }

              // Populate current object
              error = 0;
              cur_fmtp = {};

              cur_fmtp.name  = cur_fmtp_key    || error++;
              cur_fmtp.value = cur_fmtp_value;

              // Incomplete?
              if(error !== 0) continue;

              // Push it to parent array
              init_payload(cur_name, cur_fmtp_id);
              payload[cur_name].descriptions.payload[cur_fmtp_id].parameter.push(cur_fmtp);
            }
          }

          continue;
        }

        m_rtcp_fb = (R_WEBRTC_SDP_ICE_PAYLOAD.rtcp_fb).exec(cur_line);

        // 'rtcp-fb' line?
        if(m_rtcp_fb) {
          // Populate current object
          error = 0;
          cur_rtcp_fb = {};

          cur_rtcp_fb.id      = m_rtcp_fb[1] || error++;
          cur_rtcp_fb.type    = m_rtcp_fb[2];
          cur_rtcp_fb.subtype = m_rtcp_fb[4];

          // Incomplete?
          if(error !== 0) continue;

          cur_rtcp_fb_id = cur_rtcp_fb.id;

          // Push it to parent array
          if(cur_rtcp_fb_id == '*') {
            init_descriptions(cur_name, 'rtcp-fb', []);
            (payload[cur_name].descriptions['rtcp-fb']).push(cur_rtcp_fb);
          } else {
            init_payload(cur_name, cur_rtcp_fb_id);
            (payload[cur_name].descriptions.payload[cur_rtcp_fb_id]['rtcp-fb']).push(cur_rtcp_fb);
          }

          continue;
        }

        m_rtcp_fb_trr_int = (R_WEBRTC_SDP_ICE_PAYLOAD.rtcp_fb_trr_int).exec(cur_line);

        // 'rtcp-fb-trr-int' line?
        if(m_rtcp_fb_trr_int) {
          // Populate current object
          error = 0;
          cur_rtcp_fb_trr_int = {};

          cur_rtcp_fb_trr_int.id      = m_rtcp_fb_trr_int[1] || error++;
          cur_rtcp_fb_trr_int.value   = m_rtcp_fb_trr_int[2] || error++;

          // Incomplete?
          if(error !== 0) continue;

          cur_rtcp_fb_trr_int_id = cur_rtcp_fb_trr_int.id;

          // Push it to parent array
          init_payload(cur_name, cur_rtcp_fb_trr_int_id);
          (payload[cur_name].descriptions.payload[cur_rtcp_fb_trr_int_id]['rtcp-fb-trr-int']).push(cur_rtcp_fb_trr_int);

          continue;
        }

        m_crypto = (R_WEBRTC_SDP_ICE_PAYLOAD.crypto).exec(cur_line);

        // 'crypto' line?
        if(m_crypto) {
          // Populate current object
          error = 0;
          cur_crypto = {};

          cur_crypto['crypto-suite']   = m_crypto[2]  || error++;
          cur_crypto['key-params']     = m_crypto[3]  || error++;
          cur_crypto['session-params'] = m_crypto[5];
          cur_crypto.tag               = m_crypto[1]  || error++;

          // Incomplete?
          if(error !== 0) continue;

          // Push it to parent array
          init_encryption(cur_name);
          (payload[cur_name].descriptions.encryption.crypto).push(cur_crypto);

          continue;
        }

        m_zrtp_hash = (R_WEBRTC_SDP_ICE_PAYLOAD.zrtp_hash).exec(cur_line);

        // 'zrtp-hash' line?
        if(m_zrtp_hash) {
          // Populate current object
          error = 0;
          cur_zrtp_hash = {};

          cur_zrtp_hash.version = m_zrtp_hash[1]  || error++;
          cur_zrtp_hash.value   = m_zrtp_hash[2]  || error++;

          // Incomplete?
          if(error !== 0) continue;

          // Push it to parent array
          init_encryption(cur_name);
          (payload[cur_name].descriptions.encryption['zrtp-hash']).push(cur_zrtp_hash);

          continue;
        }

        m_ptime = (R_WEBRTC_SDP_ICE_PAYLOAD.ptime).exec(cur_line);

        // 'ptime' line?
        if(m_ptime) {
          // Push it to parent array
          init_descriptions(cur_name, 'attrs', {});
          payload[cur_name].descriptions.attrs.ptime = m_ptime[1];

          continue;
        }

        m_maxptime = (R_WEBRTC_SDP_ICE_PAYLOAD.maxptime).exec(cur_line);

        // 'maxptime' line?
        if(m_maxptime) {
          // Push it to parent array
          init_descriptions(cur_name, 'attrs', {});
          payload[cur_name].descriptions.attrs.maxptime = m_maxptime[1];

          continue;
        }

        m_ssrc = (R_WEBRTC_SDP_ICE_PAYLOAD.ssrc).exec(cur_line);

        // 'ssrc' line?
        if(m_ssrc) {
          // Populate current object
          error = 0;
          cur_ssrc = {};

          cur_ssrc_id    = m_ssrc[1]  || error++;
          cur_ssrc.name  = m_ssrc[2]  || error++;
          cur_ssrc.value = m_ssrc[4];

          // Incomplete?
          if(error !== 0) continue;

          // Push it to storage array
          init_ssrc(cur_name, cur_ssrc_id);
          (payload[cur_name].descriptions.ssrc[cur_ssrc_id]).push(cur_ssrc);

          // Push it to parent array (common attr required for Jingle)
          init_descriptions(cur_name, 'attrs', {});
          payload[cur_name].descriptions.attrs.ssrc = cur_ssrc_id;

          continue;
        }

        m_ssrc_group = (R_WEBRTC_SDP_ICE_PAYLOAD.ssrc_group).exec(cur_line);

        // 'ssrc-group' line?
        if(m_ssrc_group) {
          // Populate current object
          error = 0;
          cur_ssrc_group = {};

          cur_ssrc_group_semantics = m_ssrc_group[1]  || error++;
          cur_ssrc_group_ids       = m_ssrc_group[2]  || error++;

          // Explode sources into a list
          cur_ssrc_group.sources = [];
          cur_ssrc_group_ids = cur_ssrc_group_ids.trim();

          if(cur_ssrc_group_ids) {
            cur_ssrc_group_ids = cur_ssrc_group_ids.split(' ');

            for(k in cur_ssrc_group_ids) {
              cur_ssrc_group_id = cur_ssrc_group_ids[k].trim();

              if(cur_ssrc_group_id) {
                cur_ssrc_group.sources.push({
                  'ssrc': cur_ssrc_group_id
                });
              }
            }
          }

          if(cur_ssrc_group.sources.length === 0)  error++;

          // Incomplete?
          if(error !== 0) continue;

          // Push it to storage array
          init_ssrc_group(cur_name, cur_ssrc_group_semantics);
          (payload[cur_name].descriptions['ssrc-group'][cur_ssrc_group_semantics]).push(cur_ssrc_group);

          continue;
        }

        m_rtcp_mux = (R_WEBRTC_SDP_ICE_PAYLOAD.rtcp_mux).exec(cur_line);

        // 'rtcp-mux' line?
        if(m_rtcp_mux) {
          // Push it to parent array
          init_descriptions(cur_name, 'rtcp-mux', 1);

          continue;
        }

        m_extmap = (R_WEBRTC_SDP_ICE_PAYLOAD.extmap).exec(cur_line);

        // 'extmap' line?
        if(m_extmap) {
          // Populate current object
          error = 0;
          cur_extmap = {};

          cur_extmap.id      = m_extmap[1]  || error++;
          cur_extmap.uri     = m_extmap[4]  || error++;
          cur_extmap.senders = m_extmap[3];

          // Incomplete?
          if(error !== 0) continue;

          // Push it to parent array
          init_descriptions(cur_name, 'rtp-hdrext', []);
          (payload[cur_name].descriptions['rtp-hdrext']).push(cur_extmap);

          continue;
        }

        m_fingerprint = (R_WEBRTC_SDP_ICE_PAYLOAD.fingerprint).exec(cur_line);

        // 'fingerprint' line?
        if(m_fingerprint) {
          // Populate current object
          error = 0;
          cur_fingerprint = common_transports.fingerprint || {};

          cur_fingerprint.hash  = m_fingerprint[1]  || error++;
          cur_fingerprint.value = m_fingerprint[2]  || error++;

          // Incomplete?
          if(error !== 0) continue;

          // Push it to parent array
          init_transports(cur_name, 'fingerprint', cur_fingerprint);
          common_transports.fingerprint = cur_fingerprint;

          continue;
        }

        m_setup = (R_WEBRTC_SDP_ICE_PAYLOAD.setup).exec(cur_line);

        // 'setup' line?
        if(m_setup) {
          // Populate current object
          cur_fingerprint = common_transports.fingerprint || {};
          cur_fingerprint.setup = m_setup[1];

          // Push it to parent array
          if(cur_fingerprint.setup) {
            // Map it to fingerprint as XML-wise it is related
            init_transports(cur_name, 'fingerprint', cur_fingerprint);
            common_transports.fingerprint = cur_fingerprint;
          }

          continue;
        }

        m_pwd = (R_WEBRTC_SDP_ICE_PAYLOAD.pwd).exec(cur_line);

        // 'pwd' line?
        if(m_pwd) {
          init_transports(cur_name, 'pwd', m_pwd[1]);

          if(!common_transports.pwd)
            common_transports.pwd = m_pwd[1];

          continue;
        }

        m_ufrag = (R_WEBRTC_SDP_ICE_PAYLOAD.ufrag).exec(cur_line);

        // 'ufrag' line?
        if(m_ufrag) {
          init_transports(cur_name, 'ufrag', m_ufrag[1]);

          if(!common_transports.ufrag)
            common_transports.ufrag = m_ufrag[1];

          continue;
        }

        // 'candidate' line? (shouldn't be there)
        m_candidate = R_WEBRTC_SDP_CANDIDATE.exec(cur_line);

        if(m_candidate) {
          this.parse_candidate_store({
            media     : cur_media,
            candidate : cur_line
          });

          continue;
        }
      }

      // Filter medias
      for(cur_check_name in payload) {
        // Undesired media?
        if(!this.parent.get_name()[cur_check_name]) {
          delete payload[cur_check_name]; continue;
        }

        // Validate transports
        if(typeof payload[cur_check_name].transports !== 'object')
          payload[cur_check_name].transports = {};

        for(cur_transport_sub in common_transports) {
          if(!payload[cur_check_name].transports[cur_transport_sub])
            payload[cur_check_name].transports[cur_transport_sub] = common_transports[cur_transport_sub];
        }
      }
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:sdp] parse_payload > ' + e, 1);
    }

    return payload;
  },

  /**
   * @private
   */
  parse_group: function(sdp_payload) {
    var group = {};

    try {
      if(!sdp_payload || sdp_payload.indexOf('\n') == -1)  return group;

      // Common vars
      var lines = sdp_payload.split('\n');
      var i, cur_line,
          m_group;

      var init_group = function(semantics) {
        if(!(semantics in group))  group[semantics] = [];
      };

      for(i in lines) {
        cur_line = lines[i];

        // 'group' line?
        m_group = (R_WEBRTC_SDP_ICE_PAYLOAD.group).exec(cur_line);

        if(m_group) {
          if(m_group[1] && m_group[2]) {
            init_group(m_group[1]);

            group[m_group[1]] = (m_group[2].indexOf(' ') === -1 ? [m_group[2]] : m_group[2].split(' '));
          }

          continue;
        }
      }
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:sdp] parse_group > ' + e, 1);
    }

    return group;
  },

  /**
   * @private
   */
  resolution_payload: function(payload) {
    try {
      if(!payload || typeof payload !== 'object') return {};

      // No video?
      if(this.parent.get_media_all().indexOf(JSJAC_JINGLE_MEDIA_VIDEO) === -1) return payload;

      var i, j, k, cur_media;
      var cur_payload, res_arr, constraints;
      var res_height = null;
      var res_width  = null;

      // Try local view? (more reliable)
      for(i in this.parent.get_local_view()) {
        if(typeof this.parent.get_local_view()[i].videoWidth  == 'number'  &&
           typeof this.parent.get_local_view()[i].videoHeight == 'number'  ) {
          res_height = this.parent.get_local_view()[i].videoHeight;
          res_width  = this.parent.get_local_view()[i].videoWidth;

          if(res_height && res_width)  break;
        }
      }

      // Try media constraints? (less reliable)
      if(!res_height || !res_width) {
        this.parent.get_debug().log('[JSJaCJingle:sdp] resolution_payload > Could not get local video resolution, falling back on constraints (local video may not be ready).', 0);

        constraints = this.generate_constraints();

        // Still nothing?!
        if(typeof constraints.video                     !== 'object'  || 
           typeof constraints.video.mandatory           !== 'object'  || 
           typeof constraints.video.mandatory.minWidth  !== 'number'  || 
           typeof constraints.video.mandatory.minHeight !== 'number'  ) {
          this.parent.get_debug().log('[JSJaCJingle:sdp] resolution_payload > Could not get local video resolution (not sending it).', 1);
          return payload;
        }

        res_height = constraints.video.mandatory.minHeight;
        res_width  = constraints.video.mandatory.minWidth;
      }

      // Constraints to be used
      res_arr = [
        {
          name  : 'height',
          value : res_height
        },

        {
          name  : 'width',
          value : res_width
        }
      ];

      for(cur_media in payload) {
        if(cur_media != JSJAC_JINGLE_MEDIA_VIDEO) continue;

        cur_payload = payload[cur_media].descriptions.payload;

        for(j in cur_payload) {
          if(typeof cur_payload[j].parameter !== 'object')  cur_payload[j].parameter = [];

          for(k in res_arr)
            (cur_payload[j].parameter).push(res_arr[k]);
        }
      }

      this.parent.get_debug().log('[JSJaCJingle:sdp] resolution_payload > Got local video resolution (' + res_width + 'x' + res_height + ').', 2);
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:sdp] resolution_payload > ' + e, 1);
    }

    return payload;
  },

  /**
   * @private
   */
  parse_candidate: function(sdp_candidate) {
    var candidate = {};

    try {
      if(!sdp_candidate)  return candidate;

      var error     = 0;
      var matches   = R_WEBRTC_SDP_CANDIDATE.exec(sdp_candidate);

      // Matches!
      if(matches) {
        candidate.component     = matches[2]  || error++;
        candidate.foundation    = matches[1]  || error++;
        candidate.generation    = matches[16] || JSJAC_JINGLE_GENERATION;
        candidate.id            = this.parent.utils.generate_id();
        candidate.ip            = matches[5]  || error++;
        candidate.network       = JSJAC_JINGLE_NETWORK;
        candidate.port          = matches[6]  || error++;
        candidate.priority      = matches[4]  || error++;
        candidate.protocol      = matches[3]  || error++;
        candidate['rel-addr']   = matches[11];
        candidate['rel-port']   = matches[13];
        candidate.type          = matches[8]  || error++;
      }

      // Incomplete?
      if(error !== 0) return {};
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:sdp] parse_candidate > ' + e, 1);
    }

    return candidate;
  },

  /**
   * @private
   */
  parse_candidate_store: function(sdp_candidate) {
    // Store received candidate
    var candidate_media = sdp_candidate.media;
    var candidate_data  = sdp_candidate.candidate;

    // Convert SDP raw data to an object
    var candidate_obj   = this.parse_candidate(candidate_data);

    this.parent.set_candidates_local(
      this.parent.utils.name_generate(
        candidate_media
      ),

      candidate_obj
    );

    // Enqueue candidate
    this.parent.set_candidates_queue_local(
      this.parent.utils.name_generate(
        candidate_media
      ),

      candidate_obj
    );
  },

  /**
   * @private
   */
  generate: function(type, group, payloads, candidates) {    
    try {
      var sdp_obj = {};

      sdp_obj.candidates  = this.generate_candidates(candidates);
      sdp_obj.description = this.generate_description(type, group, payloads, sdp_obj.candidates);

      return sdp_obj;
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:sdp] generate > ' + e, 1);
    }

    return {};
  },

  /**
   * @private
   */
  generate_candidates: function(candidates) {    
    var candidates_arr = [];

    try {
      // Parse candidates
      var i,
          cur_media, cur_name, cur_c_name, cur_candidate, cur_label, cur_id, cur_candidate_str;

      for(cur_name in candidates) {
        cur_c_name = candidates[cur_name];
        cur_media   = this.parent.utils.media_generate(cur_name);

        for(i in cur_c_name) {
          cur_candidate = cur_c_name[i];

          cur_label         = JSJAC_JINGLE_MEDIAS[cur_media].label;
          cur_id            = cur_label;
          cur_candidate_str = '';

          cur_candidate_str += 'a=candidate:';
          cur_candidate_str += (cur_candidate.foundation || cur_candidate.id);
          cur_candidate_str += ' ';
          cur_candidate_str += cur_candidate.component;
          cur_candidate_str += ' ';
          cur_candidate_str += cur_candidate.protocol || JSJAC_JINGLE_SDP_CANDIDATE_PROTOCOL_DEFAULT;
          cur_candidate_str += ' ';
          cur_candidate_str += cur_candidate.priority || JSJAC_JINGLE_SDP_CANDIDATE_PRIORITY_DEFAULT;
          cur_candidate_str += ' ';
          cur_candidate_str += cur_candidate.ip;
          cur_candidate_str += ' ';
          cur_candidate_str += cur_candidate.port;

          if(cur_candidate.type) {
            cur_candidate_str += ' ';
            cur_candidate_str += 'typ';
            cur_candidate_str += ' ';
            cur_candidate_str += cur_candidate.type;
          }

          if(cur_candidate['rel-addr'] && cur_candidate['rel-port']) {
            cur_candidate_str += ' ';
            cur_candidate_str += 'raddr';
            cur_candidate_str += ' ';
            cur_candidate_str += cur_candidate['rel-addr'];
            cur_candidate_str += ' ';
            cur_candidate_str += 'rport';
            cur_candidate_str += ' ';
            cur_candidate_str += cur_candidate['rel-port'];
          }

          if(cur_candidate.generation) {
            cur_candidate_str += ' ';
            cur_candidate_str += 'generation';
            cur_candidate_str += ' ';
            cur_candidate_str += cur_candidate.generation;
          }

          cur_candidate_str   += WEBRTC_SDP_LINE_BREAK;

          candidates_arr.push({
            label     : cur_label,
            id        : cur_id,
            candidate : cur_candidate_str
          });
        }
      }
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:sdp] generate_candidates > ' + e, 1);
    }

    return candidates_arr;
  },

  /**
   * @private
   */
  generate_description: function(type, group, payloads, sdp_candidates) {    
    var payloads_obj = {};

    try {
      var payloads_str = '';
      var is_common_credentials = this.parent.utils.is_sdp_common_credentials(payloads);

      // Common vars
      var i, c, j, k, l, m, n, o, p, q, r, s, t, u,
          cur_name, cur_name_first, cur_name_obj,
          cur_media, cur_senders,
          cur_group_semantics, cur_group_names, cur_group_name,
          cur_network_obj, cur_transports_obj, cur_transports_obj_first, cur_description_obj,
          cur_d_pwd, cur_d_ufrag, cur_d_fingerprint,
          cur_d_attrs, cur_d_rtcp_fb, cur_d_bandwidth, cur_d_encryption,
          cur_d_ssrc, cur_d_ssrc_id, cur_d_ssrc_obj, cur_d_ssrc_group, cur_d_ssrc_group_semantics, cur_d_ssrc_group_obj,
          cur_d_rtcp_fb_obj,
          cur_d_payload, cur_d_payload_obj, cur_d_payload_obj_attrs, cur_d_payload_obj_id,
          cur_d_payload_obj_parameter, cur_d_payload_obj_parameter_obj, cur_d_payload_obj_parameter_str,
          cur_d_payload_obj_rtcp_fb, cur_d_payload_obj_rtcp_fb_obj,
          cur_d_payload_obj_rtcp_fb_ttr_int, cur_d_payload_obj_rtcp_fb_ttr_int_obj,
          cur_d_crypto_obj, cur_d_zrtp_hash_obj,
          cur_d_rtp_hdrext, cur_d_rtp_hdrext_obj,
          cur_d_rtcp_mux;

      // Payloads headers
      payloads_str += this.generate_protocol_version();
      payloads_str += WEBRTC_SDP_LINE_BREAK;
      payloads_str += this.generate_origin();
      payloads_str += WEBRTC_SDP_LINE_BREAK;
      payloads_str += this.generate_session_name();
      payloads_str += WEBRTC_SDP_LINE_BREAK;
      payloads_str += this.generate_timing();
      payloads_str += WEBRTC_SDP_LINE_BREAK;

      // Add groups
      for(cur_group_semantics in group) {
        cur_group_names = group[cur_group_semantics];

        payloads_str += 'a=group:' + cur_group_semantics;

        for(s in cur_group_names) {
          cur_group_name = cur_group_names[s];
          payloads_str += ' ' + cur_group_name;
        }

        payloads_str += WEBRTC_SDP_LINE_BREAK;
      }

      // Common credentials?
      if(is_common_credentials === true) {
        for(cur_name_first in payloads) {
          cur_transports_obj_first = payloads[cur_name_first].transports || {};

          payloads_str += this.generate_credentials(
            cur_transports_obj_first.ufrag,
            cur_transports_obj_first.pwd,
            cur_transports_obj_first.fingerprint
          );

          break;
        }
      }

      // Add media groups
      for(cur_name in payloads) {
        cur_name_obj          = payloads[cur_name];
        cur_senders           = this.parent.get_senders(cur_name);
        cur_media             = this.parent.get_name(cur_name) ? this.parent.utils.media_generate(cur_name) : null;

        // No media?
        if(!cur_media) continue;

        // Network
        cur_network_obj       = this.parent.utils.network_extract_main(cur_name, sdp_candidates);

        // Transports
        cur_transports_obj    = cur_name_obj.transports || {};
        cur_d_pwd             = cur_transports_obj.pwd;
        cur_d_ufrag           = cur_transports_obj.ufrag;
        cur_d_fingerprint     = cur_transports_obj.fingerprint;

        // Descriptions
        cur_description_obj   = cur_name_obj.descriptions;
        cur_d_attrs           = cur_description_obj.attrs;
        cur_d_rtcp_fb         = cur_description_obj['rtcp-fb'];
        cur_d_bandwidth       = cur_description_obj.bandwidth;
        cur_d_payload         = cur_description_obj.payload;
        cur_d_encryption      = cur_description_obj.encryption;
        cur_d_ssrc            = cur_description_obj.ssrc;
        cur_d_ssrc_group      = cur_description_obj['ssrc-group'];
        cur_d_rtp_hdrext      = cur_description_obj['rtp-hdrext'];
        cur_d_rtcp_mux        = cur_description_obj['rtcp-mux'];

        // Current media
        payloads_str += this.generate_description_media(
          cur_media,
          cur_network_obj.port,
          cur_d_encryption,
          cur_d_fingerprint,
          cur_d_payload
        );
        payloads_str += WEBRTC_SDP_LINE_BREAK;

        payloads_str += 'c=' + 
                        cur_network_obj.scope + ' ' + 
                        cur_network_obj.protocol + ' ' + 
                        cur_network_obj.ip;
        payloads_str += WEBRTC_SDP_LINE_BREAK;

        payloads_str += 'a=rtcp:' + 
                        cur_network_obj.port + ' ' + 
                        cur_network_obj.scope + ' ' + 
                        cur_network_obj.protocol + ' ' + 
                        cur_network_obj.ip;
        payloads_str += WEBRTC_SDP_LINE_BREAK;

        // Specific credentials?
        if(is_common_credentials === false) {
          payloads_str += this.generate_credentials(
            cur_d_ufrag,
            cur_d_pwd,
            cur_d_fingerprint
          );
        }

        // Fingerprint
        if(cur_d_fingerprint && cur_d_fingerprint.setup) {
          payloads_str += 'a=setup:' + cur_d_fingerprint.setup;
          payloads_str += WEBRTC_SDP_LINE_BREAK;
        }

        // RTP-HDREXT
        if(cur_d_rtp_hdrext && cur_d_rtp_hdrext.length) {
          for(i in cur_d_rtp_hdrext) {
            cur_d_rtp_hdrext_obj = cur_d_rtp_hdrext[i];

            payloads_str += 'a=extmap:' + cur_d_rtp_hdrext_obj.id;

            if(cur_d_rtp_hdrext_obj.senders)
              payloads_str += '/' + cur_d_rtp_hdrext_obj.senders;

            payloads_str += ' ' + cur_d_rtp_hdrext_obj.uri;
            payloads_str += WEBRTC_SDP_LINE_BREAK;
          }
        }

        // Senders
        if(cur_senders) {
          payloads_str += 'a=' + JSJAC_JINGLE_SENDERS[cur_senders];
          payloads_str += WEBRTC_SDP_LINE_BREAK;
        }

        // Name
        if(cur_media && JSJAC_JINGLE_MEDIAS[cur_media]) {
          payloads_str += 'a=mid:' + (JSJAC_JINGLE_MEDIAS[cur_media]).label;
          payloads_str += WEBRTC_SDP_LINE_BREAK;
        }

        // RTCP-MUX
        // WARNING: no spec!
        // See: http://code.google.com/p/libjingle/issues/detail?id=309
        //      http://mail.jabber.org/pipermail/jingle/2011-December/001761.html
        if(cur_d_rtcp_mux) {
          payloads_str += 'a=rtcp-mux';
          payloads_str += WEBRTC_SDP_LINE_BREAK;
        }

        // 'encryption'
        if(cur_d_encryption) {
          // 'crypto'
          for(j in cur_d_encryption.crypto) {
            cur_d_crypto_obj = cur_d_encryption.crypto[j];

            payloads_str += 'a=crypto:'                       + 
                            cur_d_crypto_obj.tag           + ' ' + 
                            cur_d_crypto_obj['crypto-suite']  + ' ' + 
                            cur_d_crypto_obj['key-params']    + 
                            (cur_d_crypto_obj['session-params'] ? (' ' + cur_d_crypto_obj['session-params']) : '');

            payloads_str += WEBRTC_SDP_LINE_BREAK;
          }

          // 'zrtp-hash'
          for(p in cur_d_encryption['zrtp-hash']) {
            cur_d_zrtp_hash_obj = cur_d_encryption['zrtp-hash'][p];

            payloads_str += 'a=zrtp-hash:'                  + 
                            cur_d_zrtp_hash_obj.version  + ' ' + 
                            cur_d_zrtp_hash_obj.value;

            payloads_str += WEBRTC_SDP_LINE_BREAK;
          }
        }

        // 'rtcp-fb' (common)
        for(n in cur_d_rtcp_fb) {
          cur_d_rtcp_fb_obj = cur_d_rtcp_fb[n];

          payloads_str += 'a=rtcp-fb:*';
          payloads_str += ' ' + cur_d_rtcp_fb_obj.type;

          if(cur_d_rtcp_fb_obj.subtype)
            payloads_str += ' ' + cur_d_rtcp_fb_obj.subtype;

          payloads_str += WEBRTC_SDP_LINE_BREAK;
        }

        // 'bandwidth' (common)
        for(q in cur_d_bandwidth) {
          cur_d_bandwidth_obj = cur_d_bandwidth[q];

          payloads_str += 'b=' + cur_d_bandwidth_obj.type;
          payloads_str += ':'  + cur_d_bandwidth_obj.value;
          payloads_str += WEBRTC_SDP_LINE_BREAK;
        }

        // 'payload-type'
        for(k in cur_d_payload) {
          cur_d_payload_obj                 = cur_d_payload[k];
          cur_d_payload_obj_attrs           = cur_d_payload_obj.attrs;
          cur_d_payload_obj_parameter       = cur_d_payload_obj.parameter;
          cur_d_payload_obj_rtcp_fb         = cur_d_payload_obj['rtcp-fb'];
          cur_d_payload_obj_rtcp_fb_ttr_int = cur_d_payload_obj['rtcp-fb-trr-int'];

          cur_d_payload_obj_id              = cur_d_payload_obj_attrs.id;

          payloads_str += 'a=rtpmap:' + cur_d_payload_obj_id;

          // 'rtpmap'
          if(cur_d_payload_obj_attrs.name) {
            payloads_str += ' ' + cur_d_payload_obj_attrs.name;

            if(cur_d_payload_obj_attrs.clockrate) {
              payloads_str += '/' + cur_d_payload_obj_attrs.clockrate;

              if(cur_d_payload_obj_attrs.channels)
                payloads_str += '/' + cur_d_payload_obj_attrs.channels;
            }
          }

          payloads_str += WEBRTC_SDP_LINE_BREAK;

          // 'parameter'
          if(cur_d_payload_obj_parameter.length) {
            payloads_str += 'a=fmtp:' + cur_d_payload_obj_id + ' ';
            cur_d_payload_obj_parameter_str = '';

            for(o in cur_d_payload_obj_parameter) {
              cur_d_payload_obj_parameter_obj = cur_d_payload_obj_parameter[o];

              if(cur_d_payload_obj_parameter_str)  cur_d_payload_obj_parameter_str += ';';

              cur_d_payload_obj_parameter_str += cur_d_payload_obj_parameter_obj.name;

              if(cur_d_payload_obj_parameter_obj.value !== null) {
                cur_d_payload_obj_parameter_str += '=';
                cur_d_payload_obj_parameter_str += cur_d_payload_obj_parameter_obj.value;
              }
            }

            payloads_str += cur_d_payload_obj_parameter_str;
            payloads_str += WEBRTC_SDP_LINE_BREAK;
          }

          // 'rtcp-fb' (sub)
          for(l in cur_d_payload_obj_rtcp_fb) {
            cur_d_payload_obj_rtcp_fb_obj = cur_d_payload_obj_rtcp_fb[l];

            payloads_str += 'a=rtcp-fb:' + cur_d_payload_obj_id;
            payloads_str += ' ' + cur_d_payload_obj_rtcp_fb_obj.type;

            if(cur_d_payload_obj_rtcp_fb_obj.subtype)
              payloads_str += ' ' + cur_d_payload_obj_rtcp_fb_obj.subtype;

            payloads_str += WEBRTC_SDP_LINE_BREAK;
          }

          // 'rtcp-fb-ttr-int'
          for(m in cur_d_payload_obj_rtcp_fb_ttr_int) {
            cur_d_payload_obj_rtcp_fb_ttr_int_obj = cur_d_payload_obj_rtcp_fb_ttr_int[m];

            payloads_str += 'a=rtcp-fb:' + cur_d_payload_obj_id;
            payloads_str += ' ' + 'trr-int';
            payloads_str += ' ' + cur_d_payload_obj_rtcp_fb_ttr_int_obj.value;
            payloads_str += WEBRTC_SDP_LINE_BREAK;
          }
        }

        if(cur_d_attrs.ptime)     payloads_str += 'a=ptime:'    + cur_d_attrs.ptime + WEBRTC_SDP_LINE_BREAK;
        if(cur_d_attrs.maxptime)  payloads_str += 'a=maxptime:' + cur_d_attrs.maxptime + WEBRTC_SDP_LINE_BREAK;

        // 'ssrc-group'
        for(cur_d_ssrc_group_semantics in cur_d_ssrc_group) {
          for(t in cur_d_ssrc_group[cur_d_ssrc_group_semantics]) {
            cur_d_ssrc_group_obj = cur_d_ssrc_group[cur_d_ssrc_group_semantics][t];

            payloads_str += 'a=ssrc-group';
            payloads_str += ':' + cur_d_ssrc_group_semantics;

            for(u in cur_d_ssrc_group_obj.sources) {
              payloads_str += ' ' + cur_d_ssrc_group_obj.sources[u].ssrc;
            }

            payloads_str += WEBRTC_SDP_LINE_BREAK;
          }
        }

        // 'ssrc'
        for(cur_d_ssrc_id in cur_d_ssrc) {
          for(r in cur_d_ssrc[cur_d_ssrc_id]) {
            cur_d_ssrc_obj = cur_d_ssrc[cur_d_ssrc_id][r];

            payloads_str += 'a=ssrc';
            payloads_str += ':' + cur_d_ssrc_id;
            payloads_str += ' ' + cur_d_ssrc_obj.name;

            if(cur_d_ssrc_obj.value)
              payloads_str += ':' + cur_d_ssrc_obj.value;

            payloads_str += WEBRTC_SDP_LINE_BREAK;
          }
        }

        // Candidates (some browsers require them there, too)
        if(typeof sdp_candidates == 'object') {
          for(c in sdp_candidates) {
            if((sdp_candidates[c]).label == JSJAC_JINGLE_MEDIAS[cur_media].label)
              payloads_str += (sdp_candidates[c]).candidate;
          }
        }
      }

      // Push to object
      payloads_obj.type = type;
      payloads_obj.sdp  = payloads_str;
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:sdp] generate_description > ' + e, 1);
    }

    return payloads_obj;
  },

  /**
   * @private
   */
  generate_protocol_version: function() {
    return 'v=0';
  },

  /**
   * @private
   */
  generate_origin: function() {    
    var sdp_origin = '';

    try {
      // Values
      var jid = new JSJaCJID(this.parent.get_initiator());

      var username        = jid.getNode()   ? jid.getNode()   : '-';
      var session_id      = '1';
      var session_version = '1';
      var nettype         = JSJAC_JINGLE_SDP_CANDIDATE_SCOPE_DEFAULT;
      var addrtype        = JSJAC_JINGLE_SDP_CANDIDATE_IPVERSION_DEFAULT;
      var unicast_address = JSJAC_JINGLE_SDP_CANDIDATE_IP_DEFAULT;

      // Line content
      sdp_origin += 'o=';
      sdp_origin += username + ' ';
      sdp_origin += session_id + ' ';
      sdp_origin += session_version + ' ';
      sdp_origin += nettype + ' ';
      sdp_origin += addrtype + ' ';
      sdp_origin += unicast_address;
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:sdp] generate_origin > ' + e, 1);
    }

    return sdp_origin;
  },

  /**
   * @private
   */
  generate_session_name: function() {
    return 's=' + (this.parent.get_sid() || '-');
  },

  /**
   * @private
   */
  generate_timing: function() {
    return 't=0 0';
  },

  /**
   * @private
   */
  generate_credentials: function(ufrag, pwd, fingerprint) {    
    var sdp = '';

    // ICE credentials
    if(ufrag)  sdp += 'a=ice-ufrag:' + ufrag + WEBRTC_SDP_LINE_BREAK;
    if(pwd)    sdp += 'a=ice-pwd:' + pwd + WEBRTC_SDP_LINE_BREAK;

    // Fingerprint
    if(fingerprint) {
      if(fingerprint.hash && fingerprint.value) {
        sdp += 'a=fingerprint:' + fingerprint.hash + ' ' + fingerprint.value;
        sdp += WEBRTC_SDP_LINE_BREAK;
      }
    }

    return sdp;
  },

  /**
   * @private
   */
  generate_description_media: function(media, port, crypto, fingerprint, payload) {    
    var sdp_media = '';

    try {
      var i;
      var type_ids = [];

      sdp_media += 'm=' + media + ' ' + port + ' ';

      // Protocol
      if((crypto && crypto.length) || (fingerprint && fingerprint.hash && fingerprint.value))
        sdp_media += 'RTP/SAVPF';
      else
        sdp_media += 'RTP/AVPF';

      // Payload type IDs
      for(i in payload)  type_ids.push(payload[i].attrs.id);

      sdp_media += ' ' + type_ids.join(' ');
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:sdp] generate_description_media > ' + e, 1);
    }

    return sdp_media;
  },
});

/**
 * @fileoverview JSJaC Jingle library - Peer API lib
 *
 * @url https://github.com/valeriansaliou/jsjac-jingle
 * @depends https://github.com/sstrigler/JSJaC
 * @author Valérian Saliou https://valeriansaliou.name/
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */


var JSJaCJinglePeer = ring.create({
  /**
   * Constructor
   */
  constructor: function(parent) {
    this.parent = parent;
  },

  /**
   * @private
   */
  connection_create: function(sdp_message_callback) {
    this.parent.get_debug().log('[JSJaCJingle:peer] connection_create', 4);

    try {
      // Log STUN servers in use
      var i;
      var ice_config = this.parent.utils.config_ice();

      if(typeof ice_config.iceServers == 'object') {
        for(i = 0; i < (ice_config.iceServers).length; i++)
          this.parent.get_debug().log('[JSJaCJingle:peer] connection_create > Using ICE server at: ' + ice_config.iceServers[i].url + ' (' + (i + 1) + ').', 2);
      } else {
        this.parent.get_debug().log('[JSJaCJingle:peer] connection_create > No ICE server configured. Network may not work properly.', 0);
      }

      // Create the RTCPeerConnection object
      this.parent.set_peer_connection(
        new WEBRTC_PEER_CONNECTION(
          ice_config,
          WEBRTC_CONFIGURATION.peer_connection.constraints
        )
      );

      // Event: onicecandidate
      var _this = this;

      this.parent.get_peer_connection().onicecandidate = function(e) {
        if(e.candidate) {
          _this.parent.sdp.parse_candidate_store({
            media     : (isNaN(e.candidate.sdpMid) ? e.candidate.sdpMid : _this.parent.utils.media_generate(parseInt(e.candidate.sdpMid, 10))),
            candidate : e.candidate.candidate
          });
        } else {
          // Build or re-build content (local)
          _this.parent.utils.build_content_local();

          // In which action stanza should candidates be sent?
          if((_this.parent.is_initiator() && _this.parent.get_status() == JSJAC_JINGLE_STATUS_INITIATING)  ||
             (_this.parent.is_responder() && _this.parent.get_status() == JSJAC_JINGLE_STATUS_ACCEPTING)) {
            _this.parent.get_debug().log('[JSJaCJingle:peer] connection_create > onicecandidate > Got initial candidates.', 2);

            // Execute what's next (initiate/accept session)
            sdp_message_callback();
          } else {
            _this.parent.get_debug().log('[JSJaCJingle:peer] connection_create > onicecandidate > Got more candidates (on the go).', 2);

            // Send unsent candidates
            var candidates_queue_local = _this.parent.get_candidates_queue_local();

            if(_this.parent.utils.object_length(candidates_queue_local) > 0)
              _this.send(JSJAC_JINGLE_STANZA_TYPE_SET, { action: JSJAC_JINGLE_ACTION_TRANSPORT_INFO, candidates: candidates_queue_local });
          }

          // Empty the unsent candidates queue
          _this.parent.set_candidates_queue_local(null);
        }
      };

      // Event: oniceconnectionstatechange
      this.parent.get_peer_connection().oniceconnectionstatechange = function(e) {
        _this.parent.get_debug().log('[JSJaCJingle:peer] connection_create > oniceconnectionstatechange', 2);

        // Connection errors?
        switch(this.iceConnectionState) {
          case 'disconnected':
            _this.timeout(this.iceConnectionState, {
              timer  : JSJAC_JINGLE_PEER_TIMEOUT_DISCONNECT,
              reason : JSJAC_JINGLE_REASON_CONNECTIVITY_ERROR
            });
            break;

          case 'checking':
            _this.timeout(this.iceConnectionState); break;
        }

        _this.parent.get_debug().log('[JSJaCJingle:peer] connection_create > oniceconnectionstatechange > (state: ' + this.iceConnectionState + ').', 2);
      };

      // Event: onaddstream
      this.parent.get_peer_connection().onaddstream = function(e) {
        if (!e) return;

        _this.parent.get_debug().log('[JSJaCJingle:peer] connection_create > onaddstream', 2);

        // Attach remote stream to DOM view
        _this.parent.set_remote_stream(e.stream);
      };

      // Event: onremovestream
      this.parent.get_peer_connection().onremovestream = function(e) {
        _this.parent.get_debug().log('[JSJaCJingle:peer] connection_create > onremovestream', 2);

        // Detach remote stream from DOM view
        _this.parent.set_remote_stream(null);
      };

      // Add local stream
      this.parent.get_peer_connection().addStream(this.parent.get_local_stream()); 

      // Create offer
      this.parent.get_debug().log('[JSJaCJingle:peer] connection_create > Getting local description...', 2);

      if(this.parent.is_initiator()) {
        // Local description
        this.parent.get_peer_connection().createOffer(
          this.got_description.bind(this),
          this.fail_description.bind(this),
          WEBRTC_CONFIGURATION.create_offer
        );

        // Then, wait for responder to send back its remote description
      } else {
        // Apply SDP data
        sdp_remote = this.parent.sdp.generate(
          WEBRTC_SDP_TYPE_OFFER,
          this.parent.get_group_remote(),
          this.parent.get_payloads_remote(),
          this.parent.get_candidates_queue_remote()
        );

        if(this.parent.get_sdp_trace())  this.parent.get_debug().log('[JSJaCJingle:peer] SDP (remote)' + '\n\n' + sdp_remote.description.sdp, 4);

        // Remote description
        this.parent.get_peer_connection().setRemoteDescription(
          (new WEBRTC_SESSION_DESCRIPTION(sdp_remote.description)),

          function() {
            // Success (descriptions are compatible)
          },

          function(e) {
            if(_this.parent.get_sdp_trace())  _this.parent.get_debug().log('[JSJaCJingle:peer] SDP (remote:error)' + '\n\n' + (e.message || e.name || 'Unknown error'), 4);

            // Error (descriptions are incompatible)
            _this.parent.terminate(JSJAC_JINGLE_REASON_INCOMPATIBLE_PARAMETERS);
          }
        );

        // Local description
        this.parent.get_peer_connection().createAnswer(
          this.got_description.bind(this),
          this.fail_description.bind(this),
          WEBRTC_CONFIGURATION.create_answer
        );

        // ICE candidates
        var c;
        var cur_candidate_obj;

        for(c in sdp_remote.candidates) {
          cur_candidate_obj = sdp_remote.candidates[c];

          this.parent.get_peer_connection().addIceCandidate(
            new WEBRTC_ICE_CANDIDATE({
              sdpMLineIndex : cur_candidate_obj.id,
              candidate     : cur_candidate_obj.candidate
            })
          );
        }

        // Empty the unapplied candidates queue
        this.parent.set_candidates_queue_remote(null);
      }
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:peer] connection_create > ' + e, 1);
    }
  },

  /**
   * @private
   */
  get_user_media: function(callback) {
    this.parent.get_debug().log('[JSJaCJingle:peer] get_user_media', 4);

    try {
      this.parent.get_debug().log('[JSJaCJingle:peer] get_user_media > Getting user media...', 2);

      (WEBRTC_GET_MEDIA.bind(navigator))(
        this.parent.utils.generate_constraints(),
        this.got_user_media_success.bind(this, callback),
        this.got_user_media_error.bind(this)
      );
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:peer] get_user_media > ' + e, 1);
    }
  },

  /**
   * @private
   */
  got_user_media_success: function(callback, stream) {
    this.parent.get_debug().log('[JSJaCJingle:peer] got_user_media_success', 4);

    try {
      this.parent.get_debug().log('[JSJaCJingle:peer] got_user_media_success > Got user media.', 2);

      this.parent.set_local_stream(stream);

      if(callback && typeof callback == 'function') {
        if((this.parent.get_media() == JSJAC_JINGLE_MEDIA_VIDEO) && this.parent.get_local_view().length) {
          this.parent.get_debug().log('[JSJaCJingle:peer] got_user_media_success > Waiting for local video to be loaded...', 2);

          var _this = this;

          var fn_loaded = function() {
            _this.parent.get_debug().log('[JSJaCJingle:peer] got_user_media_success > Local video loaded.', 2);

            this.removeEventListener('loadeddata', fn_loaded, false);
            callback();
          };

          _this.parent.get_local_view()[0].addEventListener('loadeddata', fn_loaded, false);
        } else {
          callback();
        }
      }
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:peer] got_user_media_success > ' + e, 1);
    }
  },

  /**
   * @private
   */
  got_user_media_error: function(error) {
    this.parent.get_debug().log('[JSJaCJingle:peer] got_user_media_error', 4);

    try {
      (this.parent.get_session_initiate_error())(this);

      // Not needed in case we are the responder (breaks termination)
      if(this.parent.is_initiator()) this.parent.handle_session_initiate_error();

      // Not needed in case we are the initiator (no packet sent, ever)
      if(this.parent.is_responder()) this.parent.terminate(JSJAC_JINGLE_REASON_MEDIA_ERROR);

      this.parent.get_debug().log('[JSJaCJingle:peer] got_user_media_error > Failed (' + (error.PERMISSION_DENIED ? 'permission denied' : 'unknown' ) + ').', 1);
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:peer] got_user_media_error > ' + e, 1);
    }
  },

  /**
   * @private
   */
  got_description: function(sdp_local) {
    this.parent.get_debug().log('[JSJaCJingle:peer] got_description', 4);

    try {
      this.parent.get_debug().log('[JSJaCJingle:peer] got_description > Got local description.', 2);

      if(this.parent.get_sdp_trace())  this.parent.get_debug().log('[JSJaCJingle:peer] SDP (local:raw)' + '\n\n' + sdp_local.sdp, 4);

      // Convert SDP raw data to an object
      var cur_name;
      var payload_parsed = this.parent.sdp.parse_payload(sdp_local.sdp);
      this.parent.sdp.resolution_payload(payload_parsed);

      for(cur_name in payload_parsed) {
        this.parent.set_payloads_local(
          cur_name,
          payload_parsed[cur_name]
        );
      }

      var cur_semantics;
      var group_parsed = this.parent.sdp.parse_group(sdp_local.sdp);

      for(cur_semantics in group_parsed) {
        this.parent.set_group_local(
          cur_semantics,
          group_parsed[cur_semantics]
        );
      }

      // Filter our local description (remove unused medias)
      var sdp_local_desc = this.parent.sdp.generate_description(
        sdp_local.type,
        this.parent.get_group_local(),
        this.parent.get_payloads_local(),

        this.parent.sdp.generate_candidates(
          this.parent.get_candidates_local()
        )
      );

      if(this.parent.get_sdp_trace())  this.parent.get_debug().log('[JSJaCJingle:peer] SDP (local:gen)' + '\n\n' + sdp_local_desc.sdp, 4);

      var _this = this;

      this.parent.get_peer_connection().setLocalDescription(
        (new WEBRTC_SESSION_DESCRIPTION(sdp_local_desc)),

        function() {
          // Success (descriptions are compatible)
        },

        function(e) {
          if(_this.parent.get_sdp_trace())  _this.parent.get_debug().log('[JSJaCJingle:peer] SDP (local:error)' + '\n\n' + (e.message || e.name || 'Unknown error'), 4);

          // Error (descriptions are incompatible)
        }
      );

      this.parent.get_debug().log('[JSJaCJingle:peer] got_description > Waiting for local candidates...', 2);
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:peer] got_description > ' + e, 1);
    }
  },

  /**
   * @private
   */
  fail_description: function() {
    this.parent.get_debug().log('[JSJaCJingle:peer] fail_description', 4);

    try {
      this.parent.get_debug().log('[JSJaCJingle:peer] fail_description > Could not get local description!', 1);
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:peer] fail_description > ' + e, 1);
    }
  },

  /**
   * @private
   */
  sound: function(enable) {
    this.parent.get_debug().log('[JSJaCJingle:peer] sound', 4);

    try {
      this.parent.get_debug().log('[JSJaCJingle:peer] sound > Enable: ' + enable + ' (current: ' + this.parent.get_mute(JSJAC_JINGLE_MEDIA_AUDIO) + ').', 2);

      var i;
      var audio_tracks = this.parent.get_local_stream().getAudioTracks();

      for(i = 0; i < audio_tracks.length; i++)
        audio_tracks[i].enabled = enable;
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:peer] sound > ' + e, 1);
    }
  },

  /**
   * Set a timeout limit to peer connection
   */
  timeout: function(state, args) {
    try {
      // Assert
      if(typeof args !== 'object') args = {};

      var t_sid = this.parent.get_sid();

      var _this = this;

      setTimeout(function() {
        // State did not change?
        if(_this.parent.get_sid() == t_sid && _this.parent.get_peer_connection().iceConnectionState == state) {
          _this.parent.get_debug().log('[JSJaCJingle:peer] stanza_timeout > Peer timeout.', 2);

          // Error (transports are incompatible)
          _this.parent.terminate(args.reason || JSJAC_JINGLE_REASON_FAILED_TRANSPORT);
        }
      }, ((args.timer || JSJAC_JINGLE_PEER_TIMEOUT_DEFAULT) * 1000));
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:peer] timeout > ' + e, 1);
    }
  },

  /**
   * @private
   */
  stop: function() {
    this.parent.get_debug().log('[JSJaCJingle:peer] stop', 4);

    // Detach media streams from DOM view
    this.parent.set_local_stream(null);
    this.parent.set_remote_stream(null);

    // Close the media stream
    if(this.parent.get_peer_connection())
      this.parent.get_peer_connection().close();

    // Remove this session from router
    JSJaCJingle_remove(this.parent.get_sid());
  },

  /**
   * @private
   */
  stream_attach: function(element, stream, mute) {
    try {
      var i;
      var stream_src = stream ? URL.createObjectURL(stream) : '';

      for(i in element) {
        element[i].src = stream_src;

        if(navigator.mozGetUserMedia)
          element[i].play();
        else
          element[i].autoplay = true;

        if(typeof mute == 'boolean') element[i].muted = mute;
      }
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] _peer_stream_attach > ' + e, 1);
    }
  },

  /**
   * @private
   */
  stream_detach: function(element) {
    try {
      var i;

      for(i in element) {
        element[i].pause();
        element[i].src = '';
      }
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] _peer_stream_detach > ' + e, 1);
    }
  },
});

/**
 * @fileoverview JSJaC Jingle library - Base call lib
 *
 * @url https://github.com/valeriansaliou/jsjac-jingle
 * @depends https://github.com/sstrigler/JSJaC
 * @author Valérian Saliou https://valeriansaliou.name/
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */


/**
 * Creates a new XMPP Jingle session.
 * @class Somewhat abstract base class for XMPP Jingle sessions. Contains all
 * of the code in common for all Jingle sessions
 * @constructor
 * @param {Object} args Jingle session arguments.
 * @param {function} args.session_initiate_pending The initiate pending custom handler.
 * @param {function} args.session_initiate_success The initiate success custom handler.
 * @param {function} args.session_initiate_error The initiate error custom handler.
 * @param {function} args.session_initiate_request The initiate request custom handler.
 * @param {function} args.session_accept_pending The accept pending custom handler.
 * @param {function} args.session_accept_success The accept success custom handler.
 * @param {function} args.session_accept_error The accept error custom handler.
 * @param {function} args.session_accept_request The accept request custom handler.
 * @param {function} args.session_info_success The info success custom handler.
 * @param {function} args.session_info_error The info error custom handler.
 * @param {function} args.session_info_request The info request custom handler.
 * @param {function} args.session_terminate_pending The terminate pending custom handler.
 * @param {function} args.session_terminate_success The terminate success custom handler.
 * @param {function} args.session_terminate_error The terminate error custom handler.
 * @param {function} args.session_terminate_request The terminate request custom handler.
 * @param {function} args.add_remote_view The remote view media add (audio/video) custom handler.
 * @param {function} args.remove_remote_view The remote view media removal (audio/video) custom handler.
 * @param {DOM} args.local_view The path to the local stream view element.
 * @param {DOM} args.remote_view The path to the remote stream view element.
 * @param {string} args.to The full JID to start the Jingle session with.
 * @param {string} args.media The media type to be used in the Jingle session.
 * @param {string} args.resolution The resolution to be used for video in the Jingle session.
 * @param {string} args.bandwidth The bandwidth to be limited for video in the Jingle session.
 * @param {string} args.fps The framerate to be used for video in the Jingle session.
 * @param {object} args.stun A list of STUN servers to use (override the default one).
 * @param {object} args.turn A list of TURN servers to use.
 * @param {boolean} args.sdp_trace Log SDP trace in console (requires a debug interface).
 * @param {boolean} args.net_trace Log network packet trace in console (requires a debug interface).
 * @param {JSJaCDebugger} args.debug A reference to a debugger implementing the JSJaCDebugger interface.
 */

var __JSJaCJingleBase = ring.create({
  /**
   * Constructor
   */
  constructor: function(args) {
    this.utils  = new JSJaCJingleUtils(this);
    this.sdp    = new JSJaCJingleSDP(this);
    this.peer   = new JSJaCJinglePeer(this);
    
    if(args && args.session_initiate_pending)
      /**
       * @private
       */
      this._session_initiate_pending = args.session_initiate_pending;

    if(args && args.session_initiate_success)
      /**
       * @private
       */
      this._session_initiate_success = args.session_initiate_success;

    if(args && args.session_initiate_error)
      /**
       * @private
       */
      this._session_initiate_error = args.session_initiate_error;

    if(args && args.session_initiate_request)
      /**
       * @private
       */
      this._session_initiate_request = args.session_initiate_request;

    if(args && args.session_accept_pending)
      /**
       * @private
       */
      this._session_accept_pending = args.session_accept_pending;

    if(args && args.session_accept_success)
      /**
       * @private
       */
      this._session_accept_success = args.session_accept_success;

    if(args && args.session_accept_error)
      /**
       * @private
       */
      this._session_accept_error = args.session_accept_error;

    if(args && args.session_accept_request)
      /**
       * @private
       */
      this._session_accept_request = args.session_accept_request;

    if(args && args.session_info_success)
      /**
       * @private
       */
      this._session_info_success = args.session_info_success;

    if(args && args.session_info_error)
      /**
       * @private
       */
      this._session_info_error = args.session_info_error;

    if(args && args.session_info_request)
      /**
       * @private
       */
      this._session_info_request = args.session_info_request;

    if(args && args.session_terminate_pending)
      /**
       * @private
       */
      this._session_terminate_pending = args.session_terminate_pending;

    if(args && args.session_terminate_success)
      /**
       * @private
       */
      this._session_terminate_success = args.session_terminate_success;

    if(args && args.session_terminate_error)
      /**
       * @private
       */
      this._session_terminate_error = args.session_terminate_error;

    if(args && args.session_terminate_request)
      /**
       * @private
       */
      this._session_terminate_request = args.session_terminate_request;

    if(args && args.add_remote_view)
      /**
       * @private
       */
      this._add_remote_view = args.add_remote_view;

    if(args && args.remove_remote_view)
      /**
       * @private
       */
      this._remove_remote_view = args.remove_remote_view;

    if(args && args.to)
      /**
       * @private
       */
      this._to = args.to;

    if(args && args.media)
      /**
       * @private
       */
      this._media = args.media;

    if(args && args.video_source)
      /**
       * @private
       */
      this._video_source = args.video_source;

    if(args && args.resolution)
      /**
       * @private
       */
      this._resolution = args.resolution;

    if(args && args.bandwidth)
      /**
       * @private
       */
      this._bandwidth = args.bandwidth;

    if(args && args.fps)
      /**
       * @private
       */
      this._fps = args.fps;

    if(args && args.local_view)
      /**
       * @private
       */
      this._local_view = [args.local_view];

    if(args && args.remote_view)
      /**
       * @private
       */
      this._remote_view = [args.remote_view];

    if(args && args.stun) {
      /**
       * @private
       */
      this._stun = args.stun;
    } else {
      this._stun = {};
    }

    if(args && args.turn) {
      /**
       * @private
       */
      this._turn = args.turn;
    } else {
      this._turn = {};
    }

    if(args && args.sdp_trace)
      /**
       * @private
       */
      this._sdp_trace = args.sdp_trace;

    if(args && args.net_trace)
      /**
       * @private
       */
      this._net_trace = args.net_trace;

    if(args && args.debug && args.debug.log) {
        /**
         * Reference to debugger interface
         * (needs to implement method <code>log</code>)
         * @type JSJaCDebugger
         */
      this._debug = args.debug;
    } else {
      this._debug = JSJAC_JINGLE_STORE_DEBUG;
    }

    /**
     * @private
     */
    this._local_stream = null;

    /**
     * @private
     */
    this._remote_stream = null;

    /**
     * @private
     */
    this._content_local = {};

    /**
     * @private
     */
    this._content_remote = {};

    /**
     * @private
     */
    this._payloads_local = [];

    /**
     * @private
     */
    this._group_local = {};

    /**
     * @private
     */
    this._candidates_local = {};

    /**
     * @private
     */
    this._candidates_queue_local = {};

    /**
     * @private
     */
    this._payloads_remote = {};

    /**
     * @private
     */
    this._group_remote = {};

    /**
     * @private
     */
    this._candidates_remote = {};

    /**
     * @private
     */
    this._candidates_queue_remote = {};

    /**
     * @private
     */
    this._initiator = '';

    /**
     * @private
     */
    this._responder = '';

    /**
     * @private
     */
    this._mute = {};

    /**
     * @private
     */
    this._lock = false;

    /**
     * @private
     */
    this._media_busy = false;

    /**
     * @private
     */
    this._sid = '';

    /**
     * @private
     */
    this._name = {};

    /**
     * @private
     */
    this._senders = {};

    /**
     * @private
     */
    this._creator = {};

    /**
     * @private
     */
    this._status = JSJAC_JINGLE_STATUS_INACTIVE;

    /**
     * @private
     */
    this._reason = JSJAC_JINGLE_REASON_CANCEL;

    /**
     * @private
     */
    this._handlers = {};

    /**
     * @private
     */
    this._peer_connection = null;

    /**
     * @private
     */
    this._id = 0;

    /**
     * @private
     */
    this._sent_id = {};

    /**
     * @private
     */
    this._received_id = {};
  },

  

  /**
   * JSJSAC JINGLE GETTERS
   */

  /**
   * @private
   */
  get_session_initiate_pending: function() {
    if(typeof this._session_initiate_pending == 'function')
      return this._session_initiate_pending;

    return function() {};
  },

  /**
   * @private
   */
  get_session_initiate_success: function() {
    if(typeof this._session_initiate_success == 'function')
      return this._session_initiate_success;

    return function(stanza) {};
  },

  /**
   * @private
   */
  get_session_initiate_error: function() {
    if(typeof this._session_initiate_error == 'function')
      return this._session_initiate_error;

    return function(stanza) {};
  },

  /**
   * @private
   */
  get_session_initiate_request: function() {
    if(typeof this._session_initiate_request == 'function')
      return this._session_initiate_request;

    return function(stanza) {};
  },

  /**
   * @private
   */
  get_session_accept_pending: function() {
    if(typeof this._session_accept_pending == 'function')
      return this._session_accept_pending;

    return function() {};
  },

  /**
   * @private
   */
  get_session_accept_success: function() {
    if(typeof this._session_accept_success == 'function')
      return this._session_accept_success;

    return function(stanza) {};
  },

  /**
   * @private
   */
  get_session_accept_error: function() {
    if(typeof this._session_accept_error == 'function')
      return this._session_accept_error;

    return function(stanza) {};
  },

  /**
   * @private
   */
  get_session_accept_request: function() {
    if(typeof this._session_accept_request == 'function')
      return this._session_accept_request;

    return function(stanza) {};
  },

  /**
   * @private
   */
  get_session_info_success: function() {
    if(typeof this._session_info_success == 'function')
      return this._session_info_success;

    return function(stanza) {};
  },

  /**
   * @private
   */
  get_session_info_error: function() {
    if(typeof this._session_info_error == 'function')
      return this._session_info_error;

    return function(stanza) {};
  },

  /**
   * @private
   */
  get_session_info_request: function() {
    if(typeof this._session_info_request == 'function')
      return this._session_info_request;

    return function(stanza) {};
  },

  /**
   * @private
   */
  get_session_terminate_pending: function() {
    if(typeof this._session_terminate_pending == 'function')
      return this._session_terminate_pending;

    return function() {};
  },

  /**
   * @private
   */
  get_session_terminate_success: function() {
    if(typeof this._session_terminate_success == 'function')
      return this._session_terminate_success;

    return function(stanza) {};
  },

  /**
   * @private
   */
  get_session_terminate_error: function() {
    if(typeof this._session_terminate_error == 'function')
      return this._session_terminate_error;

    return function(stanza) {};
  },

  /**
   * @private
   */
  get_session_terminate_request: function() {
    if(typeof this._session_terminate_request == 'function')
      return this._session_terminate_request;

    return function(stanza) {};
  },

  /**
   * @private
   */
  get_add_remote_view: function() {
    if(typeof this._add_remote_view == 'function')
      return this._add_remote_view;

    return function() {};
  },

  /**
   * @private
   */
  get_remove_remote_view: function() {
    if(typeof this._remove_remote_view == 'function')
      return this._remove_remote_view;

    return function() {};
  },

  /**
   * @private
   */
  get_local_stream: function() {
    return this._local_stream;
  },

  /**
   * @private
   */
  get_remote_stream: function() {
    return this._remote_stream;
  },

  /**
   * @private
   */
  get_payloads_local: function(name) {
    if(name)
      return (name in this._payloads_local) ? this._payloads_local[name] : {};

    return this._payloads_local;
  },

  /**
   * @private
   */
  get_group_local: function(semantics) {
    if(semantics)
      return (semantics in this._group_local) ? this._group_local[semantics] : {};

    return this._group_local;
  },

  /**
   * @private
   */
  get_candidates_local: function(name) {
    if(name)
      return (name in this._candidates_local) ? this._candidates_local[name] : {};

    return this._candidates_local;
  },

  /**
   * @private
   */
  get_candidates_queue_local: function(name) {
    if(name)
      return (name in this._candidates_queue_local) ? this._candidates_queue_local[name] : {};

    return this._candidates_queue_local;
  },

  /**
   * @private
   */
  get_payloads_remote: function(name) {
    if(name)
      return (name in this._payloads_remote) ? this._payloads_remote[name] : {};

    return this._payloads_remote;
  },

  /**
   * @private
   */
  get_group_remote: function(semantics) {
    if(semantics)
      return (semantics in this._group_remote) ? this._group_remote[semantics] : {};

    return this._group_remote;
  },

  /**
   * @private
   */
  get_candidates_remote: function(name) {
    if(name)
      return (name in this._candidates_remote) ? this._candidates_remote[name] : [];

    return this._candidates_remote;
  },

  /**
   * @private
   */
  get_candidates_queue_remote: function(name) {
    if(name)
      return (name in this._candidates_queue_remote) ? this._candidates_queue_remote[name] : {};

    return this._candidates_queue_remote;
  },

  /**
   * @private
   */
  get_content_local: function(name) {
    if(name)
      return (name in this._content_local) ? this._content_local[name] : {};

    return this._content_local;
  },

  /**
   * @private
   */
  get_content_remote: function(name) {
    if(name)
      return (name in this._content_remote) ? this._content_remote[name] : {};

    return this._content_remote;
  },

  /**
   * @private
   */
  get_handlers: function(type, id) {
    type = type || JSJAC_JINGLE_STANZA_TYPE_ALL;

    if(id) {
      if(type != JSJAC_JINGLE_STANZA_TYPE_ALL && type in this._handlers && typeof this._handlers[type][id] == 'function')
        return this._handlers[type][id];

      if(JSJAC_JINGLE_STANZA_TYPE_ALL in this._handlers && typeof this._handlers[JSJAC_JINGLE_STANZA_TYPE_ALL][id] == 'function')
        return this._handlers[type][id];
    }

    return null;
  },

  /**
   * @private
   */
  get_peer_connection: function() {
    return this._peer_connection;
  },

  /**
   * @private
   */
  get_id: function() {
    return this._id;
  },

  /**
   * @private
   */
  get_id_pre: function() {
    return JSJAC_JINGLE_STANZA_ID_PRE + '_' + (this.get_sid() || '0') + '_';
  },

  /**
   * @private
   */
  get_id_new: function() {
    var trans_id = this.get_id() + 1;
    this.set_id(trans_id);

    return this.get_id_pre() + trans_id;
  },

  /**
   * @private
   */
  get_sent_id: function() {
    return this._sent_id;
  },

  /**
   * @private
   */
  get_received_id: function() {
    return this._received_id;
  },

  /**
   * Gets the mute state
   * @return mute value
   * @type boolean
   */
  get_mute: function(name) {
    if(!name) name = '*';

    return (name in this._mute) ? this._mute[name] : false;
  },

  /**
   * Gets the lock value
   * @return lock value
   * @type boolean
   */
  get_lock: function() {
    return this._lock || !JSJAC_JINGLE_AVAILABLE;
  },

  /**
   * Gets the media busy value
   * @return media busy value
   * @type boolean
   */
  get_media_busy: function() {
    return this._media_busy;
  },

  /**
   * Gets the sid value
   * @return sid value
   * @type string
   */
  get_sid: function() {
    return this._sid;
  },

  /**
   * Gets the status value
   * @return status value
   * @type string
   */
  get_status: function() {
    return this._status;
  },

  /**
   * Gets the reason value
   * @return reason value
   * @type string
   */
  get_reason: function() {
    return this._reason;
  },

  /**
   * Gets the is_muji value
   * @return is_muji value
   * @type boolean
   */
  get_is_muji: function() {
    return this._is_muji || false;
  },

  /**
   * Gets the to value
   * @return to value
   * @type string
   */
  get_to: function() {
    return this._to;
  },

  /**
   * Gets the media value
   * @return media value
   * @type string
   */
  get_media: function() {
    return (this._media && this._media in JSJAC_JINGLE_MEDIAS) ? this._media : JSJAC_JINGLE_MEDIA_VIDEO;
  },

  /**
   * Gets a list of medias in use
   * @return media list
   * @type object
   */
  get_media_all: function() {
    if(this.get_media() == JSJAC_JINGLE_MEDIA_AUDIO)
      return [JSJAC_JINGLE_MEDIA_AUDIO];

    return [JSJAC_JINGLE_MEDIA_AUDIO, JSJAC_JINGLE_MEDIA_VIDEO];
  },

  /**
   * Gets the video source value
   * @return video source value
   * @type string
   */
  get_video_source: function() {
    return (this._video_source && this._video_source in JSJAC_JINGLE_VIDEO_SOURCES) ? this._video_source : JSJAC_JINGLE_VIDEO_SOURCE_CAMERA;
  },

  /**
   * Gets the resolution value
   * @return resolution value
   * @type string
   */
  get_resolution: function() {
    return this._resolution ? (this._resolution).toString() : null;
  },

  /**
   * Gets the bandwidth value
   * @return bandwidth value
   * @type string
   */
  get_bandwidth: function() {
    return this._bandwidth ? (this._bandwidth).toString() : null;
  },

  /**
   * Gets the fps value
   * @return fps value
   * @type string
   */
  get_fps: function() {
    return this._fps ? (this._fps).toString() : null;
  },

  /**
   * Gets the name value
   * @return name value
   * @type string
   */
  get_name: function(name) {
    if(name)
      return name in this._name;

    return this._name;
  },

  /**
   * Gets the senders value
   * @return senders value
   * @type string
   */
  get_senders: function(name) {
    if(name)
      return (name in this._senders) ? this._senders[name] : null;

    return this._senders;
  },

  /**
   * Gets the creator value
   * @return creator value
   * @type string
   */
  get_creator: function(name) {
    if(name)
      return (name in this._creator) ? this._creator[name] : null;

    return this._creator;
  },

  /**
   * Gets the creator value (for this)
   * @return creator value
   * @type string
   */
  get_creator_this: function(name) {
    return this.get_responder() == this.get_to() ? JSJAC_JINGLE_CREATOR_INITIATOR : JSJAC_JINGLE_CREATOR_RESPONDER;
  },

  /**
   * Gets the initiator value
   * @return initiator value
   * @type string
   */
  get_initiator: function() {
    return this._initiator;
  },

  /**
   * Gets the response value
   * @return response value
   * @type string
   */
  get_responder: function() {
    return this._responder;
  },

  /**
   * Gets the local_view value
   * @return local_view value
   * @type DOM
   */
  get_local_view: function() {
    return (typeof this._local_view == 'object') ? this._local_view : [];
  },

  /**
   * Gets the remote_view value
   * @return remote_view value
   * @type DOM
   */
  get_remote_view: function() {
    return (typeof this._remote_view == 'object') ? this._remote_view : [];
  },

  /**
   * Gets the STUN servers
   * @return STUN servers
   * @type object
   */
  get_stun: function() {
    return (typeof this._stun == 'object') ? this._stun : {};
  },

  /**
   * Gets the TURN servers
   * @return TURN servers
   * @type object
   */
  get_turn: function() {
    return (typeof this._turn == 'object') ? this._turn : {};
  },

  /**
   * Gets the SDP trace value
   * @return SDP trace value
   * @type boolean
   */
  get_sdp_trace: function() {
    return (this._sdp_trace === true);
  },

  /**
   * Gets the network packet trace value
   * @return Network packet trace value
   * @type boolean
   */
  get_net_trace: function() {
    return (this._net_trace === true);
  },

  /**
   * Gets the debug value
   * @return debug value
   * @type JSJaCDebugger
   */
  get_debug: function() {
    return this._debug;
  },



  /**
   * JSJSAC JINGLE SETTERS
   */

  /**
   * @private
   */
  set_session_initiate_pending: function(session_initiate_pending) {
    this._session_initiate_pending = session_initiate_pending;
  },

  /**
   * @private
   */
  set_initiate_success: function(initiate_success) {
    this._session_initiate_success = initiate_success;
  },

  /**
   * @private
   */
  set_initiate_error: function(initiate_error) {
    this._session_initiate_error = initiate_error;
  },

  /**
   * @private
   */
  set_initiate_request: function(initiate_request) {
    this._session_initiate_request = initiate_request;
  },

  /**
   * @private
   */
  set_accept_pending: function(accept_pending) {
    this._session_accept_pending = accept_pending;
  },

  /**
   * @private
   */
  set_accept_success: function(accept_success) {
    this._session_accept_success = accept_success;
  },

  /**
   * @private
   */
  set_accept_error: function(accept_error) {
    this._session_accept_error = accept_error;
  },

  /**
   * @private
   */
  set_accept_request: function(accept_request) {
    this._session_accept_request = accept_request;
  },

  /**
   * @private
   */
  set_info_success: function(info_success) {
    this._session_info_success = info_success;
  },

  /**
   * @private
   */
  set_info_error: function(info_error) {
    this._session_info_error = info_error;
  },

  /**
   * @private
   */
  set_info_request: function(info_request) {
    this._session_info_request = info_request;
  },

  /**
   * @private
   */
  set_terminate_pending: function(terminate_pending) {
    this._session_terminate_pending = terminate_pending;
  },

  /**
   * @private
   */
  set_terminate_success: function(terminate_success) {
    this._session_terminate_success = terminate_success;
  },

  /**
   * @private
   */
  set_terminate_error: function(terminate_error) {
    this._session_terminate_error = terminate_error;
  },

  /**
   * @private
   */
  set_terminate_request: function(terminate_request) {
    this._session_terminate_request = terminate_request;
  },

  /**
   * @private
   */
  set_local_stream: function(local_stream) {
    try {
      if(!local_stream && this._local_stream) {
        (this._local_stream).stop();

        this.peer.stream_detach(
          this.get_local_view()
        );
      }

      this._local_stream = local_stream;

      if(local_stream) {
        this.peer.stream_attach(
          this.get_local_view(),
          this.get_local_stream(),
          true
        );
      } else {
        this.peer.stream_detach(
          this.get_local_view()
        );
      }
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:base] set_local_stream > ' + e, 1);
    }
  },

  /**
   * @private
   */
  set_remote_stream: function(remote_stream) {
    try {
      if(!remote_stream && this._remote_stream) {
        this.peer.stream_detach(
          this.get_remote_view()
        );
      }

      this._remote_stream = remote_stream;

      if(remote_stream) {
        this.peer.stream_attach(
          this.get_remote_view(),
          this.get_remote_stream(),
          false
        );
      } else {
        this.peer.stream_detach(
          this.get_remote_view()
        );
      }
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:base] set_remote_stream > ' + e, 1);
    }
  },

  /**
   * @private
   */
  set_local_view: function(local_view) {
    if(typeof this._local_view !== 'object')
      this._local_view = [];

    this._local_view.push(local_view);
  },

  /**
   * @private
   */
  set_remote_view: function(remote_view) {
    if(typeof this._remote_view !== 'object')
      this._remote_view = [];

    this._remote_view.push(remote_view);
  },

  /**
   * @private
   */
  set_payloads_local: function(name, payload_data) {
    this._payloads_local[name] = payload_data;
  },

  /**
   * @private
   */
  set_group_local: function(semantics, group_data) {
    this._group_local[semantics] = group_data;
  },

  /**
   * @private
   */
  set_candidates_local: function(name, candidate_data) {
    if(!(name in this._candidates_local))  this._candidates_local[name] = [];

    (this._candidates_local[name]).push(candidate_data);
  },

  /**
   * @private
   */
  set_candidates_queue_local: function(name, candidate_data) {
    try {
      if(name === null) {
        this._candidates_queue_local = {};
      } else {
        if(!(name in this._candidates_queue_local))  this._candidates_queue_local[name] = [];

        (this._candidates_queue_local[name]).push(candidate_data);
      }
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:base] set_candidates_queue_local > ' + e, 1);
    }
  },

  /**
   * @private
   */
  set_payloads_remote: function(name, payload_data) {
    this._payloads_remote[name] = payload_data;
  },

  /**
   * @private
   */
  set_payloads_remote_add: function(name, payload_data) {
    try {
      if(!(name in this._payloads_remote)) {
        this.set_payloads_remote(name, payload_data);
      } else {
        var key;
        var payloads_store = this._payloads_remote[name].descriptions.payload;
        var payloads_add   = payload_data.descriptions.payload;

        for(key in payloads_add) {
          if(!(key in payloads_store))
            payloads_store[key] = payloads_add[key];
        }
      }
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:base] set_payloads_remote_add > ' + e, 1);
    }
  },

  /**
   * @private
   */
  set_group_remote: function(semantics, group_data) {
    this._group_remote[semantics] = group_data;
  },

  /**
   * @private
   */
  set_candidates_remote: function(name, candidate_data) {
    this._candidates_remote[name] = candidate_data;
  },

  /**
   * @private
   */
  set_candidates_queue_remote: function(name, candidate_data) {
    if(name === null)
      this._candidates_queue_remote = {};
    else
      this._candidates_queue_remote[name] = (candidate_data);
  },

  /**
   * @private
   */
  set_candidates_remote_add: function(name, candidate_data) {
    try {
      if(!name) return;

      if(!(name in this._candidates_remote))
        this.set_candidates_remote(name, []);
   
      var c, i;
      var candidate_ids = [];

      for(c in this.get_candidates_remote(name))
        candidate_ids.push(this.get_candidates_remote(name)[c].id);

      for(i in candidate_data) {
        if((candidate_data[i].id).indexOf(candidate_ids) !== -1)
          this.get_candidates_remote(name).push(candidate_data[i]);
      }
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:base] set_candidates_remote_add > ' + e, 1);
    }
  },

  /**
   * @private
   */
  set_content_local: function(name, content_local) {
    this._content_local[name] = content_local;
  },

  /**
   * @private
   */
  set_content_remote: function(name, content_remote) {
    this._content_remote[name] = content_remote;
  },

  /**
   * @private
   */
  set_handlers: function(type, id, handler) {
    if(!(type in this._handlers))  this._handlers[type] = {};

    this._handlers[type][id] = handler;
  },

  /**
   * @private
   */
  set_peer_connection: function(peer_connection) {
    this._peer_connection = peer_connection;
  },

  /**
   * @private
   */
  set_id: function(id) {
    this._id = id;
  },

  /**
   * @private
   */
  set_sent_id: function(sent_id) {
    this._sent_id[sent_id] = 1;
  },

  /**
   * @private
   */
  set_received_id: function(received_id) {
    this._received_id[received_id] = 1;
  },

  /**
   * @private
   */
  set_mute: function(name, mute) {
    if(!name || name == '*') {
      this._mute = {};
      name = '*';
    }

    this._mute[name] = mute;
  },

  /**
   * @private
   */
  set_lock: function(lock) {
    this._lock = lock;
  },

  /**
   * Gets the media busy value
   * @return media busy value
   * @type boolean
   */
  set_media_busy: function(busy) {
    this._media_busy = busy;
  },

  /**
   * @private
   */
  set_sid: function(sid) {
    this._sid = sid;
  },

  /**
   * @private
   */
  set_status: function(status) {
    this._status = status;
  },

  /**
   * @private
   */
  set_reason: function(reason) {
    this._reason = reason || JSJAC_JINGLE_REASON_CANCEL;
  },

  /**
   * @private
   */
  set_is_muji: function(is_muji) {
    this._is_muji = is_muji;
  },

  /**
   * @private
   */
  set_to: function(to) {
    this._to = to;
  },

  /**
   * @private
   */
  set_media: function(media) {
    this._media = media;
  },

  /**
   * @private
   */
  set_video_source: function() {
    this._video_source = video_source;
  },

  /**
   * @private
   */
  set_resolution: function(resolution) {
    this._resolution = resolution;
  },

  /**
   * @private
   */
  set_bandwidth: function(bandwidth) {
    this._bandwidth = bandwidth;
  },

  /**
   * @private
   */
  set_fps: function(fps) {
    this._fps = fps;
  },

  /**
   * @private
   */
  set_name: function(name) {
    this._name[name] = 1;
  },

  /**
   * @private
   */
  set_senders: function(name, senders) {
    if(!(senders in JSJAC_JINGLE_SENDERS)) senders = JSJAC_JINGLE_SENDERS_BOTH.jingle;

    this._senders[name] = senders;
  },

  /**
   * @private
   */
  set_creator: function(name, creator) {
    if(!(creator in JSJAC_JINGLE_CREATORS)) creator = JSJAC_JINGLE_CREATOR_INITIATOR;

    this._creator[name] = creator;
  },

  /**
   * @private
   */
  set_initiator: function(initiator) {
    this._initiator = initiator;
  },

  /**
   * @private
   */
  set_responder: function(responder) {
    this._responder = responder;
  },

  /**
   * @private
   */
  set_stun: function(stun_host, stun_data) {
    this._stun[stun_server] = stun_data;
  },

  /**
   * @private
   */
  set_turn: function(turn_host, turn_data) {
    this._turn[turn_server] = turn_data;
  },

  /**
   * @private
   */
  set_sdp_trace: function(sdp_trace) {
    this._sdp_trace = sdp_trace;
  },

  /**
   * @private
   */
  set_net_trace: function(net_trace) {
    this._net_trace = net_trace;
  },

  /**
   * @private
   */
  set_debug: function(debug) {
    this._debug = debug;
  },



  /**
   * JSJSAC JINGLE SHORTCUTS
   */

  /**
   * Am I responder?
   * @return Receiver state
   * @type boolean
   */
  is_responder: function() {
    return this.utils.negotiation_status() == JSJAC_JINGLE_SENDERS_RESPONDER.jingle;
  },

  /**
   * Am I initiator?
   * @return Initiator state
   * @type boolean
   */
  is_initiator: function() {
    return this.utils.negotiation_status() == JSJAC_JINGLE_SENDERS_INITIATOR.jingle;
  },
});

/**
 * @fileoverview JSJaC Jingle library - Single (one-to-one) call lib
 *
 * @url https://github.com/valeriansaliou/jsjac-jingle
 * @depends https://github.com/sstrigler/JSJaC
 * @author Valérian Saliou https://valeriansaliou.name/
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */


/**
 * Creates a new XMPP Jingle session.
 * @class Somewhat abstract base class for XMPP Jingle sessions. Contains all
 * of the code in common for all Jingle sessions
 * @constructor
 * @param {Object} args Jingle session arguments.
 */
var JSJaCJingleSingle = ring.create([__JSJaCJingleBase], {
  /**
   * Initiates a new Jingle session.
   */
  initiate: function() {
    this.get_debug().log('[JSJaCJingle:single] initiate', 4);

    try {
      // Locked?
      if(this.get_lock()) {
        this.get_debug().log('[JSJaCJingle:single] initiate > Cannot initiate, resource locked. Please open another session or check WebRTC support.', 0);
        return;
      }

      // Defer?
      if(JSJaCJingle_defer(function() { this.initiate(); })) {
        this.get_debug().log('[JSJaCJingle:single] initiate > Deferred (waiting for the library components to be initiated).', 0);
        return;
      }

      // Slot unavailable?
      if(this.get_status() != JSJAC_JINGLE_STATUS_INACTIVE) {
        this.get_debug().log('[JSJaCJingle:single] initiate > Cannot initiate, resource not inactive (status: ' + this.get_status() + ').', 0);
        return;
      }

      this.get_debug().log('[JSJaCJingle:single] initiate > New Jingle session with media: ' + this.get_media(), 2);

      // Common vars
      var i, cur_name;

      // Trigger init pending custom callback
      (this.get_session_initiate_pending())(this);

      // Change session status
      this.set_status(JSJAC_JINGLE_STATUS_INITIATING);

      // Set session values
      this.set_sid(this.utils.generate_sid());
      this.set_initiator(this.utils.connection_jid());
      this.set_responder(this.get_to());

      for(i in this.get_media_all()) {
        cur_name = this.utils.name_generate(
          this.get_media_all()[i]
        );

        this.set_name(cur_name);

        this.set_senders(
          cur_name,
          JSJAC_JINGLE_SENDERS_BOTH.jingle
        );

        this.set_creator(
          cur_name,
          JSJAC_JINGLE_CREATOR_INITIATOR
        );
      }

      // Register session to common router
      JSJaCJingle_add(this.get_sid(), this);

      // Initialize WebRTC
      var _this = this;

      this.peer.get_user_media(function() {
        _this.peer.connection_create(function() {
          _this.get_debug().log('[JSJaCJingle:single] initiate > Ready to begin Jingle negotiation.', 2);

          _this.send(JSJAC_JINGLE_STANZA_TYPE_SET, { action: JSJAC_JINGLE_ACTION_SESSION_INITIATE });
        });
      });
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] initiate > ' + e, 1);
    }
  },

  /**
   * Accepts the Jingle session.
   */
  accept: function() {
    this.get_debug().log('[JSJaCJingle:single] accept', 4);

    try {
      // Locked?
      if(this.get_lock()) {
        this.get_debug().log('[JSJaCJingle:single] accept > Cannot accept, resource locked. Please open another session or check WebRTC support.', 0);
        return;
      }

      // Defer?
      if(JSJaCJingle_defer(function() { this.accept(); })) {
        this.get_debug().log('[JSJaCJingle:single] accept > Deferred (waiting for the library components to be initiated).', 0);
        return;
      }

      // Slot unavailable?
      if(this.get_status() != JSJAC_JINGLE_STATUS_INITIATED) {
        this.get_debug().log('[JSJaCJingle:single] accept > Cannot accept, resource not initiated (status: ' + this.get_status() + ').', 0);
        return;
      }

      this.get_debug().log('[JSJaCJingle:single] accept > New Jingle session with media: ' + this.get_media(), 2);

      // Trigger accept pending custom callback
      (this.get_session_accept_pending())(this);

      // Change session status
      this.set_status(JSJAC_JINGLE_STATUS_ACCEPTING);

      // Initialize WebRTC
      var _this = this;

      this.peer.get_user_media(function() {
        _this.peer.connection_create(function() {
          _this.get_debug().log('[JSJaCJingle:single] accept > Ready to complete Jingle negotiation.', 2);

          // Process accept actions
          _this.send(JSJAC_JINGLE_STANZA_TYPE_SET, { action: JSJAC_JINGLE_ACTION_SESSION_ACCEPT });
        });
      });
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] accept > ' + e, 1);
    }
  },

  /**
   * Sends a Jingle session info.
   */
  info: function(name, args) {
    this.get_debug().log('[JSJaCJingle:single] info', 4);

    try {
      // Locked?
      if(this.get_lock()) {
        this.get_debug().log('[JSJaCJingle:single] info > Cannot accept, resource locked. Please open another session or check WebRTC support.', 0);
        return;
      }

      // Defer?
      if(JSJaCJingle_defer(function() { this.info(name, args); })) {
        this.get_debug().log('[JSJaCJingle:single] info > Deferred (waiting for the library components to be initiated).', 0);
        return;
      }

      // Slot unavailable?
      if(!(this.get_status() == JSJAC_JINGLE_STATUS_INITIATED || this.get_status() == JSJAC_JINGLE_STATUS_ACCEPTING || this.get_status() == JSJAC_JINGLE_STATUS_ACCEPTED)) {
        this.get_debug().log('[JSJaCJingle:single] info > Cannot send info, resource not active (status: ' + this.get_status() + ').', 0);
        return;
      }

      // Assert
      if(typeof args !== 'object') args = {};

      // Build final args parameter
      args.action = JSJAC_JINGLE_ACTION_SESSION_INFO;
      if(name) args.info = name;

      this.send(JSJAC_JINGLE_STANZA_TYPE_SET, args);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] info > ' + e, 1);
    }
  },

  /**
   * Terminates the Jingle session.
   */
  terminate: function(reason) {
    this.get_debug().log('[JSJaCJingle:single] terminate', 4);

    try {
      // Locked?
      if(this.get_lock()) {
        this.get_debug().log('[JSJaCJingle:single] terminate > Cannot terminate, resource locked. Please open another session or check WebRTC support.', 0);
        return;
      }

      // Defer?
      if(JSJaCJingle_defer(function() { this.terminate(reason); })) {
        this.get_debug().log('[JSJaCJingle:single] terminate > Deferred (waiting for the library components to be initiated).', 0);
        return;
      }

      // Slot unavailable?
      if(this.get_status() == JSJAC_JINGLE_STATUS_TERMINATED) {
        this.get_debug().log('[JSJaCJingle:single] terminate > Cannot terminate, resource already terminated (status: ' + this.get_status() + ').', 0);
        return;
      }

      // Change session status
      this.set_status(JSJAC_JINGLE_STATUS_TERMINATING);

      // Trigger terminate pending custom callback
      (this.get_session_terminate_pending())(this);

      // Process terminate actions
      this.send(JSJAC_JINGLE_STANZA_TYPE_SET, { action: JSJAC_JINGLE_ACTION_SESSION_TERMINATE, reason: reason });
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] terminate > ' + e, 1);
    }
  },

  /**
   * Sends a given Jingle stanza packet
   */
  send: function(type, args) {
    this.get_debug().log('[JSJaCJingle:single] send', 4);

    try {
      // Locked?
      if(this.get_lock()) {
        this.get_debug().log('[JSJaCJingle:single] send > Cannot send, resource locked. Please open another session or check WebRTC support.', 0);
        return;
      }

      // Defer?
      if(JSJaCJingle_defer(function() { this.send(type, args); })) {
        this.get_debug().log('[JSJaCJingle:single] send > Deferred (waiting for the library components to be initiated).', 0);
        return;
      }

      // Assert
      if(typeof args !== 'object') args = {};

      // Build stanza
      var stanza = new JSJaCIQ();
      stanza.setTo(this.get_to());

      if(type) stanza.setType(type);

      if(!args.id) args.id = this.get_id_new();
      stanza.setID(args.id);

      if(type == JSJAC_JINGLE_STANZA_TYPE_SET) {
        if(!(args.action && args.action in JSJAC_JINGLE_ACTIONS)) {
          this.get_debug().log('[JSJaCJingle:single] send > Stanza action unknown: ' + (args.action || 'undefined'), 1);
          return;
        }

        this.set_sent_id(args.id);

        // Submit to registered handler
        switch(args.action) {
          case JSJAC_JINGLE_ACTION_CONTENT_ACCEPT:
            this.send_content_accept(stanza); break;

          case JSJAC_JINGLE_ACTION_CONTENT_ADD:
            this.send_content_add(stanza); break;

          case JSJAC_JINGLE_ACTION_CONTENT_MODIFY:
            this.send_content_modify(stanza); break;

          case JSJAC_JINGLE_ACTION_CONTENT_REJECT:
            this.send_content_reject(stanza); break;

          case JSJAC_JINGLE_ACTION_CONTENT_REMOVE:
            this.send_content_remove(stanza); break;

          case JSJAC_JINGLE_ACTION_DESCRIPTION_INFO:
            this.send_description_info(stanza); break;

          case JSJAC_JINGLE_ACTION_SECURITY_INFO:
            this.send_security_info(stanza); break;

          case JSJAC_JINGLE_ACTION_SESSION_ACCEPT:
            this.send_session_accept(stanza, args); break;

          case JSJAC_JINGLE_ACTION_SESSION_INFO:
            this.send_session_info(stanza, args); break;

          case JSJAC_JINGLE_ACTION_SESSION_INITIATE:
            this.send_session_initiate(stanza, args); break;

          case JSJAC_JINGLE_ACTION_SESSION_TERMINATE:
            this.send_session_terminate(stanza, args); break;

          case JSJAC_JINGLE_ACTION_TRANSPORT_ACCEPT:
            this.send_transport_accept(stanza); break;

          case JSJAC_JINGLE_ACTION_TRANSPORT_INFO:
            this.send_transport_info(stanza, args); break;

          case JSJAC_JINGLE_ACTION_TRANSPORT_REJECT:
            this.send_transport_reject(stanza); break;

          case JSJAC_JINGLE_ACTION_TRANSPORT_REPLACE:
            this.send_transport_replace(stanza); break;

          default:
            this.get_debug().log('[JSJaCJingle:single] send > Unexpected error.', 1);

            return false;
        }
      } else if(type != JSJAC_JINGLE_STANZA_TYPE_RESULT) {
        this.get_debug().log('[JSJaCJingle:single] send > Stanza type must either be set or result.', 1);

        return false;
      }

      JSJAC_JINGLE_STORE_CONNECTION.send(stanza);

      if(this.get_net_trace())  this.get_debug().log('[JSJaCJingle:single] Outgoing packet sent' + '\n\n' + stanza.xml());

      return true;
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] send > ' + e, 1);
    }

    return false;
  },

  /**
   * Handles a given Jingle stanza response
   */
  handle: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] handle', 4);

    try {
      if(this.get_net_trace())  this.get_debug().log('[JSJaCJingle:single] Incoming packet received' + '\n\n' + stanza.xml());

      // Locked?
      if(this.get_lock()) {
        this.get_debug().log('[JSJaCJingle:single] handle > Cannot handle, resource locked. Please open another session or check WebRTC support.', 0);
        return;
      }

      // Defer?
      if(JSJaCJingle_defer(function() { this.handle(stanza); })) {
        this.get_debug().log('[JSJaCJingle:single] handle > Deferred (waiting for the library components to be initiated).', 0);
        return;
      }

      var id   = stanza.getID();
      var type = stanza.getType();

      if(id && type == JSJAC_JINGLE_STANZA_TYPE_RESULT)  this.set_received_id(id);

      // Submit to custom handler
      if(typeof this.get_handlers(type, id) == 'function') {
        this.get_debug().log('[JSJaCJingle:single] handle > Submitted to custom handler.', 2);

        (this.get_handlers(type, id))(stanza);
        this.unregister_handler(type, id);

        return;
      }

      var jingle = this.utils.stanza_jingle(stanza);

      // Don't handle non-Jingle stanzas there...
      if(!jingle) return;

      var action = this.utils.stanza_get_attribute(jingle, 'action');

      // Don't handle action-less Jingle stanzas there...
      if(!action) return;

      // Submit to registered handler
      switch(action) {
        case JSJAC_JINGLE_ACTION_CONTENT_ACCEPT:
          this.handle_content_accept(stanza); break;

        case JSJAC_JINGLE_ACTION_CONTENT_ADD:
          this.handle_content_add(stanza); break;

        case JSJAC_JINGLE_ACTION_CONTENT_MODIFY:
          this.handle_content_modify(stanza); break;

        case JSJAC_JINGLE_ACTION_CONTENT_REJECT:
          this.handle_content_reject(stanza); break;

        case JSJAC_JINGLE_ACTION_CONTENT_REMOVE:
          this.handle_content_remove(stanza); break;

        case JSJAC_JINGLE_ACTION_DESCRIPTION_INFO:
          this.handle_description_info(stanza); break;

        case JSJAC_JINGLE_ACTION_SECURITY_INFO:
          this.handle_security_info(stanza); break;

        case JSJAC_JINGLE_ACTION_SESSION_ACCEPT:
          this.handle_session_accept(stanza); break;

        case JSJAC_JINGLE_ACTION_SESSION_INFO:
          this.handle_session_info(stanza); break;

        case JSJAC_JINGLE_ACTION_SESSION_INITIATE:
          this.handle_session_initiate(stanza); break;

        case JSJAC_JINGLE_ACTION_SESSION_TERMINATE:
          this.handle_session_terminate(stanza); break;

        case JSJAC_JINGLE_ACTION_TRANSPORT_ACCEPT:
          this.handle_transport_accept(stanza); break;

        case JSJAC_JINGLE_ACTION_TRANSPORT_INFO:
          this.handle_transport_info(stanza); break;

        case JSJAC_JINGLE_ACTION_TRANSPORT_REJECT:
          this.handle_transport_reject(stanza); break;

        case JSJAC_JINGLE_ACTION_TRANSPORT_REPLACE:
          this.handle_transport_replace(stanza); break;
      }
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] handle > ' + e, 1);
    }
  },

  /**
   * Mutes a Jingle session (local)
   */
  mute: function(name) {
    this.get_debug().log('[JSJaCJingle:single] mute', 4);

    try {
      // Locked?
      if(this.get_lock()) {
        this.get_debug().log('[JSJaCJingle:single] mute > Cannot mute, resource locked. Please open another session or check WebRTC support.', 0);
        return;
      }

      // Defer?
      if(JSJaCJingle_defer(function() { this.mute(name); })) {
        this.get_debug().log('[JSJaCJingle:single] mute > Deferred (waiting for the library components to be initiated).', 0);
        return;
      }

      // Already muted?
      if(this.get_mute(name)) {
        this.get_debug().log('[JSJaCJingle:single] mute > Resource already muted.', 0);
        return;
      }

      this.peer.sound(false);
      this.set_mute(name, true);

      this.send(JSJAC_JINGLE_STANZA_TYPE_SET, { action: JSJAC_JINGLE_ACTION_SESSION_INFO, info: JSJAC_JINGLE_SESSION_INFO_MUTE, name: name });
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] mute > ' + e, 1);
    }
  },

  /**
   * Unmutes a Jingle session (local)
   */
  unmute: function(name) {
    this.get_debug().log('[JSJaCJingle:single] unmute', 4);

    try {
      // Locked?
      if(this.get_lock()) {
        this.get_debug().log('[JSJaCJingle:single] unmute > Cannot unmute, resource locked. Please open another session or check WebRTC support.', 0);
        return;
      }

      // Defer?
      if(JSJaCJingle_defer(function() { this.unmute(name); })) {
        this.get_debug().log('[JSJaCJingle:single] unmute > Deferred (waiting for the library components to be initiated).', 0);
        return;
      }

      // Already unmute?
      if(!this.get_mute(name)) {
        this.get_debug().log('[JSJaCJingle:single] unmute > Resource already unmuted.', 0);
        return;
      }

      this.peer.sound(true);
      this.set_mute(name, false);

      this.send(JSJAC_JINGLE_STANZA_TYPE_SET, { action: JSJAC_JINGLE_ACTION_SESSION_INFO, info: JSJAC_JINGLE_SESSION_INFO_UNMUTE, name: name });
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] unmute > ' + e, 1);
    }
  },

  /**
   * Toggles media type in a Jingle session
   */
  media: function(media) {
    /* DEV: don't expect this to work as of now! */

    this.get_debug().log('[JSJaCJingle:single] media', 4);

    try {
      // Locked?
      if(this.get_lock()) {
        this.get_debug().log('[JSJaCJingle:single] media > Cannot change media, resource locked. Please open another session or check WebRTC support.', 0);
        return;
      }

      // Defer?
      if(JSJaCJingle_defer(function() { this.media(media); })) {
        this.get_debug().log('[JSJaCJingle:single] media > Deferred (waiting for the library components to be initiated).', 0);
        return;
      }

      // Toggle media?
      if(!media)
        media = (this.get_media() == JSJAC_JINGLE_MEDIA_VIDEO) ? JSJAC_JINGLE_MEDIA_AUDIO : JSJAC_JINGLE_MEDIA_VIDEO;

      // Media unknown?
      if(!(media in JSJAC_JINGLE_MEDIAS)) {
        this.get_debug().log('[JSJaCJingle:single] media > No media provided or media unsupported (media: ' + media + ').', 0);
        return;
      }

      // Already using provided media?
      if(this.get_media() == media) {
        this.get_debug().log('[JSJaCJingle:single] media > Resource already using this media (media: ' + media + ').', 0);
        return;
      }

      // Switch locked for now? (another one is being processed)
      if(this.get_media_busy()) {
        this.get_debug().log('[JSJaCJingle:single] media > Resource already busy switching media (busy: ' + this.get_media() + ', media: ' + media + ').', 0);
        return;
      }

      this.get_debug().log('[JSJaCJingle:single] media > Changing media to: ' + media + '...', 2);

      // Store new media
      this.set_media(media);
      this.set_media_busy(true);

      // Toggle video mode (add/remove)
      if(media == JSJAC_JINGLE_MEDIA_VIDEO) {
        // TODO: the flow is something like that...
        /*this.peer.get_user_media(function() {
          this.peer.connection_create(function() {
            this.get_debug().log('[JSJaCJingle:single] media > Ready to change media (to: ' + media + ').', 2);

            // 'content-add' >> video
            // TODO: restart video stream configuration

            // WARNING: only change get user media, DO NOT TOUCH THE STREAM THING (don't stop active stream as it's flowing!!)

            this.send(JSJAC_JINGLE_STANZA_TYPE_SET, { action: JSJAC_JINGLE_ACTION_CONTENT_ADD, name: JSJAC_JINGLE_MEDIA_VIDEO });
          })
        });*/
      } else {
        // TODO: the flow is something like that...
        /*this.peer.get_user_media(function() {
          this.peer.connection_create(function() {
            this.get_debug().log('[JSJaCJingle:single] media > Ready to change media (to: ' + media + ').', 2);

            // 'content-remove' >> video
            // TODO: remove video stream configuration

            // WARNING: only change get user media, DO NOT TOUCH THE STREAM THING (don't stop active stream as it's flowing!!)
            //          here, only stop the video stream, do not touch the audio stream

            this.send(JSJAC_JINGLE_STANZA_TYPE_SET, { action: JSJAC_JINGLE_ACTION_CONTENT_REMOVE, name: JSJAC_JINGLE_MEDIA_VIDEO });
          })
        });*/
      }
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] media > ' + e, 1);
    }
  },

  /**
   * Registers a given handler on a given Jingle stanza
   */
  register_handler: function(type, id, fn) {
    this.get_debug().log('[JSJaCJingle:single] register_handler', 4);

    try {
      type = type || JSJAC_JINGLE_STANZA_TYPE_ALL;

      if(typeof fn !== 'function') {
        this.get_debug().log('[JSJaCJingle:single] register_handler > fn parameter not passed or not a function!', 1);
        return false;
      }

      if(id) {
        this.set_handlers(type, id, fn);

        this.get_debug().log('[JSJaCJingle:single] register_handler > Registered handler for id: ' + id + ' and type: ' + type, 3);
        return true;
      } else {
        this.get_debug().log('[JSJaCJingle:single] register_handler > Could not register handler (no ID).', 1);
        return false;
      }
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] register_handler > ' + e, 1);
    }

    return false;
  },

  /**
   * Unregisters the given handler on a given Jingle stanza
   */
  unregister_handler: function(type, id) {
    this.get_debug().log('[JSJaCJingle:single] unregister_handler', 4);

    try {
      type = type || JSJAC_JINGLE_STANZA_TYPE_ALL;

      if(type in this._handlers && id in this._handlers[type]) {
        delete this._handlers[type][id];

        this.get_debug().log('[JSJaCJingle:single] unregister_handler > Unregistered handler for id: ' + id + ' and type: ' + type, 3);
        return true;
      } else {
        this.get_debug().log('[JSJaCJingle:single] unregister_handler > Could not unregister handler with id: ' + id + ' and type: ' + type + ' (not found).', 2);
        return false;
      }
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] unregister_handler > ' + e, 1);
    }

    return false;
  },

  /**
   * Registers a view element
   */
  register_view: function(type, view) {
    this.get_debug().log('[JSJaCJingle:single] register_view', 4);

    try {
      // Get view functions
      var fn = this.utils.map_register_view(type);

      if(fn.type == type) {
        var i;

        // Check view is not already registered
        for(i in (fn.view.get)()) {
          if((fn.view.get)()[i] == view) {
            this.get_debug().log('[JSJaCJingle:single] register_view > Could not register view of type: ' + type + ' (already registered).', 2);
            return true;
          }
        }

        // Proceeds registration
        (fn.view.set)(view);

        this.utils.peer_stream_attach(
          [view],
          (fn.stream.get)(),
          fn.mute
        );

        this.get_debug().log('[JSJaCJingle:single] register_view > Registered view of type: ' + type, 3);

        return true;
      } else {
        this.get_debug().log('[JSJaCJingle:single] register_view > Could not register view of type: ' + type + ' (type unknown).', 1);
        return false;
      }
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] register_view > ' + e, 1);
    }

    return false;
  },

  /**
   * Unregisters a view element
   */
  unregister_view: function(type, view) {
    this.get_debug().log('[JSJaCJingle:single] unregister_view', 4);

    try {
      // Get view functions
      var fn = this.utils.map_unregister_view(type);

      if(fn.type == type) {
        var i;

        // Check view is registered
        for(i in (fn.view.get)()) {
          if((fn.view.get)()[i] == view) {
            // Proceeds un-registration
            this.utils.peer_stream_detach(
              [view]
            );

            this.utils.array_remove_value(
              (fn.view.get)(),
              view
            );

            this.get_debug().log('[JSJaCJingle:single] unregister_view > Unregistered view of type: ' + type, 3);
            return true;
          }
        }

        this.get_debug().log('[JSJaCJingle:single] unregister_view > Could not unregister view of type: ' + type + ' (not found).', 2);
        return true;
      } else {
        this.get_debug().log('[JSJaCJingle:single] unregister_view > Could not unregister view of type: ' + type + ' (type unknown).', 1);
        return false;
      }
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] unregister_view > ' + e, 1);
    }

    return false;
  },


  /**
   * JSJSAC JINGLE SENDERS
   */

  /**
   * Sends the Jingle content accept
   */
  send_content_accept: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] send_content_accept', 4);

    try {
      // TODO: remove from remote 'content-add' queue
      // TODO: reprocess content_local/content_remote

      // Not implemented for now
      this.get_debug().log('[JSJaCJingle:single] send_content_accept > Feature not implemented!', 0);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] send_content_accept > ' + e, 1);
    }
  },

  /**
   * Sends the Jingle content add
   */
  send_content_add: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] send_content_add', 4);

    try {
      // TODO: push to local 'content-add' queue

      // Not implemented for now
      this.get_debug().log('[JSJaCJingle:single] send_content_add > Feature not implemented!', 0);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] send_content_add > ' + e, 1);
    }
  },

  /**
   * Sends the Jingle content modify
   */
  send_content_modify: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] send_content_modify', 4);

    try {
      // TODO: push to local 'content-modify' queue

      // Not implemented for now
      this.get_debug().log('[JSJaCJingle:single] send_content_modify > Feature not implemented!', 0);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] send_content_modify > ' + e, 1);
    }
  },

  /**
   * Sends the Jingle content reject
   */
  send_content_reject: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] send_content_reject', 4);

    try {
      // TODO: remove from remote 'content-add' queue

      // Not implemented for now
      this.get_debug().log('[JSJaCJingle:single] send_content_reject > Feature not implemented!', 0);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] send_content_reject > ' + e, 1);
    }
  },

  /**
   * Sends the Jingle content remove
   */
  send_content_remove: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] send_content_remove', 4);

    try {
      // TODO: add to local 'content-remove' queue

      // Not implemented for now
      this.get_debug().log('[JSJaCJingle:single] send_content_remove > Feature not implemented!', 0);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] send_content_remove > ' + e, 1);
    }
  },

  /**
   * Sends the Jingle description info
   */
  send_description_info: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] send_description_info', 4);

    try {
      // Not implemented for now
      this.get_debug().log('[JSJaCJingle:single] send_description_info > Feature not implemented!', 0);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] send_description_info > ' + e, 1);
    }
  },

  /**
   * Sends the Jingle security info
   */
  send_security_info: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] send_security_info', 4);

    try {
      // Not implemented for now
      this.get_debug().log('[JSJaCJingle:single] send_security_info > Feature not implemented!', 0);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] send_security_info > ' + e, 1);
    }
  },

  /**
   * Sends the Jingle session accept
   */
  send_session_accept: function(stanza, args) {
    this.get_debug().log('[JSJaCJingle:single] send_session_accept', 4);

    try {
      if(this.get_status() != JSJAC_JINGLE_STATUS_ACCEPTING) {
        this.get_debug().log('[JSJaCJingle:single] send_session_accept > Cannot send accept stanza, resource not accepting (status: ' + this.get_status() + ').', 0);
        this.send_error(stanza, JSJAC_JINGLE_ERROR_OUT_OF_ORDER);
        return;
      }

      if(!args) {
          this.get_debug().log('[JSJaCJingle:single] send_session_accept > Argument not provided.', 1);
          return;
      }

      // Build Jingle stanza
      var jingle = this.utils.stanza_generate_jingle(stanza, {
        'action'    : JSJAC_JINGLE_ACTION_SESSION_ACCEPT,
        'responder' : this.get_responder()
      });

      this.utils.stanza_generate_content_local(stanza, jingle);
      this.utils.stanza_generate_group_local(stanza, jingle);

      // Schedule success
      var _this = this;

      this.register_handler(JSJAC_JINGLE_STANZA_TYPE_RESULT, args.id, function(stanza) {
        (_this.get_session_accept_success())(_this, stanza);
        _this.handle_session_accept_success(stanza);
      });

      // Schedule error timeout
      this.utils.stanza_timeout(JSJAC_JINGLE_STANZA_TYPE_RESULT, args.id, {
        external:   this.get_session_accept_error(),
        internal:   this.handle_session_accept_error
      });

      this.get_debug().log('[JSJaCJingle:single] send_session_accept > Sent.', 4);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] send_session_accept > ' + e, 1);
    }
  },

  /**
   * Sends the Jingle session info
   */
  send_session_info: function(stanza, args) {
    this.get_debug().log('[JSJaCJingle:single] send_session_info', 4);

    try {
      if(!args) {
        this.get_debug().log('[JSJaCJingle:single] send_session_info > Argument not provided.', 1);
        return;
      }

      // Filter info
      args.info = args.info || JSJAC_JINGLE_SESSION_INFO_ACTIVE;

      // Build Jingle stanza
      var jingle = this.utils.stanza_generate_jingle(stanza, {
        'action'    : JSJAC_JINGLE_ACTION_SESSION_INFO,
        'initiator' : this.get_initiator()
      });

      this.utils.stanza_generate_session_info(stanza, jingle, args);

      // Schedule success
      var _this = this;

      this.register_handler(JSJAC_JINGLE_STANZA_TYPE_RESULT, args.id, function(stanza) {
        (_this.get_session_info_success())(this, stanza);
        _this.handle_session_info_success(stanza);
      });

      // Schedule error timeout
      this.utils.stanza_timeout(JSJAC_JINGLE_STANZA_TYPE_RESULT, args.id, {
        external:   this.get_session_info_error(),
        internal:   this.handle_session_info_error
      });

      this.get_debug().log('[JSJaCJingle:single] send_session_info > Sent (name: ' + args.info + ').', 2);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] send_session_info > ' + e, 1);
    }
  },

  /**
   * Sends the Jingle session initiate
   */
  send_session_initiate: function(stanza, args) {
    this.get_debug().log('[JSJaCJingle:single] send_session_initiate', 4);

    try {
      if(this.get_status() != JSJAC_JINGLE_STATUS_INITIATING) {
        this.get_debug().log('[JSJaCJingle:single] send_session_initiate > Cannot send initiate stanza, resource not initiating (status: ' + this.get_status() + ').', 0);
        return;
      }

      if(!args) {
        this.get_debug().log('[JSJaCJingle:single] send_session_initiate > Argument not provided.', 1);
        return;
      }

      // Build Jingle stanza
      var jingle = this.utils.stanza_generate_jingle(stanza, {
        'action'    : JSJAC_JINGLE_ACTION_SESSION_INITIATE,
        'initiator' : this.get_initiator()
      });

      this.utils.stanza_generate_content_local(stanza, jingle);
      this.utils.stanza_generate_group_local(stanza, jingle);

      // Schedule success
      var _this = this;
      
      this.register_handler(JSJAC_JINGLE_STANZA_TYPE_RESULT, args.id, function(stanza) {
        (_this.get_session_initiate_success())(_this, stanza);
        _this.handle_session_initiate_success(stanza);
      });

      // Schedule error timeout
      this.utils.stanza_timeout(JSJAC_JINGLE_STANZA_TYPE_RESULT, args.id, {
        external:   this.get_session_initiate_error(),
        internal:   this.handle_session_initiate_error
      });

      this.get_debug().log('[JSJaCJingle:single] send_session_initiate > Sent.', 2);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] send_session_initiate > ' + e, 1);
    }
  },

  /**
   * Sends the Jingle session terminate
   */
  send_session_terminate: function(stanza, args) {
    this.get_debug().log('[JSJaCJingle:single] send_session_terminate', 4);

    try {
      if(this.get_status() != JSJAC_JINGLE_STATUS_TERMINATING) {
        this.get_debug().log('[JSJaCJingle:single] send_session_terminate > Cannot send terminate stanza, resource not terminating (status: ' + this.get_status() + ').', 0);
        return;
      }

      if(!args) {
        this.get_debug().log('[JSJaCJingle:single] send_session_terminate > Argument not provided.', 1);
        return;
      }

      // Filter reason
      args.reason = args.reason || JSJAC_JINGLE_REASON_SUCCESS;

      // Store terminate reason
      this.set_reason(args.reason);

      // Build terminate stanza
      var jingle = this.utils.stanza_generate_jingle(stanza, {
        'action': JSJAC_JINGLE_ACTION_SESSION_TERMINATE
      });

      var jingle_reason = jingle.appendChild(stanza.buildNode('reason', {'xmlns': NS_JINGLE}));
      jingle_reason.appendChild(stanza.buildNode(args.reason, {'xmlns': NS_JINGLE}));

      // Schedule success
      var _this = this;
      
      this.register_handler(JSJAC_JINGLE_STANZA_TYPE_RESULT, args.id, function(stanza) {
        (_this.get_session_terminate_success())(_this, stanza);
        _this.handle_session_terminate_success(stanza);
      });

      // Schedule error timeout
      this.utils.stanza_timeout(JSJAC_JINGLE_STANZA_TYPE_RESULT, args.id, {
        external:   this.get_session_terminate_error(),
        internal:   this.handle_session_terminate_error
      });

      this.get_debug().log('[JSJaCJingle:single] send_session_terminate > Sent (reason: ' + args.reason + ').', 2);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] send_session_terminate > ' + e, 1);
    }
  },

  /**
   * Sends the Jingle transport accept
   */
  send_transport_accept: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] send_transport_accept', 4);

    try {
      // Not implemented for now
      this.get_debug().log('[JSJaCJingle:single] send_transport_accept > Feature not implemented!', 0);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] send_transport_accept > ' + e, 1);
    }
  },

  /**
   * Sends the Jingle transport info
   */
  send_transport_info: function(stanza, args) {
    this.get_debug().log('[JSJaCJingle:single] send_transport_info', 4);

    try {
      if(this.get_status() != JSJAC_JINGLE_STATUS_INITIATED && this.get_status() != JSJAC_JINGLE_STATUS_ACCEPTING && this.get_status() != JSJAC_JINGLE_STATUS_ACCEPTED) {
        this.get_debug().log('[JSJaCJingle:single] send_transport_info > Cannot send transport info, resource not initiated, nor accepting, nor accepted (status: ' + this.get_status() + ').', 0);
        return;
      }

      if(!args) {
        this.get_debug().log('[JSJaCJingle:single] send_transport_info > Argument not provided.', 1);
        return;
      }

      if(this.utils.object_length(this.get_candidates_queue_local()) === 0) {
        this.get_debug().log('[JSJaCJingle:single] send_transport_info > No local candidate in queue.', 1);
        return;
      }

      // Build Jingle stanza
      var jingle = this.utils.stanza_generate_jingle(stanza, {
        'action'    : JSJAC_JINGLE_ACTION_TRANSPORT_INFO,
        'initiator' : this.get_initiator()
      });

      // Build queue content
      var cur_name;
      var content_queue_local = {};

      for(cur_name in this.get_name()) {
        content_queue_local[cur_name] = this.utils.generate_content(
            this.get_creator(cur_name),
            cur_name,
            this.get_senders(cur_name),
            this.get_payloads_local(cur_name),
            this.get_candidates_queue_local(cur_name)
        );
      }

      this.utils.stanza_generate_content_local(stanza, jingle, content_queue_local);
      this.utils.stanza_generate_group_local(stanza, jingle);

      // Schedule success
      var _this = this;
      
      this.register_handler(JSJAC_JINGLE_STANZA_TYPE_RESULT, args.id, function(stanza) {
        _this.handle_transport_info_success(stanza);
      });

      // Schedule error timeout
      this.utils.stanza_timeout(JSJAC_JINGLE_STANZA_TYPE_RESULT, args.id, {
        internal: this.handle_transport_info_error
      });

      this.get_debug().log('[JSJaCJingle:single] send_transport_info > Sent.', 2);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] send_transport_info > ' + e, 1);
    }
  },

  /**
   * Sends the Jingle transport reject
   */
  send_transport_reject: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] send_transport_reject', 4);

    try {
      // Not implemented for now
      this.get_debug().log('[JSJaCJingle:single] send_transport_reject > Feature not implemented!', 0);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] send_transport_reject > ' + e, 1);
    }
  },

  /**
   * Sends the Jingle transport replace
   */
  send_transport_replace: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] send_transport_replace', 4);

    try {
      // Not implemented for now
      this.get_debug().log('[JSJaCJingle:single] send_transport_replace > Feature not implemented!', 0);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] send_transport_replace > ' + e, 1);
    }
  },

  /**
   * Sends the Jingle transport replace
   */
  send_error: function(stanza, error) {
    this.get_debug().log('[JSJaCJingle:single] send_error', 4);

    try {
      // Assert
      if(!('type' in error)) {
        this.get_debug().log('[JSJaCJingle:single] send_error > Type unknown.', 1);
        return;
      }

      if('jingle' in error && !(error.jingle in JSJAC_JINGLE_ERRORS)) {
        this.get_debug().log('[JSJaCJingle:single] send_error > Jingle condition unknown (' + error.jingle + ').', 1);
        return;
      }

      if('xmpp' in error && !(error.xmpp in XMPP_ERRORS)) {
        this.get_debug().log('[JSJaCJingle:single] send_error > XMPP condition unknown (' + error.xmpp + ').', 1);
        return;
      }

      var stanza_error = new JSJaCIQ();

      stanza_error.setType('error');
      stanza_error.setID(stanza.getID());
      stanza_error.setTo(this.get_to());

      var error_node = stanza_error.getNode().appendChild(stanza_error.buildNode('error', {'xmlns': NS_CLIENT, 'type': error.type}));

      if('xmpp'   in error) error_node.appendChild(stanza_error.buildNode(error.xmpp,   { 'xmlns': NS_STANZAS       }));
      if('jingle' in error) error_node.appendChild(stanza_error.buildNode(error.jingle, { 'xmlns': NS_JINGLE_ERRORS }));

      JSJAC_JINGLE_STORE_CONNECTION.send(stanza_error);

      this.get_debug().log('[JSJaCJingle:single] send_error > Sent: ' + (error.jingle || error.xmpp), 2);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] send_error > ' + e, 1);
    }
  },



  /**
   * JSJSAC JINGLE HANDLERS
   */

  /**
   * Handles the Jingle content accept
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  handle_content_accept: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] handle_content_accept', 4);

    try {
      // TODO: start to flow accepted stream
      // TODO: remove accepted content from local 'content-add' queue
      // TODO: reprocess content_local/content_remote

      // Not implemented for now
      this.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] handle_content_accept > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle content add
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  handle_content_add: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] handle_content_add', 4);

    try {
      // TODO: request the user to start this content (need a custom handler)
      //       on accept: send content-accept
      // TODO: push to remote 'content-add' queue
      // TODO: reprocess content_local/content_remote

      // Not implemented for now
      this.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] handle_content_add > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle content modify
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  handle_content_modify: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] handle_content_modify', 4);

    try {
      // TODO: change 'senders' value (direction of the stream)
      //       if(send:from_me): notify the user that media is requested
      //       if(unacceptable): terminate the session
      //       if(accepted):     change local/remote SDP
      // TODO: reprocess content_local/content_remote

      // Not implemented for now
      this.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] handle_content_modify > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle content reject
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  handle_content_reject: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] handle_content_reject', 4);

    try {
      // TODO: remove rejected content from local 'content-add' queue

      // Not implemented for now
      this.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] handle_content_reject > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle content remove
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  handle_content_remove: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] handle_content_remove', 4);

    try {
      // TODO: stop flowing removed stream
      // TODO: reprocess content_local/content_remote

      // Not implemented for now
      this.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] handle_content_remove > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle description info
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  handle_description_info: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] handle_description_info', 4);

    try {
      // Not implemented for now
      this.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] handle_description_info > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle security info
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  handle_security_info: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] handle_security_info', 4);

    try {
      // Not implemented for now
      this.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] handle_security_info > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle session accept
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  handle_session_accept: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] handle_session_accept', 4);

    try {
      // Security preconditions
      if(!this.utils.stanza_safe(stanza)) {
        this.get_debug().log('[JSJaCJingle:single] handle_session_accept > Dropped unsafe stanza.', 0);

        this.send_error(stanza, JSJAC_JINGLE_ERROR_UNKNOWN_SESSION);
        return;
      }

      // Can now safely dispatch the stanza
      switch(stanza.getType()) {
        case JSJAC_JINGLE_STANZA_TYPE_RESULT:
          (this.get_session_accept_success())(this, stanza);
          this.handle_session_accept_success(stanza);

          break;

        case 'error':
          (this.get_session_accept_error())(this, stanza);
          this.handle_session_accept_error(stanza);

          break;

        case JSJAC_JINGLE_STANZA_TYPE_SET:
          // External handler must be set before internal one here...
          (this.get_session_accept_request())(this, stanza);
          this.handle_session_accept_request(stanza);

          break;

        default:
          this.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
      }
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] handle_session_accept > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle session accept success
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  handle_session_accept_success: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] handle_session_accept_success', 4);

    try {
      // Change session status
      this.set_status(JSJAC_JINGLE_STATUS_ACCEPTED);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] handle_session_accept_success > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle session accept error
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  handle_session_accept_error: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] handle_session_accept_error', 4);

    try {
      // Terminate the session (timeout)
      this.terminate(JSJAC_JINGLE_REASON_TIMEOUT);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] handle_session_accept_error > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle session accept request
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  handle_session_accept_request: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] handle_session_accept_request', 4);

    try {
      // Slot unavailable?
      if(this.get_status() != JSJAC_JINGLE_STATUS_INITIATED) {
        this.get_debug().log('[JSJaCJingle:single] handle_session_accept_request > Cannot handle, resource already accepted (status: ' + this.get_status() + ').', 0);
        this.send_error(stanza, JSJAC_JINGLE_ERROR_OUT_OF_ORDER);
        return;
      }

      // Common vars
      var i, cur_candidate_obj;

      // Change session status
      this.set_status(JSJAC_JINGLE_STATUS_ACCEPTING);

      var rd_sid = this.utils.stanza_sid(stanza);

      // Request is valid?
      if(rd_sid && this.is_initiator() && this.utils.stanza_parse_content(stanza)) {
        // Handle additional data (optional)
        this.utils.stanza_parse_group(stanza);

        // Generate and store content data
        this.utils.build_content_remote();

        // Trigger accept success callback
        (this.get_session_accept_success())(this, stanza);
        this.handle_session_accept_success(stanza);

        var sdp_remote = this.sdp.generate(
          WEBRTC_SDP_TYPE_ANSWER,
          this.get_group_remote(),
          this.get_payloads_remote(),
          this.get_candidates_queue_remote()
        );

        if(this.get_sdp_trace())  this.get_debug().log('[JSJaCJingle:single] SDP (remote)' + '\n\n' + sdp_remote.description.sdp, 4);

        // Remote description
        var _this = this;
        
        this.get_peer_connection().setRemoteDescription(
          (new WEBRTC_SESSION_DESCRIPTION(sdp_remote.description)),

          function() {
            // Success (descriptions are compatible)
          },

          function(e) {
            if(_this.get_sdp_trace())  _this.get_debug().log('[JSJaCJingle:single] SDP (remote:error)' + '\n\n' + (e.message || e.name || 'Unknown error'), 4);

            // Error (descriptions are incompatible)
            _this.terminate(JSJAC_JINGLE_REASON_INCOMPATIBLE_PARAMETERS);
          }
        );

        // ICE candidates
        for(i in sdp_remote.candidates) {
          cur_candidate_obj = sdp_remote.candidates[i];

          this.get_peer_connection().addIceCandidate(
            new WEBRTC_ICE_CANDIDATE({
              sdpMLineIndex : cur_candidate_obj.id,
              candidate     : cur_candidate_obj.candidate
            })
          );
        }

        // Empty the unapplied candidates queue
        this.set_candidates_queue_remote(null);

        // Success reply
        this.send(JSJAC_JINGLE_STANZA_TYPE_RESULT, { id: stanza.getID() });
      } else {
        // Trigger accept error callback
        (this.get_session_accept_error())(this, stanza);
        this.handle_session_accept_error(stanza);

        // Send error reply
        this.send_error(stanza, XMPP_ERROR_BAD_REQUEST);

        this.get_debug().log('[JSJaCJingle:single] handle_session_accept_request > Error.', 1);
      }
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] handle_session_accept_request > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle session info
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  handle_session_info: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] handle_session_info', 4);

    try {
      // Security preconditions
      if(!this.utils.stanza_safe(stanza)) {
        this.get_debug().log('[JSJaCJingle:single] handle_session_info > Dropped unsafe stanza.', 0);

        this.send_error(stanza, JSJAC_JINGLE_ERROR_UNKNOWN_SESSION);
        return;
      }

      // Can now safely dispatch the stanza
      switch(stanza.getType()) {
        case JSJAC_JINGLE_STANZA_TYPE_RESULT:
          (this.get_session_info_success())(this, stanza);
          this.handle_session_info_success(stanza);

          break;

        case 'error':
          (this.get_session_info_error())(this, stanza);
          this.handle_session_info_error(stanza);

          break;

        case JSJAC_JINGLE_STANZA_TYPE_SET:
          (this.get_session_info_request())(this, stanza);
          this.handle_session_info_request(stanza);

          break;

        default:
          this.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
      }
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] handle_session_info > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle session info success
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  handle_session_info_success: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] handle_session_info_success', 4);
  },

  /**
   * Handles the Jingle session info error
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  handle_session_info_error: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] handle_session_info_error', 4);
  },

  /**
   * Handles the Jingle session info request
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  handle_session_info_request: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] handle_session_info_request', 4);

    try {
      // Parse stanza
      var info_name = this.utils.stanza_session_info(stanza);
      var info_result = false;

      switch(info_name) {
        case JSJAC_JINGLE_SESSION_INFO_ACTIVE:
        case JSJAC_JINGLE_SESSION_INFO_RINGING:
        case JSJAC_JINGLE_SESSION_INFO_MUTE:
        case JSJAC_JINGLE_SESSION_INFO_UNMUTE:
          info_result = true; break;
      }

      if(info_result) {
        this.get_debug().log('[JSJaCJingle:single] handle_session_info_request > (name: ' + (info_name || 'undefined') + ').', 3);

        // Process info actions
        this.send(JSJAC_JINGLE_STANZA_TYPE_RESULT, { id: stanza.getID() });

        // Trigger info success custom callback
        (this.get_session_info_success())(this, stanza);
        this.handle_session_info_success(stanza);
      } else {
        this.get_debug().log('[JSJaCJingle:single] handle_session_info_request > Error (name: ' + (info_name || 'undefined') + ').', 1);

        // Send error reply
        this.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);

        // Trigger info error custom callback
        (this.get_session_info_error())(this, stanza);
        this.handle_session_info_error(stanza);
      }
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] handle_session_info_request > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle session initiate
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  handle_session_initiate: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] handle_session_initiate', 4);

    try {
      switch(stanza.getType()) {
        case JSJAC_JINGLE_STANZA_TYPE_RESULT:
          (this.get_session_initiate_success())(this, stanza);
          this.handle_session_initiate_success(stanza);

          break;

        case 'error':
          (this.get_session_initiate_error())(this, stanza);
          this.handle_session_initiate_error(stanza);

          break;

        case JSJAC_JINGLE_STANZA_TYPE_SET:
          (this.get_session_initiate_request())(this, stanza);
          this.handle_session_initiate_request(stanza);

          break;

        default:
          this.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
      }
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] handle_session_initiate > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle session initiate success
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  handle_session_initiate_success: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] handle_session_initiate_success', 4);

    try {
      // Change session status
      this.set_status(JSJAC_JINGLE_STATUS_INITIATED);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] handle_session_initiate_success > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle session initiate error
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  handle_session_initiate_error: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] handle_session_initiate_error', 4);

    try {
      // Change session status
      this.set_status(JSJAC_JINGLE_STATUS_INACTIVE);

      // Stop WebRTC
      this.peer.stop();

      // Lock session (cannot be used later)
      this.set_lock(true);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] handle_session_initiate_error > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle session initiate request
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  handle_session_initiate_request: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] handle_session_initiate_request', 4);

    try {
      // Slot unavailable?
      if(this.get_status() != JSJAC_JINGLE_STATUS_INACTIVE) {
        this.get_debug().log('[JSJaCJingle:single] handle_session_initiate_request > Cannot handle, resource already initiated (status: ' + this.get_status() + ').', 0);
        this.send_error(stanza, JSJAC_JINGLE_ERROR_OUT_OF_ORDER);
        return;
      }

      // Change session status
      this.set_status(JSJAC_JINGLE_STATUS_INITIATING);

      // Common vars
      var rd_from = this.utils.stanza_from(stanza);
      var rd_sid  = this.utils.stanza_sid(stanza);

      // Request is valid?
      if(rd_sid && this.utils.stanza_parse_content(stanza)) {
        // Handle additional data (optional)
        this.utils.stanza_parse_group(stanza);

        // Set session values
        this.set_sid(rd_sid);
        this.set_to(rd_from);
        this.set_initiator(rd_from);
        this.set_responder(this.utils.connection_jid());

        // Register session to common router
        JSJaCJingle_add(rd_sid, this);

        // Generate and store content data
        this.utils.build_content_remote();

        // Video or audio-only session?
        if(JSJAC_JINGLE_MEDIA_VIDEO in this.get_content_remote()) {
          this.set_media(JSJAC_JINGLE_MEDIA_VIDEO);
        } else if(JSJAC_JINGLE_MEDIA_AUDIO in this.get_content_remote()) {
          this.set_media(JSJAC_JINGLE_MEDIA_AUDIO);
        } else {
          // Session initiation not done
          (this.get_session_initiate_error())(this, stanza);
          this.handle_session_initiate_error(stanza);

          // Error (no media is supported)
          this.terminate(JSJAC_JINGLE_REASON_UNSUPPORTED_APPLICATIONS);

          this.get_debug().log('[JSJaCJingle:single] handle_session_initiate_request > Error (unsupported media).', 1);
          return;
        }

        // Session initiate done
        (this.get_session_initiate_success())(this, stanza);
        this.handle_session_initiate_success(stanza);

        this.send(JSJAC_JINGLE_STANZA_TYPE_RESULT, { id: stanza.getID() });
      } else {
        // Session initiation not done
        (this.get_session_initiate_error())(this, stanza);
        this.handle_session_initiate_error(stanza);

        // Send error reply
        this.send_error(stanza, XMPP_ERROR_BAD_REQUEST);

        this.get_debug().log('[JSJaCJingle:single] handle_session_initiate_request > Error (bad request).', 1);
      }
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] handle_session_initiate_request > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle session terminate
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  handle_session_terminate: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] handle_session_terminate', 4);

    try {
      var type = stanza.getType();

      // Security preconditions
      if(!this.utils.stanza_safe(stanza)) {
        this.get_debug().log('[JSJaCJingle:single] handle_session_terminate > Dropped unsafe stanza.', 0);

        this.send_error(stanza, JSJAC_JINGLE_ERROR_UNKNOWN_SESSION);
        return;
      }

      // Can now safely dispatch the stanza
      switch(stanza.getType()) {
        case JSJAC_JINGLE_STANZA_TYPE_RESULT:
          (this.get_session_terminate_success())(this, stanza);
          this.handle_session_terminate_success(stanza);

          break;

        case 'error':
          (this.get_session_terminate_error())(this, stanza);
          this.handle_session_terminate_error(stanza);

          break;

        case JSJAC_JINGLE_STANZA_TYPE_SET:
          (this.get_session_terminate_request())(this, stanza);
          this.handle_session_terminate_request(stanza);

          break;

        default:
          this.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
      }
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] handle_session_terminate > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle session terminate success
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  handle_session_terminate_success: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] handle_session_terminate_success', 4);

    try {
      // Change session status
      this.set_status(JSJAC_JINGLE_STATUS_TERMINATED);

      // Stop WebRTC
      this.peer.stop();
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] handle_session_terminate_success > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle session terminate error
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  handle_session_terminate_error: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] handle_session_terminate_error', 4);

    try {
      // Change session status
      this.set_status(JSJAC_JINGLE_STATUS_TERMINATED);

      // Stop WebRTC
      this.peer.stop();

      // Lock session (cannot be used later)
      this.set_lock(true);

      this.get_debug().log('[JSJaCJingle:single] handle_session_terminate_error > Forced session termination locally.', 0);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] handle_session_terminate_error > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle session terminate request
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  handle_session_terminate_request: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] handle_session_terminate_request', 4);

    try {
      // Slot unavailable?
      if(this.get_status() == JSJAC_JINGLE_STATUS_INACTIVE || this.get_status() == JSJAC_JINGLE_STATUS_TERMINATED) {
        this.get_debug().log('[JSJaCJingle:single] handle_session_terminate_request > Cannot handle, resource not active (status: ' + this.get_status() + ').', 0);
        this.send_error(stanza, JSJAC_JINGLE_ERROR_OUT_OF_ORDER);
        return;
      }

      // Change session status
      this.set_status(JSJAC_JINGLE_STATUS_TERMINATING);

      // Store termination reason
      this.set_reason(this.utils.stanza_terminate_reason(stanza));

      // Trigger terminate success callbacks
      (this.get_session_terminate_success())(this, stanza);
      this.handle_session_terminate_success(stanza);

      // Process terminate actions
      this.send(JSJAC_JINGLE_STANZA_TYPE_RESULT, { id: stanza.getID() });

      this.get_debug().log('[JSJaCJingle:single] handle_session_terminate_request > (reason: ' + this.get_reason() + ').', 3);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] handle_session_terminate_request > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle transport accept
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  handle_transport_accept: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] handle_transport_accept', 4);

    try {
      // Not implemented for now
      this.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] handle_content_accept > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle transport info
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  handle_transport_info: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] handle_transport_info', 4);

    try {
      // Slot unavailable?
      if(this.get_status() != JSJAC_JINGLE_STATUS_INITIATED && this.get_status() != JSJAC_JINGLE_STATUS_ACCEPTING && this.get_status() != JSJAC_JINGLE_STATUS_ACCEPTED) {
        this.get_debug().log('[JSJaCJingle:single] handle_transport_info > Cannot handle, resource not initiated, nor accepting, nor accepted (status: ' + this.get_status() + ').', 0);
        this.send_error(stanza, JSJAC_JINGLE_ERROR_OUT_OF_ORDER);
        return;
      }

      // Common vars
      var i, cur_candidate_obj;

      // Parse the incoming transport
      var rd_sid = this.utils.stanza_sid(stanza);

      // Request is valid?
      if(rd_sid && this.utils.stanza_parse_content(stanza)) {
        // Handle additional data (optional)
        // Still unsure if it is relevant to parse groups there... (are they allowed in such stanza?)
        //this.utils.stanza_parse_group(stanza);

        // Re-generate and store new content data
        this.utils.build_content_remote();

        var sdp_candidates_remote = this.utils.sdp_generate_candidates(
          this.get_candidates_queue_remote()
        );

        // ICE candidates
        for(i in sdp_candidates_remote) {
          cur_candidate_obj = sdp_candidates_remote[i];

          this.get_peer_connection().addIceCandidate(
            new WEBRTC_ICE_CANDIDATE({
              sdpMLineIndex : cur_candidate_obj.id,
              candidate     : cur_candidate_obj.candidate
            })
          );
        }

        // Empty the unapplied candidates queue
        this.set_candidates_queue_remote(null);

        // Success reply
        this.send(JSJAC_JINGLE_STANZA_TYPE_RESULT, { id: stanza.getID() });
      } else {
        // Send error reply
        this.send_error(stanza, XMPP_ERROR_BAD_REQUEST);

        this.get_debug().log('[JSJaCJingle:single] handle_transport_info > Error.', 1);
      }
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] handle_transport_info > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle transport info success
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  handle_transport_info_success: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] handle_transport_info_success', 4);
  },

  /**
   * Handles the Jingle transport info error
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  handle_transport_info_error: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] handle_transport_info_error', 4);
  },

  /**
   * Handles the Jingle transport reject
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  handle_transport_reject: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] handle_transport_reject', 4);

    try {
      // Not implemented for now
      this.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] handle_transport_reject > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle transport replace
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  handle_transport_replace: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] handle_transport_replace', 4);

    try {
      // Not implemented for now
      this.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] handle_transport_replace > ' + e, 1);
    }
  },
});

/**
 * @fileoverview JSJaC Jingle library - Multi-user call lib
 *
 * @url https://github.com/valeriansaliou/jsjac-jingle
 * @depends https://github.com/sstrigler/JSJaC
 * @author Valérian Saliou https://valeriansaliou.name/
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */


/**
 * Creates a new XMPP Jingle Muji session.
 * @class Depends on JSJaCJingle() base class (needs to instantiate it)
 * @constructor
 * @param {Object} args Jingle session arguments.
 * @param {*} args.* Herits of JSJaCJingle() prototype
 */
var JSJaCJingleMuji = ring.create([__JSJaCJingleBase], {
  constructor: function() {
    this.is_muji = true;
  },
});

/**
 * @fileoverview JSJaC Jingle library - Initialization components
 *
 * @url https://github.com/valeriansaliou/jsjac-jingle
 * @depends https://github.com/sstrigler/JSJaC
 * @author Valérian Saliou https://valeriansaliou.name/
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */


var JSJaCJingleInit = (new ring.create({
  /**
   * Query the server for external services
   */
  extdisco: function() {
    JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:init] lib:extdisco > Discovering available services...', 2);

    try {
      // Pending state (defer other requests)
      JSJaCJingle_defer(true);

      // Build request
      var request = new JSJaCIQ();

      request.setTo(JSJAC_JINGLE_STORE_CONNECTION.domain);
      request.setType(JSJAC_JINGLE_STANZA_TYPE_GET);

      request.getNode().appendChild(request.buildNode('services', { 'xmlns': NS_EXTDISCO }));

      JSJAC_JINGLE_STORE_CONNECTION.send(request, function(response) {
        try {
          // Parse response
          if(response.getType() == JSJAC_JINGLE_STANZA_TYPE_RESULT) {
            var i,
                service_arr, cur_service,
                cur_host, cur_password, cur_port, cur_transport, cur_type, cur_username;

            var services = response.getChild('services', NS_EXTDISCO);

            if(services) {
              service_arr = services.getElementsByTagNameNS(NS_EXTDISCO, 'service');

              for(i = 0; i < service_arr.length; i++) {
                cur_service = service_arr[i];

                cur_host      = cur_service.getAttribute('host')       || null;
                cur_port      = cur_service.getAttribute('port')       || null;
                cur_transport = cur_service.getAttribute('transport')  || null;
                cur_type      = cur_service.getAttribute('type')       || null;

                cur_username  = cur_service.getAttribute('username')   || null;
                cur_password  = cur_service.getAttribute('password')   || null;

                if(!cur_host || !cur_type)  continue;

                if(!(cur_type in JSJAC_JINGLE_STORE_EXTDISCO)) {
                  JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:init] lib:extdisco > handle > Service skipped (type: ' + cur_type + ', host: ' + cur_host + ', port: ' + cur_port + ', transport: ' + cur_transport + ').', 4);
                  continue;
                }

                JSJAC_JINGLE_STORE_EXTDISCO[cur_type][cur_host] = {
                  'port'      : cur_port,
                  'transport' : cur_transport,
                  'type'      : cur_type
                };

                if(cur_type == 'turn') {
                  JSJAC_JINGLE_STORE_EXTDISCO[cur_type][cur_host].username = cur_username;
                  JSJAC_JINGLE_STORE_EXTDISCO[cur_type][cur_host].password = cur_password;
                }

                JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:init] lib:extdisco > handle > Service stored (type: ' + cur_type + ', host: ' + cur_host + ', port: ' + cur_port + ', transport: ' + cur_transport + ').', 4);
              }
            }

            JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:init] lib:extdisco > handle > Discovered available services.', 2);
          } else {
            JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:init] lib:extdisco > handle > Could not discover services (server might not support XEP-0215).', 0);
          }
        } catch(e) {
          JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:init] lib:extdisco > handle > ' + e, 1);
        }

        JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:init] lib:extdisco > Ready.', 2);

        // Execute deferred requests
        JSJaCJingle_defer(false);
      });
    } catch(e) {
      JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:init] lib:extdisco > ' + e, 1);
      
      // Execute deferred requests
      JSJaCJingle_defer(false);
    }
  },

  /**
   * Query the server for Jingle Relay Nodes services
   */
  relaynodes: function() {
    JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:init] lib:relaynodes > Discovering available Jingle Relay Nodes services...', 2);

    try {
      // Pending state (defer other requests)
      JSJaCJingle_defer(true);

      // Build request
      var request = new JSJaCIQ();

      request.setTo(JSJAC_JINGLE_STORE_CONNECTION.domain);
      request.setType(JSJAC_JINGLE_STANZA_TYPE_GET);

      request.getNode().appendChild(request.buildNode('services', { 'xmlns': NS_JABBER_JINGLENODES }));

      JSJAC_JINGLE_STORE_CONNECTION.send(request, function(response) {
        try {
          // Parse response
          if(response.getType() == JSJAC_JINGLE_STANZA_TYPE_RESULT) {
            var i,
                stun_arr, cur_stun,
                cur_policy, cur_address, cur_protocol;

            var services = response.getChild('services', NS_JABBER_JINGLENODES);

            if(services) {
              // Parse STUN servers
              stun_arr = services.getElementsByTagNameNS(NS_JABBER_JINGLENODES, 'stun');

              for(i = 0; i < stun_arr.length; i++) {
                cur_stun = stun_arr[i];

                cur_policy    = cur_stun.getAttribute('policy')    || null;
                cur_address   = cur_stun.getAttribute('address')   || null;
                cur_port      = cur_stun.getAttribute('port')      || null;
                cur_protocol  = cur_stun.getAttribute('protocol')  || null;

                if(!cur_address || !cur_protocol || !cur_policy || (cur_policy && cur_policy != 'public'))  continue;

                JSJAC_JINGLE_STORE_RELAYNODES.stun[cur_address] = {
                  'port'      : cur_port,
                  'transport' : cur_protocol,
                  'type'      : 'stun'
                };

                JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:init] lib:relaynodes > handle > STUN service stored (address: ' + cur_address + ', port: ' + cur_port + ', policy: ' + cur_policy + ', protocol: ' + cur_protocol + ').', 4);
              }
            }

            JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:init] lib:relaynodes > handle > Discovered available Jingle Relay Nodes services.', 2);
          } else {
            JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:init] lib:relaynodes > handle > Could not discover Jingle Relay Nodes services (server might not support XEP-0278).', 0);
          }
        } catch(e) {
          JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:init] lib:relaynodes > handle > ' + e, 1);
        }

        JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:init] lib:relaynodes > Ready.', 2);

        // Execute deferred requests
        JSJaCJingle_defer(false);
      });
    } catch(e) {
      JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:init] lib:relaynodes > ' + e, 1);
      
      // Execute deferred requests
      JSJaCJingle_defer(false);
    }
  },

  /**
   * Query some external APIs for fallback STUN/TURN (must be configured)
   */
  fallback: function(fallback_url) {
    JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:init] lib:fallback > Discovering fallback services...', 2);

    try {
      // Pending state (defer other requests)
      JSJaCJingle_defer(true);

      // Generate fallback API URL
      fallback_url += '?username=' + 
                      encodeURIComponent(JSJAC_JINGLE_STORE_CONNECTION.username + '@' + JSJAC_JINGLE_STORE_CONNECTION.domain);

      // Proceed request
      var xhr = new XMLHttpRequest();
      xhr.open('GET', fallback_url, true);

      xhr.onreadystatechange = function() {
        if(xhr.readyState === 4) {
          // Success?
          if(xhr.status === 200) {
            var data = JSON.parse(xhr.responseText);

            var cur_parse,
                i, cur_url,
                cur_type, cur_host, cur_port, cur_transport,
                cur_username, cur_password;

            if(data.uris && data.uris.length) {
              JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:init] lib:fallback > handle > Parsing ' + data.uris.length + ' URIs...', 2);

              for(i in data.uris) {
                cur_url = data.uris[i];

                if(cur_url) {
                  // Parse current URL
                  cur_parse = R_JSJAC_JINGLE_SERVICE_URI.exec(cur_url);

                  if(cur_parse) {
                    cur_type = cur_parse[1]        || null;
                    cur_host = cur_parse[2]        || null;
                    cur_port = cur_parse[3]        || null;
                    cur_transport = cur_parse[4]   || null;

                    cur_username  = data.username  || null;
                    cur_password  = data.password  || null;

                    if(!cur_host || !cur_type)  continue;

                    if(!(cur_type in JSJAC_JINGLE_STORE_FALLBACK)) {
                      JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:init] lib:fallback > handle > Service skipped (type: ' + cur_type + ', host: ' + cur_host + ', port: ' + cur_port + ', transport: ' + cur_transport + ').', 4);
                      continue;
                    }

                    JSJAC_JINGLE_STORE_FALLBACK[cur_type][cur_host] = {
                      'port'      : cur_port,
                      'transport' : cur_transport,
                      'type'      : cur_type
                    };

                    if(cur_type == 'turn') {
                      JSJAC_JINGLE_STORE_FALLBACK[cur_type][cur_host].username = cur_username;
                      JSJAC_JINGLE_STORE_FALLBACK[cur_type][cur_host].password = cur_password;
                    }

                    JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:init] lib:fallback > handle > Fallback service stored (type: ' + cur_type + ', host: ' + cur_host + ', port: ' + cur_port + ', transport: ' + cur_transport + ').', 4);
                  } else {
                    JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:init] lib:fallback > handle > Fallback service not stored, weird URI (' + cur_url + ').', 0);
                  }
                }
              }

              JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:init] lib:fallback > handle > Finished parsing URIs.', 2);
            } else {
              JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:init] lib:fallback > handle > No URI to parse.', 2);
            }

            JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:init] lib:fallback > handle > Discovered fallback services.', 2);
          } else {
            JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:init] lib:fallback > handle > Could not discover fallback services (API malfunction).', 0);
          }

          JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:init] lib:fallback > Ready.', 2);

          // Execute deferred requests
          JSJaCJingle_defer(false);
        }
      };

      xhr.send();
    } catch(e) {
      JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:init] lib:fallback > ' + e, 1);
    }
  },
}));

/**
 * @fileoverview JSJaC Jingle library - Common components
 *
 * @url https://github.com/valeriansaliou/jsjac-jingle
 * @depends https://github.com/sstrigler/JSJaC
 * @author Valérian Saliou https://valeriansaliou.name/
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */


var JSJaCJingle = (new ring.create({
  /**
   * Listens for Jingle events
   */
  listen: function(args) {
    try {
      if(args && args.connection)
        JSJAC_JINGLE_STORE_CONNECTION = args.connection;

      if(args && args.initiate)
        JSJAC_JINGLE_STORE_INITIATE = args.initiate;

      if(args && args.debug)
        JSJAC_JINGLE_STORE_DEBUG = args.debug;

      // Incoming IQs handler
      JSJAC_JINGLE_STORE_CONNECTION.registerHandler('iq', this.route);

      JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:commons] lib:listen > Listening.', 2);

      // Discover available network services
      if(!args || args.extdisco !== false)
        JSJaCJingle_extdisco();
      if(!args || args.relaynodes !== false)
        JSJaCJingle_relaynodes();
      if(args.fallback && typeof args.fallback === 'string')
        JSJaCJingle_fallback(args.fallback);
    } catch(e) {
      JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:commons] lib:listen > ' + e, 1);
    }
  },

  /**
   * Routes Jingle stanzas
   */
  route: function(stanza) {
    try {
      var action = null;
      var sid    = null;

      // Route the incoming stanza
      var jingle = stanza.getChild('jingle', NS_JINGLE);

      if(jingle) {
        sid = jingle.getAttribute('sid');
        action = jingle.getAttribute('action');
      } else {
        var stanza_id = stanza.getID();

        if(stanza_id) {
          var is_jingle = stanza_id.indexOf(JSJAC_JINGLE_STANZA_ID_PRE + '_') !== -1;

          if(is_jingle) {
            var stanza_id_split = stanza_id.split('_');
            sid = stanza_id_split[1];
          }
        }
      }

      // WebRTC not available ATM?
      if(jingle && !JSJAC_JINGLE_AVAILABLE) {
        JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:commons] lib:route > Dropped Jingle packet (WebRTC not available).', 0);

        (new JSJaCJingleSingle({ to: stanza.getFrom() })).send_error(stanza, XMPP_ERROR_SERVICE_UNAVAILABLE);
      } else {
        // New session? Or registered one?
        var session_route = this.read(sid);

        if(action == JSJAC_JINGLE_ACTION_SESSION_INITIATE && session_route === null) {
          JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:commons] lib:route > New Jingle session (sid: ' + sid + ').', 2);

          JSJAC_JINGLE_STORE_INITIATE(stanza);
        } else if(sid) {
          if(session_route !== null) {
            JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:commons] lib:route > Routed to Jingle session (sid: ' + sid + ').', 2);

            session_route.handle(stanza);
          } else if(stanza.getType() == JSJAC_JINGLE_STANZA_TYPE_SET && stanza.getFrom()) {
            JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:commons] lib:route > Unknown Jingle session (sid: ' + sid + ').', 0);

            (new JSJaCJingleSingle({ to: stanza.getFrom() })).send_error(stanza, JSJAC_JINGLE_ERROR_UNKNOWN_SESSION);
          }
        }
      }
    } catch(e) {
      JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:commons] lib:route > ' + e, 1);
    }
  },

  /**
   * Adds a new Jingle session
   */
  add: function(sid, obj) {
    JSJAC_JINGLE_STORE_SESSIONS[sid] = obj;
  },

  /**
   * Reads a new Jingle session
   * @return Session
   * @type object
   */
  read: function(sid) {
    return (sid in JSJAC_JINGLE_STORE_SESSIONS) ? JSJAC_JINGLE_STORE_SESSIONS[sid] : null;
  },

  /**
   * Removes a new Jingle session
   */
  remove: function(sid) {
    delete JSJAC_JINGLE_STORE_SESSIONS[sid];
  },

  /**
   * Defer given task/execute deferred tasks
   */
  defer: function(arg) {
    try {
      if(typeof arg == 'function') {
        // Deferring?
        if(JSJAC_JINGLE_STORE_DEFER.deferred) {
          (JSJAC_JINGLE_STORE_DEFER.fn).push(arg);

          JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:commons] lib:defer > Registered a function to be executed once ready.', 2);
        }

        return JSJAC_JINGLE_STORE_DEFER.deferred;
      } else if(!arg || typeof arg == 'boolean') {
        JSJAC_JINGLE_STORE_DEFER.deferred = (arg === true);

        if(JSJAC_JINGLE_STORE_DEFER.deferred === false) {
          // Execute deferred tasks?
          if((--JSJAC_JINGLE_STORE_DEFER.count) <= 0) {
            JSJAC_JINGLE_STORE_DEFER.count = 0;

            JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:commons] lib:defer > Executing ' + JSJAC_JINGLE_STORE_DEFER.fn.length + ' deferred functions...', 2);

            while(JSJAC_JINGLE_STORE_DEFER.fn.length)
              ((JSJAC_JINGLE_STORE_DEFER.fn).shift())();

            JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:commons] lib:defer > Done executing deferred functions.', 2);
          }
        } else {
          ++JSJAC_JINGLE_STORE_DEFER.count;
        }
      }
    } catch(e) {
      JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:commons] lib:defer > ' + e, 1);
    }
  },

  /**
   * Maps the Jingle disco features
   * @return Feature namespaces
   * @type array
   */
  disco: function() {
    return JSJAC_JINGLE_AVAILABLE ? MAP_DISCO_JINGLE : [];
  },
}));
