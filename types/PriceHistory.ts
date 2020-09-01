import PriceSnapshot from "./PriceSnapshot";

export default interface PriceHistory {
    [unixtime: number]: PriceSnapshot
}