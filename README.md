# SCM Price History ![Module version](https://img.shields.io/npm/v/scm-price-history) ![Minified size](https://img.shields.io/bundlephobia/min/scm-price-history)

Accessing the price history of an item on the Steam Community Market (SCM) can be helpful for seeing the general trend of sales for an item. This includes the volume sold and the median price of sales.

However, this data isn't as easily accessible.

## Contents
- [Installation](https://github.com/HilliamT/scm-price-history/blob/master/README.md#installation)
- [Usage](https://github.com/HilliamT/scm-price-history/blob/master/README.md#usage)
- [SCMItem](https://github.com/HilliamT/scm-price-history/blob/master/README.md#scmitem)
- [Context](https://github.com/HilliamT/scm-price-history/blob/master/README.md#context)
- [The Problem](https://github.com/HilliamT/scm-price-history/blob/master/README.md#the-problem)
- [The Solution](https://github.com/HilliamT/scm-price-history/blob/master/README.md#the-solution)


## Installation
```npm install scm-price-history```

## Usage
To find the item `The Elite Mr. Muhlik | Elite Crew` from CS:GO (appid `730`), do
     
    getItemOnSCM("The Elite Mr. Muhlik | Elite Crew", "730").then((item) => {
        console.log(item.getItemInfo()); // Returns item information
        console.log(item.getPriceHistory()); // Returns price history
        console.log(item.getPriceSnapshots()); // Returns price snapshots
    });

## SCMItem
The `SCMItem` class returned from `getItemOnSCM` has the following methods:

### getItemInfo()

Returns general information on the item to be able to display it. It follows the format

    {
        market_hash_name: string,

        appid: number, // Should be the same as the appid value you have entered

        icon_url: string, // A direct url for displaying an image of the url

        type: string, // A short tagline describing the item's type.

        descriptions: {
            type: string, // Either `html` or `text` to denote how to render
            value: string, // Text - will be `` if a line break is wanted
            color?: string // Optional key of the color of the description line
        }[];
    }

### getPriceSnapshots()

Returns an array of snapshots. It follows the format

    {
        time: number, // Unixtime
        value: number, // USD value rounded to 3 d.p
        volume: number // Integer
    }[]

### getPriceHistory()

Returns a map of snapshots, indexed by time. It follows the format

    {
        [time: number]: { 
            time: number, // Unixtime
            value: number, // USD value rounded to 3 d.p
            volume: number // Integer
        }
    }

## Context

Accessing the price history of an item on the Steam Community Market (SCM) can be helpful for seeing the general trend of sales for an item. This includes the volume sold and the median price of sales.

However, this data isn't as easily accessible.

### Process

It can be done manually via accessing the item's market page, an example being
>`https://steamcommunity.com/market/listings/730/The%20Elite%20Mr.%20Muhlik%20%7C%20Elite%20Crew`

or programmatically in `JSON` form by doing a `GET` request to 
>`https://steamcommunity.com/market/pricehistory/?appid=APPID&market_hash_name=MARKET_HASH_NAME` 

with a logged-in `steamcommunity.com` session.

A general response from the API link `/market/pricehistory/` is:

    {
        "success":true,
        "price_prefix":"\u00a3",
        "price_suffix":"",
        "prices":[
            ["Nov 27 2013 01: +0",12.767,"1"],
            ["Nov 29 2013 01: +0",12.929,"2"],
            ["Dec 01 2013 01: +0",7.777,"1"],
            ["Dec 03 2013 01: +0",7.173,"2"],
            ["Dec 04 2013 01: +0",6.586,"2"]
        ]
    }

Each array inside the `prices` follows the structure of `[Date, MedianSalesPrice, Volume]` in which:
- `Date` details the date/time in the logged-in user's set timezone
- `MedianSalesPrice` details the median sales price in the logged-in user's native currency, rounded to 3 decimal places for slack with currency conversions to the user's currency.
- `Volume` details the number of items sold within the last price evaluation. In the above case, they all detail the number of that item sold in the last 24 hours, however, the API will normally provide entries that describe the hourly sales for each hour of the last 24 hours.

## The Problem

Accessing `https://steamcommunity.com/market/pricehistory/?appid=APPID&market_hash_name=MARKET_HASH_NAME` on a clean slate session will load the following:

    []

For those who are interested in retrieving the price history of an item on SCM programmatically, you will need to provide login credentials and login to `steamcommunity.com` with a session to be able to use the API, however, this can be circumvented.

Furthermore, for those who are logged into their own account, the API will always return prices in the currency native to you, meaning that for a UK user using `GBP`, you can not alter the API in any way to see the price history of an item in `USD`, one of the most popular currencies used on the platform.

## The Solution

A non-user can view an item's market page, which shows the item's price history as a line graph.

On a clean window without any previous cookies or user sessions, you can view the line graph shown at `https://steamcommunity.com/market/listings/730/The%20Elite%20Mr.%20Muhlik%20%7C%20Elite%20Crew` that details the previous price history of the item.

This shows that either:
1. The item price history data is sourced from a public API that doesn't require a logged-in session, with the rendering being done on the client side.
2. The item price history data is sourced internally, and the data is embedded as a JavaScript variable into the page so that the line graph is rendered on client-side.
3. The item price history data is sourced internally, and the line graph is rendered on the server-side and the page is delivered to us.

These are ranked in order of how easy it is to come up with a solution to circumvent the problem of requiring a user session.

- In the case of `1`, we can simply look at the source code and make use of that public API url link instead of what is done above, without needing any credentials.
- `2` can be solved by finding the data embedded in the returned source code of the page and parsing to get the data.
- With server-side rendering delivering us a page that has done all of the calculations of what HTML elements to show, `3` is a lot trickier. However, once one knows how each datapoint in the dataset is rendered as a HTML element on the line graph, a function can be written to extract the data out from each HTML element.

In the case of an item's market page, looking at the source code, case 2 applies.

![Image showing that the data is embedded in the source code of an item's market page](https://i.imgur.com/34juFsv.png)

This module applies a solution that extracts the price history data embedded in the source code.