# vanity-function-selector

## Introduction

This is a CLI tool to help you find a suffix to your solidity function names in
order to affect its 4 bytes selector.

## How to use

There are 2 main ways to use this script:

### Match pattern

You can run the script to get a function signature to match a given pattern
(starting with `0x` and followed by 0 to 8 hexadecimal characters). For example
you want your `mint(address,uint256)` to have a signature starting with `0xf00`
you can run the following command

```bash
$ npx vanity-function-selector 0xf00 mint address uint256
```

which would output

```
[WARN] Argument types are not checked for validity. I hope you know what you are doing
Computing... Looking for a suffix for function mint(address,uint256) to get a signature starting with 0xf00
Found suffix: "Cz" after 2493 attempts
0xf001aed5 : mintCz(address,uint256)
```

so you can rename your function to `mintCz` and it will have the desired
signature (or selector) `0xf001aed5`.

**Protip: you may want to pass `mint_` as an input if you want it to look
prettier**

```
[WARN] Argument types are not checked for validity. I hope you know what you are doing
Computing... Looking for a suffix for function mint_(address,uint256) to get a signature starting with 0xf00
Found suffix: "0Ew" after 6585 attempts
0xf00fe9d9 : mint_0Ew(address,uint256)
```

### Zero-bytes

If the first argument you pass is not prefixed with `0x` and is a number
instead, it will be interpreted as the byte difficulty. Meaning it will try to
find a function selector that starts with as many zero-bytes. For example the
command

```bash
$ npx vanity-function-selector 1 withdraw uint256
```

will look for a function signature starting with `0x00` (one zero-byte)

## Notes

I came accross this need and was unable to find a tool to do it, which I still
can't believe. There has to be something that I just didn't find. So anyway,
I decided to write my own and then I thought I'd share it. The code is ugly,
It's super not-optimized (runs on a single thread) and some decisions in the
way it is used are quite opinionated.

By publishing this project, I express my will to make this something that is
useful for other people (otherwise, I would have just backed it up somewhere
private, right?). So please make suggestions, post issues, send PRs.

The next thing I would love to implement here is to use workers to parallelize
the search and make it N-times faster, where N is the number of CPU cores.

Then maybe use proper CLI utilities to parse the arguments, ane maybe switch
to `--` prefixed arguments and an `option` object in the main function.

Anyway, I hope this is will be useful for someone
