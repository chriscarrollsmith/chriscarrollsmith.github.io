Unlike some languages where logical operators always return `True` or `False`, Python's 'and' returns the last evaluated operand. Usually this doesn't change code behavior all that much, because if we're expecting a boolean return value, any truthy return value is still going to evaluate as truthy and trigger whatever logic `True` would have. However, it might trip you up if you're doing strict type checking with mypy and expect your return value to be boolean.

Normally no one uses this much in production code, because it's not very readable, but it can be a fun and surprising trick for impressing people with your 'code golf' skills (solving problems with the smallest possible number of characters). For instance, check out this simple function to return the text of a tweet only if it's less than 140 characters, and otherwise to return `False`. Most people would expect this function call to print `True`!

``` python
tweet_it = lambda s: len(s) <= 140 and s

print(tweet_it('Hello world!')) # Not a bool!
```

    Hello world!

This behavior is much more intuitive with the `or` operator, which works the same way. We can use this behavior to return a variable only if it's truthy, and otherwise to return something else (like a default return value, `False`, or `-1`):

``` python
def non_empty_string(s) -> str:
  '''Return the string if it's non-empty; else return a default non-empty string'''
  return s or 'default return value'

print(non_empty_string('valid string'))
print(non_empty_string(''))
```

    valid string
    default return value

Since we've used a logical operator in the `return` statement of the `non_empty_string` function, you might expect the function to return a boolean. In fact, since 'default return value' is truthy, you'd think the function would always return `True`! But that's not how logical tests in Python work.

Instead, the logical test returns the last evaluated operand. If `s` evaluates as truthy, then the logical test stops there and returns `s`. Otherwise, it returns the next operand: 'default return value'.

Once you get the hang of it, this behavior makes it really easy and intuitive to always return some fallback value if your calculated return value is falsy. Note that the fallback value will always be returned from the function, regardless of whether it's truthy or falsy. Our 'default return value' is truthy, but we could just as easily have returned a falsy value like `0` or `[]` by placing it after the `or`.
