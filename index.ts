import axios from "axios";
import PriceSnapshot from "./types/PriceSnapshot";
import PriceHistory from "./types/PriceHistory";
import ItemInfo from "./types/ItemInfo";

class SCMItem {
    item: ItemInfo;
    priceSnapshots: PriceSnapshot[];

    constructor({ market_hash_name, appid, icon_url, type, descriptions }: ItemInfo, priceSnapshots: PriceSnapshot[]) {
        this.item = { market_hash_name, appid, icon_url, type, descriptions };
        this.priceSnapshots = priceSnapshots;
    }

    getItemInfo(): ItemInfo {
        let { market_hash_name, appid, icon_url, type, descriptions } = this.item;
        return { market_hash_name, appid, icon_url, type, descriptions };
    }

    getPriceHistory(): PriceHistory {
        let priceHistory = {};
        return this.priceSnapshots.map((snapshot) => priceHistory[snapshot.time] = snapshot);
    }

    getPriceSnapshots(): PriceSnapshot[] {
        return this.priceSnapshots;
    }
}

export async function getItemOnSCM(market_hash_name: string, appid: string): Promise<SCMItem> {
    // Fetch the item's market page
    let url = `https://steamcommunity.com/market/listings/${appid}/${encodeURI(market_hash_name)}`;
    let html = (await axios.get(url)).data;
    let $ = require("cheerio").load(html);

    // Retrieve the embedded data saved inside the post-server-side-rendered source code
    let scripts = $("script").get();
    let embeddedItemData = scripts[scripts.length - 1].children[0].data;
    let embeddedItemDataSplit = embeddedItemData.split(";");

    // Parse the variable value set to "g_rgAssets" to retrieve the general item information
    let itemInfo = JSON.parse(embeddedItemData.split("var g_rgAssets = ")[1].split("}}}};")[0] + "}}}}")[appid];
    itemInfo = itemInfo[Object.keys(itemInfo)[0]];
    itemInfo = itemInfo[Object.keys(itemInfo)[0]];

    // Parse the variable value set to "line1" to retrieve the array of pricing snapshots
    let line1 = embeddedItemDataSplit.find((line) => line.startsWith("\n\n\t\t\t$J(document).ready(function(){\n\t\t\tvar line1="));
    if (line1 == null) throw new Error("Could not find embedded data");
    line1 = line1.replace("\n\n\t\t\t$J(document).ready(function(){\n\t\t\tvar line1=", "");
    let priceSnapshots = JSON.parse(line1).map(([time, value, volume]) => ({ time: Date.parse(time), value, volume: parseInt(volume) }));

    // Return an object that contains methods to call for the data.
    return new SCMItem(itemInfo, priceSnapshots);
}